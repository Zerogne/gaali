"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COMPANY_ID_COOKIE = "company-id"
const WORKER_ID_COOKIE = "worker-id"
const SESSION_EXPIRES_COOKIE = "session-expires"

// Session duration: 7 days (in seconds)
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

// Check if cookies should be secure (production or forced)
const isSecure = process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true"

export interface SessionData {
  companyId: string
  workerId: string
  expiresAt: number
}

/**
 * Get the active company context from session
 * Throws if no company is set (forces login)
 * Validates session expiration
 */
export async function getActiveCompany(): Promise<string> {
  const cookieStore = await cookies()
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value
  const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value

  if (!companyId) {
    redirect("/login")
  }

  // Check expiration
  if (expiresAt) {
    const expires = parseInt(expiresAt, 10)
    if (isNaN(expires) || expires < Date.now()) {
      // Session expired, clear and redirect
      await clearSession()
      redirect("/login")
    }
  }

  return companyId
}

/**
 * Get the current session data (companyId + workerId)
 * Returns null if not authenticated or expired
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value
  const workerId = cookieStore.get(WORKER_ID_COOKIE)?.value
  const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value

  if (!companyId || !workerId) {
    return null
  }

  // Check expiration
  if (expiresAt) {
    const expires = parseInt(expiresAt, 10)
    if (isNaN(expires) || expires < Date.now()) {
      // Session expired
      await clearSession()
      return null
    }
  }

  return {
    companyId,
    workerId,
    expiresAt: expiresAt ? parseInt(expiresAt, 10) : Date.now() + SESSION_MAX_AGE * 1000,
  }
}

/**
 * Set session expiration timestamp
 */
function setSessionExpiration(cookieStore: ReturnType<typeof cookies>) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000
  cookieStore.set(SESSION_EXPIRES_COOKIE, expiresAt.toString(), {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

/**
 * Set session after successful login
 * Includes expiration timestamp
 */
export async function setSession(companyId: string, workerId: string) {
  const cookieStore = await cookies()
  
  // Validate inputs
  if (!companyId || !workerId) {
    throw new Error("Company ID and Worker ID are required")
  }

  // Set cookies with httpOnly for security
  cookieStore.set(COMPANY_ID_COOKIE, companyId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })

  cookieStore.set(WORKER_ID_COOKIE, workerId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })

  setSessionExpiration(cookieStore)
}

/**
 * Set company session (partial session - company logged in, worker not selected yet)
 * Includes expiration timestamp
 */
export async function setCompanySession(companyId: string) {
  const cookieStore = await cookies()
  
  if (!companyId) {
    throw new Error("Company ID is required")
  }

  cookieStore.set(COMPANY_ID_COOKIE, companyId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })

  setSessionExpiration(cookieStore)
}

/**
 * Set worker ID in existing company session
 * Refreshes expiration
 */
export async function setWorkerInSession(workerId: string) {
  const cookieStore = await cookies()
  
  if (!workerId) {
    throw new Error("Worker ID is required")
  }

  // Verify company session exists
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value
  if (!companyId) {
    throw new Error("Company session not found")
  }

  cookieStore.set(WORKER_ID_COOKIE, workerId, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })

  setSessionExpiration(cookieStore)
}

/**
 * Refresh session expiration
 */
export async function refreshSession() {
  const cookieStore = await cookies()
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value
  const workerId = cookieStore.get(WORKER_ID_COOKIE)?.value

  if (companyId && workerId) {
    setSessionExpiration(cookieStore)
  }
}

/**
 * Clear session on logout
 */
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COMPANY_ID_COOKIE)
  cookieStore.delete(WORKER_ID_COOKIE)
  cookieStore.delete(SESSION_EXPIRES_COOKIE)
}

/**
 * Check if user is authenticated (both company and worker)
 * Also checks expiration
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Check if company is logged in (partial authentication)
 * Also checks expiration
 */
export async function isCompanyAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value
  const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value

  if (!companyId) {
    return false
  }

  // Check expiration
  if (expiresAt) {
    const expires = parseInt(expiresAt, 10)
    if (isNaN(expires) || expires < Date.now()) {
      return false
    }
  }

  return true
}

