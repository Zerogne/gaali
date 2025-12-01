import { NextResponse } from "next/server"
import { getTruckLogs } from "@/lib/api"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/logs - Get truck logs with pagination
 * Query params: page (default: 1), limit (default: 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await getTruckLogs(page, limit)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error getting truck logs:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

