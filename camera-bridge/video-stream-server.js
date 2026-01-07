/**
 * Video Stream Server for VzLPRClient SDK Integration
 * 
 * This server bridges the VzLPRClient SDK (C/C++) with web clients via WebSocket.
 * It handles:
 * - Camera connection via VzLPRClient_Open
 * - Real-time video streaming via VzLPRClient_StartRealPlay
 * - Video frame capture and streaming to web clients
 * 
 * Note: This requires a native addon or separate process that interfaces with VzLPRClient SDK
 */

const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);

// WebSocket server for video streaming
// Don't set path here - we'll handle routing in the connection handler
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info) => {
    // Accept connections to /video/* paths
    const url = info.req.url || "";
    if (url.startsWith("/video")) {
      console.log(`✅ WebSocket connection attempt: ${url}`);
      return true;
    }
    console.log(`❌ Rejected WebSocket connection: ${url}`);
    return false;
  }
});

// Store active camera connections
const cameraConnections = new Map();

// Store WebSocket clients per camera
const cameraClients = new Map();

// Configuration
// Use port 3004 to avoid conflict with server.js (which uses 3001 for plate events)
const PORT = process.env.VIDEO_STREAM_PORT || 3004;
const CAMERA_1_IP = process.env.CAMERA_1_IP || "192.168.1.50";
const CAMERA_1_PORT = process.env.CAMERA_1_PORT || "8000";
const CAMERA_1_USERNAME = process.env.CAMERA_1_USERNAME || "admin";
const CAMERA_1_PASSWORD = process.env.CAMERA_1_PASSWORD || "admin";
const CAMERA_2_IP = process.env.CAMERA_2_IP || "192.168.1.49";
const CAMERA_2_PORT = process.env.CAMERA_2_PORT || "8000";
const CAMERA_2_USERNAME = process.env.CAMERA_2_USERNAME || "admin";
const CAMERA_2_PASSWORD = process.env.CAMERA_2_PASSWORD || "admin";

/**
 * Connect to camera using VzLPRClient SDK
 * This is a placeholder - actual implementation requires native addon
 */
function connectCamera(cameraId, ip, port, username, password) {
  console.log(`Connecting to camera ${cameraId} at ${ip}:${port}...`);
  
  // TODO: Implement actual VzLPRClient SDK calls via native addon
  // const handle = VzLPRClient_Open(ip, port, username, password);
  // if (handle === -1) {
  //   throw new Error(`Failed to connect to camera ${cameraId}`);
  // }
  
  // For now, return a mock handle
  const mockHandle = Math.random().toString(36).substr(2, 9);
  console.log(`Camera ${cameraId} connected with handle: ${mockHandle}`);
  
  return {
    handle: mockHandle,
    cameraId,
    ip,
    port,
    playHandle: null,
    isPlaying: false,
  };
}

/**
 * Start real-time video playback
 */
function startRealPlay(connection) {
  if (connection.isPlaying) {
    console.log(`Camera ${connection.cameraId} is already playing`);
    return;
  }

  console.log(`Starting real-time playback for camera ${connection.cameraId}...`);
  
  // TODO: Implement actual VzLPRClient_StartRealPlay call
  // const playHandle = VzLPRClient_StartRealPlay(connection.handle, null);
  // if (playHandle === -1) {
  //   throw new Error(`Failed to start playback for camera ${connection.cameraId}`);
  // }
  
  // Mock play handle
  const mockPlayHandle = Math.random().toString(36).substr(2, 9);
  connection.playHandle = mockPlayHandle;
  connection.isPlaying = true;
  
  console.log(`Real-time playback started for camera ${connection.cameraId} with handle: ${mockPlayHandle}`);
  
  // Start capturing frames (mock implementation)
  startFrameCapture(connection);
}

/**
 * Stop real-time video playback
 */
