import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const VALID_CAMERA_IDS = ["1", "2"];
const STALE_THRESHOLD_MS = 2000; // 2 seconds

// Initialize Upstash Redis client
// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from environment
const redis = Redis.fromEnv();

interface CameraFramePointer {
  url: string;
  ts: number;
}

/**
 * GET /api/camera/latest?camera=<id>
 * 
 * Returns the latest frame URL for a camera from Redis
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

    // 2. Read from Redis
    const redisKey = `camera:${cameraId}`;
    let framePointer: CameraFramePointer | null = null;

    try {
      const redisValue = await redis.get<string>(redisKey);
      if (redisValue) {
        try {
          framePointer = typeof redisValue === "string" 
            ? JSON.parse(redisValue) 
            : redisValue;
        } catch (e) {
          console.error(`[Camera Latest] Failed to parse Redis value for camera ${cameraId}:`, e);
          framePointer = null;
        }
      }
    } catch (error) {
      console.error(`[Camera Latest] Redis read error for camera ${cameraId}:`, error);
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
