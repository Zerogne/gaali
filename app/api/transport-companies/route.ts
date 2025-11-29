import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/transport-companies - Get all transport companies for the active company
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const companiesCollection = await getCompanyCollection(companyId, "transportCompanies")
    
    const companies = await companiesCollection.find({}).toArray()
    
    // Serialize MongoDB documents
    const serialized = companies.map((company: any) => {
      const { _id, ...data } = company
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting transport companies:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/transport-companies - Add a new transport company
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const companiesCollection = await getCompanyCollection(companyId, "transportCompanies")
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      )
    }

    // Check if company already exists
    const existing = await companiesCollection.findOne({ name: name.trim() })
    if (existing) {
      return NextResponse.json(
        { error: "Transport company with this name already exists" },
        { status: 409 }
      )
    }

    const newCompany = {
      id: `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }

    await companiesCollection.insertOne(newCompany)

    // Serialize for return
    const { _id, ...serialized } = newCompany as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding transport company:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

