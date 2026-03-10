import { NextResponse } from "next/server";
import { getActiveCompany } from "@/lib/auth/session";
import { getCompanyCollection } from "@/lib/db/companyDb";
import type { TruckSession } from "@/lib/truckSessions";

/**
 * GET /api/reports/summary
 * Uses truck_sessions collection to compute total IN/OUT weights for the report page.
 *
 * Query params:
 * - dateFrom (YYYY-MM-DD, inclusive)
 * - dateTo   (YYYY-MM-DD, inclusive, end of day)
 */
export async function GET(request: Request) {
  try {
    let companyId: string;
    try {
      companyId = await getActiveCompany();
    } catch {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const sessionsCollection = await getCompanyCollection<TruckSession>(
      companyId,
      "truck_sessions"
    );

    const query: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) {
        createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        createdAt.$lte = to;
      }
      query.createdAt = createdAt;
    }

    const sessions = await sessionsCollection
      .find(query, { projection: { direction: 1, grossWeightKg: 1 } })
      .toArray();

    let totalWeightIn = 0;
    let totalWeightOut = 0;

    for (const s of sessions) {
      const w = typeof s.grossWeightKg === "number" && !isNaN(s.grossWeightKg)
        ? s.grossWeightKg
        : 0;
      if (s.direction === "IN") {
        totalWeightIn += w;
      } else if (s.direction === "OUT") {
        totalWeightOut += w;
      }
    }

    return NextResponse.json(
      {
        totalWeightIn,
        totalWeightOut,
        totalSessions: sessions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting report summary from truck_sessions:", error);
    return NextResponse.json(
      {
        error: "Failed to compute report summary from sessions",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

