import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * PUT /api/trailers/[id] - Update a trailer
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const trailersCollection = await getCompanyCollection(companyId, "trailers")
    const body = await request.json()
    const { plateNumber, ownerName, ownerId, ownerPhone } = body

    if (!id) {
      return NextResponse.json(
        { error: "Trailer ID is required" },
        { status: 400 }
      )
    }

    if (!plateNumber || typeof plateNumber !== "string" || !plateNumber.trim()) {
      return NextResponse.json(
        { error: "Чиргүүлийн улсын дугаар (Plate number) is required" },
        { status: 400 }
      )
    }

    if (!ownerName || typeof ownerName !== "string" || !ownerName.trim()) {
      return NextResponse.json(
        { error: "Эзэмшигчийн нэр (Owner name) is required" },
        { status: 400 }
      )
    }

    if (!ownerId || typeof ownerId !== "string" || !ownerId.trim()) {
      return NextResponse.json(
        { error: "Эзэмшигчийн регистер (Owner registration) is required" },
        { status: 400 }
      )
    }

    if (!ownerPhone || typeof ownerPhone !== "string" || !ownerPhone.trim()) {
      return NextResponse.json(
        { error: "Эзэмшигчийн утасны дугаар (Owner phone) is required" },
        { status: 400 }
      )
    }

    // Check if another trailer with the same plate number exists
    const existing = await trailersCollection.findOne({ 
      plateNumber: plateNumber.trim().toUpperCase(),
      id: { $ne: id }
    })
    if (existing) {
      return NextResponse.json(
        { error: "Another trailer with this plate number already exists" },
        { status: 409 }
      )
    }

    const update = {
      plateNumber: plateNumber.trim().toUpperCase(),
      ownerName: ownerName.trim(),
      ownerId: ownerId.trim(),
      ownerPhone: ownerPhone.trim(),
      updatedAt: new Date().toISOString(),
    }

    const result = await trailersCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Trailer not found" },
        { status: 404 }
      )
    }

    const updatedTrailer = await trailersCollection.findOne({ id })
    const { _id, ...serialized } = updatedTrailer as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating trailer:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/trailers/[id] - Delete a trailer
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const trailersCollection = await getCompanyCollection(companyId, "trailers")

    if (!id) {
      return NextResponse.json(
        { error: "Trailer ID is required" },
        { status: 400 }
      )
    }

    const result = await trailersCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Trailer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting trailer:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

