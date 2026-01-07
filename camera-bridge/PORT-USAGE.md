# Port Usage in Camera Bridge

This document explains which ports are used by each service in the camera-bridge application.

## Port Allocation

| Port | Service | Purpose | Environment Variable |
|------|---------|---------|---------------------|
| 3000 | Next.js Dev | Next.js development server | - |
| 3001 | Plate Events WebSocket | WebSocket server for plate recognition events | `WS_PORT` |
| 3002 | HTTP Server | HTTP endpoint for camera push events (`/plate`) | `HTTP_PORT` or `PORT` |
| 3003 | Control API | Control API server for start/stop/status | `CONTROL_PORT` |
| 3004 | Video Stream Server | WebSocket server for real-time video streaming | `VIDEO_STREAM_PORT` |

## Services Overview

### 1. camera-bridge (server.js)
- **HTTP Server**: Port 3002 (or `PORT` env var)
  - Receives plate recognition events from cameras
  - Endpoint: `POST /plate`
- **WebSocket Server**: Port 3001 (or `WS_PORT` env var)
  - Broadcasts plate events to frontend
  - Connection: `ws://localhost:3001`

### 2. camera-bridge-control (control-server.js)
- **HTTP Server**: Port 3003
  - Control API for managing camera-bridge service
  - Endpoints: `/control/status`, `/control/start`, `/control/stop`, `/control/restart`

### 3. video-stream-server (video-stream-server.js)
- **HTTP Server**: Port 3004 (or `VIDEO_STREAM_PORT` env var)
  - Health check endpoint: `GET /health`
- **WebSocket Server**: Port 3004 (same server)
  - Real-time video streaming
  - Connection: `ws://localhost:3004/video/{cameraId}`

## Running All Services

### Using PM2 (Recommended)

```bash
cd camera-bridge
pm2 start ecosystem.config.js
pm2 save
```

This will start all three services:
- `camera-bridge` - Plate events server
- `camera-bridge-control` - Control API
- `video-stream-server` - Video streaming

### Manual Start

```bash
# Terminal 1: Plate events server
cd camera-bridge
node server.js

# Terminal 2: Control API
cd camera-bridge
node control-server.js

# Terminal 3: Video stream server
cd camera-bridge
node video-stream-server.js
```

## Environment Variables

Create a `.env` file in `camera-bridge/`:

```env
# Plate Events Server (server.js)
HTTP_PORT=3002
WS_PORT=3001

# Control API (control-server.js)
CONTROL_PORT=3003
CAMERA_BRIDGE_CONTROL_TOKEN=your-secure-token

# Video Stream Server (video-stream-server.js)
VIDEO_STREAM_PORT=3004
CAMERA_1_IP=192.168.1.50
CAMERA_1_PORT=8000
CAMERA_1_USERNAME=admin
CAMERA_1_PASSWORD=admin
CAMERA_2_IP=192.168.1.49
CAMERA_2_PORT=8000
CAMERA_2_USERNAME=admin
CAMERA_2_PASSWORD=admin
```

## Frontend Configuration

In your Next.js `.env.local`:

```env
# Video stream WebSocket URL
NEXT_PUBLIC_VIDEO_WS_URL=ws://localhost:3004/video

# For production, use your server's IP or domain
# NEXT_PUBLIC_VIDEO_WS_URL=ws://your-server-ip:3004/video
```

## Checking Service Status

```bash
# Check all PM2 processes
pm2 status

# Check specific service
pm2 logs video-stream-server
pm2 logs camera-bridge
pm2 logs camera-bridge-control

# Check health endpoints
curl http://localhost:3002/health  # Plate events server
curl http://localhost:3003/health  # Control API
curl http://localhost:3004/health  # Video stream server
```

## Troubleshooting Port Conflicts

If you get "port already in use" errors:

1. **Check what's using the port:**
   ```bash
   # Linux/Mac
   lsof -i :3004
   
   # Windows
   netstat -ano | findstr :3004
   ```

2. **Change the port in environment variables:**
   ```env
   VIDEO_STREAM_PORT=3005  # Use a different port
   ```

3. **Update frontend configuration:**
   ```env
   NEXT_PUBLIC_VIDEO_WS_URL=ws://localhost:3005/video
   ```

