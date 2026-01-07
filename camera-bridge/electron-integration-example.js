/**
 * Example: How to integrate video streaming into your Electron app
 * 
 * This shows the minimal code needed in your Electron main.js
 */

const { app } = require('electron');
const VideoStreamServer = require('./electron-video-stream-server');

// Import your VzLPRClient SDK wrapper (adjust path as needed)
// const vzlpr = require('./build/Release/vzlpr.node');

let videoStreamServer;

// Initialize when app is ready
app.whenReady().then(async () => {
  try {
    // Step 1: Start WebSocket server
    videoStreamServer = new VideoStreamServer(3004);
    videoStreamServer.addHealthEndpoint(); // Optional: adds /health endpoint
    await videoStreamServer.start();
    console.log('✅ Video stream server ready');

    // Step 2: Connect to cameras and start streaming
    // This is where you'd use your VzLPRClient SDK
    await setupCameraStreams();
    
  } catch (error) {
    console.error('❌ Failed to initialize video streaming:', error);
  }
});

/**
 * Setup camera streams using VzLPRClient SDK
 */
async function setupCameraStreams() {
  // Camera configuration
  const cameras = [
    {
      id: 'camera-1',
      ip: process.env.CAMERA_1_IP || '192.168.1.50',
      port: process.env.CAMERA_1_PORT || 8000,
      username: process.env.CAMERA_1_USERNAME || 'admin',
      password: process.env.CAMERA_1_PASSWORD || 'admin'
    },
    {
      id: 'camera-2',
      ip: process.env.CAMERA_2_IP || '192.168.1.49',
      port: process.env.CAMERA_2_PORT || 8000,
      username: process.env.CAMERA_2_USERNAME || 'admin',
      password: process.env.CAMERA_2_PASSWORD || 'admin'
    }
  ];

  for (const camera of cameras) {
    try {
      await startCameraStream(camera);
    } catch (error) {
      console.error(`❌ Failed to start stream for ${camera.id}:`, error);
    }
  }
}

/**
 * Start video stream for a camera
 */
async function startCameraStream(camera) {
  console.log(`📹 Starting video stream for ${camera.id}...`);

  // TODO: Replace with actual VzLPRClient SDK calls
  // Example:
  // 
  // 1. Open camera connection
  // const handle = vzlpr.VzLPRClient_Open(
  //   camera.ip,
  //   camera.port,
  //   camera.username,
  //   camera.password
  // );
  // 
  // if (handle === -1) {
  //   throw new Error(`Failed to connect to ${camera.id}`);
  // }
  //
  // 2. Set up video data callback
  // const callback = (handle, userData, dataType, dataInfo) => {
  //   onVideoFrame(camera.id, dataType, dataInfo);
  // };
  // vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);
  //
  // 3. Start real-time playback
  // const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
  // if (playHandle === -1) {
  //   throw new Error(`Failed to start playback for ${camera.id}`);
  // }
  //
  // Store handles for cleanup later
  // cameraHandles.set(camera.id, { handle, playHandle });

  console.log(`✅ Video stream started for ${camera.id}`);
}

/**
 * Handle video frame from SDK callback
 */
function onVideoFrame(cameraId, dataType, dataInfo) {
  // Check if there are any WebSocket clients
  if (videoStreamServer.getClientCount(cameraId) === 0) {
    return; // No clients, skip processing
  }

  // Process video frame
  // dataType: VZ_LPRC_DATA_TYPE enum (0 = VIDEO, 1 = ALARM, etc.)
  if (dataType === 0) { // VIDEO
    // Extract frame data
    // The structure depends on your SDK wrapper, but typically:
    // - dataInfo.buffer: frame buffer
    // - dataInfo.width: frame width
    // - dataInfo.height: frame height
    // - dataInfo.format: frame format

    let frameBase64 = null;

    // If frame is already JPEG
    if (dataInfo.format === 'JPEG' || dataInfo.format === 1) {
      frameBase64 = Buffer.from(dataInfo.buffer).toString('base64');
    }
    // If frame is raw, convert to JPEG
    else {
      // Use image processing library to convert
      // frameBase64 = convertFrameToJPEG(dataInfo);
    }

    // Broadcast to WebSocket clients
    if (frameBase64) {
      videoStreamServer.broadcastFrame(cameraId, frameBase64);
    }
  }
}

// Cleanup on app quit
app.on('before-quit', async () => {
  if (videoStreamServer) {
    await videoStreamServer.stop();
  }
  
  // TODO: Stop all camera streams
  // for (const [cameraId, handles] of cameraHandles.entries()) {
  //   vzlpr.VzLPRClient_StopRealPlay(handles.playHandle);
  //   vzlpr.VzLPRClient_Close(handles.handle);
  // }
});

