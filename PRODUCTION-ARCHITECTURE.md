# Production-Safe Camera Preview Architecture

## Overview

This implementation provides a **production-safe real-time camera preview** using **ONLY Vercel-managed services** (Next.js, Vercel Blob, Vercel KV). No in-memory storage, no base64 overhead, no external servers required.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Electron App (Local)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Camera 1    │  │  FFmpeg      │  │  JPEG Frame Buffer  │  │
│  │  RTSP Stream │─▶│  MJPEG Parse │─▶│  (Binary, 50KB)     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                    │                            │
│                                    ▼                            │
│                    POST /api/camera/upload?camera=1            │
│                    Body: Binary JPEG                            │
│                    Headers: Authorization, Content-Type         │
└────────────────────────────────────┼────────────────────────────┘
                                     │
                                     ▼ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Next.js API                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/camera/upload                                  │  │
│  │  • Auth check (INGEST_SECRET)                            │  │
│  │  • Rate limit (15/sec per camera via KV)                 │  │
│  │  • Validate (cameraId, Content-Type, size < 250KB)       │  │
│  │  • Upload to Vercel Blob: cameras/{id}/latest.jpg        │  │
│  │  • Store pointer in KV: camera:{id} = {url, ts}          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │  Vercel Blob        │      │  Vercel KV          │          │
│  │  cameras/1/latest.jpg│      │  camera:1 = {       │          │
│  │  cameras/2/latest.jpg│      │    url: "...",      │          │
│  │  (Public CDN URLs)   │      │    ts: 1234567890   │          │
│  └─────────────────────┘      └─────────────────────┘          │
└────────────────────────────────────┼────────────────────────────┘
                                     │
                                     ▼ HTTPS GET
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (React Component)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GET /api/camera/latest?camera=1                         │  │
│  │  (Polls every 200ms = 5 FPS display)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Response: { url: "...blob.../latest.jpg", ts, stale }   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  <img src="${url}?t=${ts}" />  (Cache-busting query param)      │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Electron App (`ELECTRON-BINARY-UPLOAD.js`)

**Responsibilities:**
- Extract JPEG frames from FFmpeg MJPEG stream
- Throttle uploads to 8-12 fps (configurable, default: 10 fps)
- POST binary JPEG to `/api/camera/upload`
- Handle rate limiting gracefully

**Key Functions:**
- `pushVideoToWebsiteAPI(cameraId, jpegBuffer, timestamp)` - Main upload function
- `MJPEGParser` - Extracts JPEG frames from MJPEG stream using marker detection
- `setupCameraStream(cameraId, rtspUrl)` - FFmpeg integration example

**Configuration:**
```env
SITE_URL=https://gaali.vercel.app
INGEST_SECRET=your-secret-here
UPLOAD_FPS=10
```

### 2. Upload API (`/app/api/camera/upload/route.ts`)

**Endpoint:** `POST /api/camera/upload?camera=1|2`

**Flow:**
1. **Authentication**: Validates `Authorization: Bearer <INGEST_SECRET>`
2. **Camera Validation**: Only accepts `cameraId` in ["1", "2"]
3. **Rate Limiting**: Sliding window via KV (max 15 uploads/sec per camera)
4. **Content Validation**: 
   - `Content-Type: image/jpeg`
   - Max payload: 250KB (rejects 413 if exceeded)
5. **Blob Upload**: Writes/overwrites `cameras/{cameraId}/latest.jpg` with public access
6. **KV Pointer**: Stores `camera:{cameraId}` = `{url: blobUrl, ts: timestamp}`
7. **Response**: `{ok: true, cameraId, ts}`

**Security:**
- Auth required (401 if missing/invalid)
- Rate limiting (429 if exceeded)
- Payload size validation (413 if too large)
- Camera ID allowlist (400 if invalid)

### 3. Latest API (`/app/api/camera/latest/route.ts`)

**Endpoint:** `GET /api/camera/latest?camera=1|2`

**Flow:**
1. **Camera Validation**: Only accepts `cameraId` in ["1", "2"]
2. **KV Read**: Reads `camera:{cameraId}` pointer
3. **Stale Detection**: Checks if `now - ts > 2000ms` (camera offline)
4. **Response**: 
   - If exists: `{ok: true, cameraId, url, ts, stale: boolean}`
   - If missing: `{ok: true, cameraId, url: null, ts: null, stale: true}`

**Headers:**
- `Cache-Control: no-store, max-age=0` (prevents browser caching)

**Public Access:**
- No authentication required (frame URLs are public by design)

### 4. React Component (`HttpFrameStream.tsx`)

**Responsibilities:**
- Poll `/api/camera/latest` every 200ms (configurable: 150-250ms)
- Update `<img src>` with Blob URL + cache-busting query param
- Show "Camera Offline" overlay if `stale: true`
- Handle loading and error states

**Props:**
- `cameraId: "1" | "2"` - Camera identifier
- `direction?: "IN" | "OUT"` - For button styling
- `showActionButton?: boolean` - Toggle button display
- `onActionClick?: () => void` - Button click handler
- `pollInterval?: number` - Polling interval in ms (default: 200)

**Display Logic:**
```typescript
// If url exists and not stale: Show frame
// If url exists but stale: Show frame with "Camera Offline" overlay
// If no url: Show loading state
```

## Data Flow

### Upload Path (Electron → Vercel)

```
1. FFmpeg extracts JPEG frame (50KB binary)
2. Electron throttles (wait 100ms between uploads = 10 fps)
3. POST https://gaali.vercel.app/api/camera/upload?camera=1
   - Headers: Authorization, Content-Type: image/jpeg, x-ts
   - Body: Binary JPEG Buffer
4. Next.js API validates, rate limits, uploads to Blob
5. Blob returns public URL: https://xxx.public.blob.vercel-storage.com/...
6. KV stores pointer: camera:1 = {url: "...", ts: 1234567890}
7. Response: {ok: true, cameraId: "1", ts: 1234567890}
```

### Display Path (Browser → Vercel → Blob CDN)

```
1. React component polls GET /api/camera/latest?camera=1 (every 200ms)
2. Next.js API reads KV: camera:1
3. Response: {ok: true, url: "https://...blob.../latest.jpg", ts: 1234567890, stale: false}
4. React updates <img src="${url}?t=${ts}"> (cache-busting)
5. Browser requests Blob URL from Vercel CDN
6. CDN serves JPEG (fast, cached)
```

## Why This Architecture?

### ❌ Problems with Previous In-Memory Map

1. **Serverless Functions are Stateless**
   - Each request may hit a different instance
   - No shared memory between requests
   - Cold starts = empty Map

2. **Base64 Overhead**
   - 33% larger than binary
   - Unnecessary encoding/decoding
   - Wastes memory and bandwidth

3. **No Persistence**
   - Server restart = data loss
   - No way to recover frames

4. **Memory Limits**
   - Serverless functions have limited memory
   - Storing frames can exhaust memory

### ✅ Benefits of Blob + KV

1. **Persistent Storage**
   - Blob: Frames stored permanently (until overwritten)
   - KV: Pointers survive server restarts
   - Shared across all function instances

2. **Efficient Binary Storage**
   - No base64 encoding overhead
   - Direct binary JPEG storage
   - CDN-backed for fast global delivery

3. **Scalability**
   - Handles thousands of concurrent browsers
   - Rate limiting prevents abuse
   - Auto-scales with Vercel

4. **Cost-Effective**
   - Pay only for storage and bandwidth used
   - Free tier covers small deployments
   - Predictable pricing

## Performance Characteristics

### Latency

- **Upload (Electron → Vercel)**: ~50-200ms (depends on network)
- **KV Write**: ~1-5ms
- **Blob Upload**: ~50-150ms
- **Total Upload Time**: ~100-350ms

- **Poll (Browser → Vercel)**: ~10-50ms
- **KV Read**: ~1-5ms
- **Total Poll Time**: ~11-55ms

- **Frame Display Latency**: Upload time + Poll interval = ~300-400ms typical

### Throughput

- **Upload Rate**: Up to 15 frames/sec per camera (rate limited)
- **Display Rate**: 5 frames/sec (200ms polling)
- **Concurrent Browsers**: Unlimited (KV + Blob scale automatically)

### Bandwidth

- **Per Frame Upload**: ~50KB (JPEG)
- **Per Frame Display**: ~50KB (JPEG)
- **At 10 fps per camera**: ~1MB/sec upload, ~500KB/sec display (5 fps)
- **For 2 cameras**: ~2MB/sec upload, ~1MB/sec display

## Security Model

### Authentication
- **Upload Endpoint**: Requires `Authorization: Bearer <INGEST_SECRET>`
- **Latest Endpoint**: Public (no auth needed)

### Authorization
- **Camera ID Allowlist**: Only "1" and "2" accepted
- **Rate Limiting**: Prevents abuse (15 uploads/sec per camera)

### Data Privacy
- **Blob URLs are Public**: Anyone with URL can view frame
- **Mitigation**: URLs contain random IDs (not predictable)
- **Alternative**: Use tokenized URLs if needed (requires additional setup)

## Monitoring & Observability

### Logs

**Upload Success (sampled):**
```
📹 [Camera 1] Frame uploaded {
  size: "50KB",
  blobUrl: "https://...",
  ts: 1234567890,
  elapsed: "120ms"
}
```

**Errors:**
- `[Camera Upload] Invalid cameraId: ...`
- `[Camera Upload] Rate limit exceeded for camera ...`
- `[Camera Upload] Payload too large: ...`
- `[Camera Upload] Blob upload failed for camera ...`
- `[Camera Upload] KV write failed for camera ...`

### Metrics to Monitor

1. **Upload Success Rate**: Should be > 95%
2. **Rate Limit Hits**: Should be < 1% (indicates throttling working)
3. **Blob Upload Latency**: P50 < 150ms, P99 < 500ms
4. **KV Read Latency**: P50 < 5ms, P99 < 20ms
5. **Stale Frame Rate**: Should be < 5% (indicates healthy camera connection)

## Troubleshooting Guide

See `VERCEL-BLOB-KV-SETUP.md` for detailed troubleshooting steps.

Common issues:
- Missing environment variables → Check Vercel Dashboard
- Blob URL 403 → Ensure `access: "public"` in `put()`
- Rate limit too aggressive → Adjust `MAX_UPLOADS_PER_SEC`
- Images not updating → Check cache-busting query param

## Future Enhancements

1. **Multi-Company Support**: Prefix Blob keys with company ID
2. **Frame History**: Store last N frames per camera (requires Blob versioning)
3. **Compression**: Use WebP for smaller file sizes
4. **Adaptive Quality**: Adjust JPEG quality based on network conditions
5. **WebSocket Alternative**: Use Server-Sent Events (SSE) for push-based updates
