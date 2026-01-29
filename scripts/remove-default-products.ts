/**
 * Remove old hardcoded default products from all companies' product collections.
 * Run from project root: npx tsx scripts/remove-default-products.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

// Old default product ids that were previously seeded
const OLD_DEFAULT_IDS = [
  "default-industrial",
  "default-food",
  "default-textiles",
  "default-electronics",
  "default-construction",
  "default-machinery",
  "default-chemicals",
  "default-other",
]

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set in .env")
    process.exit(1)
  }

  const { getDatabase } = await import("../lib/db/client")
  const db = await getDatabase()
  const collections = await db.listCollections().toArray()
  const productCollections = collections.filter((c) => c.name.endsWith("_products"))

  console.log(`Found ${productCollections.length} company product collection(s).\n`)

  let totalDeleted = 0
  for (const { name } of productCollections) {
    const coll = db.collection(name)
    const result = await coll.deleteMany({ id: { $in: OLD_DEFAULT_IDS } })
    if (result.deletedCount > 0) {
      console.log(`${name}: removed ${result.deletedCount} default product(s)`)
      totalDeleted += result.deletedCount
    }
  }

  console.log(`\nDone. Total default products removed: ${totalDeleted}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
