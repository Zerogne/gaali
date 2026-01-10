import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/camera/frame - Receive video frame from Electron app
 * Similar to /api/lpr/ingest but for video frames
 * 
 * Body (from Electron app):
 * {
 *   cameraId: "1" | "2",
 *   imageData: string, // Base64 encoded JPEG frame (without data:image/jpeg;base64, prefix)
 *   timestamp: string, // ISO 8601 timestamp like "2024-01-01T12:00:00.000Z"
 *   format: "jpeg" // Optional
 * }
 */

// Store latest frames in memory (or use Redis in production)
const latestFrames = new Map<string, {
  frameBase64: string;
  timestamp: number;
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
    const { cameraId, imageData, frameBase64, timestamp, format } = body;

    // Support both formats: imageData (from Electron) or frameBase64 (legacy)
    const frameData = imageData || frameBase64;

    if (!cameraId || !frameData) {
      return NextResponse.json(
        { ok: false, error: "Missing cameraId or imageData/frameBase64" },
        { status: 400 }
      );
    }

    // Convert ISO timestamp to number, or use current time
    let timestampNum = Date.now();
    if (timestamp) {
      const parsed = new Date(timestamp).getTime();
      if (!isNaN(parsed)) {
        timestampNum = parsed;
      }
    }

    // Store latest frame
    latestFrames.set(cameraId, {
      frameBase64: frameData,
      timestamp: timestampNum,
    });

    console.log(`📹 [Camera ${cameraId}] Frame received`, {
      format: format || 'jpeg',
      timestamp: new Date(timestampNum).toISOString(),
      size: Math.round(frameData.length * 0.75 / 1024) + ' KB', // Approximate size
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
      frameBase64: frame.frameBase64,
      timestamp: frame.timestamp,
    });
  } catch (error) {
    console.error("Camera frame get error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
