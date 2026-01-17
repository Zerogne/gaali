import { NextRequest, NextResponse } from "next/server"
import { loginAdmin } from "@/lib/auth/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const result = await loginAdmin(email, password)

    if (result.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(result, { status: 401 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
}
