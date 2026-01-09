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
      { cameraSettings: 1 }
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

    // Validate camera settings structure
    const validSettings: any = {}
    
    // Camera 1 settings
    if (cameraSettings.camera1Ip !== undefined) {
      validSettings["cameraSettings.camera1Ip"] = String(cameraSettings.camera1Ip).trim()
    }
    if (cameraSettings.camera1HttpPort !== undefined) {
      validSettings["cameraSettings.camera1HttpPort"] = Number(cameraSettings.camera1HttpPort) || 443
    }
    if (cameraSettings.camera1RtspPort !== undefined) {
      validSettings["cameraSettings.camera1RtspPort"] = Number(cameraSettings.camera1RtspPort) || 8557
    }
    if (cameraSettings.camera1WebSocketPort !== undefined) {
      validSettings["cameraSettings.camera1WebSocketPort"] = Number(cameraSettings.camera1WebSocketPort) || 8557
    }
    if (cameraSettings.camera1Username !== undefined) {
      validSettings["cameraSettings.camera1Username"] = String(cameraSettings.camera1Username).trim()
    }
    if (cameraSettings.camera1Password !== undefined) {
      validSettings["cameraSettings.camera1Password"] = String(cameraSettings.camera1Password).trim()
    }

    // Camera 2 settings
    if (cameraSettings.camera2Ip !== undefined) {
      validSettings["cameraSettings.camera2Ip"] = String(cameraSettings.camera2Ip).trim()
    }
    if (cameraSettings.camera2HttpPort !== undefined) {
      validSettings["cameraSettings.camera2HttpPort"] = Number(cameraSettings.camera2HttpPort) || 443
    }
    if (cameraSettings.camera2RtspPort !== undefined) {
      validSettings["cameraSettings.camera2RtspPort"] = Number(cameraSettings.camera2RtspPort) || 8557
    }
    if (cameraSettings.camera2WebSocketPort !== undefined) {
      validSettings["cameraSettings.camera2WebSocketPort"] = Number(cameraSettings.camera2WebSocketPort) || 8557
    }
    if (cameraSettings.camera2Username !== undefined) {
      validSettings["cameraSettings.camera2Username"] = String(cameraSettings.camera2Username).trim()
    }
    if (cameraSettings.camera2Password !== undefined) {
      validSettings["cameraSettings.camera2Password"] = String(cameraSettings.camera2Password).trim()
    }

    // Add updatedAt
    validSettings["updatedAt"] = new Date()

    const result = await companiesCollection.updateOne(
      { companyId },
      { $set: validSettings }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Return updated camera settings
    const updatedCompany = await companiesCollection.findOne(
      { companyId },
      { cameraSettings: 1 }
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
