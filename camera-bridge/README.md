# Camera Bridge Service

Local bridge service that connects an LPR camera on your LAN to the cloud API. Supports both HTTP push (camera pushes to bridge) and polling (bridge polls camera) modes.

## ⚠️ Important: Vercel Hosting

**If you're using Vercel to host your Next.js app:** The camera-bridge service **cannot run on Vercel** (Vercel is serverless and doesn't support long-running services). The camera-bridge **must run on a separate server** (local machine, VPS, Raspberry Pi, etc.). See [VERCEL-ARCHITECTURE.md](./VERCEL-ARCHITECTURE.md) for detailed architecture and deployment instructions.

## Architecture

```
Camera (LAN) → Bridge Service (LAN) → Vercel API (HTTPS) → MongoDB → Frontend
```

The bridge service runs on a machine in the same network as the camera, eliminating the need for the cloud server to access private IP addresses.

**Key Point:** The bridge service runs on a separate server (not on Vercel), and connects your local camera network to your cloud-hosted Vercel application.

## Modes

### HTTP Push Mode (Recommended)
The camera pushes plate recognition events directly to the bridge service via HTTP POST. This is more efficient and real-time.

### Polling Mode
The bridge service periodically polls the camera API to fetch new plate recognition events.

### Both Modes
Run both services simultaneously for redundancy.

## Installation

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your configuration:**

   **For HTTP Push Mode:**
   ```env
   MODE=push
   BRIDGE_PORT=3000
   
   CLOUD_BASE_URL=https://gaali.vercel.app
   LPR_INGEST_SECRET=your-secret-here-must-match-vercel-env
   ```

   **For Polling Mode:**
   ```env
   MODE=poll
   CAMERA_BASE_URL=http://192.168.1.100
   CAMERA_RESULT_ID=6
   POLL_MS=700
   
   CLOUD_BASE_URL=https://gaali.vercel.app
   LPR_INGEST_SECRET=your-secret-here-must-match-vercel-env
   FETCH_IMAGE=false  # Optional: set to true to fetch snapshot images
   ```

   **For Both Modes:**
   ```env
   MODE=both
   BRIDGE_PORT=3000
   CAMERA_BASE_URL=http://192.168.1.100
   CAMERA_RESULT_ID=6
   POLL_MS=700
   
   CLOUD_BASE_URL=https://gaali.vercel.app
   LPR_INGEST_SECRET=your-secret-here-must-match-vercel-env
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

## Running

### Development

```bash
npm run dev
```

### Production

**Simple start (for testing):**
```bash
npm start
```
This runs `node server.js` directly. For production, use PM2 or systemd (see below) to run as a service.

## Control API (Remote Start/Stop)

The camera-bridge includes a control API that allows you to start, stop, restart, and check the status of the service remotely from your web interface.

See [CONTROL-API.md](./CONTROL-API.md) for detailed documentation.

**Quick setup:**

1. **Start both services** (main service + control API):
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

2. **Set authentication token** (for security):
   ```bash
   export CAMERA_BRIDGE_CONTROL_TOKEN="your-secure-token"
   pm2 restart camera-bridge-control
   ```

3. **Configure frontend** - Set `NEXT_PUBLIC_CAMERA_BRIDGE_CONTROL_TOKEN` environment variable in your Next.js app to match the token above.

The control API runs on port 3003 and provides endpoints:
- `GET /control/status` - Check if service is running
- `POST /control/start` - Start the service
- `POST /control/stop` - Stop the service
- `POST /control/restart` - Restart the service

**Note:** If your frontend is hosted on Vercel, the control API must be accessible from the internet (or use a VPN). The browser needs to be able to reach port 3003 on your server.

## Running as a Service

### Windows (NSSM)

1. Download [NSSM](https://nssm.cc/download)
2. Run:
   ```cmd
   nssm install CameraBridge "C:\Program Files\nodejs\node.exe"
   nssm set CameraBridge AppDirectory "C:\path\to\camera-bridge"
   nssm set CameraBridge AppParameters "server.js"
   nssm start CameraBridge
   ```

**Important:** Replace `C:\path\to\camera-bridge` with your actual camera-bridge directory path.

### Linux (systemd)

1. Create `/etc/systemd/system/camera-bridge.service`:

```ini
[Unit]
Description=Camera Bridge Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/camera-bridge
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

**Important:** Replace `/path/to/camera-bridge` with your actual camera-bridge directory path and `your-user` with the user that should run the service.

2. Then run:
```bash
sudo systemctl daemon-reload
sudo systemctl enable camera-bridge
sudo systemctl start camera-bridge
```

3. Check status:
```bash
sudo systemctl status camera-bridge
```

4. View logs:
```bash
sudo journalctl -u camera-bridge -f
```

### PM2 (Cross-platform - Recommended)

