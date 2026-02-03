/**
 * Check uniqueCodePrefix for all companies
 * Usage: npx tsx scripts/check-unique-prefixes.ts
 */

import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

async function main() {
  const { getCompaniesCollection } = await import("../lib/db/companyDb")
  const col = await getCompaniesCollection()
  const companies = await col
    .find({})
    .project({ companyId: 1, name: 1, uniqueCodePrefix: 1, companyCode: 1 })
    .sort({ companyId: 1 })
    .toArray()

  console.log("Companies and unique code settings:\n")
  for (const c of companies as any[]) {
    const prefix = c.uniqueCodePrefix ?? "(not set, defaults to 3)"
    const code = c.companyCode ?? "(not set)"
    console.log(`  ${c.companyId}`)
    console.log(`    name: ${c.name}`)
    console.log(`    uniqueCodePrefix: ${prefix}`)
    console.log(`    companyCode: ${code}`)
    console.log("")
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
