"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { rateLimit } from "@/lib/rateLimit"
import { getAdminUsersCollection } from "@/lib/db/companyDb"

const ADMIN_SESSION_COOKIE = "admin-session"
const ADMIN_SESSION_EXPIRES_COOKIE = "admin-session-expires"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const isSecure = process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true"

export interface AdminLoginResult {
  success: boolean
  error?: string
}

interface AdminUserDoc {
  email: string
  emailNormalized: string
  passwordHash: string
  role: "admin"
  createdAt: Date
  updatedAt: Date
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Login admin user with email and password
 * Prefers MongoDB-backed admin users (bcrypt-hashed password), with env fallback for backwards compatibility.
 */
export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  try {
    // Rate limiting by email
    const emailNormalized = normalizeEmail(email)
    const rateLimitResult = await rateLimit(`admin-login-${emailNormalized}`, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many login attempts. Please try again later.",
      }
    }

    // 1) Prefer DB-backed admin users, if Mongo is configured
    if (process.env.MONGODB_URI) {
      try {
        const adminUsers = await getAdminUsersCollection()
        const adminUser = await adminUsers.findOne<AdminUserDoc>({ emailNormalized })

        if (adminUser) {
          const isValid = await bcrypt.compare(password, adminUser.passwordHash)
          if (!isValid) {
            return { success: false, error: "Invalid credentials" }
          }

          await setAdminSession(adminUser.email)
          return { success: true }
        }
      } catch (dbError) {
        // Don't hard-fail admin login if DB is temporarily unavailable; allow env fallback.
        console.error("Admin DB auth error (falling back to env):", dbError)
      }
    }

    // 2) Backwards-compatible env-based admin login
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPassword) {
      if (emailNormalized !== normalizeEmail(adminEmail)) {
        return { success: false, error: "Invalid credentials" }
      }
      if (password !== adminPassword) {
        return { success: false, error: "Invalid credentials" }
      }
      await setAdminSession(adminEmail)
      return { success: true }
    }

    return { success: false, error: "Admin authentication not configured" }
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
