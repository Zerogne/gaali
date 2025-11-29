import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * PUT /api/drivers/[id] - Update a driver
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
    const driversCollection = await getCompanyCollection(companyId, "drivers")
    const body = await request.json()
    const { name, licenseNumber, licenseExpiry, registrationNumber, registrationYear } = body

    if (!id) {
      return NextResponse.json(
        { error: "Driver ID is required" },
        { status: 400 }
      )
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Driver name is required" },
        { status: 400 }
      )
    }

    const update = {
      name: name.trim(),
      licenseNumber: licenseNumber?.trim() || undefined,
      licenseExpiry: licenseExpiry?.trim() || undefined,
      registrationNumber: registrationNumber?.trim() || undefined,
      registrationYear: registrationYear?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    }

    const result = await driversCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      )
    }

    const updatedDriver = await driversCollection.findOne({ id })
    const { _id, ...serialized } = updatedDriver as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating driver:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

