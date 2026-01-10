/**
 * Electron App - Push Video Frames to Next.js API (Binary JPEG)
 * 
 * Updated to use binary JPEG upload instead of base64 JSON
 * FFmpeg extracts JPEG frames → POST as binary to /api/camera/upload
 * 
 * Configuration:
 * - SITE_URL: Your Vercel deployment URL (e.g., https://gaali.vercel.app)
 * - INGEST_SECRET: Same secret as LPR_INGEST_SECRET
 * - UPLOAD_FPS: Frames per second to upload (default: 10, range: 8-12)
 */

const SITE_URL = process.env.SITE_URL || 'https://gaali.vercel.app';
const INGEST_SECRET = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;
const UPLOAD_FPS = parseInt(process.env.UPLOAD_FPS || '10', 10);
const MIN_INTERVAL_MS = 1000 / 12; // 83ms minimum (12 fps max)
const MAX_INTERVAL_MS = 1000 / 8;  // 125ms maximum (8 fps min)
const UPLOAD_INTERVAL_MS = Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, 1000 / UPLOAD_FPS));

// Throttle state per camera
const lastUploadTime = {
  '1': 0,
  '2': 0,
};

/**
 * Push video frame to Next.js API as binary JPEG
 * 
 * @param {string} cameraId - "1" or "2"
 * @param {Buffer} jpegBuffer - JPEG frame as Buffer (from FFmpeg)
 * @param {number} timestamp - Unix timestamp in milliseconds (optional)
 * @returns {Promise<boolean>} - true if successful
 */
async function pushVideoToWebsiteAPI(cameraId, jpegBuffer, timestamp = null) {
  // Validate cameraId
  if (cameraId !== '1' && cameraId !== '2') {
    console.error(`❌ [Camera ${cameraId}] Invalid cameraId. Must be "1" or "2"`);
    return false;
  }

  // Throttle: Enforce minimum interval between uploads
  const now = Date.now();
  const timeSinceLastUpload = now - lastUploadTime[cameraId];
  if (timeSinceLastUpload < UPLOAD_INTERVAL_MS) {
    // Skip this frame (throttled)
    return true; // Return true to avoid error logging
  }

  if (!INGEST_SECRET) {
    console.error(`❌ [Camera ${cameraId}] INGEST_SECRET not configured`);
    return false;
  }

  if (!jpegBuffer || jpegBuffer.length === 0) {
    console.warn(`⚠️ [Camera ${cameraId}] Empty JPEG buffer`);
    return false;
  }

  // Check size (250KB limit)
  if (jpegBuffer.length > 250 * 1024) {
    console.warn(`⚠️ [Camera ${cameraId}] JPEG too large: ${jpegBuffer.length} bytes`);
    return false;
  }

  try {
    // Construct URL with camera query parameter
    const uploadUrl = new URL(`${SITE_URL}/api/camera/upload`);
    uploadUrl.searchParams.set('camera', cameraId);

    // Use fetch with binary body
    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'Authorization': `Bearer ${INGEST_SECRET}`,
        'x-ts': (timestamp || now).toString(),
      },
      body: jpegBuffer, // Direct binary Buffer
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      
      if (response.status === 429) {
        // Rate limited - expected, don't log as error
        console.debug(`⏳ [Camera ${cameraId}] Rate limited (throttling)`);
        return false;
      }

      console.error(`❌ [Camera ${cameraId}] Upload failed:`, response.status, errorText);
      return false;
    }

    const result = await response.json();
    if (result.ok) {
      lastUploadTime[cameraId] = now;
      return true;
    } else {
      console.error(`❌ [Camera ${cameraId}] Upload failed:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Camera ${cameraId}] Upload error:`, error.message);
    return false;
  }
}

/**
 * Example: How to integrate with FFmpeg frame extraction
 * 
 * Your FFmpeg extraction code should:
 * 1. Parse JPEG frames from MJPEG stream (JPEG marker detection)
 * 2. Call pushVideoToWebsiteAPI with the JPEG Buffer
 * 
 * Example integration:
 */
function onFFmpegFrameExtracted(cameraId, jpegBuffer) {
  // jpegBuffer is a Node.js Buffer containing raw JPEG data
  // No base64 encoding needed - send binary directly
  
  const timestamp = Date.now();
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, timestamp).catch((err) => {
    console.error(`[Camera ${cameraId}] Frame upload promise rejected:`, err);
  });
}

/**
 * Example: FFmpeg MJPEG stream parser
 * 
 * This shows how to extract individual JPEG frames from FFmpeg's MJPEG stdout
 * Each frame starts with JPEG marker 0xFF 0xD8 and ends with 0xFF 0xD9
 */
class MJPEGParser {
  constructor(cameraId, onFrame) {
    this.cameraId = cameraId;
    this.onFrame = onFrame;
    this.buffer = Buffer.alloc(0);
    this.frameStart = -1;
  }

  append(data) {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (true) {
      // Find JPEG start marker (0xFF 0xD8)
      if (this.frameStart === -1) {
        this.frameStart = this.buffer.indexOf(Buffer.from([0xFF, 0xD8]));
        if (this.frameStart === -1) {
          // No start marker, keep waiting
          if (this.buffer.length > 1024 * 1024) {
            // Buffer too large, reset
            this.buffer = Buffer.alloc(0);
          }
          break;
        }
      }

      // Find JPEG end marker (0xFF 0xD9)
      const endMarker = this.buffer.indexOf(Buffer.from([0xFF, 0xD9]), this.frameStart + 2);
      if (endMarker === -1) {
        // End marker not found yet, keep waiting
        break;
      }

      // Extract complete JPEG frame
      const frameLength = endMarker + 2 - this.frameStart;
      const jpegFrame = this.buffer.slice(this.frameStart, endMarker + 2);

      // Call callback with frame
      this.onFrame(this.cameraId, jpegFrame);

      // Remove processed frame from buffer
      this.buffer = this.buffer.slice(endMarker + 2);
      this.frameStart = -1;
    }
  }

  reset() {
    this.buffer = Buffer.alloc(0);
    this.frameStart = -1;
  }
}

/**
 * Example: Using with FFmpeg process
 */
function setupCameraStream(cameraId, rtspUrl) {
  const { spawn } = require('child_process');
  
  const parser = new MJPEGParser(cameraId, pushVideoToWebsiteAPI);

  const ffmpeg = spawn('ffmpeg', [
    '-i', rtspUrl,
    '-f', 'mjpeg',
    '-r', '25', // Capture at 25 fps
    '-s', '1600x1200',
    '-q:v', '5',
    '-', // Output to stdout
  ]);

  ffmpeg.stdout.on('data', (data) => {
    parser.append(data);
  });

  ffmpeg.stderr.on('data', (data) => {
    // FFmpeg logs to stderr
    // console.debug(`[FFmpeg ${cameraId}]`, data.toString());
  });

  ffmpeg.on('error', (error) => {
    console.error(`❌ [FFmpeg ${cameraId}] Error:`, error);
  });

  ffmpeg.on('close', (code) => {
    console.warn(`⚠️ [FFmpeg ${cameraId}] Process exited with code ${code}`);
  });

  return { ffmpeg, parser };
}

module.exports = {
  pushVideoToWebsiteAPI,
  onFFmpegFrameExtracted,
  MJPEGParser,
  setupCameraStream,
};
