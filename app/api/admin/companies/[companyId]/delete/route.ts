import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import { getDatabase } from "@/lib/db/client"

/**
 * DELETE /api/admin/companies/[companyId]/delete - Delete entire company and all its data
 * This will:
 * 1. Delete all company-scoped collections (company_{companyId}_*)
 * 2. Delete the company from the companies collection
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> | { companyId: string } }
) {
  try {
    await requireAdmin()

    // Handle both sync and async params (Next.js 13+ vs 15+)
    const resolvedParams = params instanceof Promise ? await params : params
    const companyId = resolvedParams.companyId

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      )
    }

    console.log(`🗑️ Starting deletion of company: ${companyId}`)

    // Get both databases
    const db = await getDatabase() // Main database where company collections are stored
    const companiesCollection = await getCompaniesCollection() // Admin database where company metadata is stored

    // Verify company exists
    const company = await companiesCollection.findOne({ companyId })
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    console.log(`🗑️ Company found: ${company.name}`)

    // Get all collections in the main database
    let allCollections: any[] = []
    try {
      allCollections = await db.listCollections().toArray()
      console.log(`🗑️ Found ${allCollections.length} total collections in main database`)
    } catch (error) {
      console.error("Error listing collections:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to list collections",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    }

    // Find all collections that belong to this company
    const companyCollections = allCollections.filter((col) =>
      col.name.startsWith(`company_${companyId}_`)
    )

    console.log(`🗑️ Found ${companyCollections.length} collections to delete for company ${companyId}`)

    // Delete all company-scoped collections
    const deletionResults = await Promise.all(
      companyCollections.map(async (col) => {
        try {
          const collection = db.collection(col.name)
          const count = await collection.countDocuments()
          
          // Drop the collection (this deletes all documents and the collection itself)
          await collection.drop()
          
          console.log(`✅ Deleted collection: ${col.name} (${count} documents)`)
          return { collection: col.name, count, success: true }
        } catch (error) {
          // If collection doesn't exist or already dropped, that's okay
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes("not found") || errorMessage.includes("ns not found")) {
            console.log(`ℹ️ Collection ${col.name} already deleted or doesn't exist`)
            return { collection: col.name, count: 0, success: true }
          }
          
          console.error(`❌ Error deleting collection ${col.name}:`, error)
          return {
            collection: col.name,
            count: 0,
            success: false,
            error: errorMessage,
          }
        }
      })
    )

    // Delete the company from companies collection
    const companyDeleteResult = await companiesCollection.deleteOne({ companyId })

    if (companyDeleteResult.deletedCount === 0) {
      console.warn(`⚠️ Company ${companyId} not found in companies collection`)
    } else {
      console.log(`✅ Deleted company ${companyId} from companies collection`)
    }

    const totalDeleted = deletionResults.reduce((sum, r) => sum + r.count, 0)
    const successful = deletionResults.filter((r) => r.success).length
    const failed = deletionResults.filter((r) => !r.success)

    return NextResponse.json({
      success: true,
      message: `Company ${companyId} and all its data have been deleted`,
      details: {
        companyId,
        collectionsDeleted: successful,
        collectionsFailed: failed.length,
        totalDocumentsDeleted: totalDeleted,
        failedCollections: failed.length > 0 ? failed : undefined,
      },
    })
  } catch (error) {
    console.error("Error deleting company:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete company",
        details: process.env.NODE_ENV === "development" && error instanceof Error
          ? { stack: error.stack, name: error.name }
          : undefined,
      },
      { status: 500 }
    )
  }
}
