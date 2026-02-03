import { NextResponse } from "next/server"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import { errorToResponse } from "@/lib/errors"
import type { TruckSession } from "@/lib/truckSessions"

/**
 * GET /api/truck-sessions/generate-code - Generate a unique code for a new session
 * This is used for preview/printing before the session is saved
 */
export async function GET(request: Request) {
  try {
    const companyId = await getActiveCompany()
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    )

    // Generate unique code using the same logic as saveTruckSession
    const { getCompany } = await import("@/lib/companies/metadata")
    let companyCode = "1001"
    let uniqueCodePrefix = "3" // 108oil stays as 3, others use 4,5,6 from DB
    try {
      const company = await getCompany(companyId)
      if (company?.companyCode) companyCode = company.companyCode
      else console.warn(`⚠️ Company code not set for ${companyId}, using default: 1001`)
      if (company?.uniqueCodePrefix && /^[3-9]$/.test(company.uniqueCodePrefix)) {
        uniqueCodePrefix = company.uniqueCodePrefix
      }
    } catch (error) {
      console.warn(`⚠️ Could not fetch company metadata for ${companyId}, using defaults`, error)
    }
    
    if (companyCode.length !== 4 || !/^\d{4}$/.test(companyCode)) {
      console.warn(`⚠️ Invalid company code format: ${companyCode}, using default: 1001`)
      companyCode = "1001"
    }
    
    const companyPrefix = `${uniqueCodePrefix}1`
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "") // YYYYMMDD (8 digits)
    
    // Find the highest sequential number for today
    // Format: 31 + 1001 + YYYYMMDD + XXXXX
    const todayPrefix = `${companyPrefix}${companyCode}${dateStr}`
    const todaySessions = await sessionsCollection
      .find({
        uniqueCode: { $regex: `^${todayPrefix}` }
      })
      .sort({ uniqueCode: -1 })
      .limit(1)
      .toArray()
    
    let seqNum = 1
    if (todaySessions.length > 0 && todaySessions[0].uniqueCode) {
      // Extract sequential number from existing code
      const existingCode = todaySessions[0].uniqueCode
      const existingSeqStr = existingCode.slice(todayPrefix.length) // Get last 5 digits
      const existingSeq = parseInt(existingSeqStr, 10)
      if (!isNaN(existingSeq)) {
        seqNum = existingSeq + 1
      }
    }
    
    // Format: 31 + 1001 + YYYYMMDD + 00009 (5 digits) = 19 digits total
    const seqNumStr = seqNum.toString().padStart(5, '0')
    const uniqueCode = `${companyPrefix}${companyCode}${dateStr}${seqNumStr}`
    
    console.log("✅ Generated unique code for preview:", uniqueCode)
    
    return NextResponse.json({ uniqueCode }, { status: 200 })
  } catch (error) {
    console.error("Error generating unique code:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

