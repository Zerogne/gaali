import { NextRequest, NextResponse } from "next/server";
import { getRfidCollection } from "@/lib/db/rfid";
import { getActiveCompany } from "@/lib/auth/session";

/**
 * Check RFID connection status and recent activity
 * Query param: ?siteId=your-site-id (optional - if not provided, shows all sites)
 * Filters by companyId from session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");

    // Filter by active company (same as weight/status)
    let companyId: string | null = null;
    try {
      companyId = await getActiveCompany();
    } catch {
      return NextResponse.json({
        connected: false,
        siteId: siteId || "all",
        allSites: [],
        totalRecords: 0,
        recentActivity: { count: 0, timeWindow: "last 5 minutes" },
        latestRfid: null,
        message: "❌ No data: Authentication required",
      });
    }

    const collection = await getRfidCollection();

    const query: any = { companyId };
    if (siteId) query.siteId = siteId;

    const recent = await collection.find(query).sort({ receivedAt: -1 }).limit(1).toArray();
    const totalCount = await collection.countDocuments(query);

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentCount = await collection.countDocuments({
      ...query,
      receivedAt: { $gte: fiveMinutesAgo },
    });

    let allSites: string[] = [];
    if (!siteId) {
      const sites = await collection.distinct("siteId", { companyId });
      allSites = sites as string[];
    }

    const status = {
      connected: recentCount > 0,
      siteId: siteId || "all",
      allSites,
      totalRecords: totalCount,
      recentActivity: {
        count: recentCount,
        timeWindow: "last 5 minutes",
      },
      latestRfid:
        recent.length > 0
          ? {
              siteId: recent[0].siteId,
              rfid: recent[0].rfid,
              receivedAt: recent[0].receivedAt,
            }
          : null,
      message:
        recentCount > 0
          ? `✅ Active: Received ${recentCount} RFID record(s) in the last 5 minutes`
          : totalCount > 0
            ? `⚠️ Inactive: No recent data, but ${totalCount} total record(s) exist`
            : "❌ No data: No RFID records found",
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error checking RFID status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

