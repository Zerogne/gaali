import { getAllCompanies } from "@/lib/companies/metadata"
import { NextResponse } from "next/server"

/**
 * API route to get all companies
 * GET /api/companies
 * This is a public endpoint (no authentication required) for login page
 */
export async function GET() {
  try {
    console.log("📥 GET /api/companies - Loading companies...")
    console.log(`🔍 [GET /api/companies] MONGODB_ADMIN_DB_NAME: ${process.env.MONGODB_ADMIN_DB_NAME || "not set (using default: gaali-admin)"}`)
    
    const companies = await getAllCompanies()
    console.log("✅ Successfully loaded companies:", companies.length)
    return NextResponse.json(companies, { status: 200 })
  } catch (error) {
    console.error("❌ Error in GET /api/companies:", error)
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorResponse = {
      error: errorMessage || "Failed to load companies",
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : undefined,
    }
    
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
