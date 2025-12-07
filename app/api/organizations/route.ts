import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/organizations - Get all organizations for the active company
 * All organizations are shared between sender and receiver
 */
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const orgsCollection = await getCompanyCollection(companyId, "organizations")
    
    // Get all organizations (no type filter - they're all shared)
    const organizations = await orgsCollection.find({}).toArray()
    
    // Serialize MongoDB documents
    const serialized = organizations.map((org: any) => {
      const { _id, ...data } = org
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting organizations:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { statusCode })
  }
}

/**
 * POST /api/organizations - Add a new organization
 * Organizations are shared between sender and receiver
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const orgsCollection = await getCompanyCollection(companyId, "organizations")
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      )
    }

    // Check if organization already exists (by name only, no type distinction)
    const existing = await orgsCollection.findOne({ 
      name: name.trim()
    })
    if (existing) {
      return NextResponse.json(
        { error: "Organization with this name already exists" },
        { status: 409 }
      )
    }

    const newOrg = {
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }

    await orgsCollection.insertOne(newOrg)

    // Serialize for return
    const { _id, ...serialized } = newOrg as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding organization:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { statusCode })
  }
}
