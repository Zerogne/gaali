# Prompt: Add Real-Time Video Streaming to Electron App

## Task

Add real-time video streaming from cameras to the frontend in your Electron app. The video should stream continuously from cameras (using VzLPRClient SDK or similar) through the Electron main process to the frontend via WebSocket, displaying live video frames in real-time.

## Requirements

### Camera Setup
- Cameras accessible via IP (e.g., `192.168.1.50`, `192.168.1.49`)
- Camera credentials (username/password)
- VzLPRClient SDK or similar camera SDK installed
- Cameras support real-time video streaming

### Integration Requirements
1. **Start WebSocket server** for video streaming (port 3004)
2. **Connect to cameras** using camera SDK (VzLPRClient or similar)
3. **Receive video frames** from camera SDK callbacks
4. **Convert frames to JPEG** (base64 encoded)
5. **Broadcast frames** to frontend via WebSocket in real-time
6. **Handle multiple cameras** (camera-1, camera-2)
7. **Clean up** camera connections on app quit

## Architecture

```
Camera 1 (IP: 192.168.1.50)
    ↓ Camera SDK Callback
Electron Main Process
    ↓ Process Frame → Convert to JPEG → Base64
Video Stream Server (WebSocket)
    ↓ ws://localhost:3004/video/camera-1
Frontend (RealtimeVideo component)
    ↓ Display in <video> element
Live Video Display
```

## Implementation Steps

### Step 1: Install Dependencies

Ensure `ws` is installed in your Electron app:

```bash
npm install ws
```

If using image processing libraries for frame conversion:
```bash
npm install sharp
# or
npm install jimp
# or
npm install canvas
```

### Step 2: Import Required Modules

In your Electron `main.js` (or main process file):

```javascript
const { app, BrowserWindow } = require('electron');
const VideoStreamServer = require('./camera-bridge/electron-video-stream-server');

// Import your camera SDK (adjust path as needed)
// Option 1: VzLPRClient SDK (Node.js addon)
// const vzlpr = require('./build/Release/vzlpr.node');

// Option 2: Other camera SDK
// const cameraSDK = require('your-camera-sdk');

let videoStreamServer;
let cameraHandles = new Map(); // Store camera handles for cleanup
```

### Step 3: Initialize Video Stream Server

In your `app.whenReady()` handler:

```javascript
app.whenReady().then(async () => {
  try {
    // Start WebSocket server for video streaming
    videoStreamServer = new VideoStreamServer(3004);
    videoStreamServer.addHealthEndpoint(); // Optional: adds /health endpoint
    await videoStreamServer.start();
    console.log('✅ Video stream server ready');
    console.log('🔌 WebSocket endpoint: ws://localhost:3004/video/{cameraId}');

    // Connect to cameras and start streaming
    await setupCameraStreams();
    
  } catch (error) {
    console.error('❌ Failed to initialize video streaming:', error);
  }
});
```

### Step 4: Setup Camera Streams

Create function to setup cameras:

```javascript
async function setupCameraStreams() {
  // Camera configuration
  const cameras = [
    {
      id: 'camera-1',
      ip: process.env.CAMERA_1_IP || '192.168.1.50',
      port: parseInt(process.env.CAMERA_1_PORT || '8000', 10),
      username: process.env.CAMERA_1_USERNAME || 'admin',
      password: process.env.CAMERA_1_PASSWORD || 'admin'
    },
    {
      id: 'camera-2',
      ip: process.env.CAMERA_2_IP || '192.168.1.49',
      port: parseInt(process.env.CAMERA_2_PORT || '8000', 10),
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
```

### Step 5: Start Camera Stream (VzLPRClient SDK Example)

Implement camera connection using your SDK:

