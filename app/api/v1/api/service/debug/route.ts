import { NextResponse } from "next/server"
import { getRequestLogs, getRequestLogsByPath } from "@/lib/request-monitor"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * CORS headers helper
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400", // 24 hours
}

/**
 * OPTIONS /api/v1/api/service/debug
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders,
  })
}

/**
 * GET /api/v1/api/service/debug
 * View captured request logs for debugging
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    // Require authentication
    try {
      await getActiveCompany()
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication required" },
        { 
          status: 401,
          headers: corsHeaders,
        }
      )
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
      headers: corsHeaders,
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
        headers: corsHeaders,
      }
    )
  }
}

