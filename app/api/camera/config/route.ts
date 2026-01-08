import { NextResponse } from "next/server";
import { getActiveCompany } from "@/lib/auth/session";
import { getCompany } from "@/lib/companies/metadata";

/**
 * Get camera configuration for current company
 * Returns camera IPs from company settings (not hardcoded)
 * Returns null for streamUrl to use WebSocket instead of MJPEG
 */
export async function GET() {
  try {
    // Get current company
    const companyId = await getActiveCompany().catch(() => null);
    
    let camera1Ip = null;
    let camera2Ip = null;
    
    // Try to get camera IPs from company settings
    if (companyId) {
      try {
        const company = await getCompany(companyId);
        if (company?.cameraSettings) {
          camera1Ip = company.cameraSettings.camera1Ip || null;
          camera2Ip = company.cameraSettings.camera2Ip || null;
        }
      } catch (error) {
        console.warn("Could not get company camera settings:", error);
      }
    }
    
    // Fallback to environment variables if company settings not available
    // (for backward compatibility and local development)
    const baseUrl = process.env.CAMERA_BASE_URL;
    const eventPath = process.env.CAMERA_EVENT_PATH;
    const streamPath = process.env.CAMERA_STREAM_PATH || "/video.mjpeg";
    
    // Don't build MJPEG URL - use WebSocket instead
    // Setting streamUrl to null prevents MJPEG loading errors
    const streamUrl = null;
    
    return NextResponse.json({
      configured: !!(camera1Ip || baseUrl),
      companyId: companyId || null,
      camera1Ip: camera1Ip || null,
      camera2Ip: camera2Ip || null,
      // Legacy fields (for backward compatibility)
      baseUrl: baseUrl || "not set",
      eventPath: eventPath || "not set",
      streamPath: streamPath || "not set",
      // streamUrl is null to use WebSocket instead of MJPEG
      streamUrl: streamUrl,
      message: "Use WebSocket for video streaming (ws://localhost:3004/video/camera-1)",
    });
  } catch (error) {
    console.error("Error getting camera config:", error);
    return NextResponse.json({
      configured: false,
      streamUrl: null, // Don't try to load MJPEG
      error: "Failed to get camera config",
    }, { status: 500 });
  }
}
