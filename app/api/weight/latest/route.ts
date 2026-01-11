import { NextRequest, NextResponse } from "next/server";
import { getWeightCollection } from "@/lib/db/weight";
import { getActiveCompany } from "@/lib/auth/session";

/**
 * Get the latest weight for a specific siteId
 * Query param: ?siteId=your-site-id
 * Filters by companyId from session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId query parameter is required" },
        { status: 400 }
      );
    }

    // Get current user's company ID from session (filter by company)
    let companyId: string | null = null;
    try {
      companyId = await getActiveCompany();
    } catch (error) {
      // User not authenticated or session expired
      return NextResponse.json({
        siteId,
        weight: null,
        message: "Authentication required",
      });
    }

    const collection = await getWeightCollection();
    
    // Get the latest weight for this siteId, filtered by companyId
    const latest = await collection.findOne(
      { siteId, companyId, isLatest: true },
      { sort: { receivedAt: -1 } }
    );

    if (!latest) {
      return NextResponse.json({
        siteId,
        weight: null,
        message: "No weight data found for this siteId",
      });
    }

    return NextResponse.json({
      siteId: latest.siteId,
      weight: latest.weight,
      unit: latest.unit,
      raw: latest.raw,
      ts: latest.ts,
      deviceIp: latest.deviceIp,
      devicePort: latest.devicePort,
      receivedAt: latest.receivedAt,
    });
  } catch (error) {
    console.error("Error fetching latest weight:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

