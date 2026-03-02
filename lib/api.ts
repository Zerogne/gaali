"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import { truckLogSchema } from "@/lib/validation"
import { handleError, ValidationError } from "@/lib/errors"
import type { TruckLog } from "./types"

/** Get numeric value from doc allowing alternate DB field spellings (e.g. TotalOutweight) */
function getWeightField(doc: any, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = doc?.[k]
    if (v != null && typeof v === "number" && !isNaN(v)) return v
  }
  return undefined
}

/** Normalize log for client: ensure totalInWeight/totalOutWeight/netWeight exist, populate weightKg/netWeightKg for UI compat */
function normalizeLogForClient(doc: any): TruckLog {
  const totalIn = getWeightField(doc, "totalInWeight", "TotalInWeight", "totalinweight")
  const totalOut = getWeightField(doc, "totalOutWeight", "TotalOutWeight", "TotalOutweight", "totaloutweight")
  const net = getWeightField(doc, "netWeight", "NetWeight", "netweight") ?? doc?.netWeightKg
  const hasNew = totalIn != null || totalOut != null || net != null
  const hasOld = doc.weightKg != null || doc.netWeightKg != null

  let totalInWeight = totalIn ?? doc.totalInWeight
  let totalOutWeight = totalOut ?? doc.totalOutWeight
  let netWeight = net != null ? net : doc.netWeight

  if (!hasNew && hasOld) {
    const w = doc.weightKg
    const n = doc.netWeightKg
    if (doc.direction === "IN" && n != null) {
      totalOutWeight = w
      netWeight = n
      totalInWeight = (w ?? 0) + Math.abs(n)
    } else if (doc.direction === "IN") {
      totalInWeight = w
    } else {
      totalOutWeight = w
      netWeight = n
      if (w != null && n != null) totalInWeight = w + Math.abs(n)
    }
  }

  const truckWeight = doc.truckWeight ?? doc.carWeight
  const trailerWeight = doc.trailerWeight

  return {
    ...doc,
    totalInWeight: totalInWeight ?? totalIn ?? doc.totalInWeight,
    totalOutWeight: totalOutWeight ?? totalOut ?? doc.totalOutWeight,
    netWeight: netWeight ?? net ?? doc.netWeight,
    truckWeight: truckWeight ?? doc.truckWeight,
    trailerWeight: trailerWeight ?? doc.trailerWeight,
    weightKg: totalOutWeight ?? totalInWeight ?? doc.weightKg,
    netWeightKg: netWeight ?? doc.netWeightKg,
  } as TruckLog
}

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
    
    // Map weight fields: prefer totalInWeight/totalOutWeight/netWeight; fallback to weightKg/netWeightKg
    const totalInWeight = (log as any).totalInWeight != null && !isNaN((log as any).totalInWeight) && (log as any).totalInWeight > 0
      ? (log as any).totalInWeight
      : undefined
    const totalOutWeight = (log as any).totalOutWeight != null && !isNaN((log as any).totalOutWeight) && (log as any).totalOutWeight > 0
      ? (log as any).totalOutWeight
      : undefined
    const netWeight = (log as any).netWeight != null && !isNaN((log as any).netWeight)
      ? (log as any).netWeight
      : (log as any).netWeightKg != null && !isNaN((log as any).netWeightKg) ? (log as any).netWeightKg : undefined

    const w = (log as any).weightKg
    const n = (log as any).netWeightKg
    const dir = (log as any).direction
    const ti = totalInWeight ?? (dir === "IN" && w > 0 ? w : undefined)
    const to = totalOutWeight ?? (dir === "OUT" && w > 0 ? w : (n != null && w > 0 ? w : undefined))
    const nw = netWeight ?? (n != null ? Math.abs(n) : undefined)

    const truckWeight = (log as any).truckWeight ?? (log as any).carWeight
    const trailerWeight = (log as any).trailerWeight
    const cleanedLog = {
      ...log,
      driverId: (log.driverId === "" || log.driverId === null) ? undefined : log.driverId,
      productId: ((log as any).productId === "" || (log as any).productId === null) ? undefined : (log as any).productId,
      totalInWeight: ti ?? (to != null && nw != null ? to + nw : undefined),
      totalOutWeight: to,
      netWeight: nw,
      truckWeight: truckWeight != null && truckWeight > 0 ? truckWeight : undefined,
      trailerWeight: trailerWeight != null && trailerWeight > 0 ? trailerWeight : undefined,
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

    // Create log document: totalInWeight/out = truckWeight + trailerWeight; persist truckWeight, trailerWeight too
    const { weightKg, netWeightKg, carWeight, ...rest } = validation.data as any
    const truckWeight = rest.truckWeight ?? carWeight
    const trailerWeight = rest.trailerWeight
    const logDoc: TruckLog = {
      ...rest,
      truckWeight: truckWeight != null && truckWeight > 0 ? truckWeight : undefined,
      trailerWeight: trailerWeight != null && trailerWeight > 0 ? trailerWeight : undefined,
      totalInWeight: rest.totalInWeight,
      totalOutWeight: rest.totalOutWeight,
      netWeight: rest.netWeight,
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

    const serializedLogs = logs.map((doc) => {
      const { _id, createdAt, ...log } = doc as any
      const serialized = {
        ...log,
        productId: log.productId,
        createdAt: typeof createdAt === 'string' 
          ? createdAt 
          : (createdAt instanceof Date 
              ? createdAt.toISOString() 
              : new Date(createdAt).toISOString()),
      }
      if (logs.indexOf(doc) < 3) {
        console.log("📖 Serialized log", logs.indexOf(doc) + 1, ":", {
          id: serialized.id,
          plate: serialized.plate,
          direction: serialized.direction,
          cargoType: serialized.cargoType,
          createdAt: serialized.createdAt,
        })
      }
      return normalizeLogForClient(serialized)
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

  const { _id, createdAt, ...logData } = log as any
  const serialized = {
    ...logData,
    productId: logData.productId,
    createdAt: typeof createdAt === 'string' 
      ? createdAt 
      : (createdAt instanceof Date 
          ? createdAt.toISOString() 
          : new Date(createdAt).toISOString()),
  }
  return normalizeLogForClient(serialized)
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

    // Map weight updates: accept weightKg/netWeightKg/carWeight; truckWeight=carWeight; totalIn/Out = truckWeight+trailerWeight
    const { weightKg: w, netWeightKg: n, carWeight, ...restUpdates } = updates as any
    const mapped: any = { ...restUpdates }
    if (updates.truckWeight != null) mapped.truckWeight = updates.truckWeight
    else if (carWeight != null && carWeight > 0) mapped.truckWeight = carWeight
    if (updates.trailerWeight != null) mapped.trailerWeight = updates.trailerWeight
    const dir = updates.direction ?? existingLog.direction
    const hasNet = n != null
    if (updates.totalInWeight != null) mapped.totalInWeight = updates.totalInWeight
    else if (updates.totalOutWeight != null) mapped.totalOutWeight = updates.totalOutWeight
    if (updates.netWeight != null) mapped.netWeight = updates.netWeight
    else if (n != null) mapped.netWeight = Math.abs(n)
    if (w != null && w > 0) {
      if (dir === "IN" && hasNet) {
        mapped.totalOutWeight = w
        mapped.totalInWeight = updates.totalInWeight ?? (w + Math.abs(n))
      } else if (dir === "IN") {
        mapped.totalInWeight = w
      } else {
        mapped.totalOutWeight = w
        if (n != null) mapped.totalInWeight = updates.totalInWeight ?? (w + Math.abs(n))
      }
    }

    if (Object.keys(mapped).length > 0) {
      const validation = truckLogSchema.partial().safeParse(mapped)
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

    const { weightKg: _w, netWeightKg: _n, carWeight: _c, ...safeUpdates } = {
      ...existingLog,
      ...mapped,
    } as any
    const updatedLog = {
      ...safeUpdates,
      id: existingLog.id,
      createdAt: existingLog.createdAt,
      sentToCustoms: existingLog.sentToCustoms,
      updatedAt: new Date().toISOString(),
    }

    await logsCollection.updateOne(
      { id: logId },
      { 
        $set: updatedLog,
        $unset: { weightKg: "", netWeightKg: "", carWeight: "" },
      }
    )

    // Fetch the updated document to ensure we have the latest version
    const updatedDoc = await logsCollection.findOne({ id: logId })
    
    if (!updatedDoc) {
      return {
        success: false,
        error: "Failed to retrieve updated log",
      }
    }

    const doc = updatedDoc as any
    const { _id, ...logData } = doc
    const serialized = {
      ...logData,
      productId: doc.productId,
      createdAt: typeof doc.createdAt === 'string' 
        ? doc.createdAt 
        : (doc.createdAt instanceof Date 
            ? doc.createdAt.toISOString() 
            : (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString())),
    }

    return {
      success: true,
      log: normalizeLogForClient(serialized),
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
