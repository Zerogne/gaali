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
    const companyPrefix = "31"
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "") // YYYYMMDD
    
    // Find the highest sequential number for today
    const todayPrefix = `${companyPrefix}${dateStr}`
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
    
    // Format: 31 + YYYYMMDD + 00009 (5 digits) = 15 digits total
    const seqNumStr = seqNum.toString().padStart(5, '0')
    const uniqueCode = `${companyPrefix}${dateStr}${seqNumStr}`
    
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

