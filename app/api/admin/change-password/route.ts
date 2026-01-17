import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { writeFile, readFile } from "fs/promises"
import { resolve } from "path"

/**
 * POST /api/admin/change-password - Change admin password
 * Updates ADMIN_PASSWORD in .env.local file
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

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

    // Verify current password
    const currentAdminPassword = process.env.ADMIN_PASSWORD
    if (currentPassword !== currentAdminPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Read .env.local file
    const envPath = resolve(process.cwd(), ".env.local")
    let envContent = ""
    try {
      envContent = await readFile(envPath, "utf-8")
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Could not read .env.local file" },
        { status: 500 }
      )
    }

    // Update ADMIN_PASSWORD in .env.local
    let updatedContent = envContent
    if (envContent.includes("ADMIN_PASSWORD=")) {
      // Replace existing ADMIN_PASSWORD
      updatedContent = envContent.replace(
        /ADMIN_PASSWORD=.*/,
        `ADMIN_PASSWORD=${newPassword}`
      )
    } else {
      // Add ADMIN_PASSWORD if it doesn't exist
      updatedContent = envContent + `\nADMIN_PASSWORD=${newPassword}\n`
    }

    // Write back to file
    await writeFile(envPath, updatedContent, "utf-8")

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. Please restart the server for changes to take effect.",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 }
    )
  }
}
