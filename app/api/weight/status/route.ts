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

    // Never query without a valid companyId (prevents cross-company data leak)
    if (!companyId || typeof companyId !== "string" || companyId.trim() === "") {
      return NextResponse.json({
        connected: false,
        siteId: siteId || "all",
        allSites: [],
        totalRecords: 0,
        recentActivity: { count: 0, timeWindow: "last 5 minutes" },
        latestWeight: null,
        message: "❌ No data: Invalid company context",
      });
    }

    const collection = await getWeightCollection();

    // Build query - filter by companyId and optionally siteId
    const query: Record<string, unknown> = { companyId };
    if (siteId) {
      query.siteId = siteId;
    }

    // Log so you can verify each request is scoped to the correct company
    console.log("[Weight Status] Request scoped to companyId:", companyId);

    // Get the most recent weight record(s) for this company only
    const recent = await collection
      .find(query)
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    // Defensive: only expose weight if document's companyId matches session (no cross-company leak)
    const doc = recent.length > 0 ? recent[0] : null;
    const safeLatestWeight =
      doc && (doc as any).companyId === companyId
        ? { siteId: doc.siteId, weight: doc.weight, unit: doc.unit, receivedAt: doc.receivedAt }
        : null;
    if (doc && (doc as any).companyId !== companyId) {
      console.warn(
        `[Weight Status] Discarded document companyId ${(doc as any).companyId} (session: ${companyId})`
      );
    }

    // Get count of total records
    const totalCount = await collection.countDocuments(query);

    // Get count of records in last 5 minutes (to check if actively receiving)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentCount = await collection.countDocuments({
      ...query,
      receivedAt: { $gte: fiveMinutesAgo },
    });

    // Get all unique siteIds for this company only (if no specific siteId requested)
    let allSites: string[] = [];
    if (!siteId) {
      const sites = await collection.distinct("siteId", query);
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
      latestWeight: safeLatestWeight,
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

