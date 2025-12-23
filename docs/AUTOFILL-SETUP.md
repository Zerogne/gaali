# Plate Number Autofill Setup

This guide explains how the plate number autofill works and how to set it up.

## How It Works

The autofill system uses a bridge service that connects your camera to your Vercel-deployed application:

```
Camera (192.168.1.100)
  ↓ Detects plate number
Bridge Service (Local Network)
  ↓ Sends to Vercel API
Vercel API (/api/lpr/ingest)
  ↓ Stores in MongoDB
Frontend polls /api/lpr/latest
  ↓ Auto-fills plate input
```

## Setup Steps

### 1. Configure Vercel Environment Variables

In your Vercel project settings, add:

```env
LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=gaali
MONGODB_COLLECTION=lpr_events
```

### 2. Set Up Bridge Service

The bridge service runs on a machine in the same network as your camera.

**Option A: HTTP Push Mode (Recommended)**

1. Configure camera to push to bridge service (see `docs/camera-setup-guide.md`)
2. Set up bridge service:

```bash
cd camera-bridge
cp .env.example .env
# Edit .env:
# MODE=push
# BRIDGE_PORT=3000
# CLOUD_BASE_URL=https://your-app.vercel.app
# LPR_INGEST_SECRET=your-secret-from-vercel
npm install
npm run build
npm start
```

**Option B: Polling Mode**

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

### 3. Test the Integration

1. **Start the bridge service** (see above)
2. **Open your application** at `/in-session` or `/out-session`
3. **Enable autofill** by toggling the "Камера" switch next to the plate number input
4. **Wait for camera detection** - when a plate is detected, it should automatically fill the input field

## Frontend Integration

The autofill is handled by the `useLprPlateAutofill` hook, which:

- Polls `/api/lpr/latest` every 1 second (configurable)
- Automatically fills the plate number input when:
  - The field is empty, OR
  - The field matches the previously auto-filled value
- Respects user input:
  - Won't overwrite if user is typing
  - Won't overwrite if user typed within last 1.5 seconds
  - Won't overwrite if field has different content

## User Interface

### Plate Number Input

- **Toggle Switch**: Enable/disable autofill (stored in localStorage)
- **Status Indicator**: Shows connection status:
  - "Камера холбогдож байна..." - Polling/connecting
  - "Камера холбогдсон" - Connected and receiving data
  - "Камера алдаа: ..." - Error occurred
- **Last Detected Plate**: Shows the most recently detected plate number

### Status Messages

- **Blue indicator**: Camera is connected and working
- **Red indicator**: Error occurred (check bridge service and Vercel logs)

## Troubleshooting

### Autofill Not Working

1. **Check bridge service is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check Vercel API:**
   ```bash
   curl https://your-app.vercel.app/api/lpr/latest
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for `/api/lpr/latest` requests

4. **Verify toggle is enabled:**
   - Make sure "Камера" switch is ON
   - Check localStorage: `localStorage.getItem('lprAutofillEnabled')` should be `"true"`

### Plate Not Detecting

1. **Check camera is working:**
   - Verify camera is powered on
   - Check camera web interface at `http://192.168.1.100`
   - Test camera recognition manually

2. **Check bridge service logs:**
   - Look for "✓ Pushed plate: ..." messages
   - Check for error messages

3. **Check MongoDB:**
   - Verify documents are being inserted
   - Check `lpr_events` collection

### Status Shows Error

1. **Check Vercel environment variables:**
   - Verify `LPR_INGEST_SECRET` is set
   - Verify MongoDB connection string is correct

2. **Check bridge service configuration:**
   - Verify `LPR_INGEST_SECRET` matches Vercel
   - Verify `CLOUD_BASE_URL` is correct

3. **Check network connectivity:**
   - Bridge service must be able to reach Vercel API
   - Camera must be able to reach bridge service (HTTP push mode)

## Advanced Configuration

### Change Polling Interval

In the session page component, you can customize the polling interval:

```typescript
const cameraAutofill = useLprPlateAutofill({
  pollInterval: 2000, // Poll every 2 seconds instead of 1
  enabled: true,
});
```

### Disable Autofill by Default

```typescript
const cameraAutofill = useLprPlateAutofill({
  enabled: false, // User must enable manually
});
```

## Testing

### Manual Test

1. Start bridge service
2. Open `/in-session` page
3. Enable camera toggle
4. Trigger camera recognition (drive vehicle past camera)
5. Verify plate number appears in input field

### API Test

Test the full flow:

```bash
# 1. Send test event to Vercel API
curl -X POST https://your-app.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "TEST123",
    "recognizedAt": "2025-12-23 19:00:00",
    "cameraIp": "192.168.1.100"
  }'

# 2. Check if it's available
curl https://your-app.vercel.app/api/lpr/latest

# 3. Should return:
# {
#   "plateNumber": "TEST123",
#   "recognizedAt": "2025-12-23 19:00:00",
#   ...
# }
```

## Next Steps

- See `docs/camera-setup-guide.md` for camera configuration
- See `docs/QUICK-START.md` for quick setup instructions
- See `camera-bridge/README.md` for bridge service details
