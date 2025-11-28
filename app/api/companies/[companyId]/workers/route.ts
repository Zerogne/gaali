import { NextResponse } from "next/server"
import { getCompanyWorkers } from "@/lib/companies/workers"

/**
 * API route to get workers for a specific company
 * GET /api/companies/[companyId]/workers
 */
export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    const workers = await getCompanyWorkers(companyId)
    return NextResponse.json(workers)
  } catch (error) {
    console.error("Error getting workers:", error)
    return NextResponse.json(
      { error: "Failed to get workers" },
      { status: 500 }
    )
  }
}

