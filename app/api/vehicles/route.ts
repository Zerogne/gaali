import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/vehicles - Get all vehicles for the active company
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const vehiclesCollection = await getCompanyCollection(companyId, "vehicles")
    
    const vehicles = await vehiclesCollection.find({}).toArray()
    
    // Serialize MongoDB documents
    const serialized = vehicles.map((vehicle: any) => {
      const { _id, ...data } = vehicle
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting vehicles:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/vehicles - Add a new vehicle
 */
export async function POST(request: Request) {
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

    // Check if vehicle already exists
    const existing = await vehiclesCollection.findOne({ plateNumber: plateNumber.trim().toUpperCase() })
    if (existing) {
      return NextResponse.json(
        { error: "Vehicle with this plate number already exists" },
        { status: 409 }
      )
    }

    const newVehicle = {
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plateNumber: plateNumber.trim().toUpperCase(),
      registrationNumber: registrationNumber?.trim() || undefined,
      chassisNumber: chassisNumber?.trim() || undefined,
      trailerId: trailerId?.trim() || undefined,
      countryOfManufacture: countryOfManufacture?.trim() || undefined,
      make: make?.trim() || undefined,
      model: model?.trim() || undefined,
      color: color?.trim() || undefined,
      vehicleType: vehicleType?.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    await vehiclesCollection.insertOne(newVehicle)

    // Serialize for return
    const { _id, ...serialized } = newVehicle as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding vehicle:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

