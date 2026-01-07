import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/user"
import { errorToResponse } from "@/lib/errors"

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
    }, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

