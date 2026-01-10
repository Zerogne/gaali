import { NextRequest, NextResponse } from "next/server";
import { getActiveCompany } from "@/lib/auth/session";

/**
 * POST /api/camera/frame - Receive video frame from Electron app
 * Similar to /api/lpr/ingest but for video frames
 * 
 * Body format from Electron app:
 * {
 *   cameraId: "1" | "2",
 *   timestamp: "2024-01-01T12:00:00.000Z", // ISO string
 *   imageData: "base64-encoded-jpeg-frame",
 *   format: "jpeg"
 * }
 */

// Store latest frames in memory (or use Redis in production)
const latestFrames = new Map<string, {
  imageData: string;
  timestamp: string;
  format: string;
}>();

export async function POST(request: NextRequest) {
  try {
    // Check authentication (same as LPR ingest)
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.LPR_INGEST_SECRET; // Reuse same secret

    if (!expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "LPR_INGEST_SECRET not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cameraId, imageData, timestamp, format } = body;

    if (!cameraId || !imageData) {
      return NextResponse.json(
        { ok: false, error: "Missing cameraId or imageData" },
        { status: 400 }
      );
    }

    // Store latest frame (matching Electron app format)
    latestFrames.set(cameraId, {
      imageData,
      timestamp: timestamp || new Date().toISOString(),
      format: format || "jpeg",
    });

    console.log(`✅ Received frame for camera ${cameraId}`, {
      timestamp: timestamp || new Date().toISOString(),
      format: format || "jpeg",
      imageDataLength: imageData?.length || 0,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Camera frame ingest error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/camera/frame?camera=1 - Get latest frame for a camera
 * Used by browser to poll for frames
 */
export async function GET(request: NextRequest) {
  try {
    const cameraId = request.nextUrl.searchParams.get("camera") || "1";
    
    const frame = latestFrames.get(cameraId);
    
    if (!frame) {
      return NextResponse.json(
        { ok: false, error: "No frame available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      cameraId,
      imageData: frame.imageData, // Match Electron app format
      timestamp: frame.timestamp,
      format: frame.format,
    });
  } catch (error) {
    console.error("Camera frame get error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
