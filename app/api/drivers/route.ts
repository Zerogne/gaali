import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/drivers - Get all drivers for the active company
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const driversCollection = await getCompanyCollection(companyId, "drivers")
    
    const drivers = await driversCollection.find({}).toArray()
    
    // Serialize MongoDB documents
    const serialized = drivers.map((driver: any) => {
      const { _id, ...data } = driver
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting drivers:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/drivers - Add a new driver
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const driversCollection = await getCompanyCollection(companyId, "drivers")
    const body = await request.json()
    const { name, phone, registrationNumber, additionalInfo } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Driver name is required" },
        { status: 400 }
      )
    }

    const newDriver = {
      id: `drv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      phone: phone?.trim() || undefined,
      registrationNumber: registrationNumber?.trim() || undefined,
      additionalInfo: additionalInfo?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    await driversCollection.insertOne(newDriver)

    // Serialize for return
    const { _id, ...serialized } = newDriver as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding driver:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

