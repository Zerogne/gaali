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
 * Accepts code in request body (optional - if not provided, returns latest)
 * Supports multiple formats:
 * - JSON body: { "code": "..." }
 * - Form data: code=...
 * - URL encoded: code=...
 * This is the preferred method for other sites that can't put code in URL
 */
export async function POST(request: Request) {
  try {
    // Try to parse as JSON first
    let body: any = {}
    const contentType = request.headers.get("content-type") || ""
    
    if (contentType.includes("application/json")) {
      body = await request.json().catch(() => ({}))
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      // Handle form data
      const formData = await request.formData().catch(() => null)
      if (formData) {
        body = Object.fromEntries(formData.entries())
      } else {
        // Try to parse as URL encoded string
        const text = await request.text().catch(() => "")
        if (text) {
          const params = new URLSearchParams(text)
          body = Object.fromEntries(params.entries())
        }
      }
    } else {
      // Try JSON as fallback
      try {
        const text = await request.text()
        if (text) {
          try {
            body = JSON.parse(text)
          } catch {
            // If JSON parse fails, try URL encoded
            try {
              const params = new URLSearchParams(text)
              body = Object.fromEntries(params.entries())
            } catch {
              body = {}
            }
          }
        }
      } catch {
        body = {}
      }
    }
    
    console.log("📥 [v1/api/service] POST request")
    console.log("📥 Content-Type:", contentType)
    console.log("📥 Request body:", JSON.stringify(body))
    
    const code = body.code || body.uniqueCode || body.akt || body.code || null
    const plateNumber = body.plate || body.vno || null
    const akt = body.akt || null
    
    // Trim whitespace
    const trimmedCode = code ? String(code).trim() : null
    const trimmedPlate = plateNumber ? String(plateNumber).trim() : null
    const trimmedAkt = akt ? String(akt).trim() : null
    
    console.log("📥 [v1/api/service] POST request")
    console.log("📥 Request body:", JSON.stringify(body))
    console.log("📥 Code from body:", code)
    console.log("📥 Plate from body:", plateNumber)
    console.log("📥 AKT from body:", akt)
    console.log("📥 Final values (trimmed):", { trimmedCode, trimmedPlate, trimmedAkt })

    // If no code/plate/akt provided, return latest (don't require code)
    if (!trimmedCode && !trimmedPlate && !trimmedAkt) {
      console.log("📥 No code/plate/akt in POST body, returning latest data")
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

    let document = null
    let foundCode = null

    // If code is provided, search by code
    if (trimmedCode && trimmedCode !== "" && trimmedCode !== "null" && trimmedCode !== "undefined") {
      let query: any = { code: trimmedCode }
      if (companyId) {
        query.companyId = companyId
      }

      console.log("🔍 Searching for document by code:", JSON.stringify(query))
      document = await collection.findOne(query)

      if (!document) {
        document = await collection.findOne({ code: trimmedCode })
      }
      
      if (document) {
        foundCode = trimmedCode
      }
    }
    // If plate number is provided, search by plate number
    else if (trimmedPlate && trimmedPlate !== "" && trimmedPlate !== "null" && trimmedPlate !== "undefined") {
      console.log("🔍 Searching for document by plate number:", trimmedPlate)
      const allDocs = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray()
      document = allDocs.find(doc => {
        if (doc.data && Array.isArray(doc.data) && doc.data.length > 0) {
          const vno = doc.data[0].VNO || ""
          return vno.toLowerCase().includes(trimmedPlate.toLowerCase()) || 
                 trimmedPlate.toLowerCase().includes(vno.toLowerCase())
        }
        return false
      })
      
      if (document) {
        foundCode = document.code
      }
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
      
      if (document) {
        foundCode = document.code
      }
    }
    // If no parameters, return the most recent data
    else {
      console.log("🔍 No code/plate/akt provided, returning latest data")
      const query: any = {}
      if (companyId) {
        query.companyId = companyId
      }
      
      document = await collection.findOne(query, { sort: { createdAt: -1 } })
      
      if (!document && companyId) {
        document = await collection.findOne({}, { sort: { createdAt: -1 } })
      }
      
      if (document) {
        foundCode = document.code
      }
    }

    if (!document) {
      console.log("❌ No document found")
      const sampleDocs = await collection.find({}).limit(5).toArray()
      const sampleCodes = sampleDocs.map(doc => doc.code)
      
      return NextResponse.json(
        { 
          error: "Data not found",
          message: trimmedCode 
            ? "The code you provided does not exist in the database."
            : trimmedPlate
            ? "No data found for the provided plate number."
            : trimmedAkt
            ? "No data found for the provided AKT number."
            : "No data available in the database.",
          receivedCode: trimmedCode,
          receivedPlate: trimmedPlate,
          receivedAkt: trimmedAkt,
          sampleCodes: sampleCodes.length > 0 ? sampleCodes : undefined
        },
        { status: 404 }
      )
    }

    // Update access stats
    if (foundCode) {
      await collection.updateOne(
        { code: foundCode },
        {
          $set: { accessedAt: new Date() },
          $inc: { accessCount: 1 },
        }
      )
    }

    console.log("✅ [v1/api/service] Data served for code:", foundCode || "latest")

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

