"use server"

import { ObjectId } from "mongodb"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import { handleError, ValidationError } from "@/lib/errors"
import { z } from "zod"

export type SessionDirection = "IN" | "OUT"

// Validation schema for truck session
const truckSessionSchema = z.object({
  direction: z.enum(["IN", "OUT"]),
  plateNumber: z.string().min(1, "Plate number is required"),
  driverName: z.string().optional(),
  product: z.string().optional(),
  transporterCompany: z.string().optional(),
  inSessionId: z.string().optional(),
  grossWeightKg: z.number().positive("Gross weight must be positive"),
  netWeightKg: z.number().optional().nullable(), // Allow negative values (negative = cargo loaded, positive = cargo unloaded)
  inTime: z.string().optional(),
  outTime: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * Generate a unique, unrepeatable code (8 characters, uppercase alphanumeric)
 * Format: A1B2C3D4 (easy to type and share)
 * 
 * Uses timestamp + random data to ensure uniqueness:
 * - Timestamp ensures different codes at different times
 * - Random component ensures different codes even at the same millisecond
 * - Database check ensures no duplicates exist (final guarantee)
 */
/**
 * Generate unique AKT code for truck session
 * Format: 312025121700009 (15 digits)
 * - 31: Company-specific prefix (2 digits)
 * - 20251217: Date YYYYMMDD (8 digits)
 * - 00009: Sequential number for that day (5 digits)
 * 
 * Sequential numbers are unique per day and queried from database
 * to ensure each IN and OUT session gets a different number
 */
async function generateUniqueCode(
  companyId: string,
  sessionsCollection: any
): Promise<string> {
  const companyPrefix = "31"
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "") // YYYYMMDD
  
  // Find the highest sequential number for today
  // Extract date part from uniqueCode: 31 + YYYYMMDD + XXXXX
  const todayPrefix = `${companyPrefix}${dateStr}`
  const todaySessions = await sessionsCollection
    .find({
      uniqueCode: { $regex: `^${todayPrefix}` }
    })
    .sort({ uniqueCode: -1 })
    .limit(1)
    .toArray()
  
  let seqNum = 1
  if (todaySessions.length > 0 && todaySessions[0].uniqueCode) {
    // Extract sequential number from existing code
    const existingCode = todaySessions[0].uniqueCode
    const existingSeqStr = existingCode.slice(todayPrefix.length) // Get last 5 digits
    const existingSeq = parseInt(existingSeqStr, 10)
    if (!isNaN(existingSeq)) {
      seqNum = existingSeq + 1
    }
  }
  
  // Format: 31 + YYYYMMDD + 00009 (5 digits) = 15 digits total
  const seqNumStr = seqNum.toString().padStart(5, '0')
  const aktNumber = `${companyPrefix}${dateStr}${seqNumStr}`
  
  return aktNumber
}

export interface TruckSession {
  _id?: ObjectId
  id: string // Custom ID for client-side use
  uniqueCode: string // Unique code for pulling data from external sites
  companyId: string
  direction: SessionDirection
  plateNumber: string
  driverName?: string
  product?: string
  transporterCompany?: string
  inSessionId?: string // Links to IN session for OUT sessions
  grossWeightKg: number
  netWeightKg?: number // Only for OUT sessions
  inTime?: string // ISO string for IN sessions
  outTime?: string // ISO string for OUT sessions
  notes?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Save a truck session (IN or OUT) to company-scoped collection
 * Uses the active company from session
 * Includes input validation
 */
export async function saveTruckSession(
  sessionData: Omit<TruckSession, "_id" | "id" | "uniqueCode" | "companyId" | "createdAt" | "updatedAt">
): Promise<TruckSession> {
  try {
    console.log("💾 saveTruckSession called with:", JSON.stringify(sessionData, null, 2))
    
    // Validate input (data should already be cleaned by API route)
    const validation = truckSessionSchema.safeParse(sessionData)
    if (!validation.success) {
      console.error("❌ Validation failed:", JSON.stringify(validation.error.issues, null, 2))
      throw new ValidationError(
        "Invalid truck session data",
        validation.error.issues.reduce((acc, issue) => {
          const path = issue.path.join(".")
          acc[path] = issue.message
          return acc
        }, {} as Record<string, string>)
      )
    }
    console.log("✅ Validation passed")

    // Get active company from session
    let companyId: string
    try {
      companyId = await getActiveCompany()
      console.log("✅ Active company ID:", companyId)
      if (!companyId) {
        throw new Error("No active company found")
      }
    } catch (error) {
      console.error("❌ Error getting active company:", error)
      throw new Error("Authentication required. Please log in.")
    }

    // Get company-scoped sessions collection
    let sessionsCollection
    try {
      sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )
      console.log("✅ Got sessions collection for company:", companyId)
    } catch (error) {
      console.error("❌ Error getting sessions collection:", error)
      throw new Error(`Failed to access database: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Generate unique code based on database (ensures each IN and OUT session gets different sequential number)
    const uniqueCode = await generateUniqueCode(companyId, sessionsCollection)
    console.log(`🔑 Generated unique code:`, uniqueCode)
    
    // Verify it doesn't exist (shouldn't happen, but double-check)
    const existing = await sessionsCollection.findOne({ uniqueCode })
    if (existing) {
      throw new Error("Generated code already exists - this should not happen")
    }

    // Create session document
    const now = new Date()
    const sessionDoc: TruckSession = {
      ...validation.data,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uniqueCode,
      companyId,
      createdAt: now,
      updatedAt: now,
      // Ensure netWeightKg is undefined instead of null
      netWeightKg: validation.data.netWeightKg === null ? undefined : validation.data.netWeightKg,
    }

    // Insert into company's collection
    console.log("💾 Attempting to insert session document:", JSON.stringify(sessionDoc, null, 2))
    let insertResult
    try {
      insertResult = await sessionsCollection.insertOne(sessionDoc)
      console.log("📝 Insert result:", insertResult)
    } catch (error) {
      console.error("❌ Error inserting session:", error)
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message)
        console.error("❌ Error stack:", error.stack)
      }
      throw new Error(`Failed to insert session into database: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    if (!insertResult.insertedId) {
      console.error("❌ Insert result has no insertedId:", insertResult)
      throw new Error("Failed to insert session into database - no insertedId returned")
    }
    console.log("✅ Session saved with unique code:", uniqueCode, "insertedId:", insertResult.insertedId)

    // Verify the session was actually saved by querying it back
    try {
      const verifySession = await sessionsCollection.findOne({ uniqueCode })
      if (verifySession) {
        console.log("✅ Verification: Session found in database after save")
        console.log("✅ Verification: Session plate:", verifySession.plateNumber)
        console.log("✅ Verification: Session direction:", verifySession.direction)
        console.log("✅ Verification: Session weight:", verifySession.grossWeightKg)
      } else {
        console.error("❌ Verification: Session NOT found in database after save!")
        console.error("❌ Verification: This indicates a serious database issue")
      }
    } catch (verifyError) {
      console.error("❌ Verification: Error verifying session:", verifyError)
    }

    // Serialize MongoDB document to plain object
    const serializedSession: TruckSession = {
      id: sessionDoc.id,
      uniqueCode: sessionDoc.uniqueCode,
      companyId: sessionDoc.companyId,
      direction: sessionDoc.direction,
      plateNumber: sessionDoc.plateNumber,
      driverName: sessionDoc.driverName,
      product: sessionDoc.product,
      transporterCompany: sessionDoc.transporterCompany,
      inSessionId: sessionDoc.inSessionId,
      grossWeightKg: sessionDoc.grossWeightKg,
      netWeightKg: sessionDoc.netWeightKg,
      inTime: sessionDoc.inTime,
      outTime: sessionDoc.outTime,
      notes: sessionDoc.notes,
      createdAt: sessionDoc.createdAt,
      updatedAt: sessionDoc.updatedAt,
    }

    return serializedSession
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Get truck sessions for the active company with optional filters
 * Serializes MongoDB documents to plain objects for Client Components
 */
export async function getTruckSessions(options?: {
  direction?: SessionDirection
  plateNumber?: string
  startDate?: Date | string
  endDate?: Date | string
  limit?: number
  page?: number
}): Promise<{
  sessions: TruckSession[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  try {
    const companyId = await getActiveCompany()
    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    // Build query filter
    const filter: any = {}
    if (options?.direction) {
      filter.direction = options.direction
    }
    if (options?.plateNumber) {
      filter.plateNumber = { $regex: options.plateNumber, $options: "i" }
    }
    
    // Date range filter
    if (options?.startDate || options?.endDate) {
      filter.createdAt = {}
      if (options.startDate) {
        const start = options.startDate instanceof Date 
          ? options.startDate 
          : new Date(options.startDate)
        filter.createdAt.$gte = start
      }
      if (options.endDate) {
        const end = options.endDate instanceof Date 
          ? options.endDate 
          : new Date(options.endDate)
        // Set to end of day
        end.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = end
      }
    }

    // Pagination
    const page = Math.max(1, options?.page || 1)
    const limit = Math.min(100, Math.max(1, options?.limit || 50))
    const skip = (page - 1) * limit

    // Get total count
    const total = await sessionsCollection.countDocuments(filter)

    // Fetch sessions with pagination, sorted by creation date (newest first)
    const sessions = await sessionsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Serialize MongoDB documents to plain objects
    const serializedSessions = sessions.map((doc) => {
      const { _id, ...session } = doc
      return {
        ...session,
        uniqueCode: session.uniqueCode || "",
        createdAt: session.createdAt instanceof Date 
          ? session.createdAt 
          : typeof session.createdAt === 'string'
            ? new Date(session.createdAt)
            : new Date(session.createdAt),
        updatedAt: session.updatedAt instanceof Date 
          ? session.updatedAt 
          : typeof session.updatedAt === 'string'
            ? new Date(session.updatedAt)
            : new Date(session.updatedAt),
      } as TruckSession
    })

    return {
      sessions: serializedSessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Get a single truck session by ID (company-scoped)
 * Serializes MongoDB document to plain object for Client Components
 */
export async function getTruckSession(sessionId: string): Promise<TruckSession | null> {
  try {
    const companyId = await getActiveCompany()
    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    const session = await sessionsCollection.findOne({ id: sessionId })

    if (!session) return null

    // Serialize MongoDB document to plain object
    const { _id, ...sessionData } = session
    return {
      ...sessionData,
      uniqueCode: sessionData.uniqueCode || "",
      createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
      updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt),
    } as TruckSession
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Find the most recent IN session for a given plate number
 * Used by OUT sessions to calculate net weight
 */
export async function findLatestInSession(
  plateNumber: string
): Promise<TruckSession | null> {
  try {
    const companyId = await getActiveCompany()
    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    const normalizedPlate = plateNumber.trim().toUpperCase();
    console.log("🔍 findLatestInSession: Searching for plate:", normalizedPlate);

    // First try exact match with weight > 0
    let inSession = await sessionsCollection
      .findOne(
        {
          direction: "IN",
          plateNumber: normalizedPlate,
          grossWeightKg: { $gt: 0 },
        },
        { sort: { createdAt: -1 } }
      )

    // If not found, try without weight restriction (in case weight is 0 or null)
    if (!inSession) {
      console.log("🔍 findLatestInSession: Not found with weight > 0, trying without weight restriction");
      inSession = await sessionsCollection
        .findOne(
          {
            direction: "IN",
            plateNumber: normalizedPlate,
          },
          { sort: { createdAt: -1 } }
        )
    }

    // If still not found, try case-insensitive regex search
    if (!inSession) {
      console.log("🔍 findLatestInSession: Not found with exact match, trying case-insensitive regex");
      inSession = await sessionsCollection
        .findOne(
          {
            direction: "IN",
            plateNumber: { $regex: normalizedPlate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: "i" },
          },
          { sort: { createdAt: -1 } }
        )
    }

    if (!inSession) {
      console.log("🔍 findLatestInSession: No session found");
      return null;
    }

    console.log("✅ findLatestInSession: Found session:", inSession.id);

    // Serialize MongoDB document to plain object
    const { _id, ...sessionData } = inSession
    return {
      ...sessionData,
      uniqueCode: sessionData.uniqueCode || "",
      createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
      updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt),
    } as TruckSession
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Update an existing truck session
 */
export async function updateTruckSession(
  sessionId: string,
  updates: Partial<Omit<TruckSession, "_id" | "id" | "uniqueCode" | "companyId" | "createdAt">>
): Promise<TruckSession | null> {
  try {
    const companyId = await getActiveCompany()
    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    const existingSession = await sessionsCollection.findOne({ id: sessionId })

    if (!existingSession) {
      return null
    }

    // Validate updates if provided
    if (Object.keys(updates).length > 0) {
      const validation = truckSessionSchema.partial().safeParse(updates)
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

    // Update the session (don't allow updating uniqueCode)
    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    }

    await sessionsCollection.updateOne({ id: sessionId }, { $set: updateDoc })

    // Fetch updated session
    const updatedSession = await sessionsCollection.findOne({ id: sessionId })

    if (!updatedSession) return null

    // Serialize MongoDB document to plain object
    const { _id, ...sessionData } = updatedSession
    return {
      ...sessionData,
      uniqueCode: sessionData.uniqueCode || "",
      createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
      updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt),
    } as TruckSession
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Delete a truck session
 */
export async function deleteTruckSession(sessionId: string): Promise<boolean> {
  try {
    const companyId = await getActiveCompany()
    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    const result = await sessionsCollection.deleteOne({ id: sessionId })

    return result.deletedCount > 0
  } catch (error) {
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}

/**
 * Get a truck session by unique code (for external sites to pull data)
 * This function searches across all companies to find the session
 */
export async function getTruckSessionByUniqueCode(uniqueCode: string): Promise<TruckSession | null> {
  try {
    const { getDatabase } = await import("@/lib/db/client")
    const db = await getDatabase()
    
    // Search across all company collections
    // We need to find which company has this unique code
    const companiesCollection = db.collection("companies")
    const companies = await companiesCollection.find({}).toArray()
    
    const normalizedCode = uniqueCode.toUpperCase().trim()
    
    for (const company of companies) {
      const companyId = company.id || company._id?.toString()
      if (!companyId) continue
      
      const sessionsCollection = db.collection(`company_${companyId}_truck_sessions`)
      const session = await sessionsCollection.findOne({ uniqueCode: normalizedCode })
      
      if (session) {
        // Serialize MongoDB document to plain object
        const { _id, ...sessionData } = session
        return {
          ...sessionData,
          uniqueCode: sessionData.uniqueCode || "",
          createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
          updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt),
        } as TruckSession
      }
    }
    
    return null
  } catch (error) {
    console.error("Error getting truck session by unique code:", error)
    const handled = handleError(error)
    throw new Error(handled.message)
  }
}
