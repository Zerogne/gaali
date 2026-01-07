# Video Stream Server - Quick Start

## Starting the Video Stream Server

The video stream server must be running for the real-time camera feeds to work on the dashboard.

### Option 1: Direct Start

```bash
cd camera-bridge
node video-stream-server.js
```

### Option 2: Using npm script

```bash
cd camera-bridge
npm run video
```

### Option 3: Using PM2 (Production)

```bash
cd camera-bridge
pm2 start video-stream-server.js --name video-stream
pm2 save
```

## Configuration

Set environment variables in `.env` file or export them:

```bash
# Server Port
export VIDEO_STREAM_PORT=3001

# Camera 1 (IN)
export CAMERA_1_IP=192.168.1.50
export CAMERA_1_PORT=8000
export CAMERA_1_USERNAME=admin
export CAMERA_1_PASSWORD=admin

# Camera 2 (OUT)
export CAMERA_2_IP=192.168.1.49
export CAMERA_2_PORT=8000
export CAMERA_2_USERNAME=admin
export CAMERA_2_PASSWORD=admin
```

## Verify Server is Running

1. **Check health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check server logs:**
   You should see:
   ```
   Video stream server running on port 3001
   WebSocket endpoint: ws://localhost:3001/video/{cameraId}
   Health check: http://localhost:3001/health
   Cameras initialized
   ```

## Troubleshooting

### WebSocket Connection Failed

**Error:** `WebSocket connection to 'ws://localhost:3001/video/camera-1' failed`

**Solutions:**
1. **Check if server is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   If this fails, the server is not running.

2. **Check port is not in use:**
   ```bash
   lsof -i :3001
   # or on Windows:
   netstat -ano | findstr :3001
   ```

3. **Check firewall settings:**
   - Ensure port 3001 is not blocked
   - For production, ensure the port is accessible

4. **Check server logs:**
   Look for connection attempts in the server console:
   ```
   WebSocket connection attempt: /video/camera-1
   ✅ WebSocket client connected for camera: camera-1
   ```

### Server Won't Start

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be Node.js 18+

2. **Check dependencies:**
   ```bash
   cd camera-bridge
   npm install
   ```

3. **Check for port conflicts:**
   Change `VIDEO_STREAM_PORT` if 3001 is already in use

### No Video Frames

The current implementation uses mock frames. To get real video:
1. Implement VzLPRClient SDK integration (see VIDEO-STREAM-SETUP.md)
2. Connect actual camera SDK functions
3. Capture real frames from cameras

## Development

For development with auto-restart:

```bash
# Install nodemon globally
npm install -g nodemon

# Run with auto-restart
nodemon video-stream-server.js
```

## Production Deployment

1. **Use PM2:**
   ```bash
   pm2 start video-stream-server.js --name video-stream
   pm2 save
   pm2 startup  # Follow instructions to enable on boot
   ```

2. **Use systemd (Linux):**
   Create `/etc/systemd/system/video-stream.service`:
   ```ini
   [Unit]
   Description=Video Stream Server
   After=network.target

   [Service]
   Type=simple
   User=your-user
   WorkingDirectory=/path/to/camera-bridge
   ExecStart=/usr/bin/node video-stream-server.js
   Restart=always
   RestartSec=10
   Environment="VIDEO_STREAM_PORT=3001"
   Environment="CAMERA_1_IP=192.168.1.50"
   Environment="CAMERA_2_IP=192.168.1.49"

   [Install]
   WantedBy=multi-user.target
   ```

   Then:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable video-stream
   sudo systemctl start video-stream
   ```

