import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/organizations - Get organizations for the active company
 * Query params:
 *   - type: "sender" | "receiver" (optional, filters by type)
 */
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const orgsCollection = await getCompanyCollection(companyId, "organizations")
    
    // Get type filter from query params
    const url = new URL(request.url)
    const type = url.searchParams.get("type") as "sender" | "receiver" | null
    
    // Build query filter
    const filter = type ? { type } : {}
    
    const organizations = await orgsCollection.find(filter).toArray()
    
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
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/organizations - Add a new organization
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
    const { name, type } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      )
    }

    if (!type || (type !== "sender" && type !== "receiver")) {
      return NextResponse.json(
        { error: "Organization type must be 'sender' or 'receiver'" },
        { status: 400 }
      )
    }

    // Check if organization already exists (same name and type)
    const existing = await orgsCollection.findOne({ 
      name: name.trim(),
      type: type
    })
    if (existing) {
      return NextResponse.json(
        { error: "Organization with this name and type already exists" },
        { status: 409 }
      )
    }

    const newOrg = {
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      type: type,
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
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

