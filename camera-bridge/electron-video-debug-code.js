/**
 * Enhanced Debugging Code for Video Streaming
 * 
 * Copy these functions into your Electron main.js to debug video streaming issues
 */

/**
 * Enhanced onVideoFrame with detailed logging
 * Replace your existing onVideoFrame function with this
 */
function onVideoFrame(cameraId, dataType, dataInfo) {
  const clientCount = videoStreamServer.getClientCount(cameraId);
  
  // Log every frame received (can be verbose - comment out after debugging)
  console.log(`📹 [${cameraId}] Frame received:`, {
    dataType: dataType,
    format: dataInfo?.format,
    formatType: typeof dataInfo?.format,
    hasBuffer: !!dataInfo?.buffer,
    bufferType: dataInfo?.buffer?.constructor?.name,
    bufferLength: dataInfo?.buffer?.length,
    clients: clientCount,
    timestamp: new Date().toISOString()
  });

  // Check if clients are connected
  if (clientCount === 0) {
    // Only log this occasionally to avoid spam
    if (Math.random() < 0.01) { // 1% of the time
      console.log(`⚠️ [${cameraId}] No WebSocket clients connected, skipping frame`);
    }
    return;
  }

  // Process video frame
  if (dataType === 0) { // VIDEO frame
    try {
      let frameBase64 = null;

      // Check frame format
      const format = dataInfo.format;
      console.log(`📊 [${cameraId}] Processing frame, format: ${format} (type: ${typeof format})`);

      // Handle different format types
      if (format === 'JPEG' || format === 1 || format === 'MJPEG' || format === 'jpeg') {
        // Frame is already JPEG
        const buffer = Buffer.from(dataInfo.buffer);
        frameBase64 = buffer.toString('base64');
        console.log(`✅ [${cameraId}] Converted JPEG frame to base64, size: ${frameBase64.length} chars`);
      } 
      else if (format === 'YUV420' || format === 'I420' || format === 'YUV') {
        // Raw YUV frame - needs conversion
        console.warn(`⚠️ [${cameraId}] YUV format detected - conversion needed`);
        // TODO: Implement YUV to JPEG conversion
        // frameBase64 = convertYUVToJPEG(dataInfo);
        return;
      }
      else if (format === 'RGB24' || format === 'RGB') {
        // Raw RGB frame - needs conversion
        console.warn(`⚠️ [${cameraId}] RGB format detected - conversion needed`);
        // TODO: Implement RGB to JPEG conversion
        // frameBase64 = convertRGBToJPEG(dataInfo);
        return;
      }
      else {
        // Unknown format
        console.warn(`⚠️ [${cameraId}] Unknown/unsupported format: ${format} (${typeof format})`);
        console.warn(`   Available properties:`, Object.keys(dataInfo));
        
        // Try to extract buffer anyway
        if (dataInfo.buffer) {
          try {
            const buffer = Buffer.from(dataInfo.buffer);
            frameBase64 = buffer.toString('base64');
            console.log(`   ⚠️ Attempting to use buffer directly, size: ${frameBase64.length} chars`);
          } catch (err) {
            console.error(`   ❌ Failed to convert buffer:`, err);
            return;
          }
        } else {
          return;
        }
      }

      // Broadcast frame
      if (frameBase64 && frameBase64.length > 0) {
        videoStreamServer.broadcastFrame(cameraId, frameBase64);
        
        // Log occasionally (every 30 frames to avoid spam)
        if (Math.random() < 0.033) {
          console.log(`📤 [${cameraId}] Broadcasted frame to ${clientCount} client(s), size: ${frameBase64.length} chars`);
        }
      } else {
        console.warn(`⚠️ [${cameraId}] Frame base64 is empty or invalid`);
      }
      
    } catch (error) {
      console.error(`❌ [${cameraId}] Error processing video frame:`, error);
      console.error(`   Error stack:`, error.stack);
    }
  } else {
    // Non-video data type
    if (Math.random() < 0.1) { // Log 10% of non-video frames
      console.log(`ℹ️ [${cameraId}] Non-video data type: ${dataType}`);
    }
  }
}

