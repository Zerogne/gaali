import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"
import type { Contract } from "@/lib/types"

/**
 * GET /api/contracts - Get all contracts for the active company
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const companyId = session.companyId
    const contractsCollection = await getCompanyCollection<Contract>(companyId, "contracts")
    
    const contracts = await contractsCollection.find({}).sort({ createdAt: -1 }).toArray()
    
    // Serialize MongoDB documents
    const serialized = contracts.map((contract: any) => {
      const { _id, ...data } = contract
      return data
    })
    
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error getting contracts:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/contracts - Add a new contract
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const activeCompanyId = session.companyId
    const contractsCollection = await getCompanyCollection<Contract>(activeCompanyId, "contracts")
    const body = await request.json()
    const { number, company, companyId, companyPhone, description, startDate, endDate } = body

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

    // Check if contract with this number already exists
    const existing = await contractsCollection.findOne({ 
      number: number.trim()
    })
    if (existing) {
      return NextResponse.json(
        { error: "Contract with this number already exists" },
        { status: 409 }
      )
    }

    const newContract: Contract = {
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: number.trim(),
      company: company.trim(),
      companyId: companyId.trim(),
      companyPhone: companyPhone.trim(),
      description: description?.trim() || undefined,
      startDate: startDate?.trim() || undefined,
      endDate: endDate?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    await contractsCollection.insertOne(newContract)

    // Serialize for return
    const { _id, ...serialized } = newContract as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding contract:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

