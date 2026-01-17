import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    await requireAdmin()

    const companiesCollection = await getCompaniesCollection()

    // Check if dummy company already exists
    const existing = await companiesCollection.findOne({ companyId: "dummy-company" })
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Dummy company already exists",
        company: {
          companyId: existing.companyId,
          name: existing.name,
          description: existing.description,
          logoInitials: existing.logoInitials,
          companyCode: existing.companyCode,
        },
      })
    }

    // Hash password for the dummy company
    const plainPassword = "password123"
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // Create dummy company with all fields
    const dummyCompany = {
      companyId: "dummy-company",
      name: "Dummy Company",
      description: "This is a dummy company profile created for testing purposes. It includes all standard company fields.",
      logoInitials: "DC",
      password: hashedPassword,
      cameraSettings: {
        camera1Ip: "192.168.1.100",
        camera2Ip: "192.168.1.101",
      },
      companyCode: "9999", // 4-digit company code
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await companiesCollection.insertOne(dummyCompany)

    return NextResponse.json({
      success: true,
      message: "Dummy company created successfully with all fields",
      company: {
        companyId: dummyCompany.companyId,
        name: dummyCompany.name,
        description: dummyCompany.description,
        logoInitials: dummyCompany.logoInitials,
        companyCode: dummyCompany.companyCode,
        cameraSettings: dummyCompany.cameraSettings,
        password: "password123", // Return plain password for reference (not stored in DB)
      },
      insertedId: result.insertedId,
    })
  } catch (error) {
    console.error("Create dummy company error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create dummy company",
      },
      { status: 500 }
    )
  }
}
