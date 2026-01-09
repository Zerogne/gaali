# Electron App Prompt for Cursor

Copy and paste this prompt into Cursor to create the Electron app bridge:

---

## Prompt for Cursor

Create an Electron app that acts as a bridge between RTSP cameras and a Next.js web application. The app should convert RTSP video streams to WebSocket streams that the web app can consume.

### Requirements

1. **RTSP to WebSocket Conversion**
   - Connect to RTSP cameras on port 8557
   - Use FFmpeg (via `node-rtsp-stream`) to convert RTSP to MPEG-TS
   - Stream MPEG-TS over WebSocket for browser consumption
   - Support 2 cameras simultaneously

2. **Camera Configuration**
   - Camera 1: `rtsp://192.168.1.50:8557/h264`
   - Camera 2: `rtsp://192.168.1.49:8557/h264`
   - Store configuration in a config file or environment variables
   - Allow runtime configuration updates

3. **WebSocket Servers**
   - Camera 1: `ws://localhost:9999/camera/1`
   - Camera 2: `ws://localhost:10000/camera/2`
   - Support multiple concurrent WebSocket connections
   - Handle connection/disconnection gracefully

4. **FFmpeg Settings**
   - Output format: MPEG-TS (for JSMpeg compatibility)
   - Frame rate: 30 fps
   - Resolution: 1280x720 (configurable)
   - Bitrate: 2000k (configurable)
   - Codec: mpeg1video

5. **App Structure**
   - Main process: Handle RTSP streams and WebSocket servers
   - Renderer process: Simple UI showing connection status
   - Auto-start streams when app launches
   - Graceful shutdown on app close

6. **Error Handling**
   - Retry RTSP connections on failure
   - Log errors to console and UI
   - Handle camera disconnections
   - Restart streams automatically

7. **UI Requirements**
   - Show status for each camera (Connected/Disconnected)
   - Display WebSocket connection count
   - Show RTSP stream status
   - Simple, minimal interface

### Technical Stack

- **Electron** (latest version)
- **node-rtsp-stream** - RTSP to WebSocket conversion
- **ws** - WebSocket server
- **FFmpeg** - Must be installed system-wide or bundled

### File Structure

```
electron-camera-bridge/
├── package.json
├── main.js (Main process)
├── preload.js (Preload script)
├── renderer/
│   ├── index.html
│   └── renderer.js
├── config/
│   └── cameras.json (Camera configuration)
└── README.md
```

### Key Features

1. **Auto-start streams** when app launches
2. **Health check endpoint** - HTTP GET /health returns status
3. **Logging** - Console and file logging
4. **Configuration** - JSON config file for camera settings
5. **Reconnection** - Auto-reconnect if RTSP stream fails

### Integration Points

- Next.js app connects to: `ws://localhost:9999/camera/1` and `ws://localhost:10000/camera/2`
- For production: Use Cloudflare Tunnel to expose WebSocket servers
- Environment variable: `NEXT_PUBLIC_ELECTRON_BRIDGE_URL=ws://localhost:9999`

### Example Code Structure

**main.js should:**
- Initialize Electron app
- Create WebSocket servers for each camera
- Start RTSP streams using node-rtsp-stream
- Bridge RTSP data to WebSocket clients
- Handle app lifecycle (start/stop)

**renderer.js should:**
- Display camera connection status
- Show WebSocket client count
- Allow configuration updates
- Show logs/errors

### Dependencies to Install

```json
{
  "dependencies": {
    "electron": "^latest",
    "node-rtsp-stream": "^0.0.9",
    "ws": "^8.19.0"
  }
}
```

### Expected Behavior

1. App starts → WebSocket servers start on ports 9999 and 10000
2. RTSP streams connect → FFmpeg converts to MPEG-TS
3. WebSocket clients connect → Receive MPEG-TS stream
4. Browser (Next.js) → Uses JSMpeg to decode and display video

### Error Scenarios to Handle

- Camera unreachable (RTSP connection fails)
- FFmpeg not installed
- Port already in use
- WebSocket client disconnects
- RTSP stream interruption

### Configuration Example

```json
{
  "cameras": [
    {
      "id": "1",
      "rtspUrl": "rtsp://192.168.1.50:8557/h264",
      "wsPort": 9999,
      "username": "admin",
      "password": "admin"
    },
    {
      "id": "2",
      "rtspUrl": "rtsp://192.168.1.49:8557/h264",
      "wsPort": 10000,
      "username": "admin",
      "password": "admin"
    }
  ],
  "ffmpeg": {
    "fps": 30,
    "resolution": "1280x720",
    "bitrate": "2000k"
  }
}
```

### Testing

- Test RTSP connection to cameras
- Test WebSocket server accepts connections
- Test MPEG-TS stream is valid
- Test multiple concurrent WebSocket clients
- Test reconnection after camera disconnect

### Additional Notes

- FFmpeg must be installed on the system (or bundled with app)
- WebSocket servers should handle binary data (MPEG-TS)
- Consider adding authentication for WebSocket connections
- Add rate limiting if needed
- Support hot-reload of camera configuration

---

**Create a complete, production-ready Electron app with the above requirements.**
