import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is trying to access protected routes
  const isProtectedRoute = pathname === "/" || pathname.startsWith("/dashboard")
  const isAuthRoute = pathname.startsWith("/login")

  // Get session cookies
  const companyId = request.cookies.get("company-id")?.value
  const workerId = request.cookies.get("worker-id")?.value

  const isAuthenticated = companyId && workerId

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if accessing login while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}

