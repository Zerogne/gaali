import { NextRequest, NextResponse } from "next/server";
import kv from "@vercel/kv";

const VALID_CAMERA_IDS = ["1", "2"];
const STALE_THRESHOLD_MS = 2000; // 2 seconds

interface CameraFramePointer {
  url: string;
  ts: number;
}

/**
 * GET /api/camera/latest?camera=<id>
 * 
 * Returns the latest frame URL for a camera from KV
 * Browser polls this endpoint to get the current frame pointer
 * 
 * Returns:
 * - { ok: true, cameraId, url, ts, stale } if frame exists
 * - { ok: true, cameraId, url: null, ts: null, stale: true } if no frame
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validate cameraId
    const cameraId = request.nextUrl.searchParams.get("camera") || "1";

    if (!VALID_CAMERA_IDS.includes(cameraId)) {
      return NextResponse.json(
        { ok: false, error: `Invalid cameraId. Must be one of: ${VALID_CAMERA_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    // 2. Read from KV
    const kvKey = `camera:${cameraId}`;
    let framePointer: CameraFramePointer | null = null;

    try {
      const kvValue = await kv.get<string>(kvKey);
      if (kvValue) {
        framePointer = JSON.parse(kvValue) as CameraFramePointer;
      }
    } catch (error) {
      console.error(`[Camera Latest] KV read error for camera ${cameraId}:`, error);
      // Continue with null framePointer
    }

    // 3. Check if frame exists
    if (!framePointer || !framePointer.url) {
      return NextResponse.json(
        {
          ok: true,
          cameraId,
          url: null,
          ts: null,
          stale: true,
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // 4. Check if stale (> 2000ms old)
    const now = Date.now();
    const age = now - framePointer.ts;
    const isStale = age > STALE_THRESHOLD_MS;

    return NextResponse.json(
      {
        ok: true,
        cameraId,
        url: framePointer.url,
        ts: framePointer.ts,
        stale: isStale,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[Camera Latest] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
