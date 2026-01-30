/**
 * Re-add camera IPs for company 108oil so weight auto-pull (and LPR) can map
 * incoming cameraIp to companyId.
 *
 * Run from gaali: npx tsx scripts/set-108oil-camera-ips.ts
 *
 * Uses companies collection in admin DB (MONGODB_ADMIN_DB_NAME or gaali-admin).
 */

import { config } from "dotenv"
import { resolve } from "path"
import { MongoClient } from "mongodb"

config({ path: resolve(process.cwd(), ".env") })

const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_DB = process.env.MONGODB_ADMIN_DB_NAME || "gaali-admin"

const CAMERA_1_IP = "192.168.1.50"
const CAMERA_2_IP = "192.168.1.49"

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set. Add it to .env")
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(ADMIN_DB)
    const companies = db.collection("companies")

    // Find 108oil by companyId (exact or case-insensitive)
    const company = await companies.findOne({
      $or: [
        { companyId: "108oil" },
        { companyId: /^108oil$/i },
        { name: /108oil/i },
      ],
    })

    if (!company) {
      console.error("Company 108oil not found in DB.")
      const all = await companies.find({}).project({ companyId: 1, name: 1, _id: 0 }).toArray()
      console.log("Existing companies:", all.map((c: any) => `${c.companyId} | ${c.name}`).join(", "))
      process.exit(1)
    }

    const companyId = (company as any).companyId
    const result = await companies.updateOne(
      { companyId },
      {
        $set: {
          "cameraSettings.camera1Ip": CAMERA_1_IP,
          "cameraSettings.camera2Ip": CAMERA_2_IP,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      console.error("Update matched no document.")
      process.exit(1)
    }
    console.log(`✅ 108oil camera IPs set: camera1=${CAMERA_1_IP}, camera2=${CAMERA_2_IP}`)
    if (result.modifiedCount > 0) {
      console.log("   Document updated.")
    } else {
      console.log("   Document already had these values (no change).")
    }
  } finally {
    await client.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
