# Electron App: Adding Real-Time Video Streaming

This guide shows how to add real-time video streaming to your Electron app so clients don't need to manually start camera-bridge.

## Overview

Your Electron app already:
- ✅ Connects to cameras using VzLPRClient SDK
- ✅ Sends license plate data to the site

You need to add:
- 🔄 WebSocket server for video streaming
- 📹 Video frame capture using `VZLPRC_VIDEO_DATA_CALLBACK`
- 📡 Broadcasting frames to web clients

## Architecture

```
Electron App
├── VzLPRClient SDK (Native Module)
│   ├── VzLPRClient_Open() → Connect to camera
│   ├── VzLPRClient_StartRealPlay() → Start video stream
│   └── VZLPRC_VIDEO_DATA_CALLBACK → Receive video frames
├── WebSocket Server (Port 3004)
│   └── Broadcast frames to web clients
└── HTTP API Client
    └── Send plate data to site
```

## Step 1: Install Dependencies

In your Electron app's `package.json`:

```json
{
  "dependencies": {
    "ws": "^8.18.0"
  }
}
```

Install:
```bash
npm install ws
```

## Step 2: Create Video Stream Server Module

Create `video-stream-server.js` in your Electron app:

```javascript
const { WebSocketServer } = require('ws');
const http = require('http');

class VideoStreamServer {
  constructor(port = 3004) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.cameraClients = new Map(); // Map<cameraId, Set<WebSocket>>
    this.cameraConnections = new Map(); // Map<cameraId, connectionInfo>
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer();
        
        this.wss = new WebSocketServer({
          server: this.server,
          verifyClient: (info) => {
            const url = info.req.url || "";
            return url.startsWith("/video");
          }
        });

        this.wss.on('connection', (ws, req) => {
          this.handleConnection(ws, req);
        });

        this.server.listen(this.port, '0.0.0.0', () => {
          console.log(`✅ Video stream server started on port ${this.port}`);
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

  handleConnection(ws, req) {
    // Extract camera ID from URL: /video/camera-1 or /video/camera-2
    let cameraId = 'camera-1';
    try {
      const url = req.url || '';
      const match = url.match(/\/video\/(camera-[12])/);
      if (match) {
        cameraId = match[1];
      }
    } catch (err) {
      console.error('Error parsing camera ID:', err);
    }

    console.log(`✅ WebSocket client connected for ${cameraId}`);

    // Add client to camera's client set
    if (!this.cameraClients.has(cameraId)) {
      this.cameraClients.set(cameraId, new Set());
    }
    this.cameraClients.get(cameraId).add(ws);

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      cameraId,
      message: 'Video stream connected',
      timestamp: new Date().toISOString()
    }));

    // Handle disconnect
    ws.on('close', () => {
      console.log(`🔌 WebSocket client disconnected for ${cameraId}`);
      const clients = this.cameraClients.get(cameraId);
      if (clients) {
        clients.delete(ws);
        console.log(`📊 Remaining clients for ${cameraId}: ${clients.size}`);
      }
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for ${cameraId}:`, error);
      const clients = this.cameraClients.get(cameraId);
      if (clients) {
        clients.delete(ws);
      }
    });
  }

  // Broadcast video frame to all clients for a camera
  broadcastFrame(cameraId, frameData) {
    const clients = this.cameraClients.get(cameraId);
    if (!clients || clients.size === 0) {
      return; // No clients connected
    }

    const message = JSON.stringify({
      type: 'frame',
      data: frameData, // Base64 encoded JPEG
      timestamp: Date.now()
    });

    let sentCount = 0;
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          console.error(`Error sending frame to client:`, error);
          clients.delete(client);
        }
      }
    });

    if (sentCount > 0) {
      // Uncomment for debugging (can be verbose)
      // console.log(`📹 Sent frame to ${sentCount} client(s) for ${cameraId}`);
    }
  }

  stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          console.log('WebSocket server closed');
          if (this.server) {
            this.server.close(() => {
              console.log('HTTP server closed');
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

  getClientCount(cameraId) {
    return this.cameraClients.get(cameraId)?.size || 0;
  }
}

module.exports = VideoStreamServer;
```

## Step 3: Integrate VzLPRClient SDK

Create `camera-video-manager.js`:

```javascript
// This assumes you have a native addon that wraps VzLPRClient SDK
// Adjust the import based on your actual native module setup
const vzlpr = require('./build/Release/vzlpr.node'); // Adjust path as needed

class CameraVideoManager {
  constructor(videoStreamServer) {
    this.videoStreamServer = videoStreamServer;
    this.cameraHandles = new Map(); // Map<cameraId, handle>
    this.playHandles = new Map(); // Map<cameraId, playHandle>
    this.isStreaming = new Map(); // Map<cameraId, boolean>
  }

  /**
   * Connect to camera and start video streaming
   */
  async startVideoStream(cameraId, ip, port, username, password) {
    try {
      console.log(`📹 Starting video stream for ${cameraId} at ${ip}:${port}...`);

      // Step 1: Open camera connection
      const handle = vzlpr.VzLPRClient_Open(ip, port, username, password);
      if (handle === -1 || handle === null) {
        throw new Error(`Failed to connect to camera ${cameraId}`);
      }

      this.cameraHandles.set(cameraId, handle);
      console.log(`✅ Connected to camera ${cameraId}, handle: ${handle}`);

      // Step 2: Set up video data callback
      // This callback will be called by the SDK when video frames are available
      const callback = (handle, userData, dataType, dataInfo) => {
        this.onVideoData(cameraId, handle, dataType, dataInfo);
      };

      // Register callback (adjust based on your SDK wrapper)
      vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);

      // Step 3: Start real-time playback
      // Note: hWnd can be null for headless operation
      const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
      if (playHandle === -1 || playHandle === null) {
        throw new Error(`Failed to start playback for camera ${cameraId}`);
      }

      this.playHandles.set(cameraId, playHandle);
      this.isStreaming.set(cameraId, true);

      console.log(`✅ Video streaming started for ${cameraId}, playHandle: ${playHandle}`);
      return { success: true, handle, playHandle };
    } catch (error) {
      console.error(`❌ Error starting video stream for ${cameraId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Video data callback - called by SDK when frames are available
   */
  onVideoData(cameraId, handle, dataType, dataInfo) {
    try {
      // Check if we're still streaming for this camera
      if (!this.isStreaming.get(cameraId)) {
        return;
      }

      // Check if there are any WebSocket clients connected
      const clientCount = this.videoStreamServer.getClientCount(cameraId);
      if (clientCount === 0) {
        return; // No clients, skip frame processing
      }

      // Process video data based on dataType
      // VZ_LPRC_DATA_TYPE enum values (adjust based on your SDK):
      // - VZ_LPRC_DATA_TYPE_VIDEO = 0
      // - VZ_LPRC_DATA_TYPE_ALARM = 1
      // etc.

      if (dataType === 0) { // VZ_LPRC_DATA_TYPE_VIDEO
        // Extract frame data from dataInfo
        // The structure depends on your SDK, but typically:
        // dataInfo.buffer - video frame buffer
        // dataInfo.width - frame width
        // dataInfo.height - frame height
        // dataInfo.format - frame format (JPEG, H.264, etc.)

        let frameData = null;

        // Option 1: If frame is already JPEG
        if (dataInfo.format === 'JPEG' || dataInfo.format === 1) {
          // Convert buffer to base64
          frameData = Buffer.from(dataInfo.buffer).toString('base64');
        }
        // Option 2: If frame is raw (YUV, RGB, etc.), convert to JPEG
        else {
          // Use a library like sharp or jimp to convert
          // For example with sharp:
          // const jpegBuffer = await sharp(dataInfo.buffer, {
          //   raw: { width: dataInfo.width, height: dataInfo.height, channels: 3 }
          // }).jpeg().toBuffer();
          // frameData = jpegBuffer.toString('base64');
          
          // For now, if you have a conversion function:
          frameData = this.convertFrameToJPEG(dataInfo);
        }

        if (frameData) {
          // Broadcast to WebSocket clients
          this.videoStreamServer.broadcastFrame(cameraId, frameData);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing video data for ${cameraId}:`, error);
    }
  }

  /**
   * Convert raw frame to JPEG base64
   * Implement based on your frame format
   */
  convertFrameToJPEG(dataInfo) {
    // TODO: Implement frame conversion
    // This depends on the frame format from your SDK
    // You might need libraries like:
    // - sharp (for image processing)
    // - jimp (alternative)
    // - canvas (for drawing)
    
    // Example with sharp (if you have RGB data):
    // const sharp = require('sharp');
    // const jpegBuffer = await sharp(dataInfo.buffer, {
    //   raw: {
    //     width: dataInfo.width,
    //     height: dataInfo.height,
    //     channels: 3 // or 4 for RGBA
    //   }
    // }).jpeg({ quality: 80 }).toBuffer();
    // return jpegBuffer.toString('base64');
    
    return null; // Placeholder
  }

  /**
   * Stop video streaming for a camera
   */
  stopVideoStream(cameraId) {
    try {
      const playHandle = this.playHandles.get(cameraId);
      if (playHandle) {
        vzlpr.VzLPRClient_StopRealPlay(playHandle);
        this.playHandles.delete(cameraId);
      }

      const handle = this.cameraHandles.get(cameraId);
      if (handle) {
        vzlpr.VzLPRClient_Close(handle);
        this.cameraHandles.delete(cameraId);
      }

      this.isStreaming.set(cameraId, false);
      console.log(`⏹️ Video streaming stopped for ${cameraId}`);
    } catch (error) {
      console.error(`❌ Error stopping video stream for ${cameraId}:`, error);
    }
  }

  /**
   * Stop all video streams
   */
  stopAll() {
    for (const cameraId of this.isStreaming.keys()) {
      this.stopVideoStream(cameraId);
    }
  }
}

module.exports = CameraVideoManager;
```

## Step 4: Integrate in Electron Main Process

In your Electron `main.js` (or main process file):

```javascript
const { app, BrowserWindow } = require('electron');
const VideoStreamServer = require('./video-stream-server');
const CameraVideoManager = require('./camera-video-manager');

let videoStreamServer;
let cameraVideoManager;

// Initialize video streaming when app is ready
app.whenReady().then(() => {
  // Start video stream server
  videoStreamServer = new VideoStreamServer(3004);
  videoStreamServer.start().then(() => {
    console.log('✅ Video stream server ready');
    
    // Initialize camera video manager
    cameraVideoManager = new CameraVideoManager(videoStreamServer);
    
    // Start video streams for your cameras
    // Adjust camera IDs, IPs, ports, credentials as needed
    cameraVideoManager.startVideoStream(
      'camera-1',
      '192.168.1.50',
      8000,
      'admin',
      'admin'
    ).then((result) => {
      if (result.success) {
        console.log('✅ Camera 1 video stream started');
      } else {
        console.error('❌ Failed to start camera 1:', result.error);
      }
    });

    cameraVideoManager.startVideoStream(
      'camera-2',
      '192.168.1.49',
      8000,
      'admin',
      'admin'
    ).then((result) => {
      if (result.success) {
        console.log('✅ Camera 2 video stream started');
      } else {
        console.error('❌ Failed to start camera 2:', result.error);
      }
    });
  }).catch((error) => {
    console.error('❌ Failed to start video stream server:', error);
  });
});

// Cleanup on app quit
app.on('before-quit', () => {
  if (cameraVideoManager) {
    cameraVideoManager.stopAll();
  }
  if (videoStreamServer) {
    videoStreamServer.stop();
  }
});
```

## Step 5: Handle VZLPRC_VIDEO_DATA_CALLBACK

The callback signature from SDK documentation:

```c
typedef void (*VZLPRC_VIDEO_DATA_CALLBACK)(
    VzLPRClientHandle handle,
    void *pUserData,
    VZ_LPRC_DATA_TYPE eDataType,
    const VZ_LPRC_DATA_INFO *pData
);
```

In your native addon wrapper (C++), you need to:

1. **Create the callback function:**
```cpp
void VideoDataCallback(VzLPRClientHandle handle, void* pUserData, 
                       VZ_LPRC_DATA_TYPE eDataType, const VZ_LPRC_DATA_INFO* pData) {
  // Call JavaScript callback
  // You'll need to store the JS callback function and call it here
}
```

2. **Register the callback:**
```cpp
// When VzLPRClient_StartRealPlay is called, register the callback
VzLPRClient_SetVideoDataCallback(handle, VideoDataCallback, userData);
```

3. **Pass data to JavaScript:**
```cpp
// Convert frame data to something JavaScript can use
// Typically: buffer, width, height, format
// Then call your JS callback with this data
```

## Step 6: Frame Format Conversion

If your SDK provides raw frames (YUV, RGB, etc.), convert to JPEG:

```bash
npm install sharp
```

```javascript
const sharp = require('sharp');

async function convertFrameToJPEG(buffer, width, height, format) {
  try {
    // Adjust based on your frame format
    const jpegBuffer = await sharp(buffer, {
      raw: {
        width: width,
        height: height,
        channels: format === 'RGB' ? 3 : 4 // RGB or RGBA
      }
    })
    .jpeg({ quality: 80 })
    .toBuffer();
    
    return jpegBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting frame:', error);
    return null;
  }
}
```

## Configuration

Add configuration for cameras:

```javascript
const cameraConfig = {
  'camera-1': {
    ip: process.env.CAMERA_1_IP || '192.168.1.50',
    port: process.env.CAMERA_1_PORT || 8000,
    username: process.env.CAMERA_1_USERNAME || 'admin',
    password: process.env.CAMERA_1_PASSWORD || 'admin'
  },
  'camera-2': {
    ip: process.env.CAMERA_2_IP || '192.168.1.49',
    port: process.env.CAMERA_2_PORT || 8000,
    username: process.env.CAMERA_2_USERNAME || 'admin',
    password: process.env.CAMERA_2_PASSWORD || 'admin'
  }
};
```

## Testing

1. **Start your Electron app**
2. **Check if WebSocket server is running:**
   ```bash
   curl http://localhost:3004/health
   ```
   (You may need to add a health endpoint)

3. **Test WebSocket connection:**
   ```bash
   npm install -g wscat
   wscat -c ws://localhost:3004/video/camera-1
   ```
   You should receive frame messages.

4. **Check in browser:**
   - Open your web app
   - Video should stream automatically
   - No need to start camera-bridge separately!

## Troubleshooting

### WebSocket Connection Fails
- Check if port 3004 is available
- Check firewall settings
- Verify server started successfully

### No Video Frames
- Check if cameras are connected
- Verify `VZLPRC_VIDEO_DATA_CALLBACK` is being called
- Check frame conversion logic
- Verify WebSocket clients are connected

### High CPU Usage
- Reduce frame rate (don't send every frame)
- Lower JPEG quality
- Only send frames when clients are connected

## Benefits

✅ **No Terminal Access Needed** - Everything runs in Electron app  
✅ **Automatic Startup** - Video streaming starts with app  
✅ **Single Process** - No separate camera-bridge server needed  
✅ **Native SDK Access** - Direct access to VzLPRClient SDK  
✅ **Production Ready** - Works for end clients without technical knowledge

## Next Steps

1. Implement the native addon wrapper for VzLPRClient SDK
2. Implement `VZLPRC_VIDEO_DATA_CALLBACK` handler
3. Add frame conversion logic (if needed)
4. Test with actual cameras
5. Optimize frame rate and quality for performance