```javascript
async function startCameraStream(camera) {
  console.log(`📹 Starting video stream for ${camera.id} (${camera.ip}:${camera.port})...`);

  try {
    // Step 1: Open camera connection using SDK
    // Example for VzLPRClient SDK:
    const handle = vzlpr.VzLPRClient_Open(
      camera.ip,
      camera.port,
      camera.username,
      camera.password
    );
    
    if (handle === -1 || handle === null) {
      throw new Error(`Failed to connect to ${camera.id}`);
    }
    
    console.log(`✅ Connected to ${camera.id}, handle: ${handle}`);

    // Step 2: Set up video data callback
    // The callback will be called whenever a video frame is received
    const callback = (handle, userData, dataType, dataInfo) => {
      onVideoFrame(camera.id, dataType, dataInfo);
    };
    
    vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);

    // Step 3: Start real-time playback
    const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
    
    if (playHandle === -1 || playHandle === null) {
      vzlpr.VzLPRClient_Close(handle);
      throw new Error(`Failed to start playback for ${camera.id}`);
    }

    // Store handles for cleanup later
    cameraHandles.set(camera.id, { 
      handle, 
      playHandle,
      ip: camera.ip,
      port: camera.port
    });

    console.log(`✅ Video stream started for ${camera.id}`);
    
  } catch (error) {
    console.error(`❌ Error starting camera stream for ${camera.id}:`, error);
    throw error;
  }
}
```

### Step 6: Process Video Frames

Handle video frames from camera SDK callback:

```javascript
function onVideoFrame(cameraId, dataType, dataInfo) {
  // Check if there are any WebSocket clients for this camera
  if (videoStreamServer.getClientCount(cameraId) === 0) {
    return; // No clients connected, skip processing to save CPU
  }

  // Process video frame based on data type
  // dataType: Usually 0 = VIDEO, 1 = ALARM, etc. (depends on SDK)
  if (dataType === 0) { // VIDEO frame
    let frameBase64 = null;

    // Extract frame data from dataInfo
    // The structure depends on your SDK, but typically includes:
    // - dataInfo.buffer: frame buffer (Buffer or ArrayBuffer)
    // - dataInfo.width: frame width
    // - dataInfo.height: frame height
    // - dataInfo.format: frame format (JPEG, YUV, RGB, etc.)
    // - dataInfo.size: frame size in bytes

    // Option 1: Frame is already JPEG
    if (dataInfo.format === 'JPEG' || dataInfo.format === 1 || dataInfo.format === 'MJPEG') {
      // Convert buffer to base64
      const buffer = Buffer.from(dataInfo.buffer);
      frameBase64 = buffer.toString('base64');
    }
    // Option 2: Frame is raw (YUV, RGB, etc.) - need to convert to JPEG
    else {
      // Convert raw frame to JPEG using image processing library
      frameBase64 = convertFrameToJPEG(dataInfo);
    }

    // Broadcast frame to WebSocket clients
    if (frameBase64) {
      videoStreamServer.broadcastFrame(cameraId, frameBase64);
    }
  }
}
```

### Step 7: Convert Raw Frames to JPEG (If Needed)

If your camera SDK provides raw frames, convert them to JPEG:

```javascript
const sharp = require('sharp'); // or jimp, canvas, etc.

function convertFrameToJPEG(dataInfo) {
  try {
    // Example using sharp library
    const buffer = Buffer.from(dataInfo.buffer);
    const width = dataInfo.width;
    const height = dataInfo.height;
    
    // Convert based on format
    let imageBuffer;
    
    if (dataInfo.format === 'YUV420' || dataInfo.format === 'I420') {
      // Convert YUV to RGB, then to JPEG
      imageBuffer = await sharp(buffer, {
        raw: {
          width: width,
          height: height,
          channels: 3
        }
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    } else if (dataInfo.format === 'RGB24' || dataInfo.format === 'RGB') {
      // Direct RGB to JPEG
      imageBuffer = await sharp(buffer, {
        raw: {
          width: width,
          height: height,
          channels: 3
        }
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    } else {
      console.warn(`Unsupported frame format: ${dataInfo.format}`);
      return null;
    }
    
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting frame to JPEG:', error);
    return null;
  }
}
```

**Alternative using jimp:**
```javascript
const Jimp = require('jimp');

async function convertFrameToJPEG(dataInfo) {
  try {
    const buffer = Buffer.from(dataInfo.buffer);
    const image = await Jimp.create({
      data: buffer,
      width: dataInfo.width,
      height: dataInfo.height
    });
    
    const jpegBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    return jpegBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting frame:', error);
    return null;
  }
}
```

### Step 8: Clean Up on App Quit

Stop all camera streams and close WebSocket server:

