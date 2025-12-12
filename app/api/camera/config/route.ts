import { NextResponse } from "next/server";

/**
 * Debug endpoint to check camera configuration
 * Returns whether env vars are loaded (without exposing secrets)
 */
export async function GET() {
  const baseUrl = process.env.CAMERA_BASE_URL;
  const eventPath = process.env.CAMERA_EVENT_PATH;
  const hasAuth = !!process.env.CAMERA_AUTH;
  const pollMs = process.env.CAMERA_POLL_MS;

  return NextResponse.json({
    configured: !!baseUrl,
    baseUrl: baseUrl || "not set",
    eventPath: eventPath || "not set",
    hasAuth,
    pollMs: pollMs ? parseInt(pollMs, 10) : 500,
    fullUrl: baseUrl && eventPath ? `${baseUrl}${eventPath}` : null,
  });
}