**Option 1: Using ecosystem file (recommended):**

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Update the path in `ecosystem.config.js` if needed (it should auto-detect)

3. Start the service:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. Save the PM2 process list so it restarts on reboot:
   ```bash
   pm2 save
   ```

5. Generate startup script (follow the instructions it prints):
   ```bash
   pm2 startup
   ```

**Option 2: Simple command:**

```bash
npm install -g pm2
pm2 start server.js --name camera-bridge
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

**PM2 Useful Commands:**
- View logs: `pm2 logs camera-bridge`
- Restart: `pm2 restart camera-bridge`
- Stop: `pm2 stop camera-bridge`
- Status: `pm2 status`
- Monitor: `pm2 monit`

## Configuration

### Required Environment Variables

**Common (all modes):**
- `MODE` - Service mode: `"push"`, `"poll"`, or `"both"` (default: `"poll"`)
- `CLOUD_BASE_URL` - Your Vercel deployment URL (e.g., `https://gaali.vercel.app`)
- `LPR_INGEST_SECRET` - Secret token (must match `LPR_INGEST_SECRET` in Vercel, minimum 16 characters)

**HTTP Push Mode:**
- `BRIDGE_PORT` - Port for bridge service to listen on (default: `3000`)

**Polling Mode:**
- `CAMERA_BASE_URL` - Camera IP address (e.g., `http://192.168.1.100`)
- `CAMERA_RESULT_ID` - Camera result ID (default: `6`)
- `POLL_MS` - Polling interval in milliseconds (default: `700`)

### Optional

- `FETCH_IMAGE` - Set to `"true"` to fetch snapshot images (polling mode only)

## How It Works

### HTTP Push Mode

1. **Bridge service listens** on `BRIDGE_PORT` (default: 3000)
2. **Camera pushes events** to `http://bridge-ip:3000/plate` via HTTP POST
3. **Bridge receives and parses** the camera payload
4. **Extracts plate data** from various camera response formats
5. **Pushes to cloud** via POST to `/api/lpr/ingest` on Vercel
6. **Retries on failure** with exponential backoff

### Polling Mode

1. **Polls camera** every `POLL_MS` milliseconds at `/ivs_result.php?result_id={CAMERA_RESULT_ID}`
2. **Parses response** and extracts:
   - `plateNumber` from `PlateResult.license`
   - `recognizedAt` from `PlateResult.trigger_time`
   - `imagePath` from `PlateResult.image_path` or `PlateResult.image_sd_path`
3. **Deduplicates** events by key: `${plateNumber}|${recognizedAt}|${imagePath}`
4. **Pushes to cloud** via POST to `/api/lpr/ingest`
5. **Retries on failure** with exponential backoff (caps at ~10 seconds)

## Troubleshooting

### HTTP Push Mode Issues

**Camera not pushing events:**
- Verify camera HTTP push is configured correctly (see `docs/camera-setup-guide.md`)
- Check bridge service is running and listening on correct port
- Test bridge health: `curl http://localhost:3000/health`
- Check camera can reach bridge IP: `ping bridge-ip`
- Verify firewall allows connections on `BRIDGE_PORT`

**Bridge not receiving pushes:**
- Check bridge logs for incoming requests
- Verify camera HTTP push server address points to bridge IP:port
- Test manually: `curl -X POST http://localhost:3000/plate -H "Content-Type: application/json" -d '{"PlateResult":{"license":"TEST123","trigger_time":"2025-12-23 19:00:00"}}'`

### Polling Mode Issues

**Camera not responding:**
- Verify `CAMERA_BASE_URL` is correct and accessible from the bridge machine
- Check camera is powered on and on the same network
- Test the URL manually: `curl "http://192.168.1.100/ivs_result.php?{\"result_id\":6}&_=1234567890"`

### Cloud API errors
- Verify `LPR_INGEST_SECRET` matches the secret in Vercel environment variables
- Check `CLOUD_BASE_URL` is correct
- Ensure Vercel deployment has `LPR_INGEST_SECRET` configured

### Events not appearing in frontend
- Check bridge logs for successful pushes
- Verify MongoDB is configured correctly in Vercel
- Check browser console for API errors
- Test Vercel API directly: `curl -X POST https://your-app.vercel.app/api/lpr/ingest -H "Authorization: Bearer your-secret" -H "Content-Type: application/json" -d '{"plateNumber":"TEST","recognizedAt":"2025-12-23 19:00:00","cameraIp":"192.168.1.100"}'`

## Requirements

- Node.js 18+ 
- Network access to camera IP
- Outbound HTTPS access to Vercel
- Must run on same router/LAN as camera

## Notes

- The service is resilient: it will continue polling even if individual requests fail
- Unhandled promise rejections are caught to prevent crashes
- Graceful shutdown on SIGINT/SIGTERM
- UTF-8 plates (including Cyrillic) are fully supported
