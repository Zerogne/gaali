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
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    
    console.log("📥 Fetching third-party data for code (query param):", code)

    if (!code) {
      return NextResponse.json(
        { 
          error: "Code is required",
          message: "Please provide a code parameter. Usage: /api/third-party/data?code=YOUR_CODE",
          example: "https://gaali.vercel.app/api/third-party/data?code=311001202401180001"
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

    // Find document by code
    const query: any = { code: code }
    if (companyId) {
      // If authenticated, prefer company-scoped data
      query.companyId = companyId
    }

    const document = await collection.findOne(query)

    if (!document) {
      // Try without company filter if not found (for 3rd party access)
      const publicDoc = await collection.findOne({ code: code })
      if (!publicDoc) {
        return NextResponse.json(
          { error: "Data not found for code: " + code },
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
      return NextResponse.json(publicDoc.data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Allow 3rd party app to fetch
        },
      })
    }

    // Update access stats
    await collection.updateOne(
      { code: code, companyId: companyId },
      {
        $set: { accessedAt: new Date() },
        $inc: { accessCount: 1 },
      }
    )

    console.log("✅ Third-party data served for code (query param):", code)

    return NextResponse.json(document.data, {
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

