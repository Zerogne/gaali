/**
 * Electron App - Push Video Frames to Next.js API
 * 
 * FFmpeg reads RTSP stream from camera, converts to MJPEG,
 * and sends each frame to /api/camera/frame via HTTP POST
 * 
 * Format matches your current Electron app implementation
 */

const SITE_URL = process.env.SITE_URL || 'https://gaali.vercel.app';
const LPR_SECRET = process.env.LPR_INGEST_SECRET; // Reuse same secret as license plates

/**
 * Push video frame to Next.js API
 * Call this from your FFmpeg frame extractor
 * 
 * @param {string} cameraId - "1" or "2"
 * @param {string} imageData - Base64 encoded JPEG frame (without data URI prefix)
 * @param {Date|string} timestamp - ISO timestamp or Date object
 */
async function pushVideoFrame(cameraId, imageData, timestamp = new Date()) {
  try {
    const timestampISO = timestamp instanceof Date 
      ? timestamp.toISOString() 
      : timestamp;

    const response = await fetch(`${SITE_URL}/api/camera/frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LPR_SECRET}`,
      },
      body: JSON.stringify({
        cameraId: cameraId.toString(), // "1" or "2"
        imageData: imageData, // Base64 encoded JPEG frame
        timestamp: timestampISO, // ISO 8601 format: "2024-01-01T12:00:00.000Z"
        format: "jpeg",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Camera ${cameraId}] Failed to push frame:`, response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ [Camera ${cameraId}] Error pushing frame:`, error.message);
    return false;
  }
}

/**
 * Example: How to use in your FFmpeg frame extractor
 * 
 * Your Electron app should:
 * 1. Use FFmpeg to read RTSP: rtsp://admin:admin@192.168.1.49:8557/h264
 * 2. Convert to MJPEG at 25fps, 1600x1200
 * 3. Extract individual JPEG frames
 * 4. Convert each frame to base64
 * 5. Call pushVideoFrame(cameraId, base64Frame, timestamp)
 */
function onFFmpegFrame(cameraId, jpegBuffer) {
  // Convert JPEG buffer to base64 (without data URI prefix)
  const imageData = jpegBuffer.toString('base64');
  const timestamp = new Date();
  
  // Push to Next.js API
  pushVideoFrame(cameraId, imageData, timestamp);
}

module.exports = { pushVideoFrame, onFFmpegFrame };
