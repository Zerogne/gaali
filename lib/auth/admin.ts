"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { rateLimit } from "@/lib/rateLimit"

const ADMIN_SESSION_COOKIE = "admin-session"
const ADMIN_SESSION_EXPIRES_COOKIE = "admin-session-expires"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const isSecure = process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true"

export interface AdminLoginResult {
  success: boolean
  error?: string
}

/**
 * Login admin user with email and password
 * Uses environment variables for admin credentials
 */
export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  try {
    // Rate limiting by email
    const rateLimitResult = await rateLimit(`admin-login-${email.toLowerCase()}`, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many login attempts. Please try again later.",
      }
    }

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment")
      return {
        success: false,
        error: "Admin authentication not configured",
      }
    }

    // Check if email matches
    if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Verify password (compare with plaintext from env)
    // In production, you might want to hash this and compare
    if (password !== adminPassword) {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    // Set admin session
    await setAdminSession(adminEmail)

    return { success: true }
  } catch (error) {
    console.error("Admin login error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

/**
 * Set admin session cookie
 */
async function setAdminSession(email: string) {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000

  cookieStore.set(ADMIN_SESSION_COOKIE, email, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })

  cookieStore.set(ADMIN_SESSION_EXPIRES_COOKIE, expiresAt.toString(), {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

/**
 * Get current admin session
 */
export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  const expiresCookie = cookieStore.get(ADMIN_SESSION_EXPIRES_COOKIE)?.value

  if (!sessionCookie) {
    return null
  }

  // Check expiration
  if (expiresCookie) {
    const expires = parseInt(expiresCookie, 10)
    if (isNaN(expires) || expires < Date.now()) {
      await clearAdminSession()
      return null
    }
  }

  return sessionCookie
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

/**
 * Clear admin session
 */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  cookieStore.delete(ADMIN_SESSION_EXPIRES_COOKIE)
}

/**
 * Logout admin
 */
export async function logoutAdmin() {
  await clearAdminSession()
  redirect("/admin")
}

/**
 * Require admin authentication
 */
export async function requireAdmin(): Promise<string> {
  const session = await getAdminSession()
  if (!session) {
    redirect("/admin")
  }
  return session
}
