import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";

const MAX_PAYLOAD_SIZE = 250 * 1024; // 250KB
const MAX_UPLOADS_PER_SEC = 15;
const VALID_CAMERA_IDS = ["1", "2"];

// Initialize Upstash Redis client
// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from environment
const redis = Redis.fromEnv();

/**
 * Rate limiting: Token bucket using Redis
 * Key format: rate_limit:camera:{cameraId}
 * Value: JSON object with { count: number, resetAt: number }
 * Sliding window approach that works reliably with Upstash Redis
 */
async function checkRateLimit(cameraId: string): Promise<boolean> {
  const key = `rate_limit:camera:${cameraId}`;
  const now = Date.now();
  const windowMs = 1000; // 1 second window

  try {
    // Get current rate limit state
    const stateStr = await redis.get<string>(key);
    let state: { count: number; resetAt: number } | null = null;

    if (stateStr) {
      try {
        state = typeof stateStr === "string" ? JSON.parse(stateStr) : stateStr;
      } catch (e) {
        // Invalid JSON, reset state
        state = null;
      }
    }

    // Check if window expired or state missing
    if (!state || now >= state.resetAt) {
      // Reset window
      state = {
        count: 1,
        resetAt: now + windowMs,
      };
      // Set with expiration (2 seconds TTL)
      await redis.set(key, JSON.stringify(state), { ex: 2 });
      return true;
    }

    // Check if limit exceeded
    if (state.count >= MAX_UPLOADS_PER_SEC) {
      return false;
    }

    // Increment count
    state.count += 1;
    // Update with expiration (2 seconds TTL)
    await redis.set(key, JSON.stringify(state), { ex: 2 });

    return true;
  } catch (error) {
    console.error(`[Rate Limit] Error checking rate limit for camera ${cameraId}:`, error);
    // On error, allow the request (fail open)
    return true;
  }
}

/**
 * POST /api/camera/upload?camera=<id>
 * 
 * Receives binary JPEG frame from Electron app
 * Uploads to Vercel Blob and stores pointer in Redis
 * 
 * Auth: Authorization: Bearer <INGEST_SECRET>
 * Body: Raw binary JPEG (image/jpeg)
 * Max size: 250KB
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authentication
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;

    if (!expectedSecret) {
      console.error("[Camera Upload] INGEST_SECRET not configured");
      return NextResponse.json(
        { ok: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[Camera Upload] Missing or invalid Authorization header");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== expectedSecret) {
      console.warn("[Camera Upload] Invalid authentication token");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Validate cameraId
    const cameraId = request.nextUrl.searchParams.get("camera");
    if (!cameraId || !VALID_CAMERA_IDS.includes(cameraId)) {
      console.warn(`[Camera Upload] Invalid cameraId: ${cameraId}`);
      return NextResponse.json(
        { ok: false, error: `Invalid cameraId. Must be one of: ${VALID_CAMERA_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Rate limiting
    const rateLimitOk = await checkRateLimit(cameraId);
    if (!rateLimitOk) {
      console.warn(`[Camera Upload] Rate limit exceeded for camera ${cameraId}`);
      return NextResponse.json(
        { ok: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // 4. Validate Content-Type
    const contentType = request.headers.get("Content-Type");
    if (contentType !== "image/jpeg") {
      console.warn(`[Camera Upload] Invalid Content-Type: ${contentType} for camera ${cameraId}`);
      return NextResponse.json(
        { ok: false, error: "Content-Type must be image/jpeg" },
        { status: 400 }
      );
    }

    // 5. Read and validate body size
    const body = await request.arrayBuffer();
    const bodySize = body.byteLength;

    if (bodySize > MAX_PAYLOAD_SIZE) {
      console.warn(`[Camera Upload] Payload too large: ${bodySize} bytes for camera ${cameraId}`);
      return NextResponse.json(
        { ok: false, error: `Payload too large. Maximum size: ${MAX_PAYLOAD_SIZE / 1024}KB` },
        { status: 413 }
      );
    }

    if (bodySize === 0) {
      console.warn(`[Camera Upload] Empty payload for camera ${cameraId}`);
      return NextResponse.json(
        { ok: false, error: "Empty payload" },
        { status: 400 }
      );
    }

    // 6. Get timestamp from header or use current time
    const headerTs = request.headers.get("x-ts");
    const timestamp = headerTs ? parseInt(headerTs, 10) : Date.now();

    // 7. Upload to Vercel Blob (overwrite existing)
    const blobKey = `cameras/${cameraId}/latest.jpg`;
    let blobUrl: string;

    try {
      const blob = await put(blobKey, body, {
        contentType: "image/jpeg",
        access: "public", // Public URL for direct <img> access
        addRandomSuffix: false, // Overwrite existing
      });
      blobUrl = blob.url;
    } catch (error) {
      console.error(`[Camera Upload] Blob upload failed for camera ${cameraId}:`, error);
      return NextResponse.json(
        { ok: false, error: "Failed to upload frame" },
        { status: 500 }
      );
    }

    // 8. Store pointer in Redis
    const redisKey = `camera:${cameraId}`;
    const pointerValue = JSON.stringify({
      url: blobUrl,
      ts: timestamp,
    });

    try {
      // Set the pointer (no expiration - persists until overwritten)
      await redis.set(redisKey, pointerValue);
    } catch (error) {
      console.error(`[Camera Upload] Redis write failed for camera ${cameraId}:`, error);
      // Blob upload succeeded but Redis failed - log but don't fail the request
      // The frame is still available via Blob URL
    }

    // 9. Log success (sampled - every 10th frame or every 500ms)
    const elapsed = Date.now() - startTime;
    if (timestamp % 10 === 0 || elapsed > 500) {
      console.log(`📹 [Camera ${cameraId}] Frame uploaded`, {
        size: `${Math.round(bodySize / 1024)}KB`,
        blobUrl: blobUrl.substring(0, 50) + "...",
        ts: timestamp,
        elapsed: `${elapsed}ms`,
      });
    }

    return NextResponse.json({
      ok: true,
      cameraId,
      ts: timestamp,
    });
  } catch (error) {
    console.error("[Camera Upload] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
