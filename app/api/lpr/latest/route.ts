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

    // Build query: filter by companyId, and optionally by camera IP
    const query: any = companyId ? { companyId } : {};
    if (targetCameraIp) {
      query.cameraIp = targetCameraIp;
    }
    
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
