import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

/**
 * POST /api/migrate-organizations - Migrate existing organizations to add type field
 * This will set all existing organizations to type "sender" by default
 * You can manually update them later if needed
 */
export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const companyId = session.companyId
    const orgsCollection = await getCompanyCollection(companyId, "organizations")
    
    // Find all organizations without a type field
    const orgsWithoutType = await orgsCollection.find({ type: { $exists: false } }).toArray()
    
    if (orgsWithoutType.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No organizations need migration. All organizations already have a type field.",
        migrated: 0,
      }, { status: 200 })
    }
    
    // Update all organizations without type to "sender" by default
    // You can manually change them to "receiver" if needed
    const result = await orgsCollection.updateMany(
      { type: { $exists: false } },
      { $set: { type: "sender" } }
    )
    
    return NextResponse.json({
      success: true,
      message: `Migrated ${result.modifiedCount} organizations. All were set to type "sender" by default.`,
      migrated: result.modifiedCount,
      note: "You can manually update organizations to 'receiver' type if needed.",
    }, { status: 200 })
  } catch (error) {
    console.error("Error migrating organizations:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

