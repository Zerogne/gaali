"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import bcrypt from "bcryptjs"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import { setSession, setCompanySession, setWorkerInSession, getActiveCompany } from "./session"
import { loginCompanySchema, selectWorkerSchema, loginWorkerSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rateLimit"
import { handleError } from "@/lib/errors"

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
 * Login company - verifies company password with bcrypt
 * Sets session with companyId only (worker not selected yet)
 * Includes rate limiting and input validation
 */
export async function loginCompany(
  companyId: string,
  password: string
): Promise<LoginResult> {
  try {
    // Validate input with Zod
    const validation = loginCompanySchema.safeParse({ companyId, password })
    if (!validation.success) {
      return {
        success: false,
        error: "Invalid input. Please check your credentials.",
      }
    }

    // Rate limiting - get IP from headers
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP || 'unknown'
    const rateLimitId = `login:company:${companyId}:${clientIP}`
    const rateLimitResult = await rateLimit(rateLimitId, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
      }
    }

    // Get company from shared companies collection
    const companiesCollection = await getCompaniesCollection()
    const company = await companiesCollection.findOne({ companyId })

    // Use generic error message to prevent enumeration
    if (!company) {
      console.error(`Company not found: ${companyId}`)
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    if (!company.password) {
      console.error(`Company found but no password set: ${companyId}`)
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, company.password)
    if (!isValid) {
      console.error(`Password mismatch for company: ${companyId}`)
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Set session with companyId only (partial session)
    await setCompanySession(companyId)

    return {
      success: true,
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
 * Select worker - sets workerId in existing company session
 * No password required (company already authenticated)
 * SECURITY: companyId is retrieved from session, NOT from client
 */
export async function selectWorker(
  workerId: string
): Promise<LoginResult> {
  try {
    // Validate input
    const validation = selectWorkerSchema.safeParse({ workerId })
    if (!validation.success) {
      return {
        success: false,
        error: "Invalid worker ID",
      }
    }

    // CRITICAL: Get companyId from session, not from client
    const sessionCompanyId = await getActiveCompany()

    // Get company-scoped workers collection using session companyId
    const workersCollection = await getCompanyCollection<WorkerWithPassword>(
      sessionCompanyId,
      "workers"
    )

    // Find the worker in the company's collection
    const worker = await workersCollection.findOne({ id: workerId })

    // Verify worker exists and belongs to the session company
    if (!worker || worker.companyId !== sessionCompanyId) {
      return {
        success: false,
        error: "Worker not found",
      }
    }

    // Set workerId in existing company session
    await setWorkerInSession(workerId)

    // Record login session in company's sessions collection
    const sessionsCollection = await getCompanyCollection(sessionCompanyId, "sessions")
    await sessionsCollection.insertOne({
      workerId,
      companyId: sessionCompanyId,
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

    const handled = handleError(error)
    return {
      success: false,
      error: handled.message,
    }
  }
}

/**
 * Legacy: Login worker - verifies credentials against company-scoped worker collection
 * Sets session with companyId and workerId on success
 * @deprecated Use loginCompany + selectWorker instead
 * Includes rate limiting and bcrypt password verification
 */
export async function loginWorker(
  companyId: string,
  workerId: string,
  password: string
): Promise<LoginResult> {
  try {
    // Validate input
    const validation = loginWorkerSchema.safeParse({ companyId, workerId, password })
    if (!validation.success) {
      return {
        success: false,
        error: "Invalid input. Please check your credentials.",
      }
    }

    // Rate limiting - get IP from headers
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP || 'unknown'
    const rateLimitId = `login:worker:${companyId}:${workerId}:${clientIP}`
    const rateLimitResult = await rateLimit(rateLimitId, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
      }
    }

    // Get company-scoped workers collection
    const workersCollection = await getCompanyCollection<WorkerWithPassword>(
      companyId,
      "workers"
    )

    // Find the worker in the company's collection
    const worker = await workersCollection.findOne({ id: workerId })

    // Use generic error message
    if (!worker || worker.companyId !== companyId) {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Verify password with bcrypt
    if (!worker.password) {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    const isValid = await bcrypt.compare(password, worker.password)
    if (!isValid) {
      return {
        success: false,
        error: "Invalid credentials",
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

    const handled = handleError(error)
    return {
      success: false,
      error: handled.message,
    }
  }
}

export async function logout(): Promise<void> {
  const { clearSession } = await import("./session")
  
  try {
    // Clear session cookies
    await clearSession()
    
    // In a real app, you would also:
    // 1. Invalidate session in database
    // 2. Log logout event
    
    // Redirect to login page
    redirect("/login")
  } catch (error) {
    // Even if clearing session fails, try to redirect
    redirect("/login")
  }
}

