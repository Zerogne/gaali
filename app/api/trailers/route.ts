import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/trailers - Get all trailers for the active company
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const trailersCollection = await getCompanyCollection(companyId, "trailers")
    
    const trailers = await trailersCollection.find({}).toArray()
    
    // Serialize MongoDB documents
    const serialized = trailers.map((trailer: any) => {
      const { _id, ...data } = trailer
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting trailers:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/trailers - Add a new trailer
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const trailersCollection = await getCompanyCollection(companyId, "trailers")
    const body = await request.json()
    const { plateNumber, trailerType, make, model, year, notes } = body

    if (!plateNumber || typeof plateNumber !== "string" || !plateNumber.trim()) {
      return NextResponse.json(
        { error: "Улсын дугаар (Plate number) is required" },
        { status: 400 }
      )
    }

    // Check if trailer already exists
    const existing = await trailersCollection.findOne({ plateNumber: plateNumber.trim().toUpperCase() })
    if (existing) {
      return NextResponse.json(
        { error: "Trailer with this plate number already exists" },
        { status: 409 }
      )
    }

    const newTrailer = {
      id: `trailer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plateNumber: plateNumber.trim().toUpperCase(),
      trailerType: trailerType?.trim() || undefined,
      make: make?.trim() || undefined,
      model: model?.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    await trailersCollection.insertOne(newTrailer)

    // Serialize for return
    const { _id, ...serialized } = newTrailer as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding trailer:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

