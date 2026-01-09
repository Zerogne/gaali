/**
 * Script to add default camera WebSocket settings to all existing companies
 * 
 * Usage:
 *   npx tsx scripts/add-camera-settings-to-companies.ts
 * 
 * Or with custom settings:
 *   CAMERA1_IP=192.168.1.50 CAMERA1_WS_PORT=8557 CAMERA2_IP=192.168.1.49 CAMERA2_WS_PORT=8557 npx tsx scripts/add-camera-settings-to-companies.ts
 * 
 * Note: Make sure MONGODB_URI environment variable is set
 */

import { getCompaniesCollection } from "../lib/db/companyDb"

interface CameraSettings {
  camera1Ip?: string
  camera1HttpPort?: number
  camera1RtspPort?: number
  camera1WebSocketPort?: number
  camera1Username?: string
  camera1Password?: string
  camera2Ip?: string
  camera2HttpPort?: number
  camera2RtspPort?: number
  camera2WebSocketPort?: number
  camera2Username?: string
  camera2Password?: string
}

async function addCameraSettingsToCompanies() {
  try {
    console.log("🔍 Finding all companies...")
    const companiesCollection = await getCompaniesCollection()
    const companies = await companiesCollection.find({}).toArray()

    console.log(`📊 Found ${companies.length} companies`)

    // Default camera settings (can be overridden by environment variables)
    const defaultSettings: CameraSettings = {
      camera1Ip: process.env.CAMERA1_IP || "192.168.1.50",
      camera1HttpPort: Number(process.env.CAMERA1_HTTP_PORT) || 443,
      camera1RtspPort: Number(process.env.CAMERA1_RTSP_PORT) || 8557,
      camera1WebSocketPort: Number(process.env.CAMERA1_WS_PORT) || 8557,
      camera1Username: process.env.CAMERA1_USERNAME || "admin",
      camera1Password: process.env.CAMERA1_PASSWORD || "admin",
      camera2Ip: process.env.CAMERA2_IP || "192.168.1.49",
      camera2HttpPort: Number(process.env.CAMERA2_HTTP_PORT) || 443,
      camera2RtspPort: Number(process.env.CAMERA2_RTSP_PORT) || 8557,
      camera2WebSocketPort: Number(process.env.CAMERA2_WS_PORT) || 8557,
      camera2Username: process.env.CAMERA2_USERNAME || "admin",
      camera2Password: process.env.CAMERA2_PASSWORD || "admin",
    }

    console.log("📹 Default camera settings:", defaultSettings)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const company of companies) {
      const companyId = (company as any).companyId
      if (!companyId) {
        console.warn(`⚠️  Skipping company without companyId:`, company)
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
          console.log(`⚠️  Company ${companyId} not updated (may not exist)`)
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
    console.error("❌ Error in script:", error)
    process.exit(1)
  }
}

// Run the script
addCameraSettingsToCompanies()
  .then(() => {
    console.log("\n✅ Script completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Script failed:", error)
    process.exit(1)
  })
