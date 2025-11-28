import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/user"

/**
 * API route to get current user information
 * GET /api/user
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Return serialized user info (no MongoDB objects)
    return NextResponse.json({
      name: user.name,
      role: user.role,
      companyName: user.companyName,
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json(
      { error: "Failed to get user information" },
      { status: 500 }
    )
  }
}

