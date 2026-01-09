# RTSP Video Streaming Solution

## Problem

Your Vision-Zenith cameras use:
- **Port 8557**: RTSP video stream (`rtsp://camera-ip:8557/h264`)
- **Port 9080**: WebSocket data/control (not video)
- **Port 443**: HTTPS (may or may not support MJPEG)

## Current Limitation

**Vercel (serverless) cannot run FFmpeg** to convert RTSP to browser-compatible format.

## Solutions

### Option 1: Use HTTP/HTTPS MJPEG (Current Approach) ✅

**If your camera supports MJPEG over HTTPS:**

The current `/api/camera/proxy` endpoint tries multiple HTTP paths:
- `/video.mjpeg`
- `/stream`
- `/video`
- `/mjpeg`
- `/h264`
- `/live`

**Pros:**
- ✅ Works on Vercel (no FFmpeg needed)
- ✅ No extra deployment
- ✅ Simple and reliable

**Cons:**
- ⚠️ Only works if camera supports MJPEG over HTTPS
- ⚠️ May not be available on your camera

---

### Option 2: Separate Server with FFmpeg (Recommended for RTSP)

**Deploy a small server that converts RTSP to WebSocket:**

1. **Use the existing `camera-ws-proxy-server.ts`** but add FFmpeg conversion:

```typescript
// Install: npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath.path);

// Convert RTSP to WebSocket stream
const rtspUrl = `rtsp://${cameraIp}:8557/h264`;
const wsPort = 9999;

// Use node-rtsp-stream or similar
const Stream = require('node-rtsp-stream');
const stream = new Stream({
  name: 'camera-stream',
  streamUrl: rtspUrl,
  wsPort: wsPort,
  ffmpegOptions: { 
    '-stats': '',
    '-r': 30,
    '-s': '1280x720',
    '-b:v': '2000k'
  }
});
```

2. **Deploy on a VPS** (DigitalOcean, Linode, etc.) - $5-10/month

3. **Use Cloudflare Tunnel** (free) to expose it securely

4. **Frontend connects to:** `wss://your-tunnel-url/ws/camera`

**Pros:**
- ✅ Works with RTSP
- ✅ Low latency
- ✅ Full control

**Cons:**
- ⚠️ Requires separate server ($5-10/month)
- ⚠️ Need to maintain FFmpeg setup

---

### Option 3: Use JSMpeg in Browser (If Camera Supports H.264 WebSocket)

**If camera can stream H.264 directly over WebSocket:**

1. Camera streams: `ws://camera-ip:8557/h264`
2. Use WebSocket proxy (convert `ws://` to `wss://`)
3. Frontend uses JSMpeg to decode

**Already implemented in `RealtimeVideoProxy.tsx`** - but requires proxy server.

---

## Recommendation

**Try Option 1 first** (current HTTP proxy):
- Check browser console for which paths are being tried
- Check if camera supports MJPEG over HTTPS
- If it works, you're done! ✅

**If Option 1 doesn't work:**
- Use Option 2 (separate server with FFmpeg)
- Deploy `camera-ws-proxy-server.ts` with FFmpeg on a VPS
- Use Cloudflare Tunnel for secure access

---

## Quick Test

Test if camera supports MJPEG:
```bash
curl -k -u admin:password https://192.168.1.50:443/video.mjpeg
```

If you get video data, MJPEG works! ✅
If you get 404/502, camera only supports RTSP. ❌
