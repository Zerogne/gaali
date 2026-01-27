import { NextResponse } from 'next/server'

/**
 * Favicon route handler
 * Returns 204 No Content to stop browsers from repeatedly requesting favicon.ico
 * The actual icons are configured in app/layout.tsx metadata
 */
export async function GET() {
  // Return 204 No Content - browsers will stop requesting after this
  return new NextResponse(null, { status: 204 })
}
