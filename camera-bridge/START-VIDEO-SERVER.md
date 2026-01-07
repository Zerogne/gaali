# Starting the Video Stream Server

The video stream server needs to be running for real-time camera video to work in the web application.

## Quick Start

### Option 1: Using PM2 (Recommended for Production)

```bash
cd camera-bridge
pm2 start ecosystem.config.js
```

This will start all three services:
- `camera-bridge` - Main plate recognition server (port 3001/3002)
- `camera-bridge-control` - Control API server (port 3003)
- `video-stream-server` - Video stream server (port 3004)

### Option 2: Start Video Server Only

```bash
cd camera-bridge
npm run video
# or
node video-stream-server.js
```

### Option 3: Using the Start Script

```bash
cd camera-bridge
node start-video-server.js
```

## Verify Server is Running

1. **Check Health Endpoint:**
   ```bash
   curl http://localhost:3004/health
   ```

2. **Check PM2 Status:**
   ```bash
   pm2 status
   ```

3. **Check Logs:**
   ```bash
   pm2 logs video-stream-server
   ```

## Environment Variables

Set these environment variables before starting:

```bash
export VIDEO_STREAM_PORT=3004
export CAMERA_1_IP=192.168.1.50
export CAMERA_1_PORT=8000
export CAMERA_1_USERNAME=admin
export CAMERA_1_PASSWORD=admin
export CAMERA_2_IP=192.168.1.49
export CAMERA_2_PORT=8000
export CAMERA_2_USERNAME=admin
export CAMERA_2_PASSWORD=admin
```

Or create a `.env` file in the `camera-bridge` directory.

## Troubleshooting

### WebSocket Connection Failed

If you see `WebSocket connection to 'ws://localhost:3004/video/camera-1' failed`:

1. **Check if server is running:**
   ```bash
   curl http://localhost:3004/health
   ```

2. **Check if port is in use:**
   ```bash
   lsof -i :3004
   ```

3. **Check server logs:**
   ```bash
   pm2 logs video-stream-server
   # or if running directly:
   # Check console output
   ```

### Server Won't Start

1. **Check dependencies:**
   ```bash
   cd camera-bridge
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be v16 or higher
   ```

3. **Check for port conflicts:**
   ```bash
   lsof -i :3004
   ```

## Integration with VzLPRClient SDK

Currently, the video stream server uses mock implementations. To integrate with the actual VzLPRClient SDK:

1. **Implement Native Addon:**
   - Create a Node.js native addon that wraps the VzLPRClient SDK
   - Expose functions: `VzLPRClient_Open`, `VzLPRClient_StartRealPlay`, etc.

2. **Update `connectCamera` function:**
   - Replace mock implementation with actual SDK call
   - Handle connection errors properly

3. **Update `startRealPlay` function:**
   - Replace mock implementation with actual SDK call
   - Set up video data callback

4. **Implement Frame Capture:**
   - Use `VZLPRC_VIDEO_DATA_CALLBACK` to receive video frames
   - Convert frames to base64 JPEG or H.264 stream
   - Broadcast to WebSocket clients

## Development

For development, you can run the server with auto-reload:

```bash
# Install nodemon if not already installed
npm install -g nodemon

# Run with auto-reload
nodemon video-stream-server.js
```

## Production Deployment

For production, use PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable auto-start on boot
```