/**
 * Enhanced camera setup with detailed logging
 */
async function startCameraStream(camera) {
  console.log(`📹 [${camera.id}] Starting video stream...`);
  console.log(`   IP: ${camera.ip}:${camera.port}`);
  console.log(`   Username: ${camera.username}`);

  try {
    // Step 1: Open camera connection
    console.log(`   Step 1: Opening camera connection...`);
    const handle = vzlpr.VzLPRClient_Open(
      camera.ip,
      camera.port,
      camera.username,
      camera.password
    );
    
    console.log(`   Handle returned: ${handle} (type: ${typeof handle})`);
    
    if (handle === -1 || handle === null || handle === undefined) {
      throw new Error(`Failed to connect to ${camera.id} - handle is invalid`);
    }
    
    console.log(`✅ [${camera.id}] Camera connected, handle: ${handle}`);

    // Step 2: Set up video data callback
    console.log(`   Step 2: Setting video data callback...`);
    const callback = (handle, userData, dataType, dataInfo) => {
      // Log first few callbacks to verify it's working
      if (Math.random() < 0.1) {
        console.log(`📞 [${camera.id}] Callback called!`, {
          handle,
          dataType,
          hasDataInfo: !!dataInfo
        });
      }
      onVideoFrame(camera.id, dataType, dataInfo);
    };
    
    vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);
    console.log(`✅ [${camera.id}] Video callback set`);

    // Step 3: Start real-time playback
    console.log(`   Step 3: Starting real-time playback...`);
    const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
    
    console.log(`   Play handle returned: ${playHandle} (type: ${typeof playHandle})`);
    
    if (playHandle === -1 || playHandle === null || playHandle === undefined) {
      vzlpr.VzLPRClient_Close(handle);
      throw new Error(`Failed to start playback for ${camera.id} - playHandle is invalid`);
    }

    // Store handles
    cameraHandles.set(camera.id, { 
      handle, 
      playHandle,
      ip: camera.ip,
      port: camera.port
    });

    console.log(`✅ [${camera.id}] Video stream started successfully!`);
    console.log(`   Handle: ${handle}, PlayHandle: ${playHandle}`);
    
    // Wait a bit and check if frames are coming
    setTimeout(() => {
      const clientCount = videoStreamServer.getClientCount(camera.id);
      console.log(`📊 [${camera.id}] Status check: ${clientCount} WebSocket client(s) connected`);
    }, 2000);
    
  } catch (error) {
    console.error(`❌ [${camera.id}] Error starting camera stream:`, error);
    console.error(`   Error stack:`, error.stack);
    throw error;
  }
}

/**
 * Test function to send a test frame
 * Call this manually to test if WebSocket and frontend are working
 */
function sendTestFrame(cameraId) {
  // Create a minimal valid JPEG (1x1 red pixel)
  // This is a valid base64-encoded JPEG
  const testFrame = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  
  console.log(`🧪 Sending test frame to ${cameraId}...`);
  videoStreamServer.broadcastFrame(cameraId, testFrame);
  console.log(`✅ Test frame sent`);
}

/**
 * Monitor frame rate
 */
let frameCounts = new Map();
let lastLogTime = Date.now();

function logFrameStats() {
  const now = Date.now();
  const elapsed = (now - lastLogTime) / 1000; // seconds
  
  console.log('\n📊 Frame Statistics (last ' + elapsed.toFixed(1) + 's):');
  for (const [cameraId, count] of frameCounts.entries()) {
    const fps = (count / elapsed).toFixed(1);
    console.log(`   ${cameraId}: ${count} frames (${fps} FPS)`);
    frameCounts.set(cameraId, 0);
  }
  
  lastLogTime = now;
}

// Call this in onVideoFrame to track frame rate:
// frameCounts.set(cameraId, (frameCounts.get(cameraId) || 0) + 1);

// Log stats every 10 seconds:
// setInterval(logFrameStats, 10000);

module.exports = {
  onVideoFrame,
  startCameraStream,
  sendTestFrame,
  logFrameStats
};
