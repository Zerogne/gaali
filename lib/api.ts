"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import type { TruckLog } from "./types"

/**
 * Save truck log to company-scoped collection
 * Uses the active company from session
 */
export async function saveTruckLog(
  log: Omit<TruckLog, "id" | "createdAt" | "sentToCustoms">
): Promise<TruckLog> {
  // Get active company from session
  const companyId = await getActiveCompany()

  // Get company-scoped logs collection
  const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

  // Create log document
  const logDoc: TruckLog = {
    ...log,
    id: `truck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    sentToCustoms: false,
  }

  // Insert into company's collection
  await logsCollection.insertOne(logDoc)

  return logDoc
}

/**
 * Send truck log to customs
 * Reads from and updates company-scoped collection
 */
export async function sendTruckLogToCustoms(
  logId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get active company from session
    const companyId = await getActiveCompany()

    // Get company-scoped logs collection
    const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

    // Find the log in company's collection
    const log = await logsCollection.findOne({ id: logId })

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
      { id: logId },
      { $set: { sentToCustoms: true } }
    )

    return { success: true }
  } catch (error) {
    console.error("Error sending to customs:", error)
    return {
      success: false,
      error: "Failed to send to customs",
    }
  }
}

/**
 * Get all truck logs for the active company
 * Serializes MongoDB documents to plain objects for Client Components
 */
export async function getTruckLogs(): Promise<TruckLog[]> {
  const companyId = await getActiveCompany()
  const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")

  // Fetch all logs, sorted by creation date (newest first)
  const logs = await logsCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray()

  // Serialize MongoDB documents to plain objects
  return logs.map((doc) => {
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
