import { NextRequest, NextResponse } from "next/server";
import { getWeightCollection } from "@/lib/db/weight";
import { getActiveCompany } from "@/lib/auth/session";

/**
 * Check connection status and recent activity
 * Query param: ?siteId=your-site-id (optional - if not provided, shows all sites)
 * Filters by companyId from session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");

    // Get current user's company ID from session (filter by company)
    let companyId: string | null = null;
    try {
      companyId = await getActiveCompany();
    } catch (error) {
      // User not authenticated or session expired
      // Return empty data (frontend will handle this)
      return NextResponse.json({
        connected: false,
        siteId: siteId || "all",
        allSites: [],
        totalRecords: 0,
        recentActivity: { count: 0, timeWindow: "last 5 minutes" },
        latestWeight: null,
        message: "❌ No data: Authentication required",
      });
    }

    const collection = await getWeightCollection();
    
    // Build query - filter by companyId and optionally siteId
    const query: any = { companyId }; // Always filter by company
    if (siteId) {
      query.siteId = siteId;
    }

    // Get the most recent weight record(s)
    const recent = await collection
      .find(query)
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    // Get count of total records
    const totalCount = await collection.countDocuments(query);

    // Get count of records in last 5 minutes (to check if actively receiving)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentCount = await collection.countDocuments({
      ...query,
      receivedAt: { $gte: fiveMinutesAgo },
    });

    // Get all unique siteIds (if no specific siteId requested)
    let allSites: string[] = [];
    if (!siteId) {
      const sites = await collection.distinct("siteId");
      allSites = sites as string[];
    }

    const status = {
      connected: recentCount > 0,
      siteId: siteId || "all",
      allSites: allSites,
      totalRecords: totalCount,
      recentActivity: {
        count: recentCount,
        timeWindow: "last 5 minutes",
      },
      latestWeight: recent.length > 0 ? {
        siteId: recent[0].siteId,
        weight: recent[0].weight,
        unit: recent[0].unit,
        receivedAt: recent[0].receivedAt,
      } : null,
      message: recentCount > 0
        ? `✅ Active: Received ${recentCount} weight record(s) in the last 5 minutes`
        : totalCount > 0
        ? `⚠️ Inactive: No recent data, but ${totalCount} total record(s) exist`
        : "❌ No data: No weight records found",
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error checking weight status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

