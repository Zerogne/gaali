import { NextResponse } from "next/server"
import { getActiveCompany } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getDatabase } from "@/lib/db/client"

/**
 * GET /api/products/diagnose - Returns diagnostic info for products (session, DB, collection, count).
 * Call from browser while logged in to see what the products page sees.
 */
export async function GET() {
  const diag: Record<string, unknown> = {
    ok: false,
    step: "start",
    dbName: process.env.MONGODB_DB_NAME || "truck-weighing-dashboard",
  }

  try {
    // 1. Session / company
    let companyId: string
    try {
      companyId = await getActiveCompany()
    } catch (e: unknown) {
      const err = e as { digest?: string; message?: string }
      diag.step = "getActiveCompany"
      diag.error = "No session or redirect"
      diag.detail = err.digest === "NEXT_REDIRECT" ? "redirect to login" : String(err.message)
      return NextResponse.json(diag, { status: 401 })
    }

    diag.companyId = companyId
    diag.step = "company_ok"

    // 2. Collection
    const productsCollection = await getCompanyCollection(companyId, "products")
    const db = await getDatabase()
    diag.dbName = db.databaseName
    diag.collectionName = `company_${companyId}_products`
    diag.step = "collection_ok"

    // 3. Count and sample
    const all = await productsCollection.find({}).sort({ isCustom: 1, label: 1 }).toArray()
    const count = all.length
    const sample = all.slice(0, 5).map((p: { _id?: unknown; id?: string; label?: string; isCustom?: boolean }) => ({
      id: p.id,
      label: p.label,
      isCustom: p.isCustom,
    }))

    diag.ok = true
    diag.step = "done"
    diag.count = count
    diag.sample = sample
    diag.products = all.map((p: { _id?: unknown; id?: string; value?: string; label?: string; isCustom?: boolean }) => ({
      id: p.id,
      value: p.value,
      label: p.label,
      isCustom: p.isCustom,
    }))

    return NextResponse.json(diag, { status: 200 })
  } catch (error) {
    diag.step = "error"
    diag.error = error instanceof Error ? error.message : String(error)
    return NextResponse.json(diag, { status: 500 })
  }
}
