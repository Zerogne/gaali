import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * PUT /api/transport-companies/[id] - Update a transport company
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
    const companiesCollection = await getCompanyCollection(companyId, "transportCompanies")
    const body = await request.json()
    const { name } = body

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      )
    }

    const update = {
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    }

    const result = await companiesCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Transport company not found" },
        { status: 404 }
      )
    }

    const updatedCompany = await companiesCollection.findOne({ id })
    const { _id, ...serialized } = updatedCompany as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating transport company:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/transport-companies/[id] - Delete a transport company
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
    const companiesCollection = await getCompanyCollection(companyId, "transportCompanies")

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    const result = await companiesCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transport company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting transport company:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