```javascript
app.on('before-quit', async () => {
  console.log('👋 Shutting down video streaming...');
  
  // Stop all camera streams
  for (const [cameraId, handles] of cameraHandles.entries()) {
    try {
      console.log(`   Stopping stream for ${cameraId}...`);
      
      // Stop real-time playback
      if (handles.playHandle !== null && handles.playHandle !== -1) {
        vzlpr.VzLPRClient_StopRealPlay(handles.playHandle);
      }
      
      // Close camera connection
      if (handles.handle !== null && handles.handle !== -1) {
        vzlpr.VzLPRClient_Close(handles.handle);
      }
      
      console.log(`   ✅ Stopped ${cameraId}`);
    } catch (error) {
      console.error(`   ❌ Error stopping ${cameraId}:`, error);
    }
  }
  
  cameraHandles.clear();
  
  // Stop WebSocket server
  if (videoStreamServer) {
    await videoStreamServer.stop();
  }
  
  console.log('✅ Video streaming shutdown complete');
});
```

## Complete Example

Here's a complete example combining all steps:

```javascript
const { app, BrowserWindow } = require('electron');
const VideoStreamServer = require('./camera-bridge/electron-video-stream-server');
const vzlpr = require('./build/Release/vzlpr.node'); // Your camera SDK

let mainWindow;
let videoStreamServer;
let cameraHandles = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL('http://localhost:3000'); // Your app URL
}

app.whenReady().then(async () => {
  createWindow();

  try {
    // Start video stream server
    videoStreamServer = new VideoStreamServer(3004);
    videoStreamServer.addHealthEndpoint();
    await videoStreamServer.start();
    console.log('✅ Video stream server ready');

    // Setup cameras
    await setupCameraStreams();
    
  } catch (error) {
    console.error('❌ Failed to initialize video streaming:', error);
  }
});

async function setupCameraStreams() {
  const cameras = [
    {
      id: 'camera-1',
      ip: process.env.CAMERA_1_IP || '192.168.1.50',
      port: parseInt(process.env.CAMERA_1_PORT || '8000', 10),
      username: process.env.CAMERA_1_USERNAME || 'admin',
      password: process.env.CAMERA_1_PASSWORD || 'admin'
    },
    {
      id: 'camera-2',
      ip: process.env.CAMERA_2_IP || '192.168.1.49',
      port: parseInt(process.env.CAMERA_2_PORT || '8000', 10),
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

async function startCameraStream(camera) {
  console.log(`📹 Starting video stream for ${camera.id}...`);

  const handle = vzlpr.VzLPRClient_Open(
    camera.ip,
    camera.port,
    camera.username,
    camera.password
  );
  
  if (handle === -1) {
    throw new Error(`Failed to connect to ${camera.id}`);
  }

  const callback = (handle, userData, dataType, dataInfo) => {
    onVideoFrame(camera.id, dataType, dataInfo);
  };
  
  vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);

  const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
  if (playHandle === -1) {
    vzlpr.VzLPRClient_Close(handle);
    throw new Error(`Failed to start playback for ${camera.id}`);
  }

  cameraHandles.set(camera.id, { handle, playHandle });
  console.log(`✅ Video stream started for ${camera.id}`);
}

function onVideoFrame(cameraId, dataType, dataInfo) {
  if (videoStreamServer.getClientCount(cameraId) === 0) {
    return; // No clients, skip
  }

  if (dataType === 0) { // VIDEO
    let frameBase64 = null;

    if (dataInfo.format === 'JPEG' || dataInfo.format === 1) {
      frameBase64 = Buffer.from(dataInfo.buffer).toString('base64');
    } else {
      // Convert raw frame to JPEG if needed
      // frameBase64 = convertFrameToJPEG(dataInfo);
      console.warn(`Unsupported format for ${cameraId}: ${dataInfo.format}`);
      return;
    }

    if (frameBase64) {
      videoStreamServer.broadcastFrame(cameraId, frameBase64);
    }
  }
}

app.on('before-quit', async () => {
  console.log('👋 Shutting down...');
  
  for (const [cameraId, handles] of cameraHandles.entries()) {
    vzlpr.VzLPRClient_StopRealPlay(handles.playHandle);
    vzlpr.VzLPRClient_Close(handles.handle);
  }
  cameraHandles.clear();
  
  if (videoStreamServer) {
    await videoStreamServer.stop();
  }
});
```

