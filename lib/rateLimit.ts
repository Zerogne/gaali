/**
 * In-memory rate limiting for login endpoints
 * For production, consider upgrading to Redis-based solution (Upstash)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (clears on server restart)
// In production, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Rate limit by identifier (e.g., IP address or companyId)
 * @param identifier - Unique identifier for rate limiting
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 */
export async function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // No entry or expired
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(identifier, newEntry)
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // Entry exists and not expired
  if (entry.count >= maxAttempts) {
    return {
      success: false,
      limit: maxAttempts,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    success: true,
    limit: maxAttempts,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from request headers
 * Used for rate limiting by IP
 */
export function getClientIP(request?: Request): string {
  if (!request) return 'unknown'

  // Check various headers (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

