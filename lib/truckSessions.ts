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
  netWeightKg: z.number().positive().optional().nullable(),
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
function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excludes confusing chars like 0, O, I, 1
  
  // Get current timestamp (milliseconds since epoch)
  const timestamp = Date.now()
  
  // Generate multiple random components for better uniqueness
  const random1 = Math.random() * 1000000
  const random2 = Math.random() * 1000000
  const random3 = Math.random() * 1000000
  
  // Combine timestamp + multiple random values for maximum uniqueness
  let code = ""
  let seed = Math.abs(Math.floor(timestamp + random1 + random2 + random3))
  
  // Generate 8 characters using the seed and additional randomness
  for (let i = 0; i < 8; i++) {
    // Mix seed-based selection with fresh random for each character
    const randomIndex = Math.floor(Math.random() * chars.length)
    const seedIndex = seed % chars.length
    const index = (seedIndex + randomIndex) % chars.length
    code += chars.charAt(index)
    // Rotate seed for next character
    seed = Math.floor(seed / chars.length) + (i * 1000) + Math.floor(Math.random() * 100)
  }
  
  return code
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
    console.log("💾 saveTruckSession called with:", sessionData)
    
    // Validate input (data should already be cleaned by API route)
    const validation = truckSessionSchema.safeParse(sessionData)
    if (!validation.success) {
      throw new ValidationError(
        "Invalid truck session data",
        validation.error.issues.reduce((acc, issue) => {
          const path = issue.path.join(".")
          acc[path] = issue.message
          return acc
        }, {} as Record<string, string>)
      )
    }

    // Get active company from session
    const companyId = await getActiveCompany()

    // Get company-scoped sessions collection
    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    // Generate unique code and ensure it's unique
    // The code combines timestamp + random data, but we still check database to guarantee uniqueness
    let uniqueCode: string
    let attempts = 0
    const maxAttempts = 10
    do {
      uniqueCode = generateUniqueCode()
      console.log(`🔑 Generated unique code (attempt ${attempts + 1}):`, uniqueCode)
      
      // Check if this code already exists in the database
      const existing = await sessionsCollection.findOne({ uniqueCode })
      if (!existing) {
        console.log(`✅ Unique code verified - no duplicates found:`, uniqueCode)
        break
      }
      
      // If duplicate found, generate a new one
      console.warn(`⚠️ Duplicate code found, generating new one... (attempt ${attempts + 1})`)
      attempts++
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique code after multiple attempts")
      }
    } while (true)

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
    await sessionsCollection.insertOne(sessionDoc)
    console.log("✅ Session saved with unique code:", uniqueCode)

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

    const inSession = await sessionsCollection
      .findOne(
        {
          direction: "IN",
          plateNumber: plateNumber.trim().toUpperCase(),
          grossWeightKg: { $gt: 0 },
        },
        { sort: { createdAt: -1 } }
      )

    if (!inSession) return null

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
