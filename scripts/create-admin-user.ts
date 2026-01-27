// Load environment variables FIRST before any imports
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first (higher priority), then .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

const ADMIN_EMAIL = "scalersys@gmail.com"
const ADMIN_PASSWORD = "scaler67@"

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set.')
    console.error('\nTo run against PRODUCTION MongoDB:')
    console.error('  MONGODB_URI="your-prod-mongodb-uri" MONGODB_ADMIN_DB_NAME="gaali-admin" npx tsx scripts/create-admin-user.ts')
    console.error('\nTo run against LOCAL MongoDB:')
    console.error('  Add MONGODB_URI to .env.local and run: npx tsx scripts/create-admin-user.ts')
    process.exit(1)
  }

  const adminDbName = process.env.MONGODB_ADMIN_DB_NAME || "gaali-admin"
  const mongoUriPreview = process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") // Hide credentials
  
  console.log("🔧 Configuration:")
  console.log(`   MongoDB URI: ${mongoUriPreview}`)
  console.log(`   Admin DB: ${adminDbName}`)
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log("")

  try {
    const bcrypt = await import("bcryptjs")
    const { ensureAdminUsersIndexes, getAdminUsersCollection } = await import("@/lib/db/companyDb")

    const emailNormalized = ADMIN_EMAIL.toLowerCase().trim()
    const passwordHash = await bcrypt.default.hash(ADMIN_PASSWORD, 10)

    await ensureAdminUsersIndexes()
    const adminUsers = await getAdminUsersCollection()

    const now = new Date()
    const result = await adminUsers.updateOne(
      { emailNormalized },
      {
        $set: {
          email: ADMIN_EMAIL,
          emailNormalized,
          passwordHash,
          role: "admin",
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    )

    console.log("✅ Admin user upserted into MongoDB admin database")
    console.log(`   email: ${ADMIN_EMAIL}`)
    console.log(`   password: ${ADMIN_PASSWORD}`)
    console.log(`   database: ${adminDbName}`)
    console.log(`   collection: admin_users`)
    console.log(`   operation: ${result.upsertedCount > 0 ? "created" : "updated"}`)
  } catch (error) {
    console.error("❌ Failed to create admin user:", error)
    if (error instanceof Error) {
      console.error("   Error message:", error.message)
    }
    process.exit(1)
  }
}

main()
