import { NextResponse } from "next/server"
import { getTruckLog, updateTruckLog, deleteTruckLog } from "@/lib/api"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/logs/[id] - Get a single truck log
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 })
    }

    const log = await getTruckLog(id)
    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, log },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    )
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * API route to update a truck log
 * PUT /api/logs/[id]
 * Returns serialized log (no MongoDB objects)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      )
    }

    const result = await updateTruckLog(id, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update log" },
        { status: 400 }
      )
    }

    // The log is already serialized in updateTruckLog function
    // Double-check by creating a plain object copy
    const serializedLog = result.log ? JSON.parse(JSON.stringify(result.log)) : null

    return NextResponse.json({ 
      success: true, 
      log: serializedLog 
    }, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/logs/[id] - Delete a truck log
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      )
    }

    const result = await deleteTruckLog(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete log" },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true 
    }, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
