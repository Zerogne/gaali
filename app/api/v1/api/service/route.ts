import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * GET /api/v1/api/service?code={code}
 * POST /api/v1/api/service
 * 
 * Compatible endpoint for other sites that expect /v1/api/service format
 * Supports both GET (with code query param) and POST (with code in body)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const plateNumber = searchParams.get("plate") || searchParams.get("vno") // Support both 'plate' and 'vno' params
    const akt = searchParams.get("akt")
    const latest = searchParams.get("latest") // If 'latest=true', return most recent
    
    // Trim whitespace and decode URL encoding
    const trimmedCode = code ? decodeURIComponent(code.trim()) : null
    const trimmedPlate = plateNumber ? decodeURIComponent(plateNumber.trim()) : null
    const trimmedAkt = akt ? decodeURIComponent(akt.trim()) : null
    
    console.log("📥 [v1/api/service] GET request")
    console.log("📥 Query params:", { code, plateNumber, akt, latest })
    console.log("📥 Trimmed values:", { trimmedCode, trimmedPlate, trimmedAkt })

    // Get company ID (optional - for security, but 3rd party might not have auth)
    let companyId: string | null = null
    try {
      companyId = await getActiveCompany()
    } catch (error) {
      console.log("⚠️ No active company, allowing public access")
    }

    // Get database
    const db = await getDatabase()
    const collection = db.collection("third_party_data")

    let document = null

    // If code is provided, search by code
    if (trimmedCode && trimmedCode !== "" && trimmedCode !== "null" && trimmedCode !== "undefined") {
      let query: any = { code: trimmedCode }
      if (companyId) {
        query.companyId = companyId
      }

      console.log("🔍 Searching for document by code:", JSON.stringify(query))
      document = await collection.findOne(query)

      if (!document) {
        // Try without company filter
        console.log("🔍 Trying without company filter...")
        document = await collection.findOne({ code: trimmedCode })
      }
    }
    // If plate number is provided, search by plate number (VNO field in data)
    else if (trimmedPlate && trimmedPlate !== "" && trimmedPlate !== "null" && trimmedPlate !== "undefined") {
      console.log("🔍 Searching for document by plate number:", trimmedPlate)
      // Search in the data array for matching VNO
      const allDocs = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray()
      document = allDocs.find(doc => {
        if (doc.data && Array.isArray(doc.data) && doc.data.length > 0) {
          const vno = doc.data[0].VNO || ""
          return vno.toLowerCase().includes(trimmedPlate.toLowerCase()) || 
                 trimmedPlate.toLowerCase().includes(vno.toLowerCase())
        }
        return false
      })
    }
    // If AKT is provided, search by AKT
    else if (trimmedAkt && trimmedAkt !== "" && trimmedAkt !== "null" && trimmedAkt !== "undefined") {
      console.log("🔍 Searching for document by AKT:", trimmedAkt)
      const allDocs = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray()
      document = allDocs.find(doc => {
        if (doc.data && Array.isArray(doc.data) && doc.data.length > 0) {
          const akt = doc.data[0].AKT || ""
          return akt === trimmedAkt
        }
        return false
      })
    }
    // If no parameters or latest=true, return the most recent data
    else {
      console.log("🔍 No code/plate/akt provided, returning latest data")
      const query: any = {}
      if (companyId) {
        query.companyId = companyId
      }
      
      document = await collection.findOne(query, { sort: { createdAt: -1 } })
      
      if (!document && companyId) {
        // Try without company filter
        document = await collection.findOne({}, { sort: { createdAt: -1 } })
      }
    }

    if (!document) {
      console.log("❌ No document found")
      const sampleDocs = await collection.find({}).limit(5).toArray()
      const sampleCodes = sampleDocs.map(doc => doc.code)
      console.log("📋 Sample codes in database:", sampleCodes)
      
      return NextResponse.json(
        { 
          error: "Data not found",
          message: trimmedCode 
            ? "The code you provided does not exist in the database."
            : trimmedPlate
            ? "No data found for the provided plate number."
            : "No data available in the database.",
          receivedCode: trimmedCode,
          receivedPlate: trimmedPlate,
          receivedAkt: trimmedAkt,
          sampleCodes: sampleCodes.length > 0 ? sampleCodes : undefined
        },
        { status: 404 }
      )
    }

    const foundCode = document.code
    console.log("✅ Found document:", foundCode)

    // Update access stats
    await collection.updateOne(
      { code: foundCode },
      {
        $set: { accessedAt: new Date() },
        $inc: { accessCount: 1 },
      }
    )

    console.log("✅ [v1/api/service] Data served for code:", foundCode)

    return NextResponse.json(document.data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("❌ Error in v1/api/service GET:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/api/service
 * Accepts code in request body
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const code = body.code || body.uniqueCode || body.akt
    
    // Trim whitespace
    const trimmedCode = code ? String(code).trim() : null
    
    console.log("📥 [v1/api/service] POST request")
    console.log("📥 Request body:", JSON.stringify(body))
    console.log("📥 Code from body:", code)
    console.log("📥 Final code (trimmed):", trimmedCode)

    if (!trimmedCode || trimmedCode === "" || trimmedCode === "null" || trimmedCode === "undefined") {
      return NextResponse.json(
        { 
          error: "Code is required",
          message: "Please provide a code in the request body. Usage: POST /api/v1/api/service with body: { code: 'YOUR_CODE' }",
          example: { code: "311001202401180001" },
          receivedCode: trimmedCode,
        },
        { status: 400 }
      )
    }

    // Get company ID (optional)
    let companyId: string | null = null
    try {
      companyId = await getActiveCompany()
    } catch (error) {
      console.log("⚠️ No active company, allowing public access")
    }

    // Get database
    const db = await getDatabase()
    const collection = db.collection("third_party_data")

    // Find document by code
    let query: any = { code: trimmedCode }
    if (companyId) {
      query.companyId = companyId
    }

    console.log("🔍 Searching for document with query:", JSON.stringify(query))
    let document = await collection.findOne(query)

    if (!document) {
      // Try without company filter
      const publicDoc = await collection.findOne({ code: trimmedCode })
      
      if (!publicDoc) {
        console.log("❌ No document found for code:", trimmedCode)
        const sampleDocs = await collection.find({}).limit(5).toArray()
        const sampleCodes = sampleDocs.map(doc => doc.code)
        
        return NextResponse.json(
          { 
            error: "Data not found for code: " + trimmedCode,
            message: "The code you provided does not exist in the database.",
            receivedCode: trimmedCode,
            sampleCodes: sampleCodes.length > 0 ? sampleCodes : undefined
          },
          { status: 404 }
        )
      }
      
      document = publicDoc
    }

    // Update access stats
    await collection.updateOne(
      { code: trimmedCode },
      {
        $set: { accessedAt: new Date() },
        $inc: { accessCount: 1 },
      }
    )

    console.log("✅ [v1/api/service] Data served for code:", trimmedCode)

    return NextResponse.json(document.data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("❌ Error in v1/api/service POST:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

