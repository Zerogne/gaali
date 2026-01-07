import { NextResponse } from "next/server"
import { updateTruckLog } from "@/lib/api"
import { errorToResponse } from "@/lib/errors"

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

