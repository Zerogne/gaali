# Camera Bridge Service

Local bridge service that polls an LPR camera on your LAN and pushes plate recognition events to the cloud API.

## Architecture

```
Camera (LAN) → Bridge Service (LAN) → Vercel API (HTTPS) → MongoDB → Frontend
```

The bridge service runs on a machine in the same network as the camera, eliminating the need for the cloud server to access private IP addresses.

## Installation

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your configuration:**
   ```env
   CAMERA_BASE_URL=http://192.168.1.100
   CAMERA_RESULT_ID=6
   POLL_MS=700
   
   CLOUD_BASE_URL=https://gaali.vercel.app
   LPR_INGEST_SECRET=your-secret-here-must-match-vercel-env
   
   FETCH_IMAGE=false  # Optional: set to true to fetch snapshot images
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

**Build:**
```bash
npm run build
```

**Run:**
```bash
npm start
```

## Running as a Service

### Windows (NSSM)

1. Download [NSSM](https://nssm.cc/download)
2. Run:
   ```cmd
   nssm install CameraBridge "C:\Program Files\nodejs\node.exe"
   nssm set CameraBridge AppDirectory "C:\path\to\camera-bridge"
   nssm set CameraBridge AppParameters "dist/index.js"
   nssm start CameraBridge
   ```

### Linux (systemd)

Create `/etc/systemd/system/camera-bridge.service`:

```ini
[Unit]
Description=Camera Bridge Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/camera-bridge
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable camera-bridge
sudo systemctl start camera-bridge
```

### PM2 (Cross-platform)

```bash
npm install -g pm2
pm2 start dist/index.js --name camera-bridge
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

## Configuration

### Required Environment Variables

- `CAMERA_BASE_URL` - Camera IP address (e.g., `http://192.168.1.100`)
- `CAMERA_RESULT_ID` - Camera result ID (default: `6`)
- `POLL_MS` - Polling interval in milliseconds (default: `700`)
- `CLOUD_BASE_URL` - Your Vercel deployment URL (e.g., `https://gaali.vercel.app`)
- `LPR_INGEST_SECRET` - Secret token (must match `LPR_INGEST_SECRET` in Vercel)

### Optional

- `FETCH_IMAGE` - Set to `true` to fetch snapshot images (requires camera snapshot endpoint to be discovered)

## How It Works

1. **Polls camera** every `POLL_MS` milliseconds
2. **Parses response** and extracts:
   - `plateNumber` from `PlateResult.license`
   - `recognizedAt` from `PlateResult.trigger_time`
   - `imagePath` from `PlateResult.image_path` or `PlateResult.image_sd_path`
3. **Deduplicates** events by key: `${plateNumber}|${recognizedAt}|${imagePath}`
4. **Pushes to cloud** via POST to `/api/lpr/ingest`
5. **Retries on failure** with exponential backoff (caps at ~10 seconds)

## Troubleshooting

### Camera not responding
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
