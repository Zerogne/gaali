/**
 * Find company matching "108oil" in the database.
 * Run from project root: npx tsx scripts/find-company-108oil.ts
 *
 * Note: Passwords are stored as bcrypt hashes and cannot be retrieved as plaintext.
 * Use the reset-passwords API or admin change-password to set a known password.
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load .env before any DB client import (client reads MONGODB_URI at load time)
config({ path: resolve(process.cwd(), ".env") })

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set. Add it to .env")
    process.exit(1)
  }

  const { getCompaniesCollection } = await import("../lib/db/companyDb")
  const companies = await getCompaniesCollection()

  // Match companyId or name containing 108 or 108oil (case insensitive)
  const cursor = companies.find({
    $or: [
      { companyId: /108oil/i },
      { companyId: /108/i },
      { name: /108oil/i },
      { name: /108/i },
    ],
  })

  const matches = await cursor.toArray()

  if (matches.length === 0) {
    console.log("No company matching '108' or '108oil' found in DB.")
    console.log("\nAll companies in DB:")
    const all = await companies.find({}).project({ companyId: 1, name: 1, _id: 0 }).toArray()
    all.forEach((c: { companyId?: string; name?: string }) =>
      console.log(`  - ${c.companyId} | ${c.name}`)
    )
    return
  }

  console.log(`Found ${matches.length} company(ies):\n`)
  for (const c of matches) {
    const doc = c as { companyId?: string; name?: string; password?: string }
    console.log("  companyId:", doc.companyId)
    console.log("  name:     ", doc.name)
    console.log("  hasPassword:", !!doc.password)
    console.log("")
  }
  console.log(
    "Passwords are stored as bcrypt hashes and cannot be read back.\n" +
      "To use a known password: POST /api/reset-passwords (sets all to 'password123') or use admin change-password."
  )
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
