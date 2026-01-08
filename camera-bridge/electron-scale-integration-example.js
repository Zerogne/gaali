/**
 * Example: How to integrate scale bridge into your Electron app
 * 
 * This shows how to integrate the scale bridge alongside your camera bridge
 * in your Electron main.js file.
 */

const { app } = require('electron');
const ScaleBridge = require('./electron-scale-bridge');
const VideoStreamServer = require('./electron-video-stream-server');

// Import your camera SDK wrapper (adjust path as needed)
// const vzlpr = require('./build/Release/vzlpr.node');

let scaleBridge;
let videoStreamServer;

// Initialize when app is ready
app.whenReady().then(async () => {
  try {
    // Step 1: Start video stream server (for cameras)
    videoStreamServer = new VideoStreamServer(3004);
    videoStreamServer.addHealthEndpoint();
    await videoStreamServer.start();
    console.log('✅ Video stream server ready');

    // Step 2: Start scale bridge
    scaleBridge = new ScaleBridge({
      // Scale device TCP server configuration
      scaleHost: process.env.SCALE_HOST || '192.168.1.100',
      scalePort: parseInt(process.env.SCALE_PORT || '4001', 10),
      
      // WebSocket server port (frontend connects here)
      wsPort: parseInt(process.env.SCALE_WS_PORT || '9000', 10),
      
      // Optional: Custom data parsing
      dataEncoding: 'utf8', // or 'ascii', 'latin1', etc.
      dataDelimiter: '\n', // Scale device message delimiter
      parseWeightRegex: null, // Optional: /Weight[:\s]+(\d+\.?\d*)/i
      
      // Optional: Event handlers
      onWeightReceived: (weightData) => {
        console.log(`⚖️ Weight received: ${weightData.weight} ${weightData.unit}`);
        // You can process weight data here, e.g., save to database, trigger actions, etc.
      },
      
      onScaleConnected: () => {
        console.log('✅ Scale device connected');
        // You can update UI, show notification, etc.
      },
      
      onScaleDisconnected: (hadError) => {
        console.log(`⚠️ Scale device disconnected${hadError ? ' (with error)' : ''}`);
        // You can update UI, show warning, etc.
      },
      
      onError: (error) => {
        console.error('❌ Scale bridge error:', error);
        // Handle errors, show notifications, etc.
      }
    });
    
    scaleBridge.addHealthEndpoint();
    await scaleBridge.start();
    console.log('✅ Scale bridge ready');
    
    // Step 3: Connect to cameras and start streaming
    await setupCameraStreams();
    
    // Step 4: Log status periodically (optional)
    setInterval(() => {
      const scaleStatus = scaleBridge.getStatus();
      console.log('📊 Scale bridge status:', scaleStatus);
    }, 30000); // Every 30 seconds
    
  } catch (error) {
    console.error('❌ Failed to initialize bridges:', error);
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
  // ... (same as in electron-integration-example.js)
  
  if (dataType === 0) { // VIDEO
    // Extract and broadcast frame
    // ... (implementation details)
  }
}

// Cleanup on app quit
app.on('before-quit', async () => {
  console.log('👋 Shutting down bridges...');
  
  if (scaleBridge) {
    await scaleBridge.stop();
  }
  
  if (videoStreamServer) {
    await videoStreamServer.stop();
  }
  
  // TODO: Stop all camera streams
  // for (const [cameraId, handles] of cameraHandles.entries()) {
  //   vzlpr.VzLPRClient_StopRealPlay(handles.playHandle);
  //   vzlpr.VzLPRClient_Close(handles.handle);
  // }
});
