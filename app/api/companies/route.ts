import { NextResponse } from "next/server"
import { getAllCompanies } from "@/lib/companies/metadata"
import { errorToResponse } from "@/lib/errors"

/**
 * API route to get all companies
 * GET /api/companies
 * This is a public endpoint (no authentication required) for login page
 */
export async function GET() {
  try {
    console.log("📥 GET /api/companies - Loading companies...")
    const companies = await getAllCompanies()
    console.log("✅ Successfully loaded companies:", companies.length)
    return NextResponse.json(companies, { status: 200 })
  } catch (error) {
    console.error("❌ Error in GET /api/companies:", error)
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
