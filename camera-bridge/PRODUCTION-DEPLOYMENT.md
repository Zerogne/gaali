# Camera Bridge - Production Deployment Guide

This guide explains how to run the camera-bridge service in production.

## Important: Vercel Hosting Architecture

**⚠️ The camera-bridge service CANNOT run on Vercel.** Vercel is a serverless platform that cannot run long-running services or WebSocket servers.

### Architecture Overview

```
Camera (Local Network)
    ↓
Camera-Bridge Service (Must run on a separate server)
    ↓
Vercel API (Your Next.js app) 
    ↓
MongoDB
```

### Where to Run Camera-Bridge

The camera-bridge service **must run on a separate server** that:
- Is on the same local network as the camera (for HTTP push/polling)
- Can run Node.js continuously (not serverless)
- Has outbound HTTPS access to your Vercel API
- Can accept WebSocket connections from browsers (if needed)

**Recommended options:**
- **Local server/computer** on your network (where the camera is)
- **VPS** (DigitalOcean, Linode, AWS EC2, etc.)
- **Dedicated server** on your network
- **Raspberry Pi** or similar device on the local network

The Next.js frontend on Vercel will connect to this camera-bridge service via WebSocket or HTTP, depending on your configuration.

## Quick Start (PM2 - Recommended)

PM2 is the easiest and most reliable way to run the camera-bridge service in production.

### Installation

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Navigate to the camera-bridge directory:**
   ```bash
   cd camera-bridge
   ```

3. **Start the service using the ecosystem config:**
   ```bash
   pm2 start ecosystem.config.js
   ```

   Or start directly:
   ```bash
   pm2 start server.js --name camera-bridge
   ```

4. **Save the PM2 process list (so it persists after reboot):**
   ```bash
   pm2 save
   ```

5. **Set up PM2 to start on system boot:**
   ```bash
   pm2 startup
   ```
   Follow the instructions it prints (usually requires running a sudo command).

### Managing the Service

- **View logs:** `pm2 logs camera-bridge`
- **Restart:** `pm2 restart camera-bridge`
- **Stop:** `pm2 stop camera-bridge`
- **Start:** `pm2 start camera-bridge`
- **Status:** `pm2 status`
- **Monitor:** `pm2 monit`

## Alternative: systemd (Linux)

If you prefer systemd for Linux servers:

1. **Create the service file:**
   ```bash
   sudo nano /etc/systemd/system/camera-bridge.service
   ```

2. **Add this content (update paths):**
   ```ini
   [Unit]
   Description=Camera Bridge Service
   After=network.target

   [Service]
   Type=simple
   User=your-username
   WorkingDirectory=/full/path/to/camera-bridge
   ExecStart=/usr/bin/node server.js
   Restart=always
   RestartSec=10
   Environment="NODE_ENV=production"

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable camera-bridge
   sudo systemctl start camera-bridge
   ```

4. **Check status:**
   ```bash
   sudo systemctl status camera-bridge
   ```

5. **View logs:**
   ```bash
   sudo journalctl -u camera-bridge -f
   ```

## What Ports Does It Use?

- **Port 3002:** HTTP endpoint for camera to push plate data (`/plate`)
- **Port 3001:** WebSocket server for frontend connections (from browsers accessing your Vercel-hosted app)

Make sure these ports are:
- Open in your firewall
- Not used by other services
- Accessible from:
  - Your camera (port 3002) - must be on same local network
  - Browsers accessing your Vercel app (port 3001) - may need to expose publicly or use VPN/tunnel

**Note:** If your camera-bridge is behind a firewall/NAT, you may need to:
- Use a VPN for secure access
- Use a reverse proxy (nginx) with SSL
- Use a tunnel service (ngrok, Cloudflare Tunnel) for port 3001 (WebSocket)
- Configure port forwarding if cameras are remote

## Environment Variables

The service doesn't require environment variables to run (it works out of the box), but you can set:

- `NODE_ENV=production` (already set by PM2/systemd)

## Troubleshooting

### Service won't start
- Check if ports 3001 and 3002 are already in use: `netstat -tulpn | grep -E '3001|3002'`
- Check logs: `pm2 logs camera-bridge` or `sudo journalctl -u camera-bridge`

### Camera can't connect
- Verify the camera-bridge is running: `pm2 status` or `sudo systemctl status camera-bridge`
- Check firewall rules allow port 3002
- Verify camera HTTP push URL is set to: `http://YOUR_SERVER_IP:3002/plate`

### Frontend can't connect
- Verify WebSocket server is running (check logs for "WebSocket server listening on port 3001")
- Check firewall rules allow port 3001
- Verify frontend WebSocket URL is: `ws://YOUR_SERVER_IP:3001`

## Notes

- The service runs `server.js` directly (no build step needed)
- It's designed to run continuously and auto-restart if it crashes
- Logs are saved to `./logs/` directory when using PM2 ecosystem config
- For production, always use PM2 or systemd - don't use `npm run dev` or `npm start` directly

