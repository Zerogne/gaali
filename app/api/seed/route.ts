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
 * 
 * NOTE: This endpoint should be protected in production
 * For now, it's open for development purposes
 */
export async function POST() {
  try {
    console.log("Starting database seed...")
    await seedAll()
    console.log("Database seeded successfully")
    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully",
      note: "All companies use password: password123"
    })
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

