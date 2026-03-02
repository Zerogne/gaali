import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"
import type { Location } from "@/lib/types"

/**
 * PUT /api/locations/[id] - Update a location
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
    const activeCompanyId = session.companyId
    const locationsCollection = await getCompanyCollection<Location>(activeCompanyId, "locations")
    const body = await request.json()
    const { locationName, companyName, type } = body

    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      )
    }

    if (!locationName || typeof locationName !== "string" || !locationName.trim()) {
      return NextResponse.json(
        { error: "Байршлын нэр (Location name) is required" },
        { status: 400 }
      )
    }

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return NextResponse.json(
        { error: "Компанийн нэр (Company name) is required" },
        { status: 400 }
      )
    }

    if (!type || (type !== "seller" && type !== "buyer")) {
      return NextResponse.json(
        { error: "Төрөл (Type) must be 'seller' or 'buyer'" },
        { status: 400 }
      )
    }

    // Allow multiple companies under the same location name.
    // Only block exact duplicates (same locationName + companyName + type), excluding current.
    const existing = await locationsCollection.findOne({
      locationName: locationName.trim(),
      companyName: companyName.trim(),
      type: type,
      id: { $ne: id },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Location with this name, company, and type already exists" },
        { status: 409 }
      )
    }

    const update: Partial<Location> = {
      locationName: locationName.trim(),
      companyName: companyName.trim(),
      type: type,
    }

    const result = await locationsCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      )
    }

    const updatedLocation = await locationsCollection.findOne({ id })
    const { _id, ...serialized } = updatedLocation as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating location:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/locations/[id] - Delete a location
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
    const locationsCollection = await getCompanyCollection<Location>(companyId, "locations")

    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      )
    }

    const result = await locationsCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting location:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

