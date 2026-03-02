# Real-time Video Streaming Setup

This document explains how to set up real-time video streaming from VzLPRClient SDK cameras to the web dashboard.

## Architecture

```
VzLPRClient SDK (C/C++) → Video Stream Server (Node.js) → WebSocket → Frontend (React)
```

## Components

### 1. Video Stream Server (`video-stream-server.js`)

A Node.js server that:
- Connects to cameras using VzLPRClient SDK functions
- Captures real-time video frames
- Streams frames to web clients via WebSocket

### 2. WebSocket Client (e.g. Gaali Bridge)

A client that connects to the video stream server via WebSocket and displays the video feed. Video is handled by external apps (Gaali Bridge, Electron, etc.), not by the web app.

## Setup Instructions

### Step 1: Install VzLPRClient SDK

1. Download and install the VzLPRClient SDK for your platform
2. Ensure SDK libraries are accessible to Node.js (via native addon or FFI)

### Step 2: Create Native Bridge

The VzLPRClient SDK is a C/C++ library, so you need a native bridge. Options:

**Option A: Node.js Native Addon (Recommended)**
- Create a C++ addon that wraps VzLPRClient SDK functions
- Compile using `node-gyp` or `cmake-js`
- Export functions to Node.js

**Option B: Separate Process**
- Create a C/C++ application that uses VzLPRClient SDK
- Communicate with Node.js server via IPC, HTTP, or WebSocket

**Option C: FFI (Foreign Function Interface)**
- Use `ffi-napi` or `node-ffi` to call SDK functions directly
- Requires SDK to be available as shared library (.dll/.so)

### Step 3: Configure Environment Variables

Create a `.env` file in `camera-bridge/`:

```env
# Video Stream Server Port
VIDEO_STREAM_PORT=3001

# Camera 1 Configuration
CAMERA_1_IP=192.168.1.100
CAMERA_1_PORT=8000
CAMERA_1_USERNAME=admin
CAMERA_1_PASSWORD=admin

# Camera 2 Configuration
CAMERA_2_IP=192.168.1.101
CAMERA_2_PORT=8000
CAMERA_2_USERNAME=admin
CAMERA_2_PASSWORD=admin
```

### Step 4: Update Frontend Environment

Add to your Next.js `.env.local`:

```env
NEXT_PUBLIC_VIDEO_WS_URL=ws://localhost:3001/video
```

For production, use your server's public IP or domain:
```env
NEXT_PUBLIC_VIDEO_WS_URL=ws://your-server-ip:3001/video
```

### Step 5: Implement VzLPRClient SDK Integration

In `video-stream-server.js`, replace the mock functions with actual SDK calls:

```javascript
// Example using native addon
const vzLPRClient = require('./build/Release/vzlprclient.node');

function connectCamera(cameraId, ip, port, username, password) {
  const handle = vzLPRClient.Open(ip, port, username, password);
  if (handle === -1) {
    throw new Error(`Failed to connect to camera ${cameraId}`);
  }
  return { handle, cameraId, ip, port, playHandle: null, isPlaying: false };
}

function startRealPlay(connection) {
  // Start real-time playback
  const playHandle = vzLPRClient.StartRealPlay(connection.handle, null);
  if (playHandle === -1) {
    throw new Error(`Failed to start playback`);
  }
  connection.playHandle = playHandle;
  connection.isPlaying = true;
  
  // Set up frame callback
  vzLPRClient.SetFrameCallback(playHandle, (frameData) => {
    // Broadcast frame to WebSocket clients
    broadcastFrameToClients(connection.cameraId, frameData);
  });
}

function stopRealPlay(connection) {
  if (connection.playHandle !== null) {
    vzLPRClient.StopRealPlay(connection.playHandle);
    connection.playHandle = null;
    connection.isPlaying = false;
  }
}
```

### Step 6: Start the Video Stream Server

```bash
cd camera-bridge
node video-stream-server.js
```

Or use PM2 for production:

```bash
pm2 start video-stream-server.js --name video-stream
pm2 save
```

## VzLPRClient SDK Functions Reference

### VzLPRClient_Open
```c
VzLPRClientHandle VzLPRClient_Open(
    const char* ip,
    int port,
    const char* username,
    const char* password
);
```
Opens a connection to the camera. Returns a handle on success, -1 on failure.

### VzLPRClient_StartRealPlay
```c
int VzLPRClient_StartRealPlay(
    VzLPRClientHandle handle,
    void* hWnd  // Window handle (can be NULL for callback mode)
);
```
Starts real-time video playback. Returns play handle on success, -1 on failure.

### VzLPRClient_StopRealPlay
```c
int VzLPRClient_StopRealPlay(int nPlayHandle);
```
Stops real-time video playback. Returns 0 on success, -1 on failure.

### VzLPRClient_SaveRealData
```c
int VzLPRClient_SaveRealData(
    VzLPRClientHandle handle,
    char* sFileName
);
```
Starts saving video to file. Returns 0 on success, -1 on failure.

### VzLPRClient_StopSaveRealData
```c
int VzLPRClient_StopSaveRealData(VzLPRClientHandle handle);
```
Stops saving video. Returns 0 on success, -1 on failure.

## Frame Capture Methods

### Method 1: Frame Callback (Recommended)
If the SDK supports frame callbacks, register a callback function that receives frames:

```c
typedef void (*FrameCallback)(unsigned char* frameData, int width, int height, int format);
void VzLPRClient_SetFrameCallback(int playHandle, FrameCallback callback);
```

### Method 2: Screenshot/Frame Grab
Periodically capture frames:

```c
int VzLPRClient_CaptureFrame(int playHandle, unsigned char* buffer, int* width, int* height);
```

### Method 3: RTSP Stream
If the camera supports RTSP, you can use an RTSP-to-WebRTC or RTSP-to-HLS converter instead of the SDK.

## Testing

1. **Test WebSocket Connection:**
   ```bash
   wscat -c ws://localhost:3001/video/camera-1
   ```

2. **Check Server Health:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **View Logs:**
   ```bash
   pm2 logs video-stream
   ```

## Troubleshooting

### Camera Connection Fails
- Verify camera IP, port, username, and password
- Check network connectivity: `ping <camera-ip>`
- Ensure VzLPRClient SDK is properly installed
- Check SDK documentation for connection requirements

### No Video Frames
- Verify `VzLPRClient_StartRealPlay` returns a valid handle
- Check frame callback is registered correctly
- Ensure frame data format matches expected format (JPEG, H.264, etc.)
- Check WebSocket clients are connected

### High CPU Usage
- Reduce frame rate (adjust frame capture interval)
- Compress frames before sending (JPEG quality, resolution)
- Use hardware acceleration if available
- Consider using RTSP-to-WebRTC converter instead

### WebSocket Connection Issues
- Verify `NEXT_PUBLIC_VIDEO_WS_URL` is correct
- Check firewall allows WebSocket connections
- For production, use WSS (secure WebSocket) with SSL certificate

## Production Considerations

1. **Security:**
   - Use WSS (WebSocket Secure) in production
   - Add authentication to WebSocket connections
   - Restrict access to video stream server

2. **Performance:**
   - Use video compression (H.264, VP8, VP9)
   - Implement adaptive bitrate streaming
   - Cache frames for slow connections

3. **Reliability:**
   - Implement reconnection logic
   - Add health checks and monitoring
   - Handle camera disconnections gracefully

4. **Scalability:**
   - Use a message broker (Redis, RabbitMQ) for multiple servers
   - Implement load balancing for multiple cameras
   - Consider using WebRTC for peer-to-peer streaming

