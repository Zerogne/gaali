/**
 * CSRF protection utilities
 * Validates Origin and Referer headers to prevent cross-site request forgery
 */

/**
 * Validate CSRF by checking Origin/Referer headers
 * Returns true if request is safe, false if potential CSRF
 */
export function validateCSRF(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Get allowed origin from environment
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  
  // For same-origin requests (no Origin header), check Referer
  if (!origin) {
    if (!referer) {
      // No Origin or Referer - could be a direct API call (allow in dev, restrict in prod)
      return process.env.NODE_ENV === 'development'
    }
    
    // Check if Referer matches allowed origin
    try {
      const refererUrl = new URL(referer)
      const allowedUrl = new URL(allowedOrigin)
      return refererUrl.origin === allowedUrl.origin
    } catch {
      return false
    }
  }
  
  // Check if Origin matches allowed origin
  try {
    const originUrl = new URL(origin)
    const allowedUrl = new URL(allowedOrigin)
    return originUrl.origin === allowedUrl.origin
  } catch {
    return false
  }
}

/**
 * Get CSRF error response
 */
export function csrfErrorResponse() {
  return new Response(
    JSON.stringify({ error: 'CSRF validation failed' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

