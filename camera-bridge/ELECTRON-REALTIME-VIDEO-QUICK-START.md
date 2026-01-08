# Quick Start: Real-Time Video in Electron App

## What You Need

1. Camera SDK installed (VzLPRClient or similar)
2. Cameras accessible via IP
3. Electron app with main process file (`main.js`)
4. `electron-video-stream-server.js` module

## 3-Step Integration

### Step 1: Add to Main Process

In your Electron `main.js`:

```javascript
const { app } = require('electron');
const VideoStreamServer = require('./camera-bridge/electron-video-stream-server');
const vzlpr = require('./build/Release/vzlpr.node'); // Your camera SDK

let videoStreamServer;
let cameraHandles = new Map();

app.whenReady().then(async () => {
  // Start WebSocket server
  videoStreamServer = new VideoStreamServer(3004);
  await videoStreamServer.start();
  console.log('✅ Video stream server ready');

  // Connect to cameras
  await setupCameras();
});

async function setupCameras() {
  const camera = {
    id: 'camera-1',
    ip: '192.168.1.50',
    port: 8000,
    username: 'admin',
    password: 'admin'
  };
  
  // Open camera connection
  const handle = vzlpr.VzLPRClient_Open(camera.ip, camera.port, camera.username, camera.password);
  
  // Set video callback
  vzlpr.VzLPRClient_SetVideoDataCallback(handle, (h, userData, dataType, dataInfo) => {
    if (dataType === 0) { // VIDEO frame
      const frameBase64 = Buffer.from(dataInfo.buffer).toString('base64');
      videoStreamServer.broadcastFrame(camera.id, frameBase64);
    }
  }, null);
  
  // Start playback
  const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
  cameraHandles.set(camera.id, { handle, playHandle });
}

app.on('before-quit', async () => {
  // Cleanup cameras
  for (const [id, handles] of cameraHandles.entries()) {
    vzlpr.VzLPRClient_StopRealPlay(handles.playHandle);
    vzlpr.VzLPRClient_Close(handles.handle);
  }
  await videoStreamServer.stop();
});
```

### Step 2: Configure Cameras

Set camera IP addresses and credentials:
```env
CAMERA_1_IP=192.168.1.50
CAMERA_1_PORT=8000
CAMERA_1_USERNAME=admin
CAMERA_1_PASSWORD=admin
```

### Step 3: Frontend (Already Works!)

The `RealtimeVideo` component automatically connects and displays video. No changes needed!

## How It Works

```
Camera (sends frames)
    ↓ Camera SDK Callback
Electron App (processes & converts)
    ↓ WebSocket (port 3004)
Frontend (displays in real-time)
```

## Test

1. Start Electron app
2. Check console: `✅ Video stream server ready`
3. Open frontend with video component
4. Video should display automatically!

## That's It!

Video streams in real-time automatically. See `ELECTRON-REALTIME-VIDEO-PROMPT.md` for detailed documentation.
