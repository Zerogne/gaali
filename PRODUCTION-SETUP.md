# Production Setup - Camera Bridge Server

## ⚠️ Important: Architecture Overview

**Your Setup:**

- ✅ **Next.js Frontend**: Deployed on **Vercel** (serverless)
- ⚠️ **Camera Bridge Server**: Must run on a **separate server/VPS** (NOT on Vercel)

**Why the bridge server can't run on Vercel:**

1. **Network Access**: It must be on the same LAN as your camera (e.g., `192.168.1.100`)
2. **Continuous Running**: It needs to run 24/7 (Vercel is serverless)
3. **WebSocket Support**: Requires persistent WebSocket connections (Vercel has limitations)
4. **Private IP Access**: Camera needs to reach the bridge via private IP (`192.168.x.x`)

**Solution**: Deploy the bridge server on a separate machine (VPS, local server, or cloud VM) that's on the same network as your camera.

## Quick Start (Recommended: PM2)

### 1. Deploy to Your Server/VPS

```bash
# SSH into your server
ssh user@your-server-ip

# Clone or upload the project
cd /opt  # or your preferred directory
git clone https://github.com/your-repo/gaali.git
cd gaali/camera-bridge

# Install PM2 globally
npm install -g pm2

# Install dependencies
npm install --production

# Copy environment file
cp .env.example .env
# Edit .env if needed (defaults work)

# Deploy
chmod +x deploy.sh
./deploy.sh
```

### 2. Configure Firewall

```bash
# Allow ports 3001 (WebSocket) and 3002 (HTTP)
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp
```

### 3. Update Frontend Environment Variable

In your **Vercel Dashboard** → **Settings** → **Environment Variables**, add:

```env
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=ws://YOUR_SERVER_IP:3001
```

**Replace `YOUR_SERVER_IP` with:**

- Your bridge server's **public IP** (Vercel can't access private IPs like `192.168.x.x`)
- Your bridge server's **domain name** (if you have one pointing to your server)
- ⚠️ **NOT** the LAN IP - Vercel needs a public IP or domain

**Important**:

- The bridge server must have a **public IP** or **domain** that Vercel can reach
- Port 3001 must be open in your firewall
- Consider using a reverse proxy (nginx) with SSL: `wss://your-domain.com:3001`

### 4. Configure Camera

1. Open camera web interface: `http://192.168.1.100/main.htm`
2. Go to **Advanced settings** → **Advanced Networks** → **HTTP push**
3. Configure:
   - **Server address**: `YOUR_SERVER_IP` (LAN IP of your server)
   - **Port**: `3002`
   - **Path**: `/plate`
   - **Enable**: "Push license plate recognition results"
4. Save and test

## Alternative Deployment Methods

See `camera-bridge/PRODUCTION-DEPLOYMENT.md` for:

- Docker deployment
- Systemd service
- Windows service
- Detailed troubleshooting

## Verification

### Check Server Status

```bash
# On your server
curl http://localhost:3002/health
# Should return: {"status":"ok"}
```

### Check Frontend Connection

1. Open your production site
2. Open browser console
3. Look for: `✅✅✅ Camera bridge WebSocket CONNECTED!`

### Test Camera Push

```bash
curl -X POST http://YOUR_SERVER_IP:3002/plate \
  -H "Content-Type: application/json" \
  -d '{
    "AlarmInfoPlate": {
      "result": {
        "PlateResult": {
          "license": "TEST123"
        }
      }
    }
  }'
```

## Common Issues

### Frontend Can't Connect

1. **Check firewall**: Port 3001 must be open
2. **Check URL**: Verify `NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL` is correct
3. **Check server**: `pm2 status` or `docker ps` to verify it's running
4. **Check logs**: `pm2 logs camera-bridge` or `docker-compose logs`

### Camera Not Sending Data

1. **Check camera settings**: Verify HTTP push is configured correctly
2. **Check network**: Camera must be able to reach server (`ping YOUR_SERVER_IP`)
3. **Check server logs**: Look for incoming POST requests

### Port Conflicts

If ports 3001/3002 are already in use:

1. Change ports in `.env`:
   ```env
   HTTP_PORT=3003
   WS_PORT=3004
   ```
2. Update frontend env var: `NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=ws://YOUR_SERVER_IP:3004`
3. Update camera HTTP push port to 3003
4. Restart server

## Monitoring

### PM2

```bash
pm2 status
pm2 logs camera-bridge
pm2 monit
```

### Docker

```bash
docker-compose logs -f camera-bridge
docker stats camera-bridge
```

## Updates

When you update the code:

```bash
# Pull latest
git pull

# Reinstall dependencies (if package.json changed)
npm install --production

# Restart
pm2 restart camera-bridge
# OR
docker-compose restart camera-bridge
```
