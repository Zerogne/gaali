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
    const companies = await getAllCompanies()
    return NextResponse.json(companies, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

