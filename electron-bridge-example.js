/**
 * Electron App - RTSP to WebSocket Bridge
 * 
 * This code should be added to your Electron app's main process
 * It converts RTSP streams (port 8557) to WebSocket streams for the Next.js site
 * 
 * Install dependencies:
 *   npm install node-rtsp-stream ws
 */

const Stream = require('node-rtsp-stream');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

// Configuration - get from your Electron app's config or database
const CAMERA_CONFIG = {
  '1': {
    rtspUrl: 'rtsp://192.168.1.50:8557/h264', // Camera 1 RTSP URL
    port: 9999, // WebSocket port for camera 1
  },
  '2': {
    rtspUrl: 'rtsp://192.168.1.49:8557/h264', // Camera 2 RTSP URL
    port: 10000, // WebSocket port for camera 2
  },
};

// Store active streams
const streams = new Map();

/**
 * Create RTSP stream and WebSocket server for a camera
 */
function createCameraBridge(cameraId, config) {
  const { rtspUrl, port } = config;

  console.log(`📹 [Camera ${cameraId}] Setting up bridge: ${rtspUrl} → ws://localhost:${port}/camera/${cameraId}`);

  // Create HTTP server for WebSocket upgrade
  const server = createServer();
  const wss = new WebSocketServer({ 
    server, 
    path: `/camera/${cameraId}` 
  });

  // Create RTSP stream with FFmpeg conversion
  const stream = new Stream({
    name: `camera-${cameraId}`,
    streamUrl: rtspUrl,
    wsPort: 0, // We'll handle WebSocket ourselves
    ffmpegOptions: {
      '-stats': '',
      '-r': 30, // 30 fps
      '-s': '1280x720', // Resolution (adjust as needed)
      '-b:v': '2000k', // Bitrate
      '-f': 'mpegts', // Output format (MPEG-TS for JSMpeg)
      '-codec:v': 'mpeg1video', // Video codec
      '-codec:a': 'mp2', // Audio codec (optional)
      '-bf': '0', // No B-frames
      '-g': '50', // GOP size
    }
  });

  // Bridge RTSP stream data to WebSocket clients
  // node-rtsp-stream emits data events with MPEG-TS chunks
  stream.on('data', (data) => {
    // Forward data to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(data);
        } catch (error) {
          console.error(`❌ [Camera ${cameraId}] Error sending to client:`, error);
        }
      }
    });
  });

  stream.on('error', (error) => {
    console.error(`❌ [Camera ${cameraId}] RTSP stream error:`, error);
  });

  // Start WebSocket server
  server.listen(port, () => {
    console.log(`✅ [Camera ${cameraId}] WebSocket server ready on ws://localhost:${port}/camera/${cameraId}`);
  });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log(`🔌 [Camera ${cameraId}] Client connected`);
    
    ws.on('close', () => {
      console.log(`🔌 [Camera ${cameraId}] Client disconnected`);
    });

    ws.on('error', (error) => {
      console.error(`❌ [Camera ${cameraId}] WebSocket error:`, error);
    });
  });

  // Store stream info
  streams.set(cameraId, { stream, wss, server });

  return { stream, wss, server, port };
}

/**
 * Stop camera bridge
 */
function stopCameraBridge(cameraId) {
  const streamInfo = streams.get(cameraId);
  if (streamInfo) {
    console.log(`🛑 [Camera ${cameraId}] Stopping bridge...`);
    streamInfo.stream.stop();
    streamInfo.server.close();
    streams.delete(cameraId);
  }
}

/**
 * Initialize all camera bridges
 */
function initializeBridges() {
  console.log('🌉 Initializing Electron Camera Bridge...');
  
  Object.entries(CAMERA_CONFIG).forEach(([cameraId, config]) => {
    try {
      createCameraBridge(cameraId, config);
    } catch (error) {
      console.error(`❌ Failed to create bridge for camera ${cameraId}:`, error);
    }
  });

  console.log('✅ Electron Camera Bridge initialized');
  console.log('   Camera 1: ws://localhost:9999/camera/1');
  console.log('   Camera 2: ws://localhost:10000/camera/2');
}

/**
 * Cleanup on app exit
 */
function cleanup() {
  console.log('🧹 Cleaning up camera bridges...');
  streams.forEach((streamInfo, cameraId) => {
    stopCameraBridge(cameraId);
  });
}

// Export for use in Electron app
module.exports = {
  initializeBridges,
  stopCameraBridge,
  cleanup,
  createCameraBridge,
};

// If running standalone (for testing)
if (require.main === module) {
  initializeBridges();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}
