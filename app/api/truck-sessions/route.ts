import { NextResponse } from "next/server"
import { saveTruckSession, getTruckSessions } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"

/**
 * POST /api/truck-sessions - Create a new truck session (IN or OUT)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📥 Received request body:", body)

    // Clean up the data before passing to saveTruckSession
    const cleanedBody = {
      direction: body.direction,
      plateNumber: body.plateNumber,
      driverName: body.driverName === "" ? undefined : body.driverName,
      product: body.product === "" ? undefined : body.product,
      transporterCompany: body.transporterCompany === "" ? undefined : body.transporterCompany,
      inSessionId: body.inSessionId === "" || body.inSessionId === null ? undefined : body.inSessionId,
      grossWeightKg: body.grossWeightKg,
      netWeightKg: body.netWeightKg === null || body.netWeightKg === undefined ? undefined : body.netWeightKg,
      inTime: body.inTime === "" ? undefined : body.inTime,
      outTime: body.outTime === "" ? undefined : body.outTime,
      notes: body.notes === "" ? undefined : body.notes,
    }
    
    console.log("🧹 Cleaned request body:", cleanedBody)

    const session = await saveTruckSession(cleanedBody)
    console.log("✅ Session saved successfully:", session.id)

    return NextResponse.json({ success: true, session }, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating truck session:", error)
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * GET /api/truck-sessions - Get truck sessions with optional filters
 * Query params: direction, plateNumber, page, limit
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get("direction") as "IN" | "OUT" | null
    const plateNumber = searchParams.get("plateNumber")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await getTruckSessions({
      direction: direction || undefined,
      plateNumber: plateNumber || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    })

    // Serialize dates to ISO strings for JSON response
    const serializedResult = {
      ...result,
      sessions: result.sessions.map((session) => ({
        ...session,
        createdAt: session.createdAt instanceof Date 
          ? session.createdAt.toISOString() 
          : session.createdAt,
        updatedAt: session.updatedAt instanceof Date 
          ? session.updatedAt.toISOString() 
          : session.updatedAt,
      })),
    }

    return NextResponse.json(serializedResult, { status: 200 })
  } catch (error) {
    console.error("Error getting truck sessions:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
