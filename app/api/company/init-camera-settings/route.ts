import { NextResponse } from "next/server"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * POST /api/company/init-camera-settings - Initialize camera settings for all companies
 * This is a one-time setup endpoint
 */
export async function POST(request: Request) {
  try {
    // Optional: Require authentication (uncomment if needed)
    // const companyId = await getActiveCompany()
    // if (!companyId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json().catch(() => ({}))
    
    // Default camera settings (can be overridden in request body)
    const defaultSettings = {
      camera1Ip: body.camera1Ip || "192.168.1.50",
      camera1HttpPort: body.camera1HttpPort || 443,
      camera1RtspPort: body.camera1RtspPort || 8557,
      camera1WebSocketPort: body.camera1WebSocketPort || 8557,
      camera1Username: body.camera1Username || "admin",
      camera1Password: body.camera1Password || "admin",
      camera2Ip: body.camera2Ip || "192.168.1.49",
      camera2HttpPort: body.camera2HttpPort || 443,
      camera2RtspPort: body.camera2RtspPort || 8557,
      camera2WebSocketPort: body.camera2WebSocketPort || 8557,
      camera2Username: body.camera2Username || "admin",
      camera2Password: body.camera2Password || "admin",
    }

    console.log("🔍 Finding all companies...")
    const companiesCollection = await getCompaniesCollection()
    const companies = await companiesCollection.find({}).toArray()

    console.log(`📊 Found ${companies.length} companies`)

    let updated = 0
    let skipped = 0
    let errors = 0
    const results: string[] = []

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
        results.push(`⏭️  ${companyId}: Already has settings`)
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
          results.push(`✅ ${companyId}: Settings added`)
        } else {
          console.log(`⚠️  Company ${companyId} not updated`)
          errors++
          results.push(`⚠️  ${companyId}: Not updated`)
        }
      } catch (error) {
        console.error(`❌ Error updating company ${companyId}:`, error)
        errors++
        results.push(`❌ ${companyId}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const summary = {
      total: companies.length,
      updated,
      skipped,
      errors,
      results,
    }

    console.log("\n📊 Summary:", summary)

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${updated} companies, skipped ${skipped}, errors ${errors}`,
        summary,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error initializing camera settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
