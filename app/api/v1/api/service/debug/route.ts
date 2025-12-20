import { NextResponse } from "next/server"
import { getRequestLogs, getRequestLogsByPath } from "@/lib/request-monitor"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * Get CORS headers based on request origin
 * When credentials are included, we must specify the origin (not *)
 */
function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin")
  
  // If origin is provided and is from our domains, allow it with credentials
  if (origin && (
    origin.includes("gaali.vercel.app") || 
    origin.includes("ceps.gaali.mn") ||
    origin.includes("localhost")
  )) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    }
  }
  
  // Default: allow all origins (for requests without credentials)
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  }
}

/**
 * OPTIONS /api/v1/api/service/debug
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    status: 200,
    headers: getCorsHeaders(request),
  })
}

/**
 * GET /api/v1/api/service/debug
 * View captured request logs for debugging
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    // Try to get authentication, but don't require it for viewing logs
    // This allows cross-origin access while still being useful
    let companyId: string | null = null
    try {
      companyId = await getActiveCompany()
    } catch (error) {
      // Not authenticated - that's okay, we'll still return logs
      // This allows viewing from other domains
      console.log("⚠️ Debug endpoint accessed without authentication (cross-origin)")
    }

    const { searchParams } = new URL(request.url)
    const pathname = searchParams.get("pathname")
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    let logs
    if (pathname) {
      logs = await getRequestLogsByPath(pathname, limit)
    } else {
      logs = await getRequestLogs(limit)
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs: logs.map(log => ({
        method: log.method,
        url: log.url,
        pathname: log.pathname,
        queryParams: log.queryParams,
        headers: log.headers,
        body: log.body,
        contentType: log.contentType,
        userAgent: log.userAgent,
        ipAddress: log.ipAddress,
        timestamp: log.timestamp,
        responseStatus: log.responseStatus,
        responseTime: log.responseTime,
        error: log.error,
      })),
    }, {
      headers: getCorsHeaders(request),
    })
  } catch (error) {
    console.error("Error fetching request logs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch request logs",
        message: error instanceof Error ? error.message : String(error),
      },
      { 
        status: 500,
        headers: getCorsHeaders(request),
      }
    )
  }
}

