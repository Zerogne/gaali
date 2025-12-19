import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getActiveCompany } from "@/lib/auth/session"

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
    const code = resolvedParams.code
    console.log("📥 Fetching third-party data for code:", code)

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
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

    console.log("✅ Third-party data served for code:", code)

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

