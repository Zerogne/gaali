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
  netWeightKg: z.number().positive().optional(),
  inTime: z.string().optional(),
  outTime: z.string().optional(),
  notes: z.string().optional(),
})

export interface TruckSession {
  _id?: ObjectId
  id: string // Custom ID for client-side use
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
  sessionData: Omit<TruckSession, "_id" | "id" | "companyId" | "createdAt" | "updatedAt">
): Promise<TruckSession> {
  try {
    // Validate input
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

    // Create session document
    const now = new Date()
    const sessionDoc: TruckSession = {
      ...validation.data,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      createdAt: now,
      updatedAt: now,
    }

    // Insert into company's collection
    await sessionsCollection.insertOne(sessionDoc)

    // Serialize MongoDB document to plain object
    const serializedSession: TruckSession = {
      id: sessionDoc.id,
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
  updates: Partial<Omit<TruckSession, "_id" | "id" | "companyId" | "createdAt">>
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

    // Update the session
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
