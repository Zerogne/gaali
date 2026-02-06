/**
 * Set 108oil company's companyCode to 311028 (6-digit customs org code per spec)
 *
 * Run: npx tsx scripts/set-108oil-company-code.ts
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

  const result = await companiesCollection.updateOne(
    {
      $or: [
        { companyId: /^108oil$/i },
        { name: /108oil/i },
      ],
    },
    { $set: { companyCode: "311028", updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) {
    console.error("Company 108oil not found in DB.")
    process.exit(1)
  }

  console.log("✅ 108oil companyCode set to 311028")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
