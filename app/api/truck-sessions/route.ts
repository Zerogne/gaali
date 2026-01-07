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
        const transportCompaniesCollection = await getCompanyCollection<TransportCompany>(companyId, "transportCompanies")
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
      plateNumber: body.plateNumber ? body.plateNumber.trim().toUpperCase() : body.plateNumber,
      driverName: body.driverName === "" ? undefined : body.driverName,
      product: productName || body.product || (body.product === "" ? undefined : body.product),
      transporterCompany: transportCompanyName || body.transporterCompany || (body.transporterCompany === "" ? undefined : body.transporterCompany),
      senderOrganizationId: body.senderOrganizationId || undefined,
      senderOrganization: senderOrgName || undefined,
      receiverOrganizationId: body.receiverOrganizationId || undefined,
      receiverOrganization: receiverOrgName || undefined,
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
      origin: body.origin || undefined,
      destination: body.destination || undefined,
      sealNumber: body.sealNumber || undefined,
      hasTrailer: body.hasTrailer || undefined,
      trailerPlate: body.trailerNumber || body.trailerPlate || undefined,
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
    console.log("📋 Session data to save:", {
      direction: cleanedBody.direction,
      plateNumber: cleanedBody.plateNumber,
      grossWeightKg: cleanedBody.grossWeightKg,
      driverName: cleanedBody.driverName,
      product: cleanedBody.product,
    })
    const session = await saveTruckSession(cleanedBody)
    console.log("✅ Session saved successfully!")
    console.log("✅ Session ID:", session.id)
    console.log("✅ Session unique code:", session.uniqueCode)
    console.log("✅ Session plate number:", session.plateNumber)
    console.log("✅ Session direction:", session.direction)
    console.log("✅ Session weight:", session.grossWeightKg)
    
    // Verify session exists in database
    try {
      const verifyResult = await getTruckSessions({
        direction: session.direction,
        plateNumber: session.plateNumber,
        limit: 1,
      })
      if (verifyResult.sessions.length > 0) {
        const foundSession = verifyResult.sessions.find(s => s.uniqueCode === session.uniqueCode)
        if (foundSession) {
          console.log("✅ Verification: Session confirmed in database!")
        } else {
          console.error("❌ Verification: Session not found in database query!")
        }
      } else {
        console.error("❌ Verification: No sessions found for this plate number!")
      }
    } catch (verifyError) {
      console.error("❌ Verification: Error verifying session:", verifyError)
    }

    // Send data to 3rd party app after saving
    try {
      // Get driverId from body - this should be set when form is submitted
      const driverId = body.driverId || ""
      console.log("🔍 Driver ID from request body:", driverId)
      console.log("🔍 Full body.driverId value:", body.driverId)
      console.log("🔍 body.driverId type:", typeof body.driverId)
      
      // Transform session data to 3rd party format (exact format as specified)
      const thirdPartyData = [
        {
          AKT: session.uniqueCode, // Актын дугаар (уникаль код)
          CAR: session.product || "", // Тээвэрлэгч байгууллагын нэр / Бүтээгдэхүүн
          CMN: "", // Convoy manifest number
          CON: "", // Гэрээний дугаар (can be empty)
          CT1: "", // Чингэлэг 1
          DRN: session.driverName || "", // Жолоочийн нэр
          LPC: session.transporterCompany || body.origin || senderOrgName || "", // Ачих газар код (with sender company)
          NET: session.netWeightKg || 0, // Цэвэр жин
          SLN: body.sealNumber || "", // Гаалийн лац, ломбын дугаар
          TRL: body.trailerNumber || body.trailerPlate || "", // Чиргүүлийн дугаар
          UPC: body.destination || receiverOrgName || "", // Хүлээн авах газар код (with receiver company)
          VNO: session.plateNumber || "", // Тээврийн хэрэгслийн дугаар
          WGT: session.grossWeightKg || 0, // Бохир жин
          // Additional fields for sender/receiver company and driver ID
          senderCompany: senderOrgName || "", // Илгээгч байгууллага
          receiverCompany: receiverOrgName || "", // Хүлээн авагч байгууллага
          driverId: driverId, // Жолоочийн ID
        }
      ]
      
      console.log("💾 Saving 3rd party data with driverId:", driverId)
      console.log("💾 Full 3rd party data:", JSON.stringify(thirdPartyData, null, 2))

      // Save to third-party storage (direct database call)
      const { getDatabase } = await import("@/lib/db/client")
      const db = await getDatabase()
      const collection = db.collection("third_party_data")
      
      const document = {
        code: session.uniqueCode,
        companyId: companyId,
        data: thirdPartyData,
        createdAt: new Date(),
        accessedAt: new Date(),
        accessCount: 0,
      }
      
      await collection.updateOne(
        { code: session.uniqueCode, companyId: companyId },
        { $set: document },
        { upsert: true }
      )
      
      console.log("✅ Data saved to 3rd party storage with code:", session.uniqueCode)
      
      // Note: WebSocket sending is handled by client-side hook (useThirdPartyAutofill)
    } catch (thirdPartyError) {
      // Log error but don't fail the request - session is already saved
      console.error("⚠️ Error sending to 3rd party app (session still saved):", thirdPartyError)
    }

    // Also create or update a log entry for history
    try {
      // Ensure cargoType is not empty (required by schema)
      const cargoType = productName || session.product || "Бусад"
      
      // Ensure driverName is not empty (required by schema)
      const driverName = session.driverName || "Тодорхойгүй"

      // For OUT sessions, try to find and update existing IN log
      if (session.direction === "OUT") {
        try {
          const logsCollection = await getCompanyCollection(companyId, "logs")
          
          // Find the most recent IN log for the same plate (within last 7 days)
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          
          const existingInLog = await logsCollection.findOne(
            {
              plate: session.plateNumber,
              direction: "IN",
              createdAt: { $gte: sevenDaysAgo.toISOString() },
            },
            { sort: { createdAt: -1 } }
          )

          if (existingInLog) {
            console.log("📝 Found existing IN log, updating with OUT data:", existingInLog.id)
            
            // Update the existing IN log with OUT data
            const updateData = {
              // Keep IN data, add/update OUT data
              netWeightKg: session.netWeightKg || undefined,
              // Update weight if OUT weight is provided (this might be the final weight)
              weightKg: session.grossWeightKg || existingInLog.weightKg,
              // Update other fields if provided in OUT session
              driverId: body.driverId || existingInLog.driverId,
              driverName: driverName || existingInLog.driverName,
              cargoType: cargoType || existingInLog.cargoType,
              origin: body.origin || existingInLog.origin,
              destination: body.destination || existingInLog.destination,
              senderOrganizationId: body.senderOrganizationId || existingInLog.senderOrganizationId,
              senderOrganization: senderOrgName || existingInLog.senderOrganization,
              receiverOrganizationId: body.receiverOrganizationId || existingInLog.receiverOrganizationId,
              receiverOrganization: receiverOrgName || existingInLog.receiverOrganization,
              transportCompanyId: body.transporterCompanyId || existingInLog.transportCompanyId,
              sealNumber: body.sealNumber || existingInLog.sealNumber,
              hasTrailer: body.hasTrailer !== undefined ? body.hasTrailer : existingInLog.hasTrailer,
              trailerPlate: body.trailerNumber || body.trailerPlate || existingInLog.trailerPlate,
              comments: session.notes || existingInLog.comments,
            }

            await logsCollection.updateOne(
              { id: existingInLog.id },
              { $set: updateData }
            )

            console.log("✅ Log entry updated successfully:", existingInLog.id)
          } else {
            // No IN log found, create a new OUT log
            console.log("📝 No existing IN log found, creating new OUT log")
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

            const log = await saveTruckLog(logData)
            console.log("✅ Log entry created successfully:", log.id)
          }
        } catch (updateError) {
          console.error("⚠️ Error updating/finding log entry:", updateError)
          // Fallback: create a new log
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
          const log = await saveTruckLog(logData)
          console.log("✅ Fallback: Log entry created successfully:", log.id)
        }
      } else {
        // For IN sessions, create a new log as usual
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

        console.log("📝 Creating IN log entry with data:", logData)
        const log = await saveTruckLog(logData)
        console.log("✅ Log entry created successfully:", log.id)
      }
    } catch (logError) {
      // Log the error but don't fail the request - session is already saved
      console.error("⚠️ Error creating/updating log entry (session still saved):", logError)
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
