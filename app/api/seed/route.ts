import { NextResponse } from "next/server"
import { seedAll } from "@/lib/companies/seed"

/**
 * API route to seed the database
 * POST /api/seed
 * 
 * This will:
 * - Create company metadata
 * - Seed workers into company-scoped collections
 * - Create sample truck logs for testing
 */
export async function POST() {
  try {
    await seedAll()
    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    )
  }
}

