# Electron App as Camera Bridge - Setup Guide

## Overview

Your Electron app can act as a bridge:
- **Electron app** connects to RTSP (port 8557) using FFmpeg
- **Electron app** converts RTSP → WebSocket (localhost)
- **Next.js site** connects to Electron's WebSocket (localhost or tunnel)

## Architecture

```
Camera (RTSP:8557) 
    ↓
Electron App (FFmpeg conversion)
    ↓
WebSocket (localhost:9999 or tunnel)
    ↓
Next.js Site (Vercel)
```

---

## Step 1: Update Electron App

### Install Dependencies

```bash
cd your-electron-app
npm install node-rtsp-stream ws
```

### Add RTSP → WebSocket Bridge

**In your Electron `main.js` or main process:**

```javascript
const Stream = require('node-rtsp-stream');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

// Create HTTP server for WebSocket upgrade
const server = createServer();
const wss = new WebSocketServer({ server, path: '/video' });

// Store active streams
const streams = new Map();

// Function to create RTSP stream for a camera
function createCameraStream(cameraId, rtspUrl) {
  // Close existing stream if any
  if (streams.has(cameraId)) {
    streams.get(cameraId).stop();
    streams.delete(cameraId);
  }

  const stream = new Stream({
    name: `camera-${cameraId}`,
    streamUrl: rtspUrl, // e.g., rtsp://192.168.1.50:8557/h264
    wsPort: 0, // Let node-rtsp-stream handle WebSocket internally
    ffmpegOptions: {
      '-stats': '',
      '-r': 30, // 30 fps
      '-s': '1280x720', // Resolution
      '-b:v': '2000k', // Bitrate
      '-f': 'mpegts', // Output format (MPEG-TS for JSMpeg)
    }
  });

  // Create WebSocket endpoint for this camera
  const cameraWsPort = 9999 + parseInt(cameraId); // 9999 for camera 1, 10000 for camera 2
  
  const cameraServer = createServer();
  const cameraWss = new WebSocketServer({ 
    server: cameraServer, 
    path: `/camera/${cameraId}` 
  });

  cameraServer.listen(cameraWsPort, () => {
    console.log(`📹 Camera ${cameraId} WebSocket server on port ${cameraWsPort}`);
  });

  // Bridge node-rtsp-stream WebSocket to our WebSocket
  stream.on('data', (data) => {
    // Forward data to all connected clients
    cameraWss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data);
      }
    });
  });

  streams.set(cameraId, { stream, wss: cameraWss, server: cameraServer });
  
  return { stream, wss: cameraWss, port: cameraWsPort };
}

// Start streams for both cameras
// Get camera config from your Electron app's config or database
const camera1Rtsp = 'rtsp://192.168.1.50:8557/h264';
const camera2Rtsp = 'rtsp://192.168.1.49:8557/h264';

createCameraStream('1', camera1Rtsp);
createCameraStream('2', camera2Rtsp);

// Main WebSocket server on port 3001 (or your preferred port)
server.listen(3001, () => {
  console.log('🌉 Electron Bridge WebSocket server on port 3001');
  console.log('   Camera 1: ws://localhost:9999/camera/1');
  console.log('   Camera 2: ws://localhost:10000/camera/2');
});
```

---

## Step 2: Update Next.js to Connect to Electron

### Option A: Direct Connection (Local Development)

**Update `RealtimeVideoProxy.tsx` or create new component:**

```typescript
// For local development - connect directly to Electron
const wsUrl = `ws://localhost:9999/camera/${cameraId}`;
```

**Pros:**
- ✅ Works immediately
- ✅ No tunnel needed
- ✅ Low latency

**Cons:**
- ⚠️ Only works when Electron app is running
- ⚠️ Only works on localhost

---

### Option B: Cloudflare Tunnel (Production)

**1. In Electron app, expose WebSocket via Cloudflare Tunnel:**

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Run tunnel
cloudflared tunnel --url ws://localhost:9999
```

**2. Get tunnel URL** (e.g., `https://abc123.trycloudflare.com`)

**3. In Next.js, set environment variable:**

```
NEXT_PUBLIC_ELECTRON_BRIDGE_URL=wss://abc123.trycloudflare.com
```

**4. Update component:**

```typescript
const wsUrl = process.env.NEXT_PUBLIC_ELECTRON_BRIDGE_URL 
  ? `${process.env.NEXT_PUBLIC_ELECTRON_BRIDGE_URL}/camera/${cameraId}`
  : `ws://localhost:9999/camera/${cameraId}`;
```

---

## Step 3: Update Frontend Component

**Update `RealtimeVideoProxy.tsx` to connect to Electron bridge:**

```typescript
// Check if Electron bridge is available
const electronBridgeUrl = process.env.NEXT_PUBLIC_ELECTRON_BRIDGE_URL || 'ws://localhost:9999';
const wsUrl = `${electronBridgeUrl}/camera/${cameraId}`;

// Use JSMpeg to decode MPEG-TS stream
const player = new JSMpeg.Player(wsUrl, {
  canvas: canvasRef.current,
  autoplay: true,
  audio: false,
});
```

---

## Step 4: Handle Electron App Lifecycle

**In Electron app, make sure:**

1. **Start WebSocket server when app starts**
2. **Stop streams when app closes**
3. **Reconnect if camera disconnects**

```javascript
// On app ready
app.whenReady().then(() => {
  startCameraBridge();
});

// On app close
app.on('before-quit', () => {
  streams.forEach(({ stream, server }) => {
    stream.stop();
    server.close();
  });
});
```

---

## Benefits

✅ **Works with RTSP** - Electron can run FFmpeg  
✅ **No separate server** - Uses existing Electron app  
✅ **Low latency** - Direct WebSocket connection  
✅ **Production ready** - Use Cloudflare Tunnel for remote access  

---

## Quick Start

1. **Add RTSP → WebSocket code to Electron app**
2. **Start Electron app** - WebSocket server runs on localhost:9999
3. **Update Next.js** - Connect to `ws://localhost:9999/camera/1`
4. **For production** - Use Cloudflare Tunnel

This is the simplest solution since you already have the Electron app! 🎉
