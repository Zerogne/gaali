/**
 * Video Stream Server for Electron App
 * 
 * This is a standalone version that can be integrated into your Electron app.
 * It provides the same WebSocket interface as video-stream-server.js but is
 * designed to run inside Electron's main process.
 * 
 * Usage in Electron:
 * const VideoStreamServer = require('./electron-video-stream-server');
 * const server = new VideoStreamServer(3004);
 * await server.start();
 */

const { WebSocketServer } = require('ws');
const http = require('http');

class VideoStreamServer {
  constructor(port = 3004) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.cameraClients = new Map(); // Map<cameraId, Set<WebSocket>>
  }

  /**
   * Start the WebSocket server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer();
        
        this.wss = new WebSocketServer({
          server: this.server,
          verifyClient: (info) => {
            const url = info.req.url || "";
            if (url.startsWith("/video")) {
              console.log(`✅ WebSocket connection attempt: ${url}`);
              return true;
            }
            console.log(`❌ Rejected WebSocket connection: ${url}`);
            return false;
          }
        });

        this.wss.on('connection', (ws, req) => {
          this.handleConnection(ws, req);
        });

        this.server.listen(this.port, '0.0.0.0', () => {
          console.log(`🚀 Video stream server started on port ${this.port}`);
          console.log(`🔌 WebSocket endpoint: ws://localhost:${this.port}/video/{cameraId}`);
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('❌ Video stream server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    // Extract camera ID from URL: /video/camera-1 or /video/camera-2
    let cameraId = 'camera-1';
    try {
      const url = req.url || '';
      const match = url.match(/\/video\/(camera-[12])/);
      if (match) {
        cameraId = match[1];
      } else {
        // Try alternative parsing
        const pathParts = url.split("/").filter(p => p && p !== "video");
        if (pathParts.length > 0) {
          cameraId = pathParts[0];
        }
      }
      
      // Validate camera ID
      if (cameraId !== 'camera-1' && cameraId !== 'camera-2') {
        console.warn(`⚠️ Invalid camera ID: ${cameraId}, defaulting to camera-1`);
        cameraId = 'camera-1';
      }
    } catch (err) {
      console.error('❌ Error parsing camera ID:', err);
    }

    console.log(`✅ WebSocket client connected for camera: ${cameraId} (from URL: ${req.url})`);

    // Add client to camera's client set
    if (!this.cameraClients.has(cameraId)) {
      this.cameraClients.set(cameraId, new Set());
    }
    this.cameraClients.get(cameraId).add(ws);

    // Send connection confirmation
    try {
      ws.send(JSON.stringify({
        type: 'connected',
        cameraId,
        message: 'Video stream connected',
        timestamp: new Date().toISOString()
      }));
      console.log(`✅ Sent connection confirmation to client for ${cameraId}`);
    } catch (err) {
      console.error(`❌ Error sending connection confirmation:`, err);
    }

    // Handle disconnect
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket client disconnected for camera: ${cameraId} (code: ${code}, reason: ${reason || 'none'})`);
      const clients = this.cameraClients.get(cameraId);
      if (clients) {
        clients.delete(ws);
        console.log(`📊 Remaining clients for ${cameraId}: ${clients.size}`);
      }
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for camera ${cameraId}:`, error);
      const clients = this.cameraClients.get(cameraId);
      if (clients) {
        clients.delete(ws);
      }
    });

    ws.on('message', (message) => {
      // Handle any messages from clients if needed
      console.log(`📨 Received message from ${cameraId}:`, message.toString().substring(0, 100));
    });
  }

  /**
   * Broadcast video frame to all clients for a camera
   * @param {string} cameraId - Camera ID (e.g., 'camera-1')
   * @param {string} frameData - Base64 encoded JPEG frame
   */
  broadcastFrame(cameraId, frameData) {
    const clients = this.cameraClients.get(cameraId);
    if (!clients || clients.size === 0) {
      return; // No clients connected, skip
    }

    const message = JSON.stringify({
      type: 'frame',
      data: frameData, // Base64 encoded JPEG
      timestamp: Date.now()
    });

    let sentCount = 0;
    let errorCount = 0;
    
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          console.error(`Error sending frame to client:`, error);
          clients.delete(client);
          errorCount++;
        }
      } else {
        // Client not open, remove it
        clients.delete(client);
      }
    });

    // Optional: Log frame sending (can be verbose, comment out in production)
    // if (sentCount > 0) {
    //   console.log(`📹 Sent frame to ${sentCount} client(s) for ${cameraId}`);
    // }
  }

  /**
   * Get number of connected clients for a camera
   */
  getClientCount(cameraId) {
    return this.cameraClients.get(cameraId)?.size || 0;
  }

  /**
   * Get total number of connected clients across all cameras
   */
  getTotalClientCount() {
    let total = 0;
    for (const clients of this.cameraClients.values()) {
      total += clients.size;
    }
    return total;
  }

  /**
   * Stop the server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        // Close all client connections
        for (const clients of this.cameraClients.values()) {
          clients.forEach((client) => {
            if (client.readyState === 1) {
              client.close();
            }
          });
        }
        this.cameraClients.clear();

        // Close WebSocket server
        this.wss.close(() => {
          console.log('🔌 WebSocket server closed');
          if (this.server) {
            this.server.close(() => {
              console.log('🔌 HTTP server closed');
              resolve();
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Health check endpoint (optional - add HTTP endpoint if needed)
   */
  addHealthEndpoint() {
    if (!this.server) return;

    this.server.on('request', (req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        const health = {
          status: 'ok',
          port: this.port,
          cameras: {}
        };

        for (const [cameraId, clients] of this.cameraClients.entries()) {
          health.cameras[cameraId] = {
            clients: clients.size
          };
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
      }
    });
  }
}

module.exports = VideoStreamServer;

// If running directly (for testing)
if (require.main === module) {
  const server = new VideoStreamServer(3004);
  server.addHealthEndpoint();
  server.start().then(() => {
    console.log('✅ Server started. Test with: curl http://localhost:3004/health');
  }).catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