function stopRealPlay(connection) {
  if (!connection.isPlaying) {
    return;
  }

  console.log(`Stopping real-time playback for camera ${connection.cameraId}...`);
  
  // TODO: Implement actual VzLPRClient_StopRealPlay call
  // const result = VzLPRClient_StopRealPlay(connection.playHandle);
  // if (result === -1) {
  //   console.error(`Failed to stop playback for camera ${connection.cameraId}`);
  // }
  
  connection.playHandle = null;
  connection.isPlaying = false;
  
  console.log(`Real-time playback stopped for camera ${connection.cameraId}`);
}

/**
 * Start capturing frames and streaming to clients
 * This is a placeholder - actual implementation requires frame capture from SDK
 */
function startFrameCapture(connection) {
  const frameInterval = setInterval(() => {
    if (!connection.isPlaying) {
      clearInterval(frameInterval);
      return;
    }

    // TODO: Capture actual frame from VzLPRClient SDK
    // For now, we'll need to implement this via native addon that:
    // 1. Captures frames from the play handle
    // 2. Converts to base64 or JPEG buffer
    // 3. Sends to this function
    
    // Mock: Generate a placeholder frame
    // In real implementation, this would be:
    // const frame = captureFrameFromSDK(connection.playHandle);
    // broadcastFrameToClients(connection.cameraId, frame);
    
    const clients = cameraClients.get(connection.cameraId) || new Set();
    if (clients.size > 0) {
      // Send mock frame data (in real implementation, this would be actual video frame)
      const mockFrame = {
        type: "frame",
        data: "mock_base64_frame_data", // Replace with actual frame data
        timestamp: Date.now(),
      };
      
      clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          try {
            client.send(JSON.stringify(mockFrame));
          } catch (error) {
            console.error(`Error sending frame to client:`, error);
            clients.delete(client);
          }
        }
      });
    }
  }, 100); // 10 FPS (adjust as needed)
  
  connection.frameInterval = frameInterval;
}

/**
 * Initialize camera connections
 */
