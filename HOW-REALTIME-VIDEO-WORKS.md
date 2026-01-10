# How Real-Time Video Pulling Works

## Complete Flow: Camera → Electron → Next.js → Browser

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   Camera    │─────▶│  Electron    │─────▶│  Next.js    │◀─────│   Browser   │
│  (RTSP)     │      │     App      │      │   (Vercel)  │      │  (Website)  │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
   Port 8557          FFmpeg + HTTP          API + Memory         HTTP Polling
```

---

## Step-by-Step Flow

### 1. **Electron App Reads Camera Stream** 📹

**Location:** Your Electron app (local machine)

**What happens:**
- FFmpeg connects to camera RTSP stream: `rtsp://admin:admin@192.168.1.49:8557/h264`
- Converts RTSP to MJPEG format at **25 FPS**
- Resizes to **1600x1200** resolution
- Extracts individual JPEG frames from the stream

**Code in Electron:**
```javascript
// FFmpeg command (simplified)
ffmpeg -i rtsp://admin:admin@192.168.1.49:8557/h264 \
  -f mjpeg \
  -r 25 \
  -s 1600x1200 \
  -q:v 5 \
  - | extractFrames()
```

---

### 2. **Electron App Pushes Frames to Next.js API** 🚀

**Location:** Electron app → `https://gaali.vercel.app/api/camera/frame`

**What happens:**
- For each JPEG frame extracted:
  1. Convert frame buffer to base64 string
  2. Create timestamp (ISO 8601 format)
  3. POST to Next.js API with authentication

**Request Format:**
```http
POST https://gaali.vercel.app/api/camera/frame
Authorization: Bearer YOUR_LPR_INGEST_SECRET
Content-Type: application/json

{
  "cameraId": "1",
  "imageData": "base64-encoded-jpeg-frame-here...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "format": "jpeg"
}
```

**Code in Electron:**
```javascript
async function pushVideoFrame(cameraId, imageData, timestamp) {
  await fetch('https://gaali.vercel.app/api/camera/frame', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LPR_SECRET}`,
    },
    body: JSON.stringify({
      cameraId: cameraId.toString(),
      imageData: imageData, // Base64 JPEG
      timestamp: timestamp.toISOString(),
      format: "jpeg",
    }),
  });
}
```

**Frequency:** 25 frames per second (every 40ms)

---

### 3. **Next.js API Stores Latest Frame** 💾

**Location:** `/app/api/camera/frame/route.ts` (Vercel serverless function)

**What happens:**
1. Validates authentication token (`LPR_INGEST_SECRET`)
2. Receives frame data (`imageData`, `cameraId`, `timestamp`)
3. Stores latest frame in **memory Map** (keyed by `cameraId`)
4. Returns `{ ok: true }`

**Storage:**
```typescript
// In-memory storage (simple, fast)
const latestFrames = new Map<string, {
  frameBase64: string;
  timestamp: number;
}>();

// Store frame
latestFrames.set(cameraId, {
  frameBase64: imageData,
  timestamp: Date.now(),
});
```

**Note:** Uses in-memory storage. For production with multiple servers, consider Redis.

**Logs:**
```
📹 [Camera 1] Frame received {
  format: 'jpeg',
  timestamp: '2024-01-01T12:00:00.000Z',
  size: '45 KB'
}
```

---

### 4. **Browser Polls for Latest Frame** 🔄

**Location:** `HttpFrameStream` component (React)

**What happens:**
- Component mounts → starts polling immediately
- Polls `/api/camera/frame?camera=1` every **100ms** (10 FPS display)
- Gets latest frame from Next.js API
- Updates `<img>` tag with new frame

**Polling Code:**
```typescript
// Poll every 100ms
const pollFrame = async () => {
  const response = await fetch(`/api/camera/frame?camera=${cameraId}&_t=${Date.now()}`);
  const data = await response.json();
  
  if (data.ok && data.frameBase64) {
    // Update image src
    imgRef.current.src = `data:image/jpeg;base64,${data.frameBase64}`;
  }
};

setInterval(pollFrame, 100); // 10 FPS
```

**Request:**
```http
GET https://gaali.vercel.app/api/camera/frame?camera=1&_t=1234567890
```

**Response:**
```json
{
  "ok": true,
  "cameraId": "1",
  "frameBase64": "base64-encoded-jpeg-frame...",
  "timestamp": 1234567890
}
```

---

### 5. **Browser Displays Frame** 🖼️

**Location:** `<img>` tag in `HttpFrameStream` component

**What happens:**
- Browser receives base64 frame
- Creates data URI: `data:image/jpeg;base64,${frameBase64}`
- Updates `<img src="...">` tag
- Browser renders JPEG image
- Repeats every 100ms for smooth video

**Display Code:**
```tsx
<img
  ref={imgRef}
  alt={`Camera ${cameraId} stream`}
  className="w-full h-full object-contain"
  // src is updated via: imgRef.current.src = `data:image/jpeg;base64,${frameBase64}`
