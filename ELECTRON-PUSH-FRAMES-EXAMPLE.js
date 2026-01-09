/**
 * Electron App - Push Video Frames to Next.js API
 * 
 * Instead of WebSocket, Electron POSTs frames to /api/camera/frame
 * Works without Cloudflare - same as license plates!
 * 
 * Add this to your Electron app's camera frame callback
 */

const SITE_URL = process.env.SITE_URL || 'https://gaali.vercel.app';
const LPR_SECRET = process.env.LPR_INGEST_SECRET; // Reuse same secret as license plates

/**
 * Push video frame to Next.js API
 * Call this from your camera SDK frame callback
 */
async function pushVideoFrame(cameraId, frameBase64) {
  try {
    const response = await fetch(`${SITE_URL}/api/camera/frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LPR_SECRET}`,
      },
      body: JSON.stringify({
        cameraId: cameraId.toString(), // "1" or "2"
        frameBase64: frameBase64, // Base64 encoded JPEG
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error(`❌ Failed to push frame for camera ${cameraId}:`, response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Error pushing frame for camera ${cameraId}:`, error);
    return false;
  }
}

/**
 * Example: How to use in your camera SDK callback
 */
function onCameraFrame(cameraId, frameData) {
  // Convert frame to base64 JPEG
  // (depends on your SDK - might already be JPEG, or need conversion)
  const frameBase64 = Buffer.from(frameData).toString('base64');
  
  // Push to Next.js API
  pushVideoFrame(cameraId, frameBase64);
}

// Example usage in your Electron app:
// 
// // In your camera SDK callback:
// vzlpr.VzLPRClient_SetVideoDataCallback(handle, (handle, userData, dataType, dataInfo) => {
//   if (dataType === 0) { // VIDEO
//     const frameBase64 = Buffer.from(dataInfo.buffer).toString('base64');
//     pushVideoFrame('1', frameBase64); // or '2' for camera 2
//   }
// }, null);

module.exports = { pushVideoFrame };