function initializeCameras() {
  try {
    // Connect to Camera 1
    const camera1 = connectCamera("camera-1", CAMERA_1_IP, CAMERA_1_PORT, CAMERA_1_USERNAME, CAMERA_1_PASSWORD);
    cameraConnections.set("camera-1", camera1);
    cameraClients.set("camera-1", new Set());
    
    // Connect to Camera 2
    const camera2 = connectCamera("camera-2", CAMERA_2_IP, CAMERA_2_PORT, CAMERA_2_USERNAME, CAMERA_2_PASSWORD);
    cameraConnections.set("camera-2", camera2);
    cameraClients.set("camera-2", new Set());
    
    console.log("Cameras initialized");
  } catch (error) {
    console.error("Error initializing cameras:", error);
  }
}

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  // Extract camera ID from URL path: /video/camera-1 or /video/camera-2
  let cameraId = "camera-1";
  try {
    if (req.url) {
      // req.url format: /video/camera-1 or /video/camera-2
      const urlPath = req.url;
      console.log(`📡 Processing WebSocket connection: ${urlPath}`);
      
      // Extract camera ID from path
      const match = urlPath.match(/\/video\/(camera-[12])/);
      if (match) {
        cameraId = match[1];
      } else {
        // Try alternative parsing
        const pathParts = urlPath.split("/").filter(p => p && p !== "video");
      if (pathParts.length > 0) {
          cameraId = pathParts[0];
        }
      }
      
      // Validate camera ID
      if (cameraId !== "camera-1" && cameraId !== "camera-2") {
        console.warn(`⚠️ Invalid camera ID: ${cameraId}, defaulting to camera-1`);
        cameraId = "camera-1";
      }
    }
  } catch (err) {
    console.error("❌ Error parsing URL:", err);
    // Fallback: try to extract from req.url directly
    if (req.url && req.url.includes("camera-")) {
      const match = req.url.match(/camera-[12]/);
      if (match) {
        cameraId = match[0];
      }
    }
  }
  
  console.log(`✅ WebSocket client connected for camera: ${cameraId} (from URL: ${req.url})`);
  
  // Add client to camera's client set
  if (!cameraClients.has(cameraId)) {
    cameraClients.set(cameraId, new Set());
  }
  cameraClients.get(cameraId).add(ws);
  
  // Get or create camera connection
  let connection = cameraConnections.get(cameraId);
  if (!connection) {
    // Initialize camera connection if not exists
    const config = cameraId === "camera-1" 
      ? { ip: CAMERA_1_IP, port: CAMERA_1_PORT, username: CAMERA_1_USERNAME, password: CAMERA_1_PASSWORD }
      : { ip: CAMERA_2_IP, port: CAMERA_2_PORT, username: CAMERA_2_USERNAME, password: CAMERA_2_PASSWORD };
    
    console.log(`🔌 Initializing camera connection for ${cameraId}...`);
    connection = connectCamera(cameraId, config.ip, config.port, config.username, config.password);
    cameraConnections.set(cameraId, connection);
  }
  
  // Start real-time playback if not already playing
  if (!connection.isPlaying) {
    console.log(`▶️ Starting real-time playback for ${cameraId}...`);
    startRealPlay(connection);
  }
  
  // Send connection confirmation immediately
  try {
  ws.send(JSON.stringify({
    type: "connected",
    cameraId,
    message: "Video stream connected",
      timestamp: new Date().toISOString(),
  }));
    console.log(`✅ Sent connection confirmation to client for ${cameraId}`);
  } catch (err) {
    console.error(`❌ Error sending connection confirmation:`, err);
  }
  
  // Handle client disconnect
  ws.on("close", (code, reason) => {
    console.log(`🔌 WebSocket client disconnected for camera: ${cameraId} (code: ${code}, reason: ${reason || 'none'})`);
    const clients = cameraClients.get(cameraId);
    if (clients) {
      clients.delete(ws);
      console.log(`📊 Remaining clients for ${cameraId}: ${clients.size}`);
      
      // If no clients, stop playback
      if (clients.size === 0) {
        console.log(`⏹️ No clients remaining for ${cameraId}, stopping playback`);
        const conn = cameraConnections.get(cameraId);
        if (conn) {
          stopRealPlay(conn);
        }
      }
    }
  });
  
  ws.on("error", (error) => {
    console.error(`❌ WebSocket error for camera ${cameraId}:`, error);
    const clients = cameraClients.get(cameraId);
    if (clients) {
      clients.delete(ws);
    }
  });
  
  ws.on("message", (message) => {
    console.log(`📨 Received message from ${cameraId}:`, message.toString().substring(0, 100));
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    cameras: Array.from(cameraConnections.keys()).map((id) => {
      const conn = cameraConnections.get(id);
      return {
        id,
        connected: !!conn,
        playing: conn?.isPlaying || false,
        clients: cameraClients.get(id)?.size || 0,
      };
    }),
  });
});

// Initialize cameras on startup
initializeCameras();

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Video stream server running on port ${PORT}`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/video/{cameraId}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📹 Camera 1: ${CAMERA_1_IP}:${CAMERA_1_PORT}`);
  console.log(`📹 Camera 2: ${CAMERA_2_IP}:${CAMERA_2_PORT}`);
  console.log(`\n⚠️  NOTE: This is a placeholder implementation.`);
  console.log(`   To use actual camera SDK, implement VzLPRClient SDK integration.`);
  console.log(`   See documentation for VZLPRC_VIDEO_DATA_CALLBACK and VzLPRClient_StartRealPlay.\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down video stream server...");
  
  // Stop all camera playback
  cameraConnections.forEach((connection) => {
    if (connection.isPlaying) {
      stopRealPlay(connection);
    }
  });
  
  // Close all WebSocket connections
  cameraClients.forEach((clients) => {
    clients.forEach((client) => {
      client.close();
    });
  });
  
  server.close(() => {
    console.log("Video stream server closed");
    process.exit(0);
  });
});

