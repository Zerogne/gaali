/**
 * Diagnose products in DB (no session). Run: npx tsx scripts/diagnose-products.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set")
    process.exit(1)
  }

  const { getDatabase } = await import("../lib/db/client")
  const db = await getDatabase()
  const dbName = db.databaseName

  console.log("=== Products diagnosis (DB only, no session) ===\n")
  console.log("DB name:", dbName)
  console.log("")

  const collections = await db.listCollections().toArray()
  const productCollections = collections.filter((c) => c.name.endsWith("_products"))

  console.log("Product collections:", productCollections.length)
  for (const { name } of productCollections) {
    const coll = db.collection(name)
    const count = await coll.countDocuments()
    const sample = await coll.find({}).limit(3).toArray()
    console.log(`  - ${name}: ${count} document(s)`)
    if (sample.length > 0) {
      sample.forEach((doc: { id?: string; label?: string }) =>
        console.log(`      sample: id=${doc.id} label=${doc.label}`)
      )
    }
  }

  console.log("\n=== Summary ===")
  console.log("GET /api/products uses getActiveCompany() from cookies, then reads company_<companyId>_products in this DB.")
  console.log("If you're logged in as 108oil, collection is company_108oil_products.")
  console.log("Open /api/products/diagnose in the browser while logged in to see session + products.")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
