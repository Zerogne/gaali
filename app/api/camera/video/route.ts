import { NextRequest, NextResponse } from "next/server";
import { getActiveCompany } from "@/lib/auth/session";
import { getCompany } from "@/lib/companies/metadata";

/**
 * GET /api/camera/video - Get video stream URL for cameras
 * Returns HTTPS URLs for direct camera video streaming
 */
export async function GET(request: NextRequest) {
  try {
    // Get current company
    const companyId = await getActiveCompany().catch(() => null);
    
    if (!companyId) {
      return NextResponse.json({
        error: "Not authenticated",
        camera1Url: null,
        camera2Url: null,
      }, { status: 401 });
    }

    // Get company camera settings
    const company = await getCompany(companyId);
    const cameraSettings = company?.cameraSettings || {};

    console.log(`📹 [Camera Video API] Company ID: ${companyId}`, {
      hasCompany: !!company,
      hasCameraSettings: !!company?.cameraSettings,
      cameraSettings: cameraSettings,
    });

    // Get camera IPs and ports
    const camera1Ip = cameraSettings.camera1Ip;
    const camera2Ip = cameraSettings.camera2Ip;
    
    // Ports: 
    // - HTTP/HTTPS: 443
    // - RTSP: 8557 (for RTSP streaming)
    // - WebSocket Video: 8557 (for real-time video WebSocket - ws://ip:8557)
    // - WebSocket Data: 9080 (for other WebSocket data - ws://ip:9080)
    const camera1HttpPort = cameraSettings.camera1HttpPort || 443;
    const camera1RtspPort = cameraSettings.camera1RtspPort || 8557;
    const camera1WebSocketPort = cameraSettings.camera1WebSocketPort || 8557; // Real-time video WebSocket (ws://)
    const camera1WebSocketDataPort = 9080; // Other WebSocket data (ws://)
    
    const camera2HttpPort = cameraSettings.camera2HttpPort || 443;
    const camera2RtspPort = cameraSettings.camera2RtspPort || 8557;
    const camera2WebSocketPort = cameraSettings.camera2WebSocketPort || 9080; // Other WebSocket data (ws://)
    const camera2WebSocketDataPort = 9080; // Other WebSocket data (ws://)

    // Build URLs for different protocols
    const videoPath = "/video.mjpeg"; // MJPEG path for HTTP/HTTPS
    
    // HTTP/HTTPS URLs (for MJPEG streaming)
    const camera1HttpUrl = camera1Ip 
      ? `https://${camera1Ip}:${camera1HttpPort}${videoPath}`
      : null;
    
    const camera2HttpUrl = camera2Ip 
      ? `https://${camera2Ip}:${camera2HttpPort}${videoPath}`
      : null;

    // RTSP URLs (rtsp://ip:port/h264) - Vision-Zenith cameras use /h264 path
    const camera1RtspUrl = camera1Ip
      ? `rtsp://${camera1Ip}:${camera1RtspPort}/h264`
      : null;
    
    const camera2RtspUrl = camera2Ip
      ? `rtsp://${camera2Ip}:${camera2RtspPort}/h264`
      : null;

    // WebSocket URLs for real-time video (ws://ip:8557/h264)
    // Using non-secure WebSocket (ws://) on port 8557 for H.264 video streaming
    const wsPath = "/h264"; // H.264 video stream path
    const camera1WebSocketUrl = camera1Ip
      ? `ws://${camera1Ip}:${camera1WebSocketPort}${wsPath}` // Real-time video WebSocket (H.264)
      : null;
    
    const camera2WebSocketUrl = camera2Ip
      ? `ws://${camera2Ip}:${camera2WebSocketPort}${wsPath}` // Real-time video WebSocket (H.264)
      : null;
    
    // WebSocket URLs for other data (ws://ip:9080)
    // Non-secure WebSocket (ws://) on port 9080 for other WebSocket data
    const camera1WebSocketDataUrl = camera1Ip
      ? `ws://${camera1Ip}:${camera1WebSocketDataPort}` // Other WebSocket data
      : null;
    
    const camera2WebSocketDataUrl = camera2Ip
      ? `ws://${camera2Ip}:${camera2WebSocketDataPort}` // Other WebSocket data
      : null;

    console.log(`📹 [Camera Video API] Built WebSocket URLs:`, {
      camera1: {
        ip: camera1Ip || 'not set',
        videoWebSocketPort: camera1WebSocketPort,
        videoWebSocketUrl: camera1WebSocketUrl || 'null (no IP)',
        dataWebSocketPort: camera1WebSocketDataPort,
        dataWebSocketUrl: camera1WebSocketDataUrl || 'null (no IP)',
      },
      camera2: {
        ip: camera2Ip || 'not set',
        videoWebSocketPort: camera2WebSocketPort,
        videoWebSocketUrl: camera2WebSocketUrl || 'null (no IP)',
        dataWebSocketPort: camera2WebSocketDataPort,
        dataWebSocketUrl: camera2WebSocketDataUrl || 'null (no IP)',
      },
    });

    return NextResponse.json({
      companyId,
      camera1: {
        ip: camera1Ip,
        httpPort: camera1HttpPort,
        rtspPort: camera1RtspPort,
        webSocketPort: camera1WebSocketPort, // Port 8557 for real-time video WebSocket
        webSocketDataPort: camera1WebSocketDataPort, // Port 9080 for other WebSocket data
        httpUrl: camera1HttpUrl,
        rtspUrl: camera1RtspUrl,
        webSocketUrl: camera1WebSocketUrl, // ws://ip:8557 for real-time video
        webSocketDataUrl: camera1WebSocketDataUrl, // ws://ip:9080 for other WebSocket data
        configured: !!camera1Ip,
      },
      camera2: {
        ip: camera2Ip,
        httpPort: camera2HttpPort,
        rtspPort: camera2RtspPort,
        webSocketPort: camera2WebSocketPort, // Port 8557 for real-time video WebSocket
        webSocketDataPort: camera2WebSocketDataPort, // Port 9080 for other WebSocket data
        httpUrl: camera2HttpUrl,
        rtspUrl: camera2RtspUrl,
        webSocketUrl: camera2WebSocketUrl, // ws://ip:8557 for real-time video
        webSocketDataUrl: camera2WebSocketDataUrl, // ws://ip:9080 for other WebSocket data
        configured: !!camera2Ip,
      },
    });
  } catch (error) {
    console.error("Error getting camera video URLs:", error);
    return NextResponse.json({
      error: "Failed to get camera video URLs",
      camera1Url: null,
      camera2Url: null,
    }, { status: 500 });
  }
}

/**
 * POST /api/camera/video - Receive video frame from camera
 * Cameras can push video frames via HTTPS POST
 */
export async function POST(request: NextRequest) {
  try {
    // Get camera IP from request (for identification)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    // Get request body
    const body = await request.json().catch(() => ({}));
    
    // Handle different video frame formats
    // Format 1: Base64 encoded frame
    if (body.frame && body.cameraId) {
      // Frame data received, broadcast via WebSocket
      // TODO: Implement WebSocket broadcasting
      console.log(`📹 Video frame received from camera ${body.cameraId}`);
      return NextResponse.json({ ok: true, received: true });
    }

    // Format 2: MJPEG stream data
    if (body.type === "mjpeg" && body.data) {
      console.log(`📹 MJPEG data received from ${clientIp}`);
      // TODO: Process and broadcast
      return NextResponse.json({ ok: true, received: true });
    }

    return NextResponse.json({ ok: true, message: "Video endpoint ready" });
  } catch (error) {
    console.error("Error receiving video:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process video" },
      { status: 500 }
    );
  }
}
