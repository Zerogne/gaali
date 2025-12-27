# Camera Bridge Control API

The camera-bridge service includes a control API that allows you to start, stop, restart, and check the status of the service remotely.

## Architecture

The control API runs as a separate service on port 3003 (configurable via `CONTROL_PORT` environment variable). It provides HTTP endpoints to control the camera-bridge service via PM2 commands.

## Setup

### 1. Start Both Services with PM2

The easiest way is to use the provided ecosystem config which starts both services:

```bash
cd camera-bridge
pm2 start ecosystem.config.js
pm2 save
```

This will start:
- `camera-bridge` - The main bridge service (ports 3001, 3002)
- `camera-bridge-control` - The control API (port 3003)

### 2. Set Authentication Token

For security, set an authentication token via environment variable:

```bash
export CAMERA_BRIDGE_CONTROL_TOKEN="your-secure-token-here"
pm2 restart camera-bridge-control
```

Or add it to your `.env` file (create one if it doesn't exist):

```env
CAMERA_BRIDGE_CONTROL_TOKEN=your-secure-token-here
CONTROL_PORT=3003
```

### 3. Update Frontend Environment Variable

In your Next.js app (Vercel environment variables or `.env.local`):

```env
NEXT_PUBLIC_CAMERA_BRIDGE_CONTROL_TOKEN=your-secure-token-here
```

**Important:** The token must match between the control server and your frontend.

## API Endpoints

All control endpoints require authentication via the `CAMERA_BRIDGE_CONTROL_TOKEN`.

### Health Check

```http
GET /health
```

No authentication required. Returns service status.

**Response:**
```json
{
  "status": "ok",
  "service": "camera-bridge-control",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

### Get Status

```http
GET /control/status?token=YOUR_TOKEN
```

Or with Bearer token:
```http
GET /control/status
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "running": true,
  "status": "online",
  "uptime": 1234567890,
  "restarts": 0,
  "process": {
    "pid": 12345,
    "name": "camera-bridge",
    "status": "online",
    "memory": 52428800,
    "cpu": 2.5
  }
}
```

### Start Service

```http
POST /control/start
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "token": "YOUR_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Camera bridge started/restarted",
  "output": "PM2 output..."
}
```

### Stop Service

```http
POST /control/stop
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "token": "YOUR_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Camera bridge stopped",
  "output": "PM2 output..."
}
```

### Restart Service

```http
POST /control/restart
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "token": "YOUR_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Camera bridge restarted",
  "output": "PM2 output..."
}
```

## Usage from Frontend

The control API is integrated into the Settings panel. You can:

1. Go to Settings → Camera tab
2. Use the "Camera Bridge Control" section
3. Click buttons to Start/Stop/Restart/Check Status

The frontend automatically uses the token from `NEXT_PUBLIC_CAMERA_BRIDGE_CONTROL_TOKEN` environment variable.

## Manual Testing

### Using curl

```bash
# Get status
curl "http://localhost:3003/control/status?token=YOUR_TOKEN"

# Start service
curl -X POST http://localhost:3003/control/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'

# Stop service
curl -X POST http://localhost:3003/control/stop \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'

# Restart service
curl -X POST http://localhost:3003/control/restart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'
```

## Security Considerations

1. **Authentication Token**: Always set a strong `CAMERA_BRIDGE_CONTROL_TOKEN`. Never use the default token in production.

2. **Network Access**: The control API (port 3003) should only be accessible from:
   - Your local network (if running on local machine)
   - Specific IPs via firewall rules (if on VPS)
   - VPN only (most secure)

3. **HTTPS/WSS**: For production, consider:
   - Using a reverse proxy (nginx) with SSL certificates
   - Setting up a VPN for secure access
   - Using environment-specific tokens

4. **Default Token**: The default token `change-me-in-production` should be changed immediately.

## Troubleshooting

### Control API won't start

- Check if port 3003 is already in use: `netstat -tulpn | grep 3003`
- Check PM2 logs: `pm2 logs camera-bridge-control`
- Verify Node.js is installed: `node --version`

### Authentication fails

- Verify `CAMERA_BRIDGE_CONTROL_TOKEN` is set on the control server
- Verify `NEXT_PUBLIC_CAMERA_BRIDGE_CONTROL_TOKEN` matches in your frontend
- Check that you're sending the token correctly (Bearer header or in body/query)

### PM2 commands fail

- Make sure PM2 is installed: `npm install -g pm2`
- Check PM2 can find the camera-bridge service: `pm2 list`
- Verify the working directory in control-server.js is correct

### Frontend can't connect

- Verify control server is running: `pm2 status`
- Check firewall allows port 3003
- Verify the bridge IP address is correct in settings
- Test the health endpoint: `curl http://bridge-ip:3003/health`

## Notes

- The control API runs independently from the main bridge service
- Both services can be managed via PM2
- The control API requires PM2 to be installed to execute commands
- If PM2 is not installed or the service name doesn't match, commands will fail gracefully with error messages

