import { NextResponse } from "next/server"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import { errorToResponse } from "@/lib/errors"
import type { CompanyMetadata } from "@/lib/companies/metadata"

/**
 * GET /api/company/camera-settings - Get camera settings for current company
 */
export async function GET() {
  try {
    const companyId = await getActiveCompany()
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companiesCollection = await getCompaniesCollection()
    const company = await companiesCollection.findOne(
      { companyId },
      { projection: { cameraSettings: 1 } }
    )

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(
      { cameraSettings: (company as any).cameraSettings || null },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error getting camera settings:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * PUT /api/company/camera-settings - Update camera settings for current company
 */
export async function PUT(request: Request) {
  try {
    const companyId = await getActiveCompany()
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { cameraSettings } = body

    if (!cameraSettings || typeof cameraSettings !== "object") {
      return NextResponse.json(
        { error: "cameraSettings object is required" },
        { status: 400 }
      )
    }

    const companiesCollection = await getCompaniesCollection()

    // Validate camera settings structure - Only save IP addresses
    const validSettings: any = {}
    const unsetFields: any = {}
    
    // Camera 1 IP only
    if (cameraSettings.camera1Ip !== undefined) {
      const ip = String(cameraSettings.camera1Ip).trim()
      if (ip) {
        validSettings["cameraSettings.camera1Ip"] = ip
      } else {
        // If empty string, unset the field
        unsetFields["cameraSettings.camera1Ip"] = ""
      }
      // Always unset old fields (ports, username, password) - we only save IPs now
      unsetFields["cameraSettings.camera1HttpPort"] = ""
      unsetFields["cameraSettings.camera1RtspPort"] = ""
      unsetFields["cameraSettings.camera1WebSocketPort"] = ""
      unsetFields["cameraSettings.camera1Username"] = ""
      unsetFields["cameraSettings.camera1Password"] = ""
    }

    // Camera 2 IP only
    if (cameraSettings.camera2Ip !== undefined) {
      const ip = String(cameraSettings.camera2Ip).trim()
      if (ip) {
        validSettings["cameraSettings.camera2Ip"] = ip
      } else {
        // If empty string, unset the field
        unsetFields["cameraSettings.camera2Ip"] = ""
      }
      // Always unset old fields (ports, username, password) - we only save IPs now
      unsetFields["cameraSettings.camera2HttpPort"] = ""
      unsetFields["cameraSettings.camera2RtspPort"] = ""
      unsetFields["cameraSettings.camera2WebSocketPort"] = ""
      unsetFields["cameraSettings.camera2Username"] = ""
      unsetFields["cameraSettings.camera2Password"] = ""
    }

    // Add updatedAt
    validSettings["updatedAt"] = new Date()

    // Build update operation
    const updateOp: any = { $set: validSettings }
    if (Object.keys(unsetFields).length > 0) {
      updateOp.$unset = unsetFields
    }

    const result = await companiesCollection.updateOne(
      { companyId },
      updateOp
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Return updated camera settings
    const updatedCompany = await companiesCollection.findOne(
      { companyId },
      { projection: { cameraSettings: 1 } }
    )

    console.log(`✅ Updated camera settings for company: ${companyId}`, {
      cameraSettings: (updatedCompany as any)?.cameraSettings,
    })

    return NextResponse.json(
      {
        success: true,
        cameraSettings: (updatedCompany as any)?.cameraSettings || null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating camera settings:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
