import { NextRequest, NextResponse } from "next/server";
import { getActiveCompany } from "@/lib/auth/session";
import { getCompany } from "@/lib/companies/metadata";

/**
 * Proxy video stream from camera to frontend
 * 
 * This endpoint proxies video from cameras via HTTPS to avoid CORS issues
 * and allows per-company camera configuration.
 * 
 * Usage:
 *   GET /api/camera/proxy?camera=1
 *   GET /api/camera/proxy?camera=2
 */
export async function GET(request: NextRequest) {
  try {
    // Get camera ID from query
    const cameraId = request.nextUrl.searchParams.get("camera") || "1";
    const cameraNum = cameraId === "1" || cameraId === "camera-1" ? 1 : 2;

    // Get current company
    const companyId = await getActiveCompany().catch(() => null);
    if (!companyId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get company camera settings
    const company = await getCompany(companyId);
    const cameraSettings = company?.cameraSettings || {};

    // Get camera IP and ports
    const cameraIp = cameraNum === 1 
      ? cameraSettings.camera1Ip 
      : cameraSettings.camera2Ip;
    
    // Get ports (HTTP/HTTPS: 443, RTSP: 8557, WebSocket: 9080)
    const httpPort = cameraNum === 1
      ? (cameraSettings.camera1HttpPort || 443)
      : (cameraSettings.camera2HttpPort || 443);

    const cameraUsername = cameraNum === 1
      ? cameraSettings.camera1Username || "admin"
      : cameraSettings.camera2Username || "admin";

    const cameraPassword = cameraNum === 1
      ? cameraSettings.camera1Password || "admin"
      : cameraSettings.camera2Password || "admin";

    if (!cameraIp) {
      return NextResponse.json(
        { error: `Camera ${cameraNum} not configured for this company` },
        { status: 404 }
      );
    }

    // Build camera video URL using HTTP/HTTPS port (443)
    // Common paths: /video.mjpeg, /stream, /video
    // Try multiple common paths if one fails
    const videoPaths = ["/video.mjpeg", "/stream", "/video", "/mjpeg", "/cgi-bin/video.cgi"];
    const cameraUrl = `https://${cameraIp}:${httpPort}`;

    console.log(`📹 Proxying video from camera ${cameraNum} (${cameraIp}:${httpPort})`);

    // Fetch video stream from camera
    try {
      // Create basic auth header
      const auth = Buffer.from(`${cameraUsername}:${cameraPassword}`).toString('base64');
      
      // Try each video path until one works
      let lastError: Error | null = null;
      for (const videoPath of videoPaths) {
        try {
          const fullUrl = `${cameraUrl}${videoPath}`;
          console.log(`📹 Trying video path: ${fullUrl}`);
          
          const cameraResponse = await fetch(fullUrl, {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
            // Don't verify SSL certificate (cameras often have self-signed certs)
            // In production, you might want to verify
          });

          if (cameraResponse.ok && cameraResponse.body) {
            console.log(`✅ Successfully connected to camera ${cameraNum} at ${fullUrl}`);
            
            // Stream video to client
            // Get content type from camera response
            const contentType = cameraResponse.headers.get('content-type') || 
                               'multipart/x-mixed-replace; boundary=--boundary';

            return new Response(cameraResponse.body, {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // Disable buffering for streaming
              },
            });
          } else {
            console.log(`⚠️ Camera ${cameraNum} returned status ${cameraResponse.status} for ${videoPath}`);
            lastError = new Error(`Camera returned status ${cameraResponse.status}`);
          }
        } catch (pathError) {
          console.log(`⚠️ Failed to connect to ${videoPath}:`, pathError);
          lastError = pathError instanceof Error ? pathError : new Error(String(pathError));
          // Continue to next path
        }
      }

      // All paths failed
      console.error(`❌ All video paths failed for camera ${cameraNum}`);
      return NextResponse.json(
        { 
          error: `Failed to connect to camera: ${lastError?.message || 'All video paths failed'}`,
          triedPaths: videoPaths,
          cameraIp,
          httpPort
        },
        { status: 502 }
      );
    } catch (error) {
      console.error(`❌ Error fetching from camera ${cameraNum}:`, error);
      return NextResponse.json(
        { error: `Failed to connect to camera: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error in video proxy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
