# Quick Start Guide - Camera Integration

This guide will help you quickly set up the plate number recognition camera integration with your Vercel-deployed web application.

## Prerequisites

- Camera accessible at `192.168.1.100` (or your camera IP)
- A machine on the same network as the camera to run the bridge service
- Node.js 18+ installed on the bridge machine
- Vercel deployment with MongoDB configured

## Step 1: Configure Vercel Environment Variables

In your Vercel project settings, add these environment variables:

```env
LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=gaali
MONGODB_COLLECTION=lpr_events
```

**See `ENV-EXAMPLES.md` in the project root for complete examples with all options.**

## Step 2: Choose Integration Method

### Option A: HTTP Push (Recommended)

**Advantages:**

- Real-time events (camera pushes immediately)
- More efficient (no constant polling)
- Lower latency

**Setup:**

1. **Configure Camera HTTP Push:**

   - Open `http://192.168.1.100/main.htm`
   - Go to **Advanced settings** → **Advanced Networks** → **HTTP push**
   - Set **Server address** to your bridge machine IP (e.g., `192.168.1.50`)
   - Set **port** to `3000`
   - Enable **Push license plate recognition results**
   - Set **address** to `/plate`
   - Click **Sure** to save

2. **Set Up Bridge Service:**

   ```bash
   cd camera-bridge
   cp .env.example .env
   # Edit .env with your values (see camera-bridge/.env.example for full example)
   npm install
   npm run build
   npm start
   ```

   **Example `.env` for HTTP Push mode:**

   ```env
   MODE=push
   BRIDGE_PORT=3000
   CLOUD_BASE_URL=https://your-app.vercel.app
   LPR_INGEST_SECRET=your-secret-from-vercel
   ```

### Option B: Polling

**Advantages:**

- Simpler camera configuration
- No need to configure camera HTTP push

**Setup:**

1. **Set Up Bridge Service:**
   ```bash
   cd camera-bridge
   cp .env.example .env
   # Edit .env:
   # MODE=poll
   # CAMERA_BASE_URL=http://192.168.1.100
   # CAMERA_RESULT_ID=6
   # POLL_MS=700
   # CLOUD_BASE_URL=https://your-app.vercel.app
   # LPR_INGEST_SECRET=your-secret-from-vercel
   npm install
   npm run build
   npm start
   ```

## Step 3: Test the Integration

1. **Test Bridge Service:**

   ```bash
   # For HTTP push mode
   curl http://localhost:3000/health

   # Should return: {"ok":true,"service":"camera-bridge-http-push",...}
   ```

2. **Test Camera Connection:**

   ```bash
   # For polling mode
   curl "http://192.168.1.100/ivs_result.php?{\"result_id\":6}&_=$(date +%s)"
   ```

3. **Test Frontend:**
   - Open your app at `/in-session` or `/out-session`
   - Enable "Камераас автоматаар" toggle
   - Check camera status indicator
   - When a plate is detected, it should auto-fill

## Step 4: Run Bridge as a Service

### Using PM2 (Recommended)

```bash
npm install -g pm2
cd camera-bridge
npm run build
pm2 start dist/index.js --name camera-bridge
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### Using systemd (Linux)

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

## Troubleshooting

### Bridge not receiving events

1. **Check bridge is running:**

   ```bash
   curl http://localhost:3000/health
   ```

2. **Check camera can reach bridge:**

   - From camera network, test: `ping bridge-ip`
   - Check firewall allows port 3000

3. **Check camera HTTP push config:**
   - Verify server address is correct
   - Test connection using camera's "Push test" tab

### Events not appearing in frontend

1. **Check Vercel logs:**

   - Go to Vercel dashboard → Functions → View logs
   - Look for `/api/lpr/ingest` requests

2. **Check MongoDB:**

   - Verify connection string is correct
   - Check if documents are being inserted

3. **Check frontend:**
   - Open browser console
   - Look for API errors
   - Check `/api/lpr/latest` returns data

## Next Steps

- See `docs/camera-setup-guide.md` for detailed camera configuration
- See `docs/lpr-integration.md` for architecture details
- See `camera-bridge/README.md` for bridge service details
