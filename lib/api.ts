"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import { truckLogSchema } from "@/lib/validation"
import { handleError, ValidationError } from "@/lib/errors"
import type { TruckLog } from "./types"

/**
 * Save truck log to company-scoped collection
 * Uses the active company from session
 * Includes input validation
 */
export async function saveTruckLog(
  log: Omit<TruckLog, "id" | "createdAt" | "sentToCustoms">
): Promise<TruckLog> {
  try {
    console.log("💾 saveTruckLog called with:", log)
    
    // Clean up empty strings - convert to undefined for optional fields only
    // Don't modify required fields (plate, driverName, cargoType) - let validation handle them
    const cleanedLog = {
      ...log,
      // Optional fields - convert empty strings to undefined
      driverId: (log.driverId === "" || log.driverId === null) ? undefined : log.driverId,
      weightKg: (log.weightKg === null || log.weightKg === undefined || isNaN(log.weightKg) || log.weightKg <= 0) ? undefined : log.weightKg,
      netWeightKg: (log.netWeightKg === null || log.netWeightKg === undefined || isNaN(log.netWeightKg) || log.netWeightKg <= 0) ? undefined : log.netWeightKg,
      comments: log.comments === "" ? undefined : log.comments,
      origin: log.origin === "" ? undefined : log.origin,
      destination: log.destination === "" ? undefined : log.destination,
      senderOrganizationId: log.senderOrganizationId === "" ? undefined : log.senderOrganizationId,
      senderOrganization: log.senderOrganization === "" ? undefined : log.senderOrganization,
      receiverOrganizationId: log.receiverOrganizationId === "" ? undefined : log.receiverOrganizationId,
      receiverOrganization: log.receiverOrganization === "" ? undefined : log.receiverOrganization,
      transportCompanyId: log.transportCompanyId === "" ? undefined : log.transportCompanyId,
      sealNumber: log.sealNumber === "" ? undefined : log.sealNumber,
      trailerPlate: log.trailerPlate === "" ? undefined : log.trailerPlate,
      vehicleRegistrationNumber: log.vehicleRegistrationNumber === "" ? undefined : log.vehicleRegistrationNumber,
      vehicleRegistrationYear: log.vehicleRegistrationYear === "" ? undefined : log.vehicleRegistrationYear,
    }
    
    console.log("🧹 Cleaned log data:", cleanedLog)
    
    // Validate input
    const validation = truckLogSchema.safeParse(cleanedLog)
    if (!validation.success) {
      console.error("❌ Validation failed!")
      console.error("❌ Validation errors:", JSON.stringify(validation.error.issues, null, 2))
      console.error("❌ Data that failed validation:", JSON.stringify(cleanedLog, null, 2))
      
      const fieldErrors = validation.error.issues.reduce((acc, issue) => {
        const path = issue.path.join(".")
        acc[path] = issue.message
        return acc
      }, {} as Record<string, string>)
      
      console.error("❌ Field errors:", fieldErrors)
      
      throw new ValidationError(
        `Invalid truck log data: ${Object.entries(fieldErrors).map(([field, msg]) => `${field}: ${msg}`).join(", ")}`,
        fieldErrors
      )
    }
    
    console.log("✅ Validation passed")

    // Get active company from session
    const companyId = await getActiveCompany()

    // Get company-scoped logs collection
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

    // Create log document
    const logDoc: TruckLog = {
      ...validation.data,
      id: `truck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      sentToCustoms: false,
    }

    // Insert into company's collection
    console.log("💾 Inserting log document into database...")
    await logsCollection.insertOne(logDoc)
    console.log("✅ Log document inserted successfully")

    // Serialize MongoDB document to plain object (remove _id, ensure all values are serializable)
    // Create a clean copy to avoid any MongoDB-specific properties
    const serializedLog: TruckLog = {
      id: logDoc.id,
      direction: logDoc.direction,
      plate: logDoc.plate,
      driverId: logDoc.driverId,
      driverName: logDoc.driverName,
      cargoType: logDoc.cargoType,
      weightKg: logDoc.weightKg,
      netWeightKg: logDoc.netWeightKg,
      comments: logDoc.comments,
      origin: logDoc.origin,
      destination: logDoc.destination,
      senderOrganizationId: logDoc.senderOrganizationId,
      senderOrganization: logDoc.senderOrganization,
      receiverOrganizationId: logDoc.receiverOrganizationId,
      receiverOrganization: logDoc.receiverOrganization,
      transportCompanyId: logDoc.transportCompanyId,
      transportType: logDoc.transportType,
      sealNumber: logDoc.sealNumber,
      hasTrailer: logDoc.hasTrailer,
      trailerPlate: logDoc.trailerPlate,
      createdAt: logDoc.createdAt,
      sentToCustoms: logDoc.sentToCustoms,
    }

    console.log("✅ saveTruckLog completed successfully, log ID:", serializedLog.id)
    return serializedLog
  } catch (error) {
    console.error("❌ Error in saveTruckLog:", error)
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Send truck log to customs
 * Reads from and updates company-scoped collection
 * Includes error handling
 */
export async function sendTruckLogToCustoms(
  logId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate logId
    if (!logId || typeof logId !== 'string' || logId.trim().length === 0) {
      return {
        success: false,
        error: "Invalid log ID",
      }
    }

    // Get active company from session
    const companyId = await getActiveCompany()

    // Get company-scoped logs collection
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

    // Find the log in company's collection
    const log = await logsCollection.findOne({ id: logId.trim() })

    if (!log) {
      return {
        success: false,
        error: "Log not found",
      }
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate occasional network errors (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: "Network error: Unable to connect to customs system",
      }
    }

    // Update log status in company's collection
    await logsCollection.updateOne(
      { id: logId.trim() },
      { $set: { sentToCustoms: true } }
    )

    return { success: true }
  } catch (error) {
    const handled = handleError(error)
    return {
      success: false,
      error: handled.message,
    }
  }
}

/**
 * Get truck logs for the active company with pagination
 * Serializes MongoDB documents to plain objects for Client Components
 */
export async function getTruckLogs(
  page: number = 1,
  limit: number = 50
): Promise<{ logs: TruckLog[]; total: number; page: number; limit: number; totalPages: number }> {
  try {
    const companyId = await getActiveCompany()
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

    // Validate pagination params
    const validPage = Math.max(1, Math.floor(page))
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)))
    const skip = (validPage - 1) * validLimit

    // Get total count
    const total = await logsCollection.countDocuments({})

    // Fetch logs with pagination, sorted by creation date (newest first)
    const logs = await logsCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validLimit)
      .toArray()

    // Serialize MongoDB documents to plain objects
    const serializedLogs = logs.map((doc) => {
      const { _id, createdAt, ...log } = doc as any
      return {
        ...log,
        createdAt: typeof createdAt === 'string' 
          ? createdAt 
          : (createdAt instanceof Date 
              ? createdAt.toISOString() 
              : new Date(createdAt).toISOString()),
      } as TruckLog
    })

    return {
      logs: serializedLogs,
      total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(total / validLimit),
    }
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Get a single truck log by ID (company-scoped)
 * Serializes MongoDB document to plain object for Client Components
 */
export async function getTruckLog(logId: string): Promise<TruckLog | null> {
  const companyId = await getActiveCompany()
  const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

  const log = await logsCollection.findOne({ id: logId })
  
  if (!log) return null

  // Serialize MongoDB document to plain object
  const { _id, createdAt, ...logData } = log as any
  return {
    ...logData,
    createdAt: typeof createdAt === 'string' 
      ? createdAt 
      : (createdAt instanceof Date 
          ? createdAt.toISOString() 
          : new Date(createdAt).toISOString()),
  } as TruckLog
}

/**
 * Update an existing truck log (only if not sent to customs)
 * Uses the active company from session
 * Includes input validation
 */
export async function updateTruckLog(
  logId: string,
  updates: Partial<Omit<TruckLog, "id" | "createdAt" | "sentToCustoms">>
): Promise<{ success: boolean; error?: string; log?: TruckLog }> {
  try {
    // Get active company from session
    const companyId = await getActiveCompany()

    // Get company-scoped logs collection
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

    // Find the log
    const existingLog = await logsCollection.findOne({ id: logId })

    if (!existingLog) {
      return {
        success: false,
        error: "Log not found",
      }
    }

    // Allow editing logs even if sent to customs (re-edit feature)

    // Validate updates if provided
    if (Object.keys(updates).length > 0) {
      const validation = truckLogSchema.partial().safeParse(updates)
      if (!validation.success) {
        throw new ValidationError(
          "Invalid update data",
          validation.error.issues.reduce((acc, issue) => {
            const path = issue.path.join(".")
            acc[path] = issue.message
            return acc
          }, {} as Record<string, string>)
        )
      }
    }

    // Update the log (preserve id, createdAt, sentToCustoms)
    const updatedLog = {
      ...existingLog,
      ...updates,
      id: existingLog.id,
      createdAt: existingLog.createdAt,
      sentToCustoms: existingLog.sentToCustoms,
      updatedAt: new Date().toISOString(),
    }

    await logsCollection.updateOne(
      { id: logId },
      { $set: updatedLog }
    )

    // Fetch the updated document to ensure we have the latest version
    const updatedDoc = await logsCollection.findOne({ id: logId })
    
    if (!updatedDoc) {
      return {
        success: false,
        error: "Failed to retrieve updated log",
      }
    }

    // Serialize MongoDB document to plain object (remove _id, convert Date objects)
    // Create a plain object copy to avoid any MongoDB-specific properties
    const doc = updatedDoc as any
    const serializedLog: TruckLog = {
      id: doc.id,
      direction: doc.direction,
      plate: doc.plate,
      driverName: doc.driverName,
      cargoType: doc.cargoType,
      weightKg: doc.weightKg,
      comments: doc.comments,
      origin: doc.origin,
      destination: doc.destination,
      senderOrganization: doc.senderOrganization,
      receiverOrganization: doc.receiverOrganization,
      sentToCustoms: doc.sentToCustoms,
      createdAt: typeof doc.createdAt === 'string' 
        ? doc.createdAt 
        : (doc.createdAt instanceof Date 
            ? doc.createdAt.toISOString() 
            : (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString())),
    }

    return {
      success: true,
      log: serializedLog,
    }
  } catch (error) {
    const handled = handleError(error)
    return {
      success: false,
      error: handled.message,
    }
  }
}
