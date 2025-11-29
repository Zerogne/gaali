import { NextResponse } from "next/server"

/**
 * Proxy to protect routes and validate authentication
 * Uses Next.js Proxy API (replaces deprecated middleware)
 * Redirects unauthenticated users to login page
 */
export default async function proxy(request: Request) {
  const url = new URL(request.url)
  const { pathname } = url

  // Allow public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    (pathname.startsWith('/api/companies') && pathname === '/api/companies') || // Only allow GET /api/companies (no params)
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/seed') || // Allow seed endpoint
    pathname.startsWith('/api/reset-passwords') || // Allow password reset endpoint
    pathname.startsWith('/api/debug') || // Allow debug endpoints (protected by auth in route itself)
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Get cookies from request
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  
  const companyId = cookies['company-id']
  const workerId = cookies['worker-id']
  const expiresAt = cookies['session-expires']

  // Check if session exists
  if (!companyId || !workerId) {
    // Redirect to login if not authenticated
    if (pathname.startsWith('/api/')) {
      // API routes return 401 instead of redirect
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', url))
  }

  // Check session expiration
  if (expiresAt) {
    const expires = parseInt(expiresAt, 10)
    if (!isNaN(expires) && expires < Date.now()) {
      // Session expired
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Session expired' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', url))
      
      // Clear expired cookies
      response.cookies.delete('company-id')
      response.cookies.delete('worker-id')
      response.cookies.delete('session-expires')
      
      return response
    }
  }

  // Redirect to dashboard if accessing login while fully authenticated
  if (pathname.startsWith('/login') && companyId && workerId) {
    return NextResponse.redirect(new URL('/', url))
  }

  return NextResponse.next()
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookies[name] = rest.join('=').trim()
    }
  })

  return cookies
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (already handled above)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

