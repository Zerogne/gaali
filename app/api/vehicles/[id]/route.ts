import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * PUT /api/vehicles/[id] - Update a vehicle
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const vehiclesCollection = await getCompanyCollection(companyId, "vehicles")
    const body = await request.json()
    const { 
      plateNumber, 
      registrationNumber,
      chassisNumber,
      trailerId,
      countryOfManufacture,
      make, 
      model, 
      color,
      vehicleType,
      year, 
      notes 
    } = body

    if (!plateNumber || typeof plateNumber !== "string" || !plateNumber.trim()) {
      return NextResponse.json(
        { error: "Улсын дугаар (Plate number) is required" },
        { status: 400 }
      )
    }

    // Check if another vehicle with this plate number exists
    const existing = await vehiclesCollection.findOne({ 
      plateNumber: plateNumber.trim().toUpperCase(),
      id: { $ne: params.id }
    })
    if (existing) {
      return NextResponse.json(
        { error: "Vehicle with this plate number already exists" },
        { status: 409 }
      )
    }

    const updateData: any = {
      plateNumber: plateNumber.trim().toUpperCase(),
      updatedAt: new Date().toISOString(),
    }

    if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber?.trim() || undefined
    if (chassisNumber !== undefined) updateData.chassisNumber = chassisNumber?.trim() || undefined
    if (trailerId !== undefined) updateData.trailerId = trailerId?.trim() || undefined
    if (countryOfManufacture !== undefined) updateData.countryOfManufacture = countryOfManufacture?.trim() || undefined
    if (make !== undefined) updateData.make = make?.trim() || undefined
    if (model !== undefined) updateData.model = model?.trim() || undefined
    if (color !== undefined) updateData.color = color?.trim() || undefined
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType?.trim() || undefined
    if (year !== undefined) updateData.year = year ? parseInt(year) : undefined
    if (notes !== undefined) updateData.notes = notes?.trim() || undefined

    const result = await vehiclesCollection.findOneAndUpdate(
      { id: params.id },
      { $set: updateData },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    // Serialize for return
    const { _id, ...serialized } = result as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating vehicle:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/vehicles/[id] - Delete a vehicle
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const vehiclesCollection = await getCompanyCollection(companyId, "vehicles")

    const result = await vehiclesCollection.findOneAndDelete({ id: params.id })

    if (!result) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

