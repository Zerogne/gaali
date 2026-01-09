/**
 * Script to add camera WebSocket settings to all companies
 * Direct MongoDB connection (doesn't use app's connection utilities)
 * 
 * Usage: MONGODB_URI="your-uri" npx tsx scripts/add-camera-settings-direct.ts
 */

import { MongoClient } from "mongodb"
import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env file manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env")
    const envContent = readFileSync(envPath, "utf8")
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const match = trimmed.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          const value = match[2].trim().replace(/^["']|["']$/g, "")
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      }
    })
  } catch (error) {
    // .env file doesn't exist, use environment variables
  }
}

loadEnv()

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB_NAME || "truck-weighing-dashboard"

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI environment variable is not set")
  console.error("   Set it in .env file or as environment variable")
  process.exit(1)
}

// Default camera settings
const defaultSettings = {
  camera1Ip: "192.168.1.50",
  camera1HttpPort: 443,
  camera1RtspPort: 8557,
  camera1WebSocketPort: 8557,  // Real-time video WebSocket port
  camera1Username: "admin",
  camera1Password: "admin",
  camera2Ip: "192.168.1.49",
  camera2HttpPort: 443,
  camera2RtspPort: 8557,
  camera2WebSocketPort: 8557,  // Real-time video WebSocket port
  camera2Username: "admin",
  camera2Password: "admin",
}

async function addCameraSettings() {
  let client: MongoClient | null = null

  try {
    console.log("🔌 Connecting to MongoDB...")
    client = new MongoClient(MONGODB_URI as string)
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(MONGODB_DB)
    const companiesCollection = db.collection("companies")

    console.log("🔍 Finding all companies...")
    const companies = await companiesCollection.find({}).toArray()

    console.log(`📊 Found ${companies.length} companies`)
    console.log("📹 Default camera settings:", defaultSettings)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const company of companies) {
      const companyId = (company as any).companyId
      if (!companyId) {
        console.warn(`⚠️  Skipping company without companyId:`, (company as any)._id)
        skipped++
        continue
      }

      // Check if cameraSettings already exists
      if ((company as any).cameraSettings) {
        console.log(`⏭️  Company ${companyId} already has cameraSettings, skipping...`)
        skipped++
        continue
      }

      try {
        const result = await companiesCollection.updateOne(
          { companyId },
          {
            $set: {
              cameraSettings: defaultSettings,
              updatedAt: new Date(),
            },
          }
        )

        if (result.modifiedCount > 0) {
          console.log(`✅ Added camera settings to company: ${companyId}`)
          updated++
        } else {
          console.log(`⚠️  Company ${companyId} not updated`)
          errors++
        }
      } catch (error) {
        console.error(`❌ Error updating company ${companyId}:`, error)
        errors++
      }
    }

    console.log("\n📊 Summary:")
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📝 Total: ${companies.length}`)

    if (updated > 0) {
      console.log("\n✅ Successfully added camera settings to companies!")
    } else {
      console.log("\n⚠️  No companies were updated. They may already have camera settings.")
    }
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Disconnected from MongoDB")
    }
  }
}

// Run the script
addCameraSettings()
  .then(() => {
    console.log("\n✅ Script completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Script failed:", error)
    process.exit(1)
  })
