/**
 * Set uniqueCodePrefix for each company in DB.
 * 108oil (or company matching /108/i) gets "3", others get 4, 5, 6...
 *
 * Usage: npx tsx scripts/set-unique-code-prefixes.ts
 *
 * Ensure MONGODB_URI is set in .env
 */

import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set. Add it to .env")
    process.exit(1)
  }

  const { getCompaniesCollection } = await import("../lib/db/companyDb")
  const companiesCollection = await getCompaniesCollection()
  const companies = await companiesCollection.find({}).sort({ companyId: 1 }).toArray()

  if (companies.length === 0) {
    console.log("No companies found.")
    return
  }

  console.log(`Found ${companies.length} companies. Setting uniqueCodePrefix...\n`)

  let nextPrefix = 4 // 3 is reserved for 108oil
  let updated = 0

  for (const c of companies) {
    const companyId = (c as any).companyId
    const name = (c as any).name || ""

    // 108oil or company matching 108 gets prefix "3"
    const is108oil =
      /108oil|108/i.test(companyId) || /108oil|108/i.test(name)

    let prefix: string
    if (is108oil) {
      prefix = "3"
      console.log(`  ${companyId} (${name}) → uniqueCodePrefix: 3 (108oil)`)
    } else {
      prefix = String(nextPrefix)
      if (nextPrefix <= 9) nextPrefix++
      console.log(`  ${companyId} (${name}) → uniqueCodePrefix: ${prefix}`)
    }

    await companiesCollection.updateOne(
      { companyId },
      { $set: { uniqueCodePrefix: prefix, updatedAt: new Date() } }
    )
    updated++
  }

  console.log(`\n✅ Updated ${updated} companies.`)
  console.log("Unique codes will now start with: 31 (108oil), 41, 51, 61...")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
