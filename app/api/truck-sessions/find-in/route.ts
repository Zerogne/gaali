import { NextResponse } from "next/server"
import { findLatestInSession } from "@/lib/truckSessions"
import { errorToResponse } from "@/lib/errors"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import type { TruckLog } from "@/lib/types"

/**
 * GET /api/truck-sessions/find-in?plateNumber=XXX - Find latest IN session for a plate number
 * Returns both session data and log data (which has all the fields)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const plateNumber = searchParams.get("plateNumber")

    console.log("🔍 find-in API: Received plate number:", plateNumber);

    if (!plateNumber) {
      return NextResponse.json({ error: "Plate number is required" }, { status: 400 })
    }

    const normalizedPlate = plateNumber.trim().toUpperCase();
    console.log("🔍 find-in API: Normalized plate number:", normalizedPlate);

    const inSession = await findLatestInSession(plateNumber)
    console.log("🔍 find-in API: Found session:", inSession ? "Yes" : "No");
    if (inSession) {
      console.log("🔍 find-in API: Session ID:", inSession.id);
      console.log("🔍 find-in API: Session plate:", inSession.plateNumber);
      console.log("🔍 find-in API: Session weight:", inSession.grossWeightKg);
      console.log("🔍 find-in API: Session created at:", inSession.createdAt);
      console.log("🔍 find-in API: Session unique code:", inSession.uniqueCode);
      
      // Verify this is the latest session by checking if there are newer ones
      try {
        const companyId = await getActiveCompany();
        const sessionsCollection = await getCompanyCollection(companyId, "truck_sessions");
        const newerSessions = await sessionsCollection.find({
          direction: "IN",
          plateNumber: normalizedPlate,
          createdAt: { $gt: inSession.createdAt instanceof Date ? inSession.createdAt : new Date(inSession.createdAt) }
        }).limit(1).toArray();
        
        if (newerSessions.length > 0) {
          console.warn("⚠️ find-in API: Found newer IN session! This should not happen.");
          console.warn("⚠️ find-in API: Newer session:", newerSessions[0].id, newerSessions[0].createdAt);
        } else {
          console.log("✅ find-in API: Confirmed - this is the latest IN session for this plate");
        }
      } catch (verifyError) {
        console.error("Error verifying latest session:", verifyError);
      }
    }

    if (!inSession) {
      // Let's also check what sessions exist for debugging
      try {
        const companyId = await getActiveCompany();
        const sessionsCollection = await getCompanyCollection(companyId, "truck_sessions");
        const allSessions = await sessionsCollection.find({ direction: "IN" }).limit(5).toArray();
        console.log("🔍 find-in API: Sample IN sessions in DB:", allSessions.map(s => ({ 
          plate: s.plateNumber, 
          weight: s.grossWeightKg,
          createdAt: s.createdAt 
        })));
      } catch (debugError) {
        console.error("Error debugging sessions:", debugError);
      }
      
      return NextResponse.json({ error: "No IN session found for this plate number" }, { status: 404 })
    }

    // Also fetch the corresponding log entry which has all the fields
    // Try to match by session unique code or plate + date, prioritizing the latest
    let inLog: TruckLog | null = null
    try {
      const companyId = await getActiveCompany()
      const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")
      
      // First, try to find log entry that matches the session's creation date (most accurate)
      const sessionDate = inSession.createdAt instanceof Date 
        ? inSession.createdAt 
        : new Date(inSession.createdAt);
      
      // Find log entries for this plate, sorted by creation date (latest first)
      const logEntries = await logsCollection
        .find({
          direction: "IN",
          plate: normalizedPlate,
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
      
      console.log("🔍 find-in API: Found", logEntries.length, "log entries for this plate");
      
      // Try to find the log entry that matches the session date (within 1 minute tolerance)
      if (logEntries.length > 0) {
        // Find log entry closest to session creation time
        const sessionTime = sessionDate.getTime();
        let closestLog = logEntries[0];
        let minTimeDiff = Math.abs(
          (closestLog.createdAt instanceof Date 
            ? closestLog.createdAt.getTime() 
            : new Date(closestLog.createdAt).getTime()) - sessionTime
        );
        
        for (const log of logEntries) {
          const logTime = log.createdAt instanceof Date 
            ? log.createdAt.getTime() 
            : new Date(log.createdAt).getTime();
          const timeDiff = Math.abs(logTime - sessionTime);
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestLog = log;
          }
        }
        
        // Use the closest log entry (within 5 minutes tolerance)
        if (minTimeDiff < 5 * 60 * 1000) {
          inLog = closestLog;
          console.log("✅ find-in API: Matched log entry to session (time diff:", Math.round(minTimeDiff / 1000), "seconds)");
        } else {
          // Fallback to latest log entry
          inLog = logEntries[0];
          console.log("⚠️ find-in API: Using latest log entry (time diff:", Math.round(minTimeDiff / 1000), "seconds)");
        }
      }
      
      // Serialize if found
      if (inLog) {
        const { _id, ...logData } = inLog as any
        inLog = logData as TruckLog
        console.log("✅ find-in API: Log entry created at:", inLog.createdAt);
      } else {
        console.log("⚠️ find-in API: No log entry found for this session");
      }
    } catch (logError) {
      console.error("Error fetching log entry:", logError)
      // Don't fail if log fetch fails - session data is still useful
    }

    return NextResponse.json({ 
      success: true, 
      session: inSession,
      log: inLog // Include log data with all fields
    }, { status: 200 })
  } catch (error) {
    console.error("Error finding IN session:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
