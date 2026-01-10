# Electron App Integration Guide

## Quick Start: Adding Camera Frame Upload to Your Electron App

### Step 1: Copy the Upload Function

Copy the `pushVideoToWebsiteAPI` function from `ELECTRON-BINARY-UPLOAD.js` into your Electron app's main process file (usually `main.js` or `main.ts`).

### Step 2: Set Environment Variables

In your Electron app, set these environment variables:

```javascript
// In your Electron app's main process
process.env.SITE_URL = 'https://gaali.vercel.app'; // or your Vercel URL
process.env.INGEST_SECRET = 'your-secret-here'; // Same as Vercel INGEST_SECRET
process.env.UPLOAD_FPS = '10'; // Optional: 8-12 fps (default: 10)
```

Or use a `.env` file:
```env
SITE_URL=https://gaali.vercel.app
INGEST_SECRET=your-secret-here
UPLOAD_FPS=10
```

### Step 3: Integrate with Your FFmpeg Frame Extraction

Your Electron app likely already extracts JPEG frames from FFmpeg. Find where you extract frames and add the upload call:

```javascript
// Example: In your FFmpeg frame callback
function onFrameExtracted(cameraId, jpegBuffer) {
  // jpegBuffer is a Node.js Buffer containing raw JPEG data
  
  // Upload to website
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now()).catch((err) => {
    console.error(`[Camera ${cameraId}] Upload error:`, err);
  });
  
  // Keep your existing local streaming code (node-rtsp-stream-jsmpeg)
  // This doesn't interfere with local WebSocket streaming
}
```

### Step 4: Test the Integration

1. **Start your Electron app**
2. **Check console logs** - You should see:
   ```
   📹 [Camera 1] Frame uploaded { size: "50KB", ... }
   ```
3. **Check Vercel logs** - Go to Vercel Dashboard → Your Project → Logs
   - Look for: `📹 [Camera 1] Frame received`
4. **Test in browser** - Open your website, camera preview should appear

---

## Common Integration Patterns

### Pattern 1: FFmpeg MJPEG Stream Parser

If you're using FFmpeg with MJPEG output, use the `MJPEGParser` class:

```javascript
const { MJPEGParser, pushVideoToWebsiteAPI } = require('./electron-binary-upload');

// For Camera 1
const parser1 = new MJPEGParser('1', (cameraId, jpegBuffer) => {
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now());
});

// FFmpeg stdout → parser
ffmpeg1.stdout.on('data', (data) => {
  parser1.append(data);
});
```

### Pattern 2: Direct JPEG Buffer from SDK

If your camera SDK gives you JPEG buffers directly:

```javascript
// In your camera SDK callback
cameraSDK.onFrame((cameraId, jpegBuffer) => {
  // jpegBuffer is already a Buffer
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now());
});
```

### Pattern 3: Vision-Zenith Camera SDK

If you're using Vision-Zenith SDK (like for license plates):

```javascript
// In your VzLPR video callback
vzlpr.VzLPRClient_SetVideoDataCallback(handle, (handle, userData, dataType, dataInfo) => {
  if (dataType === 0) { // VIDEO frame
    // dataInfo.buffer is the frame data
    const jpegBuffer = Buffer.from(dataInfo.buffer);
    const cameraId = '1'; // or determine from handle
    
    pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now());
  }
}, null);
```

---

## Verification Checklist

### ✅ Electron App Side

- [ ] `pushVideoToWebsiteAPI` function is imported/copied
- [ ] Environment variables are set (`SITE_URL`, `INGEST_SECRET`)
- [ ] Frame extraction is working (check console for frame callbacks)
- [ ] Upload function is called for each frame
- [ ] No errors in Electron console

### ✅ Network Side

- [ ] Electron app can reach `https://gaali.vercel.app`
- [ ] `INGEST_SECRET` matches between Electron and Vercel
- [ ] No firewall blocking HTTPS POST requests

### ✅ Vercel Side

- [ ] Blob store is created
- [ ] KV database is created
- [ ] `INGEST_SECRET` is set in Vercel environment variables
- [ ] API endpoints are deployed (`/api/camera/upload`, `/api/camera/latest`)

### ✅ Browser Side

- [ ] Website is deployed and accessible
- [ ] `HttpFrameStream` component is used in pages
- [ ] Browser console shows polling requests
- [ ] Camera preview appears

---

## Testing Commands

### Test Upload from Electron App (Manual)

```javascript
// In Electron app console or test script
const fs = require('fs');
const testFrame = fs.readFileSync('test-frame.jpg');
pushVideoToWebsiteAPI('1', testFrame, Date.now())
  .then(() => console.log('✅ Upload successful'))
  .catch(err => console.error('❌ Upload failed:', err));
```

### Test API Endpoint (curl)

```bash
# Test upload endpoint
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer your-secret-here" \
  -H "Content-Type: image/jpeg" \
  -H "x-ts: $(date +%s%3N)" \
  --data-binary @test-frame.jpg

# Expected response:
# {"ok": true, "cameraId": "1", "ts": 1234567890}
```

### Test Latest Endpoint (curl)

```bash
# Test latest endpoint
curl "https://gaali.vercel.app/api/camera/latest?camera=1"

# Expected response:
# {"ok": true, "cameraId": "1", "url": "https://...blob.../latest.jpg", "ts": 1234567890, "stale": false}
```

