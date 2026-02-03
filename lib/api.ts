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
      productId: ((log as any).productId === "" || (log as any).productId === null) ? undefined : (log as any).productId,
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
    const collectionName = "logs"
    const fullCollectionName = `company_${companyId}_${collectionName}`
    console.log("💾 Using collection:", fullCollectionName)
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, collectionName)

    // Create log document
    const logDoc: TruckLog = {
      ...validation.data,
      id: `truck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      sentToCustoms: false,
    }

    // Insert into company's collection
    console.log("💾 Inserting log document into database...")
    console.log("💾 Log document:", JSON.stringify(logDoc, null, 2))
    const insertResult = await logsCollection.insertOne(logDoc)
    console.log("✅ Log document inserted successfully")
    console.log("✅ Insert result:", {
      acknowledged: insertResult.acknowledged,
      insertedId: insertResult.insertedId,
    })
    
    if (!insertResult.acknowledged) {
      console.error("❌ CRITICAL: Log insert was not acknowledged by database!")
      throw new Error("Failed to insert log - database did not acknowledge the insert")
    }

    // Serialize MongoDB document to plain object (remove _id, ensure all values are serializable)
    // Create a clean copy to avoid any MongoDB-specific properties
    const { _id: _, ...logData } = logDoc as any
    const serializedLog: TruckLog = {
      ...logData,
      productId: logData.productId, // Include productId if present
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
    console.log("📖 getTruckLogs called for company:", companyId, "page:", page, "limit:", limit)
    
    // Verify we're using the correct collection name
    const collectionName = "logs"
    const fullCollectionName = `company_${companyId}_${collectionName}`
    console.log("📖 Using collection:", fullCollectionName)
    
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, collectionName)

    // Validate pagination params (cap 100 for dashboard, 10000 for reports)
    const validLimit = Math.min(10000, Math.max(1, Math.floor(limit)))
    const validPage = Math.max(1, Math.floor(page))
    const skip = (validPage - 1) * validLimit

    // Get total count
    const total = await logsCollection.countDocuments({})
    console.log("📖 Total logs in 'logs' collection:", total)
    
    // Also check truck_sessions collection for comparison
    try {
      const { getCompanyCollection: getCompanyCollection2 } = await import("@/lib/db/companyDb")
      const sessionsCollection = await getCompanyCollection2(companyId, "truck_sessions")
      const sessionCount = await sessionsCollection.countDocuments({})
      console.log("📖 Total sessions in 'truck_sessions' collection:", sessionCount)
      console.log("📖 Difference (sessions - logs):", sessionCount - total, "- this should be 0 or small")
    } catch (e) {
      console.warn("⚠️ Could not check truck_sessions collection:", e)
    }

    // Fetch logs with pagination, sorted by last activity (updatedAt if present, else createdAt)
    const logs = await logsCollection
      .aggregate([
        { $addFields: { sortDate: { $ifNull: ["$updatedAt", "$createdAt"] } } },
        { $sort: { sortDate: -1 } },
        { $skip: skip },
        { $limit: validLimit },
        { $project: { sortDate: 0 } },
      ])
      .toArray()
    
    console.log("📖 Fetched", logs.length, "logs from database")
    if (logs.length > 0) {
      console.log("📖 First log ID:", logs[0].id, "| Plate:", logs[0].plate, "| Created:", logs[0].createdAt)
    } else {
      console.warn("⚠️ No logs found in collection - this might indicate a problem")
    }

    // Serialize MongoDB documents to plain objects
    const serializedLogs = logs.map((doc) => {
      const { _id, createdAt, ...log } = doc as any
      const serialized = {
        ...log,
        productId: log.productId, // Include productId if present
        createdAt: typeof createdAt === 'string' 
          ? createdAt 
          : (createdAt instanceof Date 
              ? createdAt.toISOString() 
              : new Date(createdAt).toISOString()),
      } as TruckLog
      
      // Debug: Log first few logs to verify they're being serialized correctly
      if (logs.indexOf(doc) < 3) {
        console.log("📖 Serialized log", logs.indexOf(doc) + 1, ":", {
          id: serialized.id,
          plate: serialized.plate,
          direction: serialized.direction,
          cargoType: serialized.cargoType,
          createdAt: serialized.createdAt,
        })
      }
      
      return serialized
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
    productId: logData.productId, // Include productId if present
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
    const { _id, ...logData } = doc
    const serializedLog: TruckLog = {
      ...logData,
      productId: doc.productId, // Include productId if present
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

/**
 * Delete a truck log
 * Uses the active company from session
 */
export async function deleteTruckLog(
  logId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🗑️ deleteTruckLog called with logId:", logId)
    
    const companyId = await getActiveCompany()
    console.log("🗑️ Company ID:", companyId)
    
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")
    const fullCollectionName = `company_${companyId}_logs`
    console.log("🗑️ Using collection:", fullCollectionName)

    // First, check if the log exists
    const existingLog = await logsCollection.findOne({ id: logId })
    if (!existingLog) {
      console.warn("⚠️ Log not found in database:", logId)
      return {
        success: false,
        error: "Log not found",
      }
    }
    console.log("🗑️ Found log to delete:", {
      id: existingLog.id,
      plate: existingLog.plate,
      direction: existingLog.direction,
      createdAt: existingLog.createdAt
    })

    // Delete the log
    const result = await logsCollection.deleteOne({ id: logId })
    console.log("🗑️ Delete result:", {
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged
    })

    if (result.deletedCount === 0) {
      console.error("❌ Delete operation returned deletedCount: 0")
      return {
        success: false,
        error: "Log not found or could not be deleted",
      }
    }

    // Verify deletion by checking if log still exists
    const verifyLog = await logsCollection.findOne({ id: logId })
    if (verifyLog) {
      console.error("❌ Log still exists after deletion attempt!")
      return {
        success: false,
        error: "Log deletion failed - log still exists",
      }
    }

    console.log("✅ Log successfully deleted from database")
    return {
      success: true,
    }
  } catch (error) {
    console.error("❌ Error in deleteTruckLog:", error)
    const handled = handleError(error)
    return {
      success: false,
      error: handled.message,
    }
  }
}
