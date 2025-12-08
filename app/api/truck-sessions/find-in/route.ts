import { NextResponse } from "next/server"
import { findLatestInSession } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/truck-sessions/find-in?plateNumber=XXX - Find latest IN session for a plate number
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const plateNumber = searchParams.get("plateNumber")

    if (!plateNumber) {
      return NextResponse.json({ error: "Plate number is required" }, { status: 400 })
    }

    const inSession = await findLatestInSession(plateNumber)

    if (!inSession) {
      return NextResponse.json({ error: "No IN session found for this plate number" }, { status: 404 })
    }

    return NextResponse.json({ success: true, session: inSession }, { status: 200 })
  } catch (error) {
    console.error("Error finding IN session:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
