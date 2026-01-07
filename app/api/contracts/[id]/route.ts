import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"
import type { Contract } from "@/lib/types"

/**
 * PUT /api/contracts/[id] - Update a contract
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
    const activeCompanyId = session.companyId
    const contractsCollection = await getCompanyCollection<Contract>(activeCompanyId, "contracts")
    const body = await request.json()
    const { number, company, companyId, companyPhone, description, startDate, endDate } = body

    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      )
    }

    if (!number || typeof number !== "string" || !number.trim()) {
      return NextResponse.json(
        { error: "Гэрээний дугаар (Contract number) is required" },
        { status: 400 }
      )
    }

    if (!company || typeof company !== "string" || !company.trim()) {
      return NextResponse.json(
        { error: "Компани (Company) is required" },
        { status: 400 }
      )
    }

    if (!companyId || typeof companyId !== "string" || !companyId.trim()) {
      return NextResponse.json(
        { error: "Компанийн регистер (Company registration) is required" },
        { status: 400 }
      )
    }

    if (!companyPhone || typeof companyPhone !== "string" || !companyPhone.trim()) {
      return NextResponse.json(
        { error: "Компанийн утасны дугаар (Company phone) is required" },
        { status: 400 }
      )
    }

    // Check if another contract with this number already exists (excluding current one)
    const existing = await contractsCollection.findOne({ 
      number: number.trim(),
      id: { $ne: id }
    })
    if (existing) {
      return NextResponse.json(
        { error: "Contract with this number already exists" },
        { status: 409 }
      )
    }

    const update: Partial<Contract> = {
      number: number.trim(),
      company: company.trim(),
      companyId: companyId.trim(),
      companyPhone: companyPhone.trim(),
      description: description?.trim() || undefined,
      startDate: startDate?.trim() || undefined,
      endDate: endDate?.trim() || undefined,
    }

    const result = await contractsCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    const updatedContract = await contractsCollection.findOne({ id })
    const { _id, ...serialized } = updatedContract as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating contract:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/contracts/[id] - Delete a contract
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
    const contractsCollection = await getCompanyCollection<Contract>(companyId, "contracts")

    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      )
    }

    const result = await contractsCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting contract:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

