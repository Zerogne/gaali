import { NextResponse } from "next/server";
import { getLprCollection } from "@/lib/db/lpr";
import { getActiveCompany } from "@/lib/auth/session";

export async function GET() {
  try {
    // Get current user's company ID from session
    let companyId: string | null = null;
    try {
      companyId = await getActiveCompany();
    } catch (error) {
      // User not authenticated or session expired
      // Return null data (frontend will handle this)
      return NextResponse.json({
        plateNumber: null,
        recognizedAt: null,
        imageUrl: null,
        imagePath: null,
        cameraIp: null,
        receivedAt: null,
      });
    }

    const collection = await getLprCollection();

    // Find latest document by receivedAt, filtered by companyId
    const query = companyId ? { companyId } : {};
    const latest = await collection
      .find(query)
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    if (latest.length === 0) {
      return NextResponse.json({
        plateNumber: null,
        recognizedAt: null,
        imageUrl: null,
        imagePath: null,
        cameraIp: null,
        receivedAt: null,
      });
    }

    const doc = latest[0];
    
    // #region agent log - Debug API response data
    const receivedTime = doc.receivedAt ? new Date(doc.receivedAt).getTime() : 0;
    const now = Date.now();
    const ageMinutes = receivedTime > 0 ? (now - receivedTime) / 1000 / 60 : -1;
    console.log(`[DEBUG-LPR-API] Returning latest LPR:`, {
      plateNumber: doc.plateNumber,
      receivedAt: doc.receivedAt,
      ageMinutes: ageMinutes.toFixed(2),
      companyId,
    });
    // #endregion

    return NextResponse.json(
      {
        plateNumber: doc.plateNumber || null,
        recognizedAt: doc.recognizedAt || null,
        imageUrl: doc.imageUrl || null,
        imagePath: doc.imagePath || null,
        cameraIp: doc.cameraIp || null,
        receivedAt: doc.receivedAt || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("LPR latest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
