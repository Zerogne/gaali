import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getDatabase } from "@/lib/db/client"

/**
 * GET /api/debug/collections - Debug endpoint to show all collections for the current company
 * This helps identify which collections exist and where data is being saved
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const companyId = session.companyId
    const db = await getDatabase()
    
    // Get all collections in the database
    const allCollections = await db.listCollections().toArray()
    
    // Filter collections that belong to this company
    const companyCollections = allCollections
      .filter(col => col.name.startsWith(`company_${companyId}_`))
      .map(col => col.name)
    
    // Get collection names and their document counts
    const collectionsWithCounts = await Promise.all(
      companyCollections.map(async (collectionName) => {
        const collection = db.collection(collectionName)
        const count = await collection.countDocuments()
        const sample = await collection.find({}).limit(3).toArray()
        
        return {
          name: collectionName,
          count,
          sample: sample.map((doc: any) => {
            const { _id, ...data } = doc
            return data
          }),
        }
      })
    )
    
    return NextResponse.json({
      companyId,
      collections: collectionsWithCounts,
      allCollectionNames: companyCollections,
      note: `All data for company "${companyId}" is saved in collections starting with "company_${companyId}_"`,
    }, { status: 200 })
  } catch (error) {
    console.error("Error getting collections:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

