import { NextRequest, NextResponse } from "next/server";
import { getRfidCollection } from "@/lib/db/rfid";
import { getActiveCompany } from "@/lib/auth/session";

/**
 * Get the latest RFID event for a specific siteId
 * Query param: ?siteId=your-site-id
 * Filters by companyId from session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json({ error: "siteId query parameter is required" }, { status: 400 });
    }

    // Filter by active company (same as weight/latest)
    let companyId: string | null = null;
    try {
      companyId = await getActiveCompany();
    } catch {
      return NextResponse.json({
        siteId,
        rfid: null,
        message: "Authentication required",
      });
    }

    const collection = await getRfidCollection();
    const latest = await collection.findOne(
      { siteId, companyId, isLatest: true },
      { sort: { receivedAt: -1 } }
    );

    if (!latest) {
      return NextResponse.json({
        siteId,
        rfid: null,
        message: "No RFID data found for this siteId",
      });
    }

    return NextResponse.json({
      siteId: latest.siteId,
      rfid: latest.rfid,
      raw: latest.raw,
      ts: latest.ts,
      deviceIp: latest.deviceIp,
      devicePort: latest.devicePort,
      cameraIp: latest.cameraIp,
      receivedAt: latest.receivedAt,
    });
  } catch (error) {
    console.error("Error fetching latest RFID:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

