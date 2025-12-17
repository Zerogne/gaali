import { NextResponse } from "next/server"
import { getTruckSessionByUniqueCode } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/truck-sessions/by-code/[code] - Get a truck session by unique code
 * This endpoint is public and can be used by external sites to pull data
 * 
 * Returns data in two formats:
 * - Default: Full session object with all fields
 * - With ?format=thirdparty: Transformed to match 3rd party app format (CAR, CON, DRN, etc.)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Unique code is required" },
        { status: 400 }
      )
    }

    const session = await getTruckSessionByUniqueCode(code.toUpperCase())

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Check if 3rd party format is requested
    const url = new URL(request.url)
    const format = url.searchParams.get("format")
    
    if (format === "thirdparty") {
      // Transform to 3rd party app format
      const thirdPartyData = {
        uniqueCode: session.uniqueCode || "",
        CAR: session.product || "", // Cargo/Product
        CON: "", // Contract - not in our schema, leave empty
        DRN: session.driverName || "", // Driver's Name
        LPC: session.transporterCompany || "", // Carrier Organization Name
        SLN: "", // Customs Seal Number - not in our schema
        TRL: "", // Trailer Number - not in our schema
        UPC: "", // Unloading Point Company - not in our schema
        AKT: "", // Company Act - not in our schema
        NET: session.netWeightKg || 0, // Net Weight
        WGT: session.grossWeightKg || 0, // Gross Weight
        VNO: session.plateNumber || "", // Vehicle Number
        CT1: "", // Custom Field 1 - not in our schema
        CMN: session.notes || "", // Comments/Notes
        PKG: 0, // Package/Packing weight - calculate if needed
        CHG_VNO: "no", // Change Vehicle Number at Border - default to no
      }
      
      return NextResponse.json(thirdPartyData, { status: 200 })
    }

    // Default: Return full session object
    // Serialize dates to ISO strings for JSON response
    const serializedSession = {
      ...session,
      createdAt: session.createdAt instanceof Date 
        ? session.createdAt.toISOString() 
        : session.createdAt,
      updatedAt: session.updatedAt instanceof Date 
        ? session.updatedAt.toISOString() 
        : session.updatedAt,
    }

    return NextResponse.json({ success: true, session: serializedSession }, { status: 200 })
  } catch (error) {
    console.error("Error getting truck session by unique code:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
