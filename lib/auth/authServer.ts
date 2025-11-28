"use server"

import { redirect } from "next/navigation"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { setSession } from "./session"

interface WorkerWithPassword {
  id: string
  name: string
  role: string
  avatarColor: string
  companyId: string
  password?: string
}

export interface LoginResult {
  success: boolean
  error?: string
  redirect?: string
}

/**
 * Login worker - verifies credentials against company-scoped worker collection
 * Sets session with companyId and workerId on success
 */
export async function loginWorker(
  companyId: string,
  workerId: string,
  password: string
): Promise<LoginResult> {
  try {
    // Get company-scoped workers collection
    const workersCollection = await getCompanyCollection<WorkerWithPassword>(
      companyId,
      "workers"
    )

    // Find the worker in the company's collection
    const worker = await workersCollection.findOne({ id: workerId })

    // Verify worker exists and belongs to the company
    if (!worker) {
      return {
        success: false,
        error: "Worker not found",
      }
    }

    if (worker.companyId !== companyId) {
      return {
        success: false,
        error: "Worker does not belong to this company",
      }
    }

    // Verify password
    // In production, passwords should be hashed (e.g., using bcrypt)
    const correctPassword = worker.password

    if (!correctPassword || correctPassword !== password) {
      return {
        success: false,
        error: "Incorrect password",
      }
    }

    // Set session with companyId and workerId
    await setSession(companyId, workerId)

    // Record login session in company's sessions collection
    const sessionsCollection = await getCompanyCollection(companyId, "sessions")
    await sessionsCollection.insertOne({
      workerId,
      companyId,
      loginAt: new Date(),
      createdAt: new Date(),
    })

    // Redirect to dashboard (this will throw, which is expected in Next.js)
    redirect("/")
  } catch (error) {
    // If it's a redirect error, let it propagate
    if (error && typeof error === "object" && "digest" in error) {
      throw error
    }

    console.error("Login error:", error)
    return {
      success: false,
      error: "An error occurred during login",
    }
  }
}

export async function logout(): Promise<void> {
  const { clearSession } = await import("./session")
  
  // Clear session cookies
  await clearSession()
  
  // In a real app, you would also:
  // 1. Invalidate session in database
  // 2. Log logout event
  
  // Redirect to login page
  redirect("/login")
}

