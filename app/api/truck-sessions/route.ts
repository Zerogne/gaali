import { NextResponse } from "next/server"
import { saveTruckSession, getTruckSessions } from "@/lib/truckSessions"
import { saveTruckLog } from "@/lib/api"
import { errorToResponse } from "@/lib/errors"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import type { Product } from "@/lib/products/products"
import type { TransportCompany, Organization } from "@/lib/types"

/**
 * POST /api/truck-sessions - Create a new truck session (IN or OUT)
 * Also creates a corresponding log entry for history
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📥 Received request body:", body)

    // Get company ID for lookups
    let companyId: string
    try {
      companyId = await getActiveCompany()
      console.log("✅ Active company ID:", companyId)
      if (!companyId) {
        throw new Error("No active company found. Please log in.")
      }
    } catch (error) {
      console.error("❌ Error getting active company:", error)
      throw new Error("Authentication required. Please log in.")
    }

    // Look up product name if productId is provided
    let productName: string | undefined = undefined
    if (body.productId) {
      try {
        const productsCollection = await getCompanyCollection<Product>(companyId, "products")
        const product = await productsCollection.findOne({ id: body.productId })
        productName = product?.label || product?.value || undefined
      } catch (error) {
        console.error("Error looking up product:", error)
      }
    }

    // Look up transport company name if transporterCompanyId is provided
    let transportCompanyName: string | undefined = undefined
    if (body.transporterCompanyId) {
      try {
        const transportCompaniesCollection = await getCompanyCollection<TransportCompany>(companyId, "transport_companies")
        const transportCompany = await transportCompaniesCollection.findOne({ id: body.transporterCompanyId })
        transportCompanyName = transportCompany?.name || undefined
      } catch (error) {
        console.error("Error looking up transport company:", error)
      }
    }

    // Look up organization names if IDs are provided
    let senderOrgName: string | undefined = undefined
    if (body.senderOrganizationId) {
      try {
        const orgsCollection = await getCompanyCollection<Organization>(companyId, "organizations")
        const org = await orgsCollection.findOne({ id: body.senderOrganizationId })
        senderOrgName = org?.name || undefined
      } catch (error) {
        console.error("Error looking up sender organization:", error)
      }
    }

    let receiverOrgName: string | undefined = undefined
    if (body.receiverOrganizationId) {
      try {
        const orgsCollection = await getCompanyCollection<Organization>(companyId, "organizations")
        const org = await orgsCollection.findOne({ id: body.receiverOrganizationId })
        receiverOrgName = org?.name || undefined
      } catch (error) {
        console.error("Error looking up receiver organization:", error)
      }
    }

    // Clean up the data before passing to saveTruckSession
    // Ensure grossWeightKg is a number
    const grossWeightKg = typeof body.grossWeightKg === 'number' 
      ? body.grossWeightKg 
      : (typeof body.grossWeightKg === 'string' 
          ? parseFloat(body.grossWeightKg) 
          : null)
    
    if (!grossWeightKg || isNaN(grossWeightKg) || grossWeightKg <= 0) {
      throw new Error("Gross weight must be a positive number")
    }

    const cleanedBody = {
      direction: body.direction,
      plateNumber: body.plateNumber,
      driverName: body.driverName === "" ? undefined : body.driverName,
      product: productName || body.product || (body.product === "" ? undefined : body.product),
      transporterCompany: transportCompanyName || body.transporterCompany || (body.transporterCompany === "" ? undefined : body.transporterCompany),
      inSessionId: body.inSessionId === "" || body.inSessionId === null ? undefined : body.inSessionId,
      grossWeightKg: grossWeightKg,
      netWeightKg: body.netWeightKg === null || body.netWeightKg === undefined 
        ? undefined 
        : (typeof body.netWeightKg === 'number' 
            ? body.netWeightKg 
            : (typeof body.netWeightKg === 'string' ? parseFloat(body.netWeightKg) : undefined)),
      inTime: body.inTime === "" ? undefined : body.inTime,
      outTime: body.outTime === "" ? undefined : body.outTime,
      notes: body.notes === "" ? undefined : body.notes,
    }
    
    console.log("🧹 Cleaned request body:", cleanedBody)

    // Validate required fields before attempting to save
    if (!cleanedBody.direction) {
      throw new Error("Direction is required")
    }
    if (!cleanedBody.plateNumber || cleanedBody.plateNumber.trim() === "") {
      throw new Error("Plate number is required")
    }
    if (!cleanedBody.grossWeightKg || cleanedBody.grossWeightKg <= 0) {
      throw new Error("Gross weight must be a positive number")
    }

    console.log("✅ Validation passed, saving session...")
    const session = await saveTruckSession(cleanedBody)
    console.log("✅ Session saved successfully:", session.id)

    // Also create a log entry for history
    try {
      // Ensure cargoType is not empty (required by schema)
      const cargoType = productName || session.product || "Бусад"
      
      // Ensure driverName is not empty (required by schema)
      const driverName = session.driverName || "Тодорхойгүй"

      const logData = {
        direction: session.direction,
        plate: session.plateNumber,
        driverId: body.driverId || undefined,
        driverName: driverName,
        cargoType: cargoType,
        weightKg: session.grossWeightKg,
        netWeightKg: session.netWeightKg,
        comments: session.notes,
        origin: body.origin || undefined,
        destination: body.destination || undefined,
        senderOrganizationId: body.senderOrganizationId || undefined,
        senderOrganization: senderOrgName,
        receiverOrganizationId: body.receiverOrganizationId || undefined,
        receiverOrganization: receiverOrgName,
        transportCompanyId: body.transporterCompanyId || undefined,
        sealNumber: body.sealNumber || undefined,
        hasTrailer: body.hasTrailer || undefined,
        trailerPlate: body.trailerNumber || body.trailerPlate || undefined,
      }

      console.log("📝 Creating log entry with data:", logData)
      const log = await saveTruckLog(logData)
      console.log("✅ Log entry created successfully:", log.id)
    } catch (logError) {
      // Log the error but don't fail the request - session is already saved
      console.error("⚠️ Error creating log entry (session still saved):", logError)
      if (logError instanceof Error) {
        console.error("⚠️ Error message:", logError.message)
        console.error("⚠️ Error stack:", logError.stack)
      }
    }

    return NextResponse.json({ success: true, session }, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating truck session:", error)
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * GET /api/truck-sessions - Get truck sessions with optional filters
 * Query params: direction, plateNumber, page, limit
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get("direction") as "IN" | "OUT" | null
    const plateNumber = searchParams.get("plateNumber")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await getTruckSessions({
      direction: direction || undefined,
      plateNumber: plateNumber || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    })

    // Serialize dates to ISO strings for JSON response
    const serializedResult = {
      ...result,
      sessions: result.sessions.map((session) => ({
        ...session,
        createdAt: session.createdAt instanceof Date 
          ? session.createdAt.toISOString() 
          : session.createdAt,
        updatedAt: session.updatedAt instanceof Date 
          ? session.updatedAt.toISOString() 
          : session.updatedAt,
      })),
    }

    return NextResponse.json(serializedResult, { status: 200 })
  } catch (error) {
    console.error("Error getting truck sessions:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
