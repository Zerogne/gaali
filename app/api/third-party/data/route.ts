import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * GET /api/third-party/data?code={code}
 * Serves third-party data file by code (query parameter format)
 * This endpoint supports the other site's pull functionality
 * 
 * Usage:
 *   GET /api/third-party/data?code=311001202401180001
 * 
 * Alternative path format (also supported):
 *   GET /api/third-party/data/311001202401180001
 */
export async function GET(request: Request) {
  try {
    const { searchParams, pathname } = new URL(request.url)
    let code = searchParams.get("code")
    
    // If no query param, try to extract from path (for path format: /api/third-party/data/{code})
    if (!code && pathname.startsWith("/api/third-party/data/")) {
      const pathParts = pathname.split("/")
      code = pathParts[pathParts.length - 1]
    }
    
    // Trim whitespace and decode URL encoding
    code = code ? decodeURIComponent(code.trim()) : null
    
    console.log("📥 Fetching third-party data")
    console.log("📥 Request URL:", request.url)
    console.log("📥 Code from query param:", searchParams.get("code"))
    console.log("📥 Code from path:", pathname)
    console.log("📥 Final code (trimmed & decoded):", code)

    if (!code || code === "" || code === "null" || code === "undefined") {
      return NextResponse.json(
        { 
          error: "Code is required",
          message: "Please provide a code parameter. Usage: /api/third-party/data?code=YOUR_CODE",
          example: "https://gaali.vercel.app/api/third-party/data?code=311001202401180001",
          receivedCode: code,
          requestUrl: request.url
        },
        { status: 400 }
      )
    }

    // Get company ID (optional - for security, but 3rd party might not have auth)
    let companyId: string | null = null
    try {
      companyId = await getActiveCompany()
    } catch (error) {
      // If no auth, still allow access (3rd party app might not be authenticated)
      console.log("⚠️ No active company, allowing public access")
    }

    // Get database
    const db = await getDatabase()
    const collection = db.collection("third_party_data")

    // Find document by code (try exact match first)
    let query: any = { code: code }
    if (companyId) {
      // If authenticated, prefer company-scoped data
      query.companyId = companyId
    }

    console.log("🔍 Searching for document with query:", JSON.stringify(query))
    let document = await collection.findOne(query)

    if (!document) {
      // Try without company filter if not found (for 3rd party access)
      console.log("🔍 Trying without company filter...")
      const publicQuery = { code: code }
      console.log("🔍 Public query:", JSON.stringify(publicQuery))
      const publicDoc = await collection.findOne(publicQuery)
      
      if (!publicDoc) {
        // Try case-insensitive search as last resort
        console.log("🔍 Trying case-insensitive search...")
        const caseInsensitiveDoc = await collection.findOne({
          $or: [
            { code: code },
            { code: { $regex: new RegExp(`^${code}$`, "i") } }
          ]
        })
        
        if (!caseInsensitiveDoc) {
          console.log("❌ No document found for code:", code)
          // List some available codes for debugging (limit to 5)
          const sampleDocs = await collection.find({}).limit(5).toArray()
          const sampleCodes = sampleDocs.map(doc => doc.code)
          console.log("📋 Sample codes in database:", sampleCodes)
          
          return NextResponse.json(
            { 
              error: "Data not found for code: " + code,
              message: "The code you provided does not exist in the database.",
              receivedCode: code,
              codeLength: code.length,
              sampleCodes: sampleCodes.length > 0 ? sampleCodes : undefined
            },
            { status: 404 }
          )
        }
        
        document = caseInsensitiveDoc
        console.log("✅ Found document with case-insensitive search")
      } else {
        document = publicDoc
        console.log("✅ Found document without company filter")
      }
    } else {
      console.log("✅ Found document with company filter")
    }

    // At this point, document should be set
    if (!document) {
      console.log("❌ No document found after all search attempts")
      const sampleDocs = await collection.find({}).limit(5).toArray()
      const sampleCodes = sampleDocs.map(doc => doc.code)
      
      return NextResponse.json(
        { 
          error: "Data not found for code: " + code,
          message: "The code you provided does not exist in the database.",
          receivedCode: code,
          codeLength: code.length,
          sampleCodes: sampleCodes.length > 0 ? sampleCodes : undefined
        },
        { status: 404 }
      )
    }

    // Update access stats
    await collection.updateOne(
      { code: code },
      {
        $set: { accessedAt: new Date() },
        $inc: { accessCount: 1 },
      }
    )

    console.log("✅ Third-party data served for code (query param):", code)
    
    // If driverId is missing from the data, try to fetch it from the corresponding log
    let dataToReturn = document.data
    if (Array.isArray(dataToReturn) && dataToReturn.length > 0) {
      const firstItem = dataToReturn[0]
      if (!firstItem.driverId || firstItem.driverId === "") {
        console.log("🔍 driverId is missing, trying to fetch from log...")
        try {
          // Try to find the corresponding log by plate number and AKT code
          const plateNumber = firstItem.VNO || ""
          if (plateNumber) {
            // Search across all company logs to find matching entry
            const { getDatabase } = await import("@/lib/db/client")
            const db = await getDatabase()
            const companiesCollection = db.collection("companies")
            const companies = await companiesCollection.find({}).toArray()
            
            for (const company of companies) {
              const companyId = company.id || company._id?.toString()
              if (!companyId) continue
              
              const logsCollection = db.collection(`company_${companyId}_logs`)
              // Find log by plate and matching date (from AKT code)
              const log = await logsCollection.findOne(
                { plate: plateNumber },
                { sort: { createdAt: -1 } }
              )
              
              if (log && log.driverId) {
                console.log("✅ Found driverId from log:", log.driverId)
                // Update the data with driverId
                dataToReturn = [
                  {
                    ...firstItem,
                    driverId: log.driverId,
                  }
                ]
                break
              }
            }
          }
        } catch (error) {
          console.warn("⚠️ Could not fetch driverId from log:", error)
        }
      }
    }

    return NextResponse.json(dataToReturn, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow 3rd party app to fetch
      },
    })
  } catch (error) {
    console.error("❌ Error fetching third-party data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

