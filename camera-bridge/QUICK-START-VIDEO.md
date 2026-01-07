# Quick Start: Video Stream Server

## The Problem

You're seeing this error:
```
WebSocket connection to 'ws://localhost:3004/video/camera-1' failed
```

This means the video stream server is not running.

## Solution: Start the Server

### Quick Fix (One Command)

```bash
cd camera-bridge
node video-stream-server.js
```

Keep this terminal open. The server will run and accept WebSocket connections.

### Better Solution (Using PM2)

If you have PM2 installed:

```bash
cd camera-bridge
pm2 start video-stream-server.js --name video-stream-server
```

Or start all services:

```bash
cd camera-bridge
pm2 start ecosystem.config.js
```

### Verify It's Working

1. **Check if server is running:**
   ```bash
   curl http://localhost:3004/health
   ```
   Should return JSON with camera status.

2. **Check in browser:**
   - Open your app
   - The WebSocket connection should now succeed
   - You should see "Холбогдсон" (Connected) indicator

## What This Server Does

The video stream server:
- Listens on port 3004 for WebSocket connections
- Accepts connections to `/video/camera-1` and `/video/camera-2`
- Currently uses mock/placeholder implementations
- **Needs VzLPRClient SDK integration** for actual camera video

## Next Steps: SDK Integration

To get actual video from cameras, you need to:

1. **Create a Node.js native addon** that wraps the VzLPRClient SDK
2. **Implement the callback function** `VZLPRC_VIDEO_DATA_CALLBACK`
3. **Call `VzLPRClient_StartRealPlay`** to start video streaming
4. **Capture frames** and send them via WebSocket

See `video-stream-server.js` for placeholder implementations that need to be replaced.

## Troubleshooting

### Port Already in Use

If port 3004 is already in use:

```bash
# Find what's using the port
lsof -i :3004

# Kill it or change the port
export VIDEO_STREAM_PORT=3005
node video-stream-server.js
```

### Server Starts But Connection Still Fails

1. Check server logs for connection attempts
2. Verify WebSocket URL in browser matches server
3. Check firewall settings
4. Try connecting with a WebSocket client:
   ```bash
   # Install wscat
   npm install -g wscat
   
   # Test connection
   wscat -c ws://localhost:3004/video/camera-1
   ```