/>
```

---

## Data Flow Summary

| Step | From | To | Protocol | Frequency | Data |
|------|------|-----|----------|-----------|------|
| 1. Camera → Electron | Camera | Electron | RTSP | 25 FPS | H.264 stream |
| 2. Electron → Next.js | Electron | Vercel API | HTTPS POST | 25 FPS | Base64 JPEG |
| 3. Next.js Storage | API | Memory Map | - | - | Latest frame |
| 4. Browser → Next.js | Browser | Vercel API | HTTPS GET | 10 FPS | Poll request |
| 5. Next.js → Browser | Vercel API | Browser | HTTPS GET | 10 FPS | Base64 JPEG |
| 6. Browser Display | React | DOM | - | 10 FPS | `<img>` update |

---

## Key Points

### ✅ **Why This Works Without Cloudflare:**
- Uses **HTTPS POST/GET** (same as license plates)
- No WebSocket needed
- No mixed content issues
- Works from anywhere (Electron → Vercel, Browser → Vercel)

### ⚡ **Performance:**
- **Camera sends:** 25 FPS (every 40ms)
- **Browser displays:** 10 FPS (every 100ms)
- **Latency:** ~100-200ms (polling interval + network)

### 🔒 **Security:**
- Authentication: `Authorization: Bearer ${LPR_INGEST_SECRET}`
- HTTPS only (no insecure connections)
- Same secret as license plate ingestion

### 📊 **Storage:**
- **Current:** In-memory Map (fast, but lost on server restart)
- **Production:** Consider Redis for multi-server deployments

---

## Troubleshooting

### No video showing?
1. **Check Electron logs:** Are frames being sent?
   ```
   ✅ [Camera 1] Frame pushed successfully
   ```

2. **Check Vercel logs:** Are frames being received?
   ```
   📹 [Camera 1] Frame received { format: 'jpeg', size: '45 KB' }
   ```

3. **Check browser console:** Are polls successful?
   ```
   GET /api/camera/frame?camera=1 → 200 OK
   ```

4. **Check network tab:** Is polling happening?
   - Should see requests every 100ms
   - Response should have `frameBase64` field

### Video is choppy?
- **Reduce polling frequency:** Change `100ms` to `200ms` (5 FPS)
- **Reduce frame size:** Lower resolution in Electron (e.g., 1280x720)
- **Check network:** Slow connection between Electron and Vercel?

### Video is delayed?
- **Normal latency:** 100-200ms (polling interval + network)
- **For lower latency:** Reduce polling to 50ms (20 FPS), but increases server load

---

## Files Involved

1. **Electron App:**
   - FFmpeg RTSP → MJPEG conversion
   - Frame extraction and base64 encoding
   - HTTP POST to `/api/camera/frame`

2. **Next.js API:** `/app/api/camera/frame/route.ts`
   - POST: Receives frames from Electron
   - GET: Returns latest frame to browser

3. **React Component:** `/components/camera/HttpFrameStream.tsx`
   - Polls API every 100ms
   - Updates `<img>` tag with latest frame

4. **Pages Using It:**
   - `/app/page.tsx` (Dashboard)
   - `/components/sessions/InSessionForm.tsx` (Camera 1)
   - `/components/sessions/OutSessionForm.tsx` (Camera 2)

---

## Example Timeline

```
00:00.000 - Electron: Frame 1 extracted from RTSP
00:00.000 - Electron: POST /api/camera/frame (cameraId=1, frame1)
00:00.040 - Electron: Frame 2 extracted
00:00.040 - Electron: POST /api/camera/frame (cameraId=1, frame2)
00:00.080 - Electron: Frame 3 extracted
00:00.080 - Electron: POST /api/camera/frame (cameraId=1, frame3)
00:00.100 - Browser: GET /api/camera/frame?camera=1 → Returns frame3
00:00.100 - Browser: Updates <img> with frame3
00:00.120 - Electron: Frame 4 extracted
00:00.120 - Electron: POST /api/camera/frame (cameraId=1, frame4)
00:00.200 - Browser: GET /api/camera/frame?camera=1 → Returns frame4
00:00.200 - Browser: Updates <img> with frame4
...
```

**Result:** Browser sees smooth video at 10 FPS, even though camera sends 25 FPS.
