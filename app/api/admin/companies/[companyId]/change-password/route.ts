import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import bcrypt from "bcryptjs"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> | { companyId: string } }
) {
  try {
    await requireAdmin()

    const resolvedParams = params instanceof Promise ? await params : params
    const companyId = resolvedParams.companyId

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Get the company from database
    const companiesCollection = await getCompaniesCollection()
    const company = await companiesCollection.findOne({ companyId })

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    // Verify current password
    const companyPassword = (company as any).password
    if (!companyPassword) {
      return NextResponse.json(
        { success: false, error: "Company has no password set" },
        { status: 400 }
      )
    }

    const isValidPassword = await bcrypt.compare(currentPassword, companyPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update company password in MongoDB
    console.log(`🔐 [Change Password] Updating password for company: ${companyId}`)
    const updateResult = await companiesCollection.updateOne(
      { companyId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )

    console.log(`🔐 [Change Password] Update result:`, {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged,
    })

    if (updateResult.matchedCount === 0) {
      console.error(`❌ [Change Password] Company not found: ${companyId}`)
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    if (updateResult.modifiedCount === 0) {
      console.warn(`⚠️ [Change Password] Password update did not modify document: ${companyId}`)
      // Still return success as the password might be the same
    }

    // Verify the update by fetching the company again
    const updatedCompany = await companiesCollection.findOne({ companyId })
    if (updatedCompany && (updatedCompany as any).password) {
      console.log(`✅ [Change Password] Password successfully updated for company: ${companyId}`)
    } else {
      console.error(`❌ [Change Password] Failed to verify password update for company: ${companyId}`)
      return NextResponse.json(
        { success: false, error: "Failed to verify password update" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing company password:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 }
    )
  }
}
