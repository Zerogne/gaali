import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * PUT /api/organizations/[id] - Update an organization
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const orgsCollection = await getCompanyCollection(companyId, "organizations")
    const body = await request.json()
    const { name, type } = body

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      )
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      )
    }

    // If type is provided, validate it
    if (type && type !== "sender" && type !== "receiver") {
      return NextResponse.json(
        { error: "Organization type must be 'sender' or 'receiver'" },
        { status: 400 }
      )
    }

    const update: any = {
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    }

    // Only update type if provided
    if (type) {
      update.type = type
    }

    const result = await orgsCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    const updatedOrg = await orgsCollection.findOne({ id })
    const { _id, ...serialized } = updatedOrg as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating organization:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/organizations/[id] - Delete an organization
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const orgsCollection = await getCompanyCollection(companyId, "organizations")

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      )
    }

    const result = await orgsCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting organization:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

