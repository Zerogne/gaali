import { NextResponse } from "next/server";

/**
 * Debug endpoint to check camera configuration
 * Returns whether env vars are loaded (without exposing secrets)
 */
export async function GET() {
  const baseUrl = process.env.CAMERA_BASE_URL;
  const eventPath = process.env.CAMERA_EVENT_PATH;
  const streamPath = process.env.CAMERA_STREAM_PATH || "/video.mjpeg";
  const hasAuth = !!process.env.CAMERA_AUTH;
  const pollMs = process.env.CAMERA_POLL_MS;
  
  // Allow override via NEXT_PUBLIC env var (for direct camera access)
  const publicStreamUrl = process.env.NEXT_PUBLIC_CAMERA_STREAM_URL;
  
  // Build stream URL - prefer public env var, then build from baseUrl
  let streamUrl = null;
  if (publicStreamUrl) {
    streamUrl = publicStreamUrl;
  } else if (baseUrl) {
    streamUrl = `${baseUrl}${streamPath}`;
  }
  
  // If no stream URL configured, return null (video won't show)
  // User needs to set up RTSP proxy separately or configure NEXT_PUBLIC_CAMERA_STREAM_URL

  return NextResponse.json({
    configured: !!baseUrl,
    baseUrl: baseUrl || "not set",
    eventPath: eventPath || "not set",
    streamPath: streamPath || "not set",
    hasAuth,
    pollMs: pollMs ? parseInt(pollMs, 10) : 500,
    fullUrl: baseUrl && eventPath ? `${baseUrl}${eventPath}` : null,
    streamUrl: streamUrl,
  });
}
