import { NextResponse } from "next/server"
import { saveTruckSession, getTruckSessions } from "@/lib/truckSessions"
import { saveTruckLog } from "@/lib/api"
import { errorToResponse } from "@/lib/errors"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import type { Product } from "@/lib/products/products"
import type { TransportCompany, Organization, Driver } from "@/lib/types"
import { buildDRN } from "@/lib/thirdPartyFormat"

/**
 * POST /api/truck-sessions - Create a new truck session (IN or OUT)
 * Also creates a corresponding log entry for history
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📥 Received request body:", body)
    console.log("📥 ProductId in body:", body.productId, "| Type:", typeof body.productId)
    
    // Ensure default products are migrated before processing
    try {
      const { migrateDefaultProductsToDatabase } = await import("@/lib/products/migrate")
      await migrateDefaultProductsToDatabase()
    } catch (migrateError) {
      console.warn("⚠️ Product migration check failed (may already be migrated):", migrateError)
    }

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

    // Look up driver name, phone, registrationNumber if driverId is provided
    let driverNameFromDb: string | undefined = undefined
    let driverPhoneFromDb: string | undefined = undefined
    let driverRegNumberFromDb: string | undefined = undefined
    if (body.driverId) {
      try {
        console.log("🔍 Looking up driver with ID:", body.driverId)
        const driversCollection = await getCompanyCollection(companyId, "drivers")
        const driver = await driversCollection.findOne({ id: body.driverId }) as Driver | null
        console.log("🔍 Driver lookup result:", driver ? { id: driver.id, name: driver.name } : "NOT FOUND")
        driverNameFromDb = driver?.name || undefined
        driverPhoneFromDb = driver?.phone || undefined
        driverRegNumberFromDb = driver?.registrationNumber || undefined
        if (!driverNameFromDb && (!body.driverName || body.driverName.trim() === "")) {
          console.warn("⚠️ Driver found but has no name:", driver)
        } else if (driverNameFromDb) {
          console.log("✅ Driver name from database:", driverNameFromDb)
        }
      } catch (error) {
        console.error("❌ Error looking up driver:", error)
        if (error instanceof Error) {
          console.error("❌ Error message:", error.message)
        }
      }
    }

    // Look up product name if productId is provided (from database only)
    let productName: string | undefined = undefined
    console.log("🔍 Checking productId:", body.productId, "| Truthy:", !!body.productId)
    if (body.productId) {
      try {
        console.log("🔍 Looking up product with ID:", body.productId, "in database")
        const productsCollection = await getCompanyCollection<Product>(companyId, "products")
        const product = await productsCollection.findOne({ id: body.productId })
        console.log("🔍 Product lookup result:", product ? { id: product.id, label: product.label, value: product.value, isCustom: product.isCustom } : "NOT FOUND")
        productName = product?.label || product?.value || undefined
        if (!productName) {
          console.warn("⚠️ Product found but has no label or value:", product)
          // If product not found, try to migrate defaults and retry
          if (!product) {
            console.log("🔄 Product not found, attempting to migrate defaults...")
            const { migrateDefaultProductsToDatabase } = await import("@/lib/products/migrate")
            await migrateDefaultProductsToDatabase()
            // Retry lookup
            const retryProduct = await productsCollection.findOne({ id: body.productId })
            if (retryProduct) {
              productName = retryProduct.label || retryProduct.value
              console.log("✅ Product found after migration:", productName)
            }
          }
        }
      } catch (error) {
        console.error("❌ Error looking up product:", error)
        if (error instanceof Error) {
          console.error("❌ Error message:", error.message)
          console.error("❌ Error stack:", error.stack)
        }
      }
    } else {
      console.log("⚠️ No productId provided in request body")
    }

    // Look up transport company name/contract if transporterCompanyId is provided
    let transportCompanyName: string | undefined = undefined
    let transportCompanyContract: string | undefined = undefined
    if (body.transporterCompanyId) {
      try {
        console.log("🔍 Looking up transport company with ID:", body.transporterCompanyId)
        const transportCompaniesCollection = await getCompanyCollection<TransportCompany>(companyId, "transportCompanies")
        const transportCompany = await transportCompaniesCollection.findOne({ id: body.transporterCompanyId })
        console.log("🔍 Transport company lookup result:", transportCompany ? { id: transportCompany.id, name: transportCompany.name } : "NOT FOUND")
        transportCompanyName = transportCompany?.name || undefined
        transportCompanyContract = transportCompany?.contract || undefined
        if (!transportCompanyName) {
          console.warn("⚠️ Transport company found but has no name:", transportCompany)
        }
      } catch (error) {
        console.error("❌ Error looking up transport company:", error)
        if (error instanceof Error) {
          console.error("❌ Error message:", error.message)
        }
      }
    } else {
      console.log("⚠️ No transporterCompanyId provided in request body")
    }

    // Look up organization names/contracts if IDs are provided
    let senderOrgName: string | undefined = undefined
    let senderOrgContract: string | undefined = undefined
    if (body.senderOrganizationId) {
      try {
        console.log("🔍 Looking up sender organization with ID:", body.senderOrganizationId)
        const orgsCollection = await getCompanyCollection<Organization>(companyId, "organizations")
        const org = await orgsCollection.findOne({ id: body.senderOrganizationId })
        console.log("🔍 Sender org lookup result:", org ? { id: org.id, name: org.name } : "NOT FOUND")
        senderOrgName = org?.name || undefined
        senderOrgContract = org?.contract || undefined
        if (!senderOrgName) {
          console.warn("⚠️ Sender organization found but has no name:", org)
        }
      } catch (error) {
        console.error("❌ Error looking up sender organization:", error)
        if (error instanceof Error) {
          console.error("❌ Error message:", error.message)
        }
      }
    }

    let receiverOrgName: string | undefined = undefined
    let receiverOrgContract: string | undefined = undefined
    if (body.receiverOrganizationId) {
      try {
        console.log("🔍 Looking up receiver organization with ID:", body.receiverOrganizationId)
        const orgsCollection = await getCompanyCollection<Organization>(companyId, "organizations")
        const org = await orgsCollection.findOne({ id: body.receiverOrganizationId })
        console.log("🔍 Receiver org lookup result:", org ? { id: org.id, name: org.name } : "NOT FOUND")
        receiverOrgName = org?.name || undefined
        receiverOrgContract = org?.contract || undefined
        if (!receiverOrgName) {
          console.warn("⚠️ Receiver organization found but has no name:", org)
        }
      } catch (error) {
        console.error("❌ Error looking up receiver organization:", error)
        if (error instanceof Error) {
          console.error("❌ Error message:", error.message)
        }
      }
    }

    // Clean up the data before passing to saveTruckSession
    // Ensure grossWeightKg is a number (for OUT sessions, can come from totalWeight)
    // For OUT sessions, use totalWeight if grossWeightKg is not provided
    let grossWeightKg: number | null = null;
    if (body.grossWeightKg !== undefined && body.grossWeightKg !== null) {
      grossWeightKg = typeof body.grossWeightKg === 'number' 
        ? body.grossWeightKg 
        : (typeof body.grossWeightKg === 'string' 
            ? parseFloat(body.grossWeightKg) 
            : null);
    } else if (body.direction === "OUT" && body.totalWeight !== undefined && body.totalWeight !== null) {
      // For OUT sessions, use totalWeight as grossWeightKg
      grossWeightKg = typeof body.totalWeight === 'number' 
        ? body.totalWeight 
        : (typeof body.totalWeight === 'string' 
            ? parseFloat(body.totalWeight) 
            : null);
    }
    
    if (!grossWeightKg || isNaN(grossWeightKg) || grossWeightKg <= 0) {
      throw new Error("Gross weight must be a positive number")
    }

    console.log("📋 Before cleanedBody - productName:", productName, "| transportCompanyName:", transportCompanyName, "| driverNameFromDb:", driverNameFromDb)
    
    // Use driver name from database if form didn't provide it
    let finalDriverName = body.driverName?.trim() || driverNameFromDb || undefined
    
    // If we still don't have driver name but have driverId, do a final lookup
    if (body.driverId && !finalDriverName) {
      try {
        console.log("🔍 Driver name still missing, doing final lookup from driverId:", body.driverId)
        const driversCollection = await getCompanyCollection<Driver>(companyId, "drivers")
        const driver = await driversCollection.findOne({ id: body.driverId })
        if (driver?.name) {
          finalDriverName = driver.name
          console.log("✅ Found driver name from final lookup:", finalDriverName)
        } else {
          console.warn("⚠️ Driver not found in database with ID:", body.driverId)
        }
      } catch (error) {
        console.error("❌ Error in final driver lookup:", error)
      }
    }
    
    console.log("📋 Driver name determination:", {
      fromBody: body.driverName,
      fromDatabase: driverNameFromDb,
      driverId: body.driverId,
      final: finalDriverName,
    })
    
    const cleanedBody = {
      direction: body.direction,
      plateNumber: body.plateNumber
        ? body.plateNumber.trim().toUpperCase().replace(/\s/g, "")
        : body.plateNumber,
      driverName: finalDriverName, // Use looked-up driver name if form didn't provide it
      product: productName || undefined, // Use looked-up productName, don't fall back to body.product
      transporterCompany: transportCompanyName || undefined, // Use looked-up transportCompanyName
      senderOrganizationId: body.senderOrganizationId || undefined,
      senderOrganization: senderOrgName || undefined,
      receiverOrganizationId: body.receiverOrganizationId || undefined,
      receiverOrganization: receiverOrgName || undefined,
      inSessionId: body.inSessionId === "" || body.inSessionId === null ? undefined : body.inSessionId,
      grossWeightKg: grossWeightKg,
      netWeightKg: body.netWeightKg === null || body.netWeightKg === undefined 
        ? undefined 
        : (() => {
            const val = typeof body.netWeightKg === 'number' 
              ? body.netWeightKg 
              : (typeof body.netWeightKg === 'string' ? parseFloat(body.netWeightKg) : undefined);
            return val !== undefined && !isNaN(val) ? Math.abs(val) : undefined;
          })(),
      carWeight: body.carWeight !== null && body.carWeight !== undefined && body.carWeight > 0
        ? (typeof body.carWeight === 'number' ? body.carWeight : parseFloat(body.carWeight))
        : undefined,
      trailerWeight: body.trailerWeight !== null && body.trailerWeight !== undefined && body.trailerWeight > 0
        ? (typeof body.trailerWeight === 'number' ? body.trailerWeight : parseFloat(body.trailerWeight))
        : undefined,
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
    console.log("🧹 Product in cleanedBody:", cleanedBody.product, "| Should be:", productName)
    console.log("🧹 Driver in cleanedBody:", cleanedBody.driverName, "| Should be:", finalDriverName)
    console.log("🧹 Transport Company in cleanedBody:", cleanedBody.transporterCompany, "| Should be:", transportCompanyName)

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
      productName: productName,
      transportCompany: cleanedBody.transporterCompany,
      transportCompanyName: transportCompanyName,
    })
    
    // Ensure product is set in cleanedBody
    if (productName && !cleanedBody.product) {
      cleanedBody.product = productName
      console.log("📋 Updated cleanedBody.product to:", productName)
    }
    
    // Ensure driver name is set in cleanedBody
    if (finalDriverName && !cleanedBody.driverName) {
      cleanedBody.driverName = finalDriverName
      console.log("📋 Updated cleanedBody.driverName to:", finalDriverName)
    }
    
    // Ensure transport company is set in cleanedBody
    if (transportCompanyName && !cleanedBody.transporterCompany) {
      cleanedBody.transporterCompany = transportCompanyName
      console.log("📋 Updated cleanedBody.transporterCompany to:", transportCompanyName)
    }
    
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
      
      // Transform session data to 3rd party format (supports both old and new API formats)
      const thirdPartyData = [
        {
          // Core fields (original format)
          AKT: session.uniqueCode, // Актын дугаар (уникаль код)
          CAR: session.product || "", // Тээвэрлэгч байгууллагын нэр / Бүтээгдэхүүн
          CMN: "", // Convoy manifest number
          // Contract number: prefer sender company's contract, then explicit contractNumber, then others
          CON: senderOrgContract || body.contractNumber || transportCompanyContract || receiverOrgContract || "", // Гэрээний дугаар
          CT1: "", // Чингэлэг 1
          DRN: buildDRN(session.driverName || "", driverRegNumberFromDb, driverPhoneFromDb), // Жолоочийн нэр ИЮ{reg} {phone}
          LPC: session.transporterCompany || body.origin || senderOrgName || "", // Ачих газар код (with sender company)
          NET: session.netWeightKg || 0, // Цэвэр жин
          SLN: body.sealNumber || "", // Гаалийн лац, ломбын дугаар
          TRL: body.trailerNumber || body.trailerPlate || "", // Чиргүүлийн дугаар
          UPC: body.destination || receiverOrgName || "", // Хүлээн авах газар код (with receiver company)
          VNO: session.plateNumber || "", // Тээврийн хэрэгслийн дугаар
          WGT: session.grossWeightKg || 0, // Бохир жин
          
          // New fields (updated API format)
          PRM: "", // Premium/Permit number
          CT2: "", // Container 2
          CT3: "", // Container 3
          CT4: "", // Container 4
          TID: "", // Transaction ID
          
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
    // IMPORTANT: This must succeed for data to appear in history
    let logCreated = false
    let createdOrUpdatedLogId: string | undefined = undefined
    try {
      // Ensure cargoType is not empty (required by schema)
      // Priority: productName (from lookup) > session.product > body.productId > default
      // IMPORTANT: productName should already be set from the lookup above
      const cargoType = productName || session.product || (body.productId ? `Product ID: ${body.productId}` : "Бусад")
      
      console.log("📋 Cargo type determination:", {
        productName,
        sessionProduct: session.product,
        productId: body.productId,
        finalCargoType: cargoType,
      })
      
      if (!productName && body.productId) {
        console.warn("⚠️ Product lookup failed for productId:", body.productId, "- using fallback cargoType:", cargoType)
      }
      
      // Ensure driverName is not empty (required by schema)
      // Priority: body.driverName > driverNameFromDb (looked up earlier) > session.driverName > lookup again > default
      let driverName = body.driverName?.trim() || driverNameFromDb || session.driverName?.trim() || undefined
      
      // If we still don't have a driver name and have a driverId, try to look it up again
      if (!driverName && body.driverId) {
        try {
          console.log("🔍 Re-looking up driver name for log creation from driverId:", body.driverId)
          const driversCollection = await getCompanyCollection<Driver>(companyId, "drivers")
          const driver = await driversCollection.findOne({ id: body.driverId })
          if (driver?.name) {
            driverName = driver.name
            console.log("✅ Found driver name for log:", driverName)
          } else {
            console.warn("⚠️ Driver not found in database with ID:", body.driverId)
          }
        } catch (error) {
          console.warn("⚠️ Could not re-lookup driver:", error)
        }
      }
      
      // Final fallback to default
      if (!driverName) {
        driverName = "Тодорхойгүй"
        console.warn("⚠️ No driver name found - using default:", driverName)
      }
      
      console.log("📋 Final driver name for log:", driverName, "| driverId:", body.driverId)
      
      console.log("📋 Log creation data:", {
        direction: session.direction,
        plate: session.plateNumber,
        driverName,
        cargoType,
        productName,
        productId: body.productId,
        grossWeightKg: session.grossWeightKg,
        driverId: body.driverId,
      })

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
            const updateData: any = {
              // Keep IN data, add/update OUT data
              updatedAt: new Date().toISOString(),
              netWeightKg: session.netWeightKg || undefined,
              // Update weight if OUT weight is provided (this might be the final weight)
              weightKg: session.grossWeightKg || existingInLog.weightKg,
              // Update other fields if provided in OUT session
              driverId: body.driverId || existingInLog.driverId,
              driverName: driverName || existingInLog.driverName, // Use looked-up driver name
              cargoType: cargoType || existingInLog.cargoType, // Use looked-up product name
              productId: body.productId || (existingInLog as any).productId || undefined, // Store productId
              origin: body.origin || existingInLog.origin,
              destination: body.destination || existingInLog.destination,
              senderOrganizationId: body.senderOrganizationId || existingInLog.senderOrganizationId,
              senderOrganization: senderOrgName || existingInLog.senderOrganization,
              receiverOrganizationId: body.receiverOrganizationId || existingInLog.receiverOrganizationId,
              receiverOrganization: receiverOrgName || existingInLog.receiverOrganization,
              transportCompanyId: body.transporterCompanyId || existingInLog.transportCompanyId,
              transportType: transportCompanyName ? "truck" : existingInLog.transportType, // Set if we have company name
              sealNumber: body.sealNumber || existingInLog.sealNumber,
              hasTrailer: body.hasTrailer !== undefined ? body.hasTrailer : existingInLog.hasTrailer,
              trailerPlate: body.trailerNumber || body.trailerPlate || existingInLog.trailerPlate,
              comments: session.notes || existingInLog.comments,
              bagQuantity: (existingInLog as any).bagQuantity || undefined, // Keep IN value
              bagQuantityOut: body.bagQuantity || undefined, // OUT value
              rfid: body.rfid || (existingInLog as any).rfid || undefined,
            }
            
            // Preserve or update carWeight and trailerWeight
            // If provided in OUT session, use those; otherwise preserve existing values
            if (body.carWeight !== undefined && body.carWeight !== null && body.carWeight > 0) {
              updateData.carWeight = typeof body.carWeight === 'number' ? body.carWeight : parseFloat(body.carWeight)
            } else if (existingInLog.carWeight !== undefined) {
              updateData.carWeight = existingInLog.carWeight
            }
            if (body.trailerWeight !== undefined && body.trailerWeight !== null && body.trailerWeight > 0) {
              updateData.trailerWeight = typeof body.trailerWeight === 'number' ? body.trailerWeight : parseFloat(body.trailerWeight)
            } else if (existingInLog.trailerWeight !== undefined) {
              updateData.trailerWeight = existingInLog.trailerWeight
            }
            
            console.log("📋 Update data with lookups:", {
              driverName: updateData.driverName,
              driverId: updateData.driverId,
              cargoType: updateData.cargoType,
              transportCompanyId: updateData.transportCompanyId,
            })

            await logsCollection.updateOne(
              { id: existingInLog.id },
              { $set: updateData }
            )

            createdOrUpdatedLogId = existingInLog.id
            console.log("✅ Log entry updated successfully:", existingInLog.id)
            logCreated = true
          } else {
            // No IN log found, create a new OUT log
            console.log("📝 No existing IN log found, creating new OUT log")
            const logData: any = {
              direction: session.direction,
              plate: session.plateNumber,
              driverId: body.driverId || undefined,
              driverName: driverName, // Should be looked up from driverId
              cargoType: cargoType, // Should be looked up from productId (product name/label)
              productId: body.productId || undefined, // Store productId for EditDialog
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
              transportType: transportCompanyName ? "truck" : undefined,
              sealNumber: body.sealNumber || undefined,
              hasTrailer: body.hasTrailer || undefined,
              trailerPlate: body.trailerNumber || body.trailerPlate || undefined,
              bagQuantityOut: body.bagQuantity || undefined, // OUT-only log
              rfid: body.rfid || undefined,
            }
            
            // Add carWeight and trailerWeight for OUT sessions if provided
            if (body.carWeight !== undefined && body.carWeight !== null && body.carWeight > 0) {
              logData.carWeight = typeof body.carWeight === 'number' ? body.carWeight : parseFloat(body.carWeight)
            }
            if (body.trailerWeight !== undefined && body.trailerWeight !== null && body.trailerWeight > 0) {
              logData.trailerWeight = typeof body.trailerWeight === 'number' ? body.trailerWeight : parseFloat(body.trailerWeight)
            }
            
            console.log("📋 OUT log data with lookups:", {
              driverName: logData.driverName,
              driverId: logData.driverId,
              cargoType: logData.cargoType,
              productId: logData.productId,
              transportCompanyId: logData.transportCompanyId,
              carWeight: logData.carWeight,
              trailerWeight: logData.trailerWeight,
            })

            const log = await saveTruckLog(logData)
            createdOrUpdatedLogId = log.id
            console.log("✅ Log entry created successfully:", log.id)
            logCreated = true
          }
        } catch (updateError) {
          console.error("⚠️ Error updating/finding log entry:", updateError)
          // Fallback: create a new log
          const logData: any = {
            direction: session.direction,
            plate: session.plateNumber,
            driverId: body.driverId || undefined,
            driverName: driverName, // Should be looked up from driverId
            cargoType: cargoType, // Should be looked up from productId (product name/label)
            productId: body.productId || undefined, // Store productId for EditDialog
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
            transportType: transportCompanyName ? "truck" : undefined,
            sealNumber: body.sealNumber || undefined,
            hasTrailer: body.hasTrailer || undefined,
            trailerPlate: body.trailerNumber || body.trailerPlate || undefined,
            bagQuantityOut: body.bagQuantity || undefined,
            rfid: body.rfid || undefined,
          }
          
          // Add carWeight and trailerWeight if provided
          if (body.carWeight !== undefined && body.carWeight !== null && body.carWeight > 0) {
            logData.carWeight = typeof body.carWeight === 'number' ? body.carWeight : parseFloat(body.carWeight)
          }
          if (body.trailerWeight !== undefined && body.trailerWeight !== null && body.trailerWeight > 0) {
            logData.trailerWeight = typeof body.trailerWeight === 'number' ? body.trailerWeight : parseFloat(body.trailerWeight)
          }
          
          console.log("📋 Fallback log data with lookups:", {
            driverName: logData.driverName,
            driverId: logData.driverId,
            cargoType: logData.cargoType,
            productId: logData.productId,
            transportCompanyId: logData.transportCompanyId,
            carWeight: logData.carWeight,
            trailerWeight: logData.trailerWeight,
          })
          const log = await saveTruckLog(logData)
          createdOrUpdatedLogId = log.id
          console.log("✅ Fallback: Log entry created successfully:", log.id)
          logCreated = true
        }
      } else {
        // For IN sessions, create a new log as usual
        // Ensure weightKg is a valid positive number
        const weightKg = session.grossWeightKg && session.grossWeightKg > 0 
          ? session.grossWeightKg 
          : undefined
        
        const logData: any = {
          direction: session.direction,
          plate: session.plateNumber,
          driverId: body.driverId || undefined,
          driverName: driverName, // Should be looked up from driverId if not provided
          cargoType: cargoType, // Should be looked up from productId (product name/label)
          productId: body.productId || undefined, // Store productId for EditDialog
          weightKg: weightKg,
          netWeightKg: session.netWeightKg && session.netWeightKg > 0 ? session.netWeightKg : undefined,
          comments: session.notes || undefined,
          origin: body.origin || undefined,
          destination: body.destination || undefined,
          senderOrganizationId: body.senderOrganizationId || undefined,
          senderOrganization: senderOrgName || undefined,
          receiverOrganizationId: body.receiverOrganizationId || undefined,
          receiverOrganization: receiverOrgName || undefined,
          transportCompanyId: body.transporterCompanyId || undefined,
          transportType: transportCompanyName ? "truck" : undefined, // Set transport type if we have company name
          sealNumber: body.sealNumber || undefined,
          hasTrailer: body.hasTrailer !== undefined ? body.hasTrailer : undefined,
          trailerPlate: body.trailerNumber || body.trailerPlate || undefined,
          bagQuantity: body.bagQuantity || undefined,
          rfid: body.rfid || undefined,
        }
        
        console.log("📋 Log data with lookups:", {
          driverName: logData.driverName,
          driverId: logData.driverId,
          cargoType: logData.cargoType,
          productId: logData.productId,
          transportCompanyId: logData.transportCompanyId,
          senderOrganization: logData.senderOrganization,
          receiverOrganization: logData.receiverOrganization,
        })
        
        // Add carWeight and trailerWeight for IN sessions if provided
        if (body.carWeight !== undefined && body.carWeight !== null && body.carWeight > 0) {
          logData.carWeight = typeof body.carWeight === 'number' ? body.carWeight : parseFloat(body.carWeight)
        }
        if (body.trailerWeight !== undefined && body.trailerWeight !== null && body.trailerWeight > 0) {
          logData.trailerWeight = typeof body.trailerWeight === 'number' ? body.trailerWeight : parseFloat(body.trailerWeight)
        }
        
        console.log("📋 IN log data with weight fields:", {
          carWeight: logData.carWeight,
          trailerWeight: logData.trailerWeight,
          totalWeight: logData.weightKg,
        })

        console.log("📝 Creating IN log entry with data:", JSON.stringify(logData, null, 2))
        console.log("📝 Driver name:", driverName, "| Cargo type:", cargoType, "| Weight:", weightKg)
        console.log("📝 Required fields check:", {
          direction: logData.direction,
          plate: logData.plate,
          driverName: logData.driverName,
          cargoType: logData.cargoType,
          driverNameLength: logData.driverName?.length,
          cargoTypeLength: logData.cargoType?.length,
        })
        
        try {
          const log = await saveTruckLog(logData)
          createdOrUpdatedLogId = log.id
          console.log("✅ Log entry created successfully:", log.id)
          console.log("✅ Log entry details:", {
            id: log.id,
            plate: log.plate,
            direction: log.direction,
            cargoType: log.cargoType,
            driverName: log.driverName,
            createdAt: log.createdAt,
          })
          
          // Verify the log can be queried immediately
          try {
            const logsCollection = await getCompanyCollection(companyId, "logs")
            const verifyLog = await logsCollection.findOne({ id: log.id })
            if (verifyLog) {
              console.log("✅ Verification: Log found in database immediately after creation")
              console.log("✅ Verification: Log details:", {
                id: verifyLog.id,
                plate: verifyLog.plate,
                direction: verifyLog.direction,
                cargoType: verifyLog.cargoType,
                createdAt: verifyLog.createdAt,
              })
            } else {
              console.error("❌ Verification: Log NOT found in database after creation!")
              console.error("❌ This is a CRITICAL issue - log was created but not queryable!")
            }
            
            // Also check total count
            const totalCount = await logsCollection.countDocuments({})
            console.log("✅ Verification: Total logs in 'logs' collection:", totalCount)
            
            // Also check truck_sessions collection
            const sessionsCollection = await getCompanyCollection(companyId, "truck_sessions")
            const sessionCount = await sessionsCollection.countDocuments({})
            console.log("✅ Verification: Total sessions in 'truck_sessions' collection:", sessionCount)
            
            // Check if this log appears in a query
            const recentLogs = await logsCollection
              .find({})
              .sort({ createdAt: -1 })
              .limit(5)
              .toArray()
            console.log("✅ Verification: Recent 5 logs:", recentLogs.map((l: any) => ({ id: l.id, plate: l.plate, createdAt: l.createdAt })))
            const foundInQuery = recentLogs.some((l: any) => l.id === log.id)
            console.log("✅ Verification: New log appears in recent query:", foundInQuery ? "YES ✅" : "NO ❌")
            
            if (!foundInQuery) {
              console.error("❌ CRITICAL: Log was saved but doesn't appear in queries!")
              console.error("❌ This suggests a database indexing or query issue")
            }
          } catch (verifyError) {
            console.error("❌ Verification error:", verifyError)
          }
          
          logCreated = true
        } catch (saveError) {
          console.error("❌ CRITICAL: Failed to save log entry:", saveError)
          if (saveError instanceof Error) {
            console.error("❌ Error message:", saveError.message)
            console.error("❌ Error stack:", saveError.stack)
          }
          // Don't re-throw - we want the session to be saved even if log fails
          // But we'll mark it as not created so the warning is returned
        }
      }
    } catch (logError) {
      // Log creation is critical - if it fails, the data won't appear in history
      console.error("❌ CRITICAL: Error creating/updating log entry:", logError)
      if (logError instanceof Error) {
        console.error("❌ Error message:", logError.message)
        console.error("❌ Error stack:", logError.stack)
      }
      // Still return success for session, but log the issue
      // The session is saved, but history won't show it
      console.error("⚠️ WARNING: Session saved but log entry failed - data may not appear in history!")
    }
    
    if (!logCreated) {
      console.error("❌ CRITICAL: No log entry was created - data will not appear in history!")
      // Return a warning in the response so client knows
      return NextResponse.json({ 
        success: true, 
        session,
        logId: undefined,
        warning: "Session saved but log entry creation failed - data may not appear in history"
      }, { status: 201 })
    }

    return NextResponse.json({ success: true, session, logId: createdOrUpdatedLogId }, { status: 201 })
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
