import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"

/**
 * GET /api/third-party/debug
 * Debug endpoint to list available codes in the database
 * This helps troubleshoot when codes aren't found
 */
export async function GET(request: Request) {
  try {
    const db = await getDatabase()
    const collection = db.collection("third_party_data")

    // Get all documents (limit to 20 for performance)
    const documents = await collection
      .find({})
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20)
      .toArray()

    const codes = documents.map((doc) => ({
      code: doc.code,
      createdAt: doc.createdAt,
      accessedAt: doc.accessedAt,
      accessCount: doc.accessCount,
      companyId: doc.companyId ? "***" : null, // Hide actual company ID for privacy
      hasData: !!doc.data,
    }))

    return NextResponse.json(
      {
        total: codes.length,
        codes: codes,
        message: "Use one of these codes to test the pull endpoint",
        example: "https://gaali.vercel.app/api/third-party/data?code=" + (codes[0]?.code || "YOUR_CODE"),
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("❌ Error in debug endpoint:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch debug info",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

