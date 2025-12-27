import { NextRequest, NextResponse } from "next/server";
import { getLprCollection } from "@/lib/db/lpr";

/**
 * POST /api/lpr/camera-direct
 * 
 * Direct camera endpoint that accepts raw camera HTTP push format
 * Allows cameras with public internet access to connect directly to Vercel
 * without needing the camera-bridge service.
 * 
 * Camera should be configured to POST to: https://your-app.vercel.app/api/lpr/camera-direct
 * With Authorization header: Bearer YOUR_LPR_INGEST_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // Cameras can authenticate via:
    // 1. Authorization header: Bearer TOKEN
    // 2. Query parameter: ?token=TOKEN (for cameras that can't send custom headers)
    const expectedSecret = process.env.LPR_INGEST_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "LPR_INGEST_SECRET not configured" },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const queryToken = url.searchParams.get("token");
    const authHeader = request.headers.get("Authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    // Accept token from either query param or Authorization header
    const token = queryToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing authentication token. Provide ?token=TOKEN in URL or Authorization header" },
        { status: 401 }
      );
    }

    if (token !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Parse camera payload (raw camera format)
    const body = await request.json();
    
    // Camera sends data in format: { AlarmInfoPlate: { result: { PlateResult: {...} } } }
    const alarm = body?.AlarmInfoPlate;
    const plateResultRaw = alarm?.result?.PlateResult;

    // PlateResult sometimes comes as an object, sometimes an array
    const plateResult = Array.isArray(plateResultRaw)
      ? plateResultRaw[0]
      : plateResultRaw;

    // Extract plate number (try different field names)
    const plateNumber = 
      plateResult?.license || 
      plateResult?.License || 
      plateResult?.plateNumber ||
      plateResult?.plate_number ||
      null;

    if (!plateNumber) {
      return NextResponse.json(
        { ok: false, error: "No plate number found in request" },
        { status: 400 }
      );
    }

    // Extract timestamp (try different formats)
    let recognizedAt: string;
    const triggerTime = 
      plateResult?.trigger_time || 
      plateResult?.triggerTime || 
      plateResult?.time ||
      plateResult?.timestamp;
    
    if (triggerTime) {
      // Camera often sends: "YYYY-MM-DD HH:mm:ss"
      recognizedAt = typeof triggerTime === "string" 
        ? triggerTime 
        : new Date(triggerTime).toISOString();
    } else {
      // Use current time if not provided
      const now = new Date();
      recognizedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    // Extract image path (optional)
    const imagePath = 
      plateResult?.image_path || 
      plateResult?.imagePath ||
      plateResult?.image_sd_path ||
      plateResult?.imageSdPath ||
      null;

    // Get camera IP from request (if available)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     request.headers.get("x-real-ip") ||
                     null;

    // Store in MongoDB
    const collection = await getLprCollection();
    const document = {
      plateNumber: plateNumber,
      recognizedAt: recognizedAt,
      cameraIp: clientIp,
      imagePath: imagePath,
      imageUrl: null, // Can be populated later if image is uploaded
      receivedAt: new Date().toISOString(),
      source: "camera-direct", // Mark as coming directly from camera
    };

    await collection.insertOne(document);

    // Return OK response (camera expects simple "OK" or 200 status)
    return NextResponse.json({ ok: true, message: "Plate data received" });
  } catch (error) {
    console.error("LPR camera-direct error:", error);
    
    // Return error but don't expose internal details
    return NextResponse.json(
      { ok: false, error: "Failed to process camera data" },
      { status: 500 }
    );
  }
}

