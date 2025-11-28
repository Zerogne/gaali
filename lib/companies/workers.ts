"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import type { Worker } from "@/lib/auth/mockData"

export interface WorkerWithPassword extends Worker {
  password?: string
}

/**
 * Get all workers for a specific company
 * Reads from company-scoped workers collection
 * Serializes MongoDB documents to plain objects for Client Components
 */
export async function getCompanyWorkers(companyId: string): Promise<Worker[]> {
  const workersCollection = await getCompanyCollection<WorkerWithPassword>(
    companyId,
    "workers"
  )

  const workers = await workersCollection.find({}).toArray()

  // Serialize MongoDB documents and remove password from response
  return workers.map((worker: any) => {
    const { password, _id, ...workerData } = worker
    return {
      id: workerData.id,
      name: workerData.name,
      role: workerData.role,
      avatarColor: workerData.avatarColor,
      companyId: workerData.companyId,
    }
  })
}

/**
 * Get a single worker by ID (company-scoped)
 * Serializes MongoDB document to plain object
 */
export async function getCompanyWorker(
  companyId: string,
  workerId: string
): Promise<WorkerWithPassword | null> {
  const workersCollection = await getCompanyCollection<WorkerWithPassword>(
    companyId,
    "workers"
  )

  const worker = await workersCollection.findOne({ id: workerId })
  
  if (!worker) return null

  // Serialize MongoDB document to plain object
  const { _id, ...workerData } = worker
  return workerData
}

