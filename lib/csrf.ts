/**
 * CSRF protection utilities
 * Validates Origin and Referer headers to prevent cross-site request forgery
 */

function normalizeOrigin(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.origin
  } catch {
    return null
  }
}

/** Build list of allowed origins for production (custom domain, Vercel URL, fallback) */
function getAllowedOrigins(): string[] {
  const origins: string[] = []
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const o = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL)
    if (o && !origins.includes(o)) origins.push(o)
  }
  if (process.env.VERCEL_URL) {
    const o = normalizeOrigin(process.env.VERCEL_URL)
    if (o && !origins.includes(o)) origins.push(o)
  }
  const fallback = 'https://gaali.vercel.app'
  if (!origins.includes(fallback)) origins.push(fallback)
  return origins
}

/**
 * Validate CSRF by checking Origin/Referer headers
 * Returns true if request is safe, false if potential CSRF
 */
export function validateCSRF(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // In development, allow localhost requests
  if (process.env.NODE_ENV === 'development') {
    if (origin) {
      try {
        const originUrl = new URL(origin)
        if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
          return true
        }
      } catch {
        // Invalid URL, continue with normal validation
      }
    }
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        if (refererUrl.hostname === 'localhost' || refererUrl.hostname === '127.0.0.1') {
          return true
        }
      } catch {
        // Invalid URL, continue with normal validation
      }
    }
    // In development, if no origin/referer, allow the request
    if (!origin && !referer) {
      return true
    }
  }

  const allowedOrigins = getAllowedOrigins()

  const requestOrigin = origin || (referer ? normalizeOrigin(referer) : null)
  if (!requestOrigin) {
    return process.env.NODE_ENV === 'development'
  }

  try {
    const requestOriginParsed = new URL(requestOrigin)
    const requestOriginNormalized = requestOriginParsed.origin
    return allowedOrigins.some((allowed) => {
      try {
        const allowedParsed = new URL(allowed)
        return requestOriginNormalized === allowedParsed.origin
      } catch {
        return false
      }
    })
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
