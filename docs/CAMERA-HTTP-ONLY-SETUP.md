# Camera Setup for HTTP-Only Cameras

If your camera only supports HTTP (not HTTPS), you **must use the camera-bridge service**. Direct connection to Vercel won't work because Vercel only accepts HTTPS connections.

## Architecture

```
Camera (HTTP only, local network)
    ↓ HTTP POST (port 3002)
Camera-Bridge Service (local server)
    ↓ HTTPS POST
Vercel API (/api/lpr/ingest)
    ↓
MongoDB
```

## Why Camera-Bridge is Required

- ❌ Your camera: HTTP only (no SSL/TLS support)
- ✅ Vercel: HTTPS only (no HTTP support)
- ✅ Solution: Camera-bridge accepts HTTP from camera, forwards HTTPS to Vercel

## Setup Instructions

### Step 1: Set Up Camera-Bridge Service

1. **Install and Configure Bridge**

   ```bash
   cd camera-bridge
   npm install
   ```

2. **Start with PM2** (recommended for production):

   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

   This starts both:
   - Camera-bridge service (ports 3001, 3002)
   - Control API (port 3003) - optional, for remote control

3. **Verify it's running:**

   ```bash
   pm2 status
   ```

   You should see `camera-bridge` and `camera-bridge-control` running.

### Step 2: Configure Camera HTTP Push Settings

1. **Access Camera Web Interface**
   - Open your camera's web interface (e.g., `http://192.168.1.100/main.htm`)
   - Login with your credentials

2. **Navigate to HTTP Push Configuration**
   - Click **"Advanced settings"** tab
   - In the left sidebar, click **"Advanced Networks"**
   - Click the **"HTTP push"** sub-tab

3. **Configure Push Settings**
   - **Master server priority**: Check "Enable"
   - **Server address**: Enter the IP address of the computer/server running camera-bridge
     - Example: `192.168.1.50` (your local server IP)
     - ⚠️ Use local IP address, not Vercel URL
     - ⚠️ Do NOT include `http://` or `https://` - just the IP address
   - **port**: Enter `3002` (camera-bridge HTTP port)
   - **SSL connection**: **❌ Leave UNCHECKED / Disabled** (camera uses HTTP, not HTTPS)
     - ⚠️ If you see an "HTTPS enable" button nearby, also leave that **disabled**
     - The camera-bridge accepts HTTP connections on port 3002
   - **Verification method**: Select "Anonymous"
   - **Timeout (s)**: Set to `5`
   
   **Important Notes:**
   - If your camera interface has multiple SSL/HTTPS options:
     - ❌ **HTTP Push SSL**: Disable (for sending data to bridge)
     - ❌ **HTTPS Port Enable**: Disable (if it's for the push connection)
     - ✅ **Camera Web Interface HTTPS**: Can enable (for secure camera web access - this is different)

4. **Configure Push License Plate Recognition**
   - **Push license plate recognition results**: 
     - Check "Enable"
     - **address**: Set to `/plate`
     - **Content detail level**: Select "all"
     - **Send pictures**: Optional (enable if you want images)

5. **Save Configuration**
   - Click the orange **"Sure"** button at the bottom
   - Wait for confirmation

### Step 3: Configure Camera-Bridge Environment (Optional)

If you need to customize settings, create `.env` file in `camera-bridge` directory:

```env
# Bridge will listen on port 3002 for camera HTTP pushes
BRIDGE_PORT=3002

# Your Vercel deployment URL
CLOUD_BASE_URL=https://your-app.vercel.app

# Secret token (must match Vercel LPR_INGEST_SECRET)
LPR_INGEST_SECRET=your-secret-here-must-match-vercel-env
```

Then restart:
```bash
pm2 restart camera-bridge
```

### Step 4: Verify Connection

1. **Check Bridge Logs:**
   ```bash
   pm2 logs camera-bridge
   ```

   You should see:
   ```
   🚀 HTTP Server running on http://0.0.0.0:3002
   📡 Ready to receive camera pushes at http://0.0.0.0:3002/plate
   ```

2. **Test from Camera:**
   - Go to camera web interface
   - Click "Push test" tab
   - Click "Confirm" to test
   - Check if connection succeeds

3. **Check Bridge Logs Again:**
   - You should see plate data being received
   - Bridge should forward to Vercel successfully

4. **Verify in Vercel:**
   - Check Vercel logs for incoming requests
   - Frontend should receive plate data via `/api/lpr/latest`

## Network Requirements

- ✅ Camera and camera-bridge must be on the **same local network**
- ✅ Camera must be able to reach bridge IP address (test with ping)
- ✅ Camera-bridge server must have **internet access** (to reach Vercel)
- ✅ Firewall must allow:
  - Inbound HTTP on port 3002 (from camera to bridge)
  - Outbound HTTPS on port 443 (from bridge to Vercel)

## Troubleshooting

### Camera Cannot Connect to Bridge

**Check:**
1. ✅ Bridge is running: `pm2 status`
2. ✅ Bridge IP address is correct in camera settings
3. ✅ Port is set to `3002` (not 3001 or 3003)
4. ✅ Camera and bridge are on same network
5. ✅ Firewall allows port 3002
6. ✅ SSL/TLS is **disabled** in camera settings (HTTP only)

**Test manually:**
```bash
# Test bridge endpoint locally
curl -X POST http://localhost:3002/plate \
  -H "Content-Type: application/json" \
  -d '{"AlarmInfoPlate":{"result":{"PlateResult":{"license":"TEST123"}}}}'
```

### Bridge Cannot Connect to Vercel

**Check:**
1. ✅ `CLOUD_BASE_URL` is correct in bridge config
2. ✅ Bridge server has internet access
3. ✅ `LPR_INGEST_SECRET` matches Vercel environment variable
4. ✅ Firewall allows outbound HTTPS (port 443)

**Check bridge logs:**
```bash
pm2 logs camera-bridge --lines 50
```

Look for errors about Vercel connection.

### No Data in Frontend

**Check:**
1. ✅ Bridge logs show plate data received
2. ✅ Bridge logs show successful forward to Vercel
3. ✅ Vercel logs show incoming requests to `/api/lpr/ingest`
4. ✅ Frontend is polling `/api/lpr/latest`
5. ✅ MongoDB has new documents

## Comparison: HTTP-Only vs HTTPS Camera

| Feature | HTTP-Only Camera | HTTPS Camera |
|---------|-----------------|--------------|
| **Connection Method** | Camera-Bridge (required) | Direct or Bridge (both work) |
| **Camera Network** | Local network only | Can be internet-accessible |
| **Security** | Camera isolated (more secure) | Camera exposed to internet |
| **Setup Complexity** | Medium (needs bridge server) | Simple (direct) or Medium (bridge) |
| **Bridge Required** | ✅ Yes | ❌ Optional |

## Summary

**For HTTP-only cameras:**
1. ✅ Use camera-bridge service (required)
2. ✅ Configure camera to push to bridge IP:3002 (HTTP, no SSL)
3. ✅ Bridge forwards to Vercel over HTTPS
4. ✅ Camera stays on local network (secure)

**Camera Settings Summary:**
- Server address: `192.168.1.50` (bridge IP, not Vercel URL)
- Port: `3002`
- SSL: **Disabled** (unchecked)
- Address: `/plate`

See [camera-bridge README](../camera-bridge/README.md) for more details on bridge setup.

