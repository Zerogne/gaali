# Camera-Bridge with Vercel Hosting

## Architecture Overview

When using Vercel to host your Next.js application, the camera-bridge service **must run on a separate server**, not on Vercel.

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK                            │
│                                                             │
│  ┌──────────┐         ┌──────────────────┐                │
│  │  Camera  │────────▶│  Camera-Bridge   │                │
│  │  (LAN)   │  HTTP   │  Service (PM2)   │                │
│  └──────────┘  Push   │  Port 3002       │                │
│                       │  Port 3001 (WS)  │                │
│                       └────────┬─────────┘                │
│                                │                           │
│                                │ WebSocket/HTTP            │
└────────────────────────────────┼───────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   INTERNET / HTTPS      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Vercel (Next.js App)  │
                    │   - Frontend            │
                    │   - API Routes          │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      MongoDB            │
                    └─────────────────────────┘
```

## Why Camera-Bridge Can't Run on Vercel

Vercel is a **serverless platform** that:
- ❌ Cannot run long-running processes
- ❌ Cannot maintain WebSocket connections
- ❌ Cannot bind to specific ports (3001, 3002)
- ❌ Functions timeout after a limited duration

The camera-bridge service needs to:
- ✅ Run continuously (24/7)
- ✅ Accept HTTP requests from cameras
- ✅ Maintain WebSocket connections with browsers
- ✅ Bind to specific ports

## Deployment Options for Camera-Bridge

### Option 1: Local Server/Computer (Recommended for Testing)

Run camera-bridge on a computer/server on the same network as your camera:

```bash
# On your local server
cd camera-bridge
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Pros:**
- Easy to set up
- Direct network access to camera
- Low latency

**Cons:**
- Computer must stay on 24/7
- Requires port forwarding for remote access (if needed)

### Option 2: VPS (Recommended for Production)

Use a VPS provider (DigitalOcean, Linode, AWS EC2, etc.):

1. **Create a VPS instance** (Ubuntu 20.04+ recommended)
2. **Install Node.js** and PM2
3. **Clone your repository** or copy camera-bridge files
4. **Run with PM2:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

**Pros:**
- Always online
- Better uptime
- Can handle multiple cameras
- Professional hosting

**Cons:**
- Costs money ($5-20/month typically)
- Camera must be accessible from VPS (VPN or public IP)

### Option 3: Raspberry Pi / IoT Device

Run on a Raspberry Pi on your local network:

Same setup as Option 1, but on a Raspberry Pi.

**Pros:**
- Low power consumption
- Small footprint
- Good for permanent installation

**Cons:**
- Less powerful
- Requires SD card setup

## Network Configuration

### Camera → Camera-Bridge

The camera needs to send HTTP POST requests to camera-bridge:

```
Camera HTTP Push URL: http://CAMERA_BRIDGE_IP:3002/plate
```

**Requirements:**
- Camera and camera-bridge must be on the same network (or camera-bridge must be accessible)
- Port 3002 must be open on camera-bridge server
- Firewall must allow inbound connections on port 3002

### Browser → Camera-Bridge (WebSocket)

Browsers accessing your Vercel-hosted app connect to camera-bridge via WebSocket:

```
WebSocket URL: ws://CAMERA_BRIDGE_IP:3001
```

**Requirements:**
- Camera-bridge server must be accessible from the internet (or via VPN)
- Port 3001 must be open
- If behind NAT, use port forwarding or tunnel service

### Browser ↔ Vercel

Normal HTTPS traffic to your Vercel deployment (automatic, no special config needed).

### Camera-Bridge → Vercel API

Camera-bridge sends plate data to your Vercel API:

```
POST https://your-app.vercel.app/api/lpr/ingest
```

**Requirements:**
- Camera-bridge server needs outbound HTTPS access
- API endpoint must be publicly accessible (Vercel handles this)

## Security Considerations

### 1. WebSocket Security (Port 3001)

If exposing port 3001 publicly:
- Consider using **WSS (WebSocket Secure)** instead of WS
- Use a reverse proxy (nginx) with SSL certificates
- Or use a VPN/tunnel for secure access

### 2. Camera HTTP Push (Port 3002)

Keep port 3002 on your local network only. Don't expose it publicly unless necessary.

### 3. API Security

Your Vercel API endpoint (`/api/lpr/ingest`) should be protected with:
- Authentication tokens/headers
- Rate limiting
- Request validation

## Configuration Example

### Camera-Bridge Server Setup

```bash
# Install dependencies
cd camera-bridge
npm install

# Install PM2
npm install -g pm2

# Start service
pm2 start ecosystem.config.js

# Save and enable auto-start
pm2 save
pm2 startup
```

### Environment Variables (if needed)

Camera-bridge uses default ports (3001, 3002) and doesn't require environment variables for basic operation. However, if you need to customize:

Create `.env` file (optional):
```env
HTTP_PORT=3002
WS_PORT=3001
NODE_ENV=production
```

### Vercel Configuration

No special configuration needed for Vercel. Your Next.js app on Vercel will:
- Serve the frontend normally
- Handle API routes (including `/api/lpr/ingest`)
- Connect to MongoDB as configured

### Frontend Configuration

If your frontend needs to know the camera-bridge WebSocket URL, you can:

1. **Use environment variable** (for dynamic configuration):
   ```env
   NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=ws://your-server-ip:3001
   ```

2. **Or hardcode** in your code (for fixed IP):
   ```typescript
   const WS_URL = 'ws://your-server-ip:3001';
   ```

## Troubleshooting

### Camera-Bridge Can't Connect to Vercel API

- Check internet connection on camera-bridge server
- Verify Vercel API URL is correct
- Check firewall allows outbound HTTPS (port 443)

### Browsers Can't Connect to WebSocket (Port 3001)

- Verify camera-bridge is running: `pm2 status`
- Check firewall allows inbound connections on port 3001
- If behind NAT, configure port forwarding
- Test connection: `curl http://your-server-ip:3001` (should get connection)

### Camera Can't Push to Camera-Bridge

- Verify camera-bridge is running: `pm2 status`
- Check camera and camera-bridge are on same network
- Verify camera HTTP push URL is correct: `http://camera-bridge-ip:3002/plate`
- Test endpoint: `curl -X POST http://camera-bridge-ip:3002/plate -d '{"test":"data"}'`

## Summary

1. **Vercel** = Hosts your Next.js app (frontend + API)
2. **Camera-Bridge** = Runs on separate server (local/VPS) with PM2
3. **Camera** = Connects to camera-bridge (same network)
4. **Browsers** = Connect to both Vercel (HTTPS) and camera-bridge (WebSocket)

The camera-bridge acts as a bridge between your local camera network and your cloud-hosted Vercel application.