## Frontend Integration

The frontend already has the `RealtimeVideo` component that connects to `ws://localhost:3004/video/{cameraId}`. No frontend changes needed!

The component automatically:
- Connects to WebSocket server
- Receives video frames in real-time
- Displays frames in `<video>` element
- Handles reconnection

## Environment Variables

Create `.env` file or set environment variables:

```env
CAMERA_1_IP=192.168.1.50
CAMERA_1_PORT=8000
CAMERA_1_USERNAME=admin
CAMERA_1_PASSWORD=admin

CAMERA_2_IP=192.168.1.49
CAMERA_2_PORT=8000
CAMERA_2_USERNAME=admin
CAMERA_2_PASSWORD=admin
```

## Testing

### 1. Test WebSocket Server

Start Electron app and check console:
```
✅ Video stream server ready
🔌 WebSocket endpoint: ws://localhost:3004/video/{cameraId}
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3004/health
```

Expected response:
```json
{
  "status": "ok",
  "port": 3004,
  "cameras": {
    "camera-1": {
      "clients": 1
    },
    "camera-2": {
      "clients": 0
    }
  }
}
```

### 3. Test Video Stream

1. Start Electron app
2. Open frontend with `RealtimeVideo` component
3. Check browser console for WebSocket connection
4. Verify video displays in real-time

## Troubleshooting

### Camera Not Connecting

**Check:**
- Camera IP and port are correct
- Camera credentials are correct
- Camera is on same network
- Camera SDK is properly installed
- Camera supports real-time streaming

**Debug:**
- Check SDK return values (handle should not be -1)
- Verify camera is accessible: `ping 192.168.1.50`
- Check camera SDK documentation

### No Video Frames Received

**Check:**
- Video callback is registered correctly
- `dataType === 0` for video frames
- Frame format is supported
- WebSocket clients are connected

**Debug:**
- Add logging in `onVideoFrame` to see if callback is called
- Check frame format and buffer size
- Verify WebSocket connection in browser console

### Frontend Not Displaying Video

**Check:**
- Frontend is connecting to correct WebSocket URL
- `RealtimeVideo` component is mounted
- Browser console shows WebSocket messages
- Frame data format matches expected format

**Debug:**
- Check browser console for WebSocket errors
- Verify WebSocket messages are received
- Check `videoRef.current` is set correctly

## Performance Optimization

### 1. Skip Processing When No Clients

The code already checks `getClientCount()` before processing frames. This saves CPU when no one is watching.

### 2. Adjust Frame Rate

Limit frame rate if needed:
```javascript
let lastFrameTime = new Map();

function onVideoFrame(cameraId, dataType, dataInfo) {
  const now = Date.now();
  const lastTime = lastFrameTime.get(cameraId) || 0;
  const frameInterval = 1000 / 30; // 30 FPS max
  
  if (now - lastTime < frameInterval) {
    return; // Skip frame
  }
  
  lastFrameTime.set(cameraId, now);
  // ... process frame
}
```

### 3. Compress JPEG Quality

Reduce JPEG quality to lower bandwidth:
```javascript
// In convertFrameToJPEG function
.jpeg({ quality: 60 }) // Lower quality = smaller size
```

## Key Points

1. **Real-Time:** Video frames stream continuously as they're received from cameras
2. **Multiple Cameras:** Supports multiple cameras simultaneously
3. **Efficient:** Only processes frames when clients are connected
4. **Automatic:** Frontend receives and displays frames automatically
5. **Clean Shutdown:** Properly closes camera connections on app quit

## Next Steps

1. Install camera SDK (VzLPRClient or similar)
2. Copy video stream server module to Electron app
3. Add initialization code to main process
4. Implement camera connection using your SDK
5. Test with one camera first, then add more
6. Optimize frame rate and quality as needed

## Summary

This integration enables **real-time video streaming** from cameras to frontend:
- Camera SDK provides frames → Electron processes → WebSocket broadcasts → Frontend displays
- All happens automatically in real-time
- Supports multiple cameras
- Works with existing `RealtimeVideo` component
