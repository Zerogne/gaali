import { NextResponse } from "next/server"
import { migrateDefaultProductsToDatabase } from "@/lib/products/migrate"
import { errorToResponse } from "@/lib/errors"

/**
 * POST /api/products/migrate - Migrate default products to database
 * This should be called once per company to initialize default products
 */
export async function POST() {
  try {
    await migrateDefaultProductsToDatabase()
    return NextResponse.json({ success: true, message: "Default products migrated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error migrating products:", error)
    const errorResponse = errorToResponse(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
