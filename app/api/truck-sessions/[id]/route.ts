import { NextResponse } from "next/server"
import { getTruckSession, updateTruckSession, deleteTruckSession } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/truck-sessions/[id] - Get a single truck session by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const session = await getTruckSession(id)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, session }, { status: 200 })
  } catch (error) {
    console.error("Error getting truck session:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * PUT /api/truck-sessions/[id] - Update a truck session
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const session = await updateTruckSession(id, {
      direction: body.direction,
      plateNumber: body.plateNumber,
      driverName: body.driverName,
      product: body.product,
      transporterCompany: body.transporterCompany,
      inSessionId: body.inSessionId,
      grossWeightKg: body.grossWeightKg,
      netWeightKg: body.netWeightKg,
      inTime: body.inTime,
      outTime: body.outTime,
      notes: body.notes,
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, session }, { status: 200 })
  } catch (error) {
    console.error("Error updating truck session:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/truck-sessions/[id] - Delete a truck session
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const deleted = await deleteTruckSession(id)

    if (!deleted) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting truck session:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
