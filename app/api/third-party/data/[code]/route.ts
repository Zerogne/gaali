import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getActiveCompany } from "@/lib/auth/session"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}

/** OPTIONS - CORS preflight */
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * GET /api/third-party/data/[code]
 * Serves third-party data file by code
 * This is the endpoint the 3rd party app will fetch from
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    // Handle both sync and async params (Next.js 13+ vs 15+)
    const resolvedParams = params instanceof Promise ? await params : params
    let code = resolvedParams.code
    
    // Trim whitespace and decode URL encoding
    code = code ? decodeURIComponent(code.trim()) : null
    
    console.log("📥 Fetching third-party data (path format)")
    console.log("📥 Code from path param:", resolvedParams.code)
    console.log("📥 Final code (trimmed & decoded):", code)

    if (!code || code === "" || code === "null" || code === "undefined") {
      return NextResponse.json(
        { 
          error: "Code is required",
          message: "Please provide a code in the URL path. Usage: /api/third-party/data/YOUR_CODE",
          example: "https://gaali.vercel.app/api/third-party/data/311001202401180001",
          receivedCode: code
        },
        { status: 400, headers: CORS_HEADERS }
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
            { status: 404, headers: CORS_HEADERS }
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
        { status: 404, headers: CORS_HEADERS }
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

    console.log("✅ Third-party data served for code:", code)

    return NextResponse.json(document.data, {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    })
  } catch (error) {
    console.error("❌ Error fetching third-party data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