---

## Troubleshooting

### Issue: "Upload failed: 401 Unauthorized"

**Cause:** `INGEST_SECRET` doesn't match or is missing.

**Fix:**
1. Check Electron app: `process.env.INGEST_SECRET` is set
2. Check Vercel: Environment variable `INGEST_SECRET` is set
3. Ensure they match exactly (no extra spaces, same case)

### Issue: "Upload failed: 429 Rate Limit Exceeded"

**Cause:** Uploading too fast (> 15 frames/sec per camera).

**Fix:**
1. Check `UPLOAD_FPS` setting (should be 8-12, default 10)
2. Verify throttling is working (check `lastUploadTime` in function)
3. Reduce `UPLOAD_FPS` if needed: `process.env.UPLOAD_FPS = '8'`

### Issue: "Upload failed: 413 Payload Too Large"

**Cause:** JPEG frame is larger than 250KB.

**Fix:**
1. Reduce JPEG quality in FFmpeg: `-q:v 6` (higher number = lower quality)
2. Reduce resolution: `-s 1280x720` instead of `1600x1200`
3. Check frame size before upload: `if (jpegBuffer.length > 250 * 1024) { ... }`

### Issue: "Upload failed: Network Error"

**Cause:** Electron app can't reach Vercel.

**Fix:**
1. Check internet connection
2. Verify `SITE_URL` is correct: `https://gaali.vercel.app`
3. Check firewall/proxy settings
4. Test with curl from same machine

### Issue: "No frames showing in browser"

**Possible causes:**
1. **Electron not uploading** - Check Electron console for errors
2. **Vercel not receiving** - Check Vercel logs for `📹 [Camera X] Frame received`
3. **Blob/KV not set up** - Verify Blob store and KV database exist
4. **Browser polling failing** - Check browser console for errors

**Debug steps:**
```bash
# 1. Check if frames are being uploaded (Vercel logs)
# 2. Test latest endpoint manually
curl "https://gaali.vercel.app/api/camera/latest?camera=1"

# 3. If returns null, check upload endpoint
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg

# 4. Check browser network tab for polling requests
```

### Issue: "Images show but are stale/not updating"

**Cause:** Upload stopped or rate limited.

**Fix:**
1. Check Electron console - are uploads happening?
2. Check Vercel logs - are frames being received?
3. Verify `stale: false` in latest endpoint response
4. Check rate limiting - reduce upload frequency if hitting limits

---

## Performance Tuning

### Reduce Upload Frequency

```javascript
// In Electron app
process.env.UPLOAD_FPS = '8'; // Lower = less bandwidth, higher latency
```

### Reduce Frame Size

```javascript
// In FFmpeg command
'-s', '1280x720',  // Instead of 1600x1200
'-q:v', '6',       // Higher = lower quality, smaller file
```

### Adjust Browser Polling

```tsx
// In React component
<HttpFrameStream
  cameraId="1"
  pollInterval={250} // Higher = less server load, higher latency
/>
```

---

## Monitoring

### Electron App Logs

Look for:
- `✅ [Camera X] Upload successful` (if you add success logging)
- `❌ [Camera X] Upload failed: ...` (errors)
- `⏳ [Camera X] Rate limited` (throttling working)

### Vercel Logs

Look for:
- `📹 [Camera X] Frame received` (upload successful)
- `[Camera Upload] Invalid cameraId: ...` (validation errors)
- `[Camera Upload] Rate limit exceeded` (rate limiting working)

### Browser Console

Look for:
- `GET /api/camera/latest?camera=1` (polling happening)
- Image load errors (Blob URL issues)
- "Camera Offline" overlay (stale frames)

---

## Example: Complete Integration

```javascript
// main.js (Electron main process)

const { pushVideoToWebsiteAPI, MJPEGParser } = require('./electron-binary-upload');
const { spawn } = require('child_process');

// Set environment variables
process.env.SITE_URL = 'https://gaali.vercel.app';
process.env.INGEST_SECRET = 'your-secret-here';
process.env.UPLOAD_FPS = '10';

// Camera 1 setup
const camera1Parser = new MJPEGParser('1', (cameraId, jpegBuffer) => {
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now()).catch(err => {
    console.error(`[Camera ${cameraId}] Upload error:`, err);
  });
});

const ffmpeg1 = spawn('ffmpeg', [
  '-i', 'rtsp://admin:admin@192.168.1.49:8557/h264',
  '-f', 'mjpeg',
  '-r', '25',
  '-s', '1600x1200',
  '-q:v', '5',
  '-',
]);

ffmpeg1.stdout.on('data', (data) => {
  camera1Parser.append(data);
});

// Camera 2 setup (similar)
// ...

// Keep your existing local streaming code (node-rtsp-stream-jsmpeg)
// This doesn't interfere with website uploads
```

---

## Next Steps

1. ✅ Copy upload function to Electron app
2. ✅ Set environment variables
3. ✅ Integrate with frame extraction
4. ✅ Test upload (check Vercel logs)
5. ✅ Verify browser shows frames
6. ✅ Monitor performance and adjust as needed

If you encounter any issues, check the troubleshooting section above or review the Vercel logs for detailed error messages.
