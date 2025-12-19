import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * POST /api/third-party/save
 * Saves third-party data to a file-like storage (database)
 * Returns the URL where the data can be fetched
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📥 Received third-party data to save:", body)

    // Get company ID
    let companyId: string
    try {
      companyId = await getActiveCompany()
      if (!companyId) {
        return NextResponse.json(
          { error: "No active company found. Please log in." },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error("❌ Error getting active company:", error)
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      )
    }

    // Extract unique code or generate one
    const uniqueCode = body.uniqueCode || body.code || generateUniqueCode()
    const data = body.data || body

    // Get database
    const db = await getDatabase()
    const collection = db.collection("third_party_data")

    // Prepare document
    const document = {
      code: uniqueCode,
      companyId: companyId,
      data: data,
      createdAt: new Date(),
      accessedAt: new Date(),
      accessCount: 0,
    }

    // Save to database (upsert - update if exists, insert if not)
    await collection.updateOne(
      { code: uniqueCode, companyId: companyId },
      { $set: document },
      { upsert: true }
    )

    console.log("✅ Third-party data saved with code:", uniqueCode)

    // Build the URL where this data can be fetched
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== "undefined" ? window.location.origin : "https://gaali.vercel.app")
    const fileUrl = `${baseUrl}/api/third-party/data/${uniqueCode}`

    return NextResponse.json({
      success: true,
      code: uniqueCode,
      url: fileUrl,
      message: "Data saved successfully",
    })
  } catch (error) {
    console.error("❌ Error saving third-party data:", error)
    return NextResponse.json(
      {
        error: "Failed to save data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Generate a unique 8-digit numeric code
 */
function generateUniqueCode(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  const code = (timestamp % 100000000) + random
  return code.toString().padStart(8, "0").slice(-8)
}

