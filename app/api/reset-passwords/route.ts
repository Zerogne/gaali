import { NextResponse } from "next/server"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import bcrypt from "bcryptjs"

/**
 * API route to reset all company passwords to "password123"
 * POST /api/reset-passwords
 * 
 * This is a development utility to reset passwords
 * Should be removed or protected in production
 */
export async function POST() {
  try {
    const companiesCollection = await getCompaniesCollection()
    const password = "password123"
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update all companies with the new password
    const result = await companiesCollection.updateMany(
      {},
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: `Reset passwords for ${result.modifiedCount} companies`,
      password: password,
      note: "All companies now use password: password123"
    })
  } catch (error) {
    console.error("Error resetting passwords:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to reset passwords",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

