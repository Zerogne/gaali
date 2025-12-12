import { NextResponse } from "next/server"
import { getTruckSessionByUniqueCode } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/truck-sessions/by-code/[code] - Get a truck session by unique code
 * This endpoint is public and can be used by external sites to pull data
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Unique code is required" },
        { status: 400 }
      )
    }

    const session = await getTruckSessionByUniqueCode(code.toUpperCase())

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Serialize dates to ISO strings for JSON response
    const serializedSession = {
      ...session,
      createdAt: session.createdAt instanceof Date 
        ? session.createdAt.toISOString() 
        : session.createdAt,
      updatedAt: session.updatedAt instanceof Date 
        ? session.updatedAt.toISOString() 
        : session.updatedAt,
    }

    return NextResponse.json({ success: true, session: serializedSession }, { status: 200 })
  } catch (error) {
    console.error("Error getting truck session by unique code:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
