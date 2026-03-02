import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"
import type { Location } from "@/lib/types"

/**
 * GET /api/locations - Get all locations for the active company
 * Optional query params: ?type=seller or ?type=buyer
 */
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const locationsCollection = await getCompanyCollection<Location>(companyId, "locations")
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "seller" | "buyer" | null
    
    const query = type ? { type } : {}
    const locations = await locationsCollection.find(query).sort({ createdAt: -1 }).toArray()
    
    // Serialize MongoDB documents
    const serialized = locations.map((location: any) => {
      const { _id, ...data } = location
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting locations:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/locations - Add a new location
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const activeCompanyId = session.companyId
    const locationsCollection = await getCompanyCollection<Location>(activeCompanyId, "locations")
    const body = await request.json()
    const { locationName, companyName, type } = body

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
    // Only block exact duplicates (same locationName + companyName + type).
    const existing = await locationsCollection.findOne({
      locationName: locationName.trim(),
      companyName: companyName.trim(),
      type: type,
    })
    if (existing) {
      return NextResponse.json(
        { error: "Location with this name, company, and type already exists" },
        { status: 409 }
      )
    }

    const newLocation: Location = {
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      locationName: locationName.trim(),
      companyName: companyName.trim(),
      type: type,
      createdAt: new Date().toISOString(),
    }

    await locationsCollection.insertOne(newLocation)

    // Serialize for return
    const { _id, ...serialized } = newLocation as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding location:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

