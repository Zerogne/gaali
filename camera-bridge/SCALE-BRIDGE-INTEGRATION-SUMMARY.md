# Scale Bridge Integration Summary

## Quick Reference

This document provides a quick summary for adding scale bridge to `camera-bridge/server.js`.

## Files to Review

1. **`ADD-SCALE-BRIDGE-PROMPT.md`** - Detailed step-by-step integration guide
2. **`server-with-scale-bridge.js.example`** - Complete example showing integrated code
3. **`electron-scale-bridge.js`** - Standalone scale bridge module (for Electron apps)

## What Needs to Be Added

### 1. Required Module
```javascript
const net = require('net');
```

### 2. Configuration Variables
```javascript
const SCALE_HOST = process.env.SCALE_HOST || '192.168.1.100';
const SCALE_PORT = parseInt(process.env.SCALE_PORT || '4001', 10);
const SCALE_WS_PORT = parseInt(process.env.SCALE_WS_PORT || '9000', 10);
const SCALE_ENABLED = process.env.SCALE_ENABLED !== 'false';
```

### 3. State Variables
```javascript
let scaleTcpClient = null;
let scaleWsClients = new Set();
let isScaleConnected = false;
let scaleReconnectTimeout = null;
let scaleReconnectAttempts = 0;
```

### 4. Functions to Add
- `parseWeightFromScale(message)` - Parse weight from scale data
- `broadcastWeightEvent(weightData)` - Broadcast to WebSocket clients
- `connectToScale()` - Connect to scale device via TCP

### 5. WebSocket Server
- Create separate WebSocket server on port 9000 (or use path-based routing)

### 6. Health Endpoint
- Add `/scale/health` endpoint

### 7. Initialization
- Call `connectToScale()` after server starts

### 8. Cleanup
- Close scale connection and WebSocket server on shutdown

## Environment Variables

Add to `.env`:
```env
SCALE_ENABLED=true
SCALE_HOST=192.168.1.100
SCALE_PORT=4001
SCALE_WS_PORT=9000
```

## Architecture

```
Scale Device (TCP Server)
    ↓ TCP Connection
Camera-Bridge Server
    ↓ WebSocket (port 9000)
Frontend (ws://localhost:9000/service)
```

## Testing

1. **Health Check:**
   ```bash
   curl http://localhost:3002/scale/health
   ```

2. **WebSocket Test:**
   ```javascript
   const ws = new WebSocket('ws://localhost:9000/service');
   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if (data.type === 'weight_event') {
       console.log(`Weight: ${data.weight} ${data.unit}`);
     }
   };
   ```

## Key Points

- Scale device must be in **TCP Server mode**
- Scale bridge runs independently from camera bridge
- Automatic reconnection if scale disconnects
- Weight data is automatically parsed and broadcast
- Frontend uses existing `useScaleBridge` hook (connects to port 9000)

## Next Steps

1. Read `ADD-SCALE-BRIDGE-PROMPT.md` for detailed instructions
2. Review `server-with-scale-bridge.js.example` for complete code
3. Copy relevant sections into your `server.js`
4. Configure scale device to TCP Server mode
5. Set environment variables
6. Test connection
