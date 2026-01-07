/**
 * Script to seed MongoDB with mock data
 * 
 * Usage:
 *   npx tsx scripts/seed-db.ts
 * 
 * Or with ts-node:
 *   ts-node scripts/seed-db.ts
 */

import { seedAll } from "../lib/companies/seed"

async function main() {
  console.log("🌱 Starting database seeding...")
  console.log("Make sure MONGODB_URI is set in your environment variables\n")

  try {
    await seedAll()
    console.log("\n✅ Database seeding completed successfully!")
    console.log("\nYou can now:")
    console.log("  - Login with any company")
    console.log("  - Use password: password123 for all workers")
    console.log("  - Test multi-tenant isolation")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error seeding database:", error)
    process.exit(1)
  }
}

main()

