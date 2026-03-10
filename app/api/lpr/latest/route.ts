import { NextResponse } from "next/server";
import { getLprCollection } from "@/lib/db/lpr";
import { getActiveCompany } from "@/lib/auth/session";
import { getCompaniesCollection } from "@/lib/db/companyDb";

export async function GET(request: Request) {
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

    // Never query without companyId (prevents cross-company plate leak)
    if (!companyId || typeof companyId !== "string" || companyId.trim() === "") {
      return NextResponse.json({
        plateNumber: null,
        recognizedAt: null,
        imageUrl: null,
        imagePath: null,
        cameraIp: null,
        receivedAt: null,
      });
    }

    // Parse query parameters to check if we need to filter by specific camera
    const { searchParams } = new URL(request.url);
    const cameraParam = searchParams.get("camera"); // "1" or "2"
    
    let targetCameraIp: string | null = null;
    if (cameraParam === "1" || cameraParam === "2") {
      // Fetch company's camera settings to get the camera IP
      try {
        const companiesCollection = await getCompaniesCollection();
        const company = await companiesCollection.findOne(
          { companyId },
          { projection: { cameraSettings: 1 } }
        );
        
        if (company && (company as any).cameraSettings) {
          const cameraSettings = (company as any).cameraSettings;
          if (cameraParam === "1" && cameraSettings.camera1Ip) {
            targetCameraIp = cameraSettings.camera1Ip;
          } else if (cameraParam === "2" && cameraSettings.camera2Ip) {
            targetCameraIp = cameraSettings.camera2Ip;
          }
        }
      } catch (error) {
        console.error("[LPR Latest] Error fetching company camera settings:", error);
        // Continue without camera filter if lookup fails
      }
    }

    const collection = await getLprCollection();

    // Build query: always filter by companyId; optionally by camera IP
    let query: { companyId: string; cameraIp?: string } = { companyId };
    if (targetCameraIp) {
      query.cameraIp = targetCameraIp;
    }
    
    let latest = await collection
      .find(query)
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    // Fallback 1: If camera filter returned nothing but we have targetCameraIp, try without camera (single-camera or IP mismatch)
    if (latest.length === 0 && targetCameraIp && companyId) {
      query = { companyId };
      latest = await collection.find(query).sort({ receivedAt: -1 }).limit(1).toArray();
    }

    // IMPORTANT: Do NOT drop companyId filter here.
    // If there is no data for this company, return nulls instead of leaking
    // another company's plates.
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
