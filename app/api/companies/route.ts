import { NextResponse } from "next/server"
import { getAllCompanies } from "@/lib/companies/metadata"

/**
 * API route to get all companies
 * GET /api/companies
 */
export async function GET() {
  try {
    const companies = await getAllCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error("Error getting companies:", error)
    return NextResponse.json(
      { error: "Failed to get companies" },
      { status: 500 }
    )
  }
}

