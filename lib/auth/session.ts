"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = "truck-dashboard-session"
const COMPANY_ID_COOKIE = "company-id"
const WORKER_ID_COOKIE = "worker-id"

export interface SessionData {
  companyId: string
  workerId: string
}

/**
 * Get the active company context from session
 * Throws if no company is set (forces login)
 */
export async function getActiveCompany(): Promise<string> {
  const cookieStore = await cookies()
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value

  if (!companyId) {
    redirect("/login")
  }

  return companyId
}

/**
 * Get the current session data (companyId + workerId)
 * Returns null if not authenticated
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value
  const workerId = cookieStore.get(WORKER_ID_COOKIE)?.value

  if (!companyId || !workerId) {
    return null
  }

  return { companyId, workerId }
}

/**
 * Set session after successful login
 */
export async function setSession(companyId: string, workerId: string) {
  const cookieStore = await cookies()
  
  // Set cookies with httpOnly for security
  cookieStore.set(COMPANY_ID_COOKIE, companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  cookieStore.set(WORKER_ID_COOKIE, workerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

/**
 * Clear session on logout
 */
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COMPANY_ID_COOKIE)
  cookieStore.delete(WORKER_ID_COOKIE)
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

