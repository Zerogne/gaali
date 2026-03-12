import { NextResponse } from "next/server"
import { getTruckSessionByUniqueCode } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"
import { getDatabase } from "@/lib/db/client"

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
      // Prefer canonical 3rd-party payload already saved in third_party_data (includes resolved CON/contract)
      try {
        const db = await getDatabase()
        const collection = db.collection("third_party_data")
        const doc = await collection.findOne({ code: session.uniqueCode })

        if (doc && Array.isArray(doc.data) && doc.data.length > 0) {
          // Data is stored as an array; return the first item (single-trip payload)
          return NextResponse.json(doc.data[0], { status: 200 })
        }
      } catch (err) {
        console.warn(
          "[truck-sessions/by-code] Failed to read canonical third_party_data, falling back to session fields:",
          err
        )
      }

      // Fallback: derive 3rd party format from session fields (may have limited contract info)
      const thirdPartyData = {
        // Core fields (original format)
        AKT: session.uniqueCode || "", // Актын дугаар (unique code)
        CAR: session.product || (session as any).productName || "", // Cargo/Product
        CMN: session.notes || "", // Comments/Notes
        CON: (session as any).contractNumber || "", // Contract number (if stored on session)
        CT1: (session as any).container1 || "", // Container 1
        DRN: session.driverName || "", // Driver's Name
        LPC: session.transporterCompany || session.origin || (session as any).senderOrganization || "", // Loading Point Company
        NET: session.netWeightKg || 0, // Net Weight
        SLN: session.sealNumber || "", // Seal Number
        TRL: (session as any).trailerNumber || (session as any).trailerPlate || "", // Trailer Number
        UPC: session.destination || (session as any).receiverOrganization || "", // Unloading Point Company
        VNO: session.plateNumber || "", // Vehicle Number
        WGT: session.grossWeightKg || (session as any).weightKg || 0, // Gross Weight
        
        // New fields (updated API format)
        PRM: (session as any).premium || (session as any).prm || "", // Premium/Permit number
        CT2: (session as any).container2 || "", // Container 2
        CT3: (session as any).container3 || "", // Container 3
        CT4: (session as any).container4 || "", // Container 4
        TID: (session as any).transactionId || (session as any).tid || "", // Transaction ID
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
