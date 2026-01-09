# Where to Add Real-Time Video Code in Electron App

## Location: Main Process File

**Add the RTSP → WebSocket bridge code in your Electron app's MAIN PROCESS file.**

This is typically:
- `main.js`
- `main.ts`
- `index.js`
- `electron.js`
- Or whatever file is specified in `package.json` → `"main"` field

---

## Step-by-Step Integration

### 1. Find Your Main Process File

Check your `package.json`:
```json
{
  "main": "main.js"  // ← This is your main process file
}
```

### 2. Add Dependencies

In your Electron app directory:
```bash
npm install node-rtsp-stream ws
```

### 3. Add Code to Main Process

**In your `main.js` (or main process file), add this code:**

```javascript
const { app, BrowserWindow } = require('electron');
// ... your existing Electron code ...

// ============================================
// ADD THIS: RTSP to WebSocket Bridge
// ============================================
const Stream = require('node-rtsp-stream');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

// Camera configuration
const CAMERA_CONFIG = {
  '1': {
    rtspUrl: 'rtsp://192.168.1.50:8557/h264',
    port: 9999,
  },
  '2': {
    rtspUrl: 'rtsp://192.168.1.49:8557/h264',
    port: 10000,
  },
};

const streams = new Map();

function createCameraBridge(cameraId, config) {
  const { rtspUrl, port } = config;
  
  // Create WebSocket server
  const server = createServer();
  const wss = new WebSocketServer({ 
    server, 
    path: `/camera/${cameraId}` 
  });

  // Create RTSP stream
  const stream = new Stream({
    name: `camera-${cameraId}`,
    streamUrl: rtspUrl,
    wsPort: 0, // We handle WebSocket ourselves
    ffmpegOptions: {
      '-stats': '',
      '-r': 30,
      '-s': '1280x720',
      '-b:v': '2000k',
      '-f': 'mpegts',
      '-codec:v': 'mpeg1video',
    }
  });

  // Bridge RTSP data to WebSocket
  stream.on('data', (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(data);
      }
    });
  });

  server.listen(port, () => {
    console.log(`✅ Camera ${cameraId} WebSocket: ws://localhost:${port}/camera/${cameraId}`);
  });

  streams.set(cameraId, { stream, wss, server });
}

// ============================================
// ADD THIS: Initialize on app ready
// ============================================
app.whenReady().then(() => {
  // ... your existing app.whenReady() code ...
  
  // Start camera bridges
  Object.entries(CAMERA_CONFIG).forEach(([cameraId, config]) => {
    createCameraBridge(cameraId, config);
  });
});

// ============================================
// ADD THIS: Cleanup on app quit
// ============================================
app.on('before-quit', () => {
  streams.forEach(({ stream, server }) => {
    stream.stop();
    server.close();
  });
});
```

---

## Where Exactly to Add It

### Option A: If you have existing `app.whenReady()`

**Add the bridge initialization INSIDE your existing `app.whenReady()`:**

```javascript
app.whenReady().then(() => {
  // Your existing code (create window, etc.)
  createWindow();
  
  // ADD THIS: Start camera bridges
  Object.entries(CAMERA_CONFIG).forEach(([cameraId, config]) => {
    createCameraBridge(cameraId, config);
  });
});
```

### Option B: If you don't have `app.whenReady()`

**Add it at the top level of your main process file:**

```javascript
// At the top of main.js
const Stream = require('node-rtsp-stream');
// ... (all the bridge code from above)

// Then in app.whenReady()
app.whenReady().then(() => {
  // Start bridges
  initializeBridges();
});
```

---

## Complete Example Structure

```javascript
// main.js
const { app, BrowserWindow } = require('electron');
const Stream = require('node-rtsp-stream');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

// ... camera bridge code ...

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  
  // START CAMERA BRIDGES HERE
  Object.entries(CAMERA_CONFIG).forEach(([cameraId, config]) => {
    createCameraBridge(cameraId, config);
  });
});

app.on('before-quit', () => {
  // CLEANUP CAMERA BRIDGES HERE
  streams.forEach(({ stream, server }) => {
    stream.stop();
    server.close();
  });
});
```

---

## Key Points

1. **Main Process Only** - This code MUST run in the main process, not renderer
2. **Start on Ready** - Initialize bridges when `app.whenReady()` fires
3. **Cleanup on Quit** - Stop streams when app closes
4. **WebSocket Servers** - Run on ports 9999 and 10000
5. **RTSP URLs** - Use `rtsp://camera-ip:8557/h264` format

---

## Testing

After adding the code:

1. **Start Electron app:**
   ```bash
   npm start
   ```

2. **Check console for:**
   ```
   ✅ Camera 1 WebSocket: ws://localhost:9999/camera/1
   ✅ Camera 2 WebSocket: ws://localhost:10000/camera/2
   ```

3. **Test WebSocket connection:**
   ```javascript
   // In browser console
   const ws = new WebSocket('ws://localhost:9999/camera/1');
   ws.onopen = () => console.log('Connected!');
   ws.onmessage = (e) => console.log('Data received:', e.data.length);
   ```

---

## Summary

**Add the RTSP → WebSocket bridge code in your Electron app's MAIN PROCESS file (`main.js`), inside `app.whenReady()` callback.**

The code will:
- Start WebSocket servers on ports 9999 and 10000
- Connect to RTSP cameras
- Convert RTSP to MPEG-TS using FFmpeg
- Stream to WebSocket clients
- Next.js site connects to these WebSocket servers
