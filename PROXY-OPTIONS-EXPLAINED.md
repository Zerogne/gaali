# Proxy Options Explained

## Two Types of Proxies

### 1. HTTP Video Proxy (✅ Already Works - No Deployment Needed)

**Location:** `/api/camera/proxy` (Next.js API route)

**Status:** ✅ Already deployed on Vercel - works right now!

**What it does:**
- Proxies MJPEG video streams from cameras via HTTPS
- Works in production without any extra deployment
- Uses your existing Next.js API routes

**Component:** `HttpVideoStream.tsx`

**How to use:**
```tsx
import { HttpVideoStream } from "@/components/camera/HttpVideoStream"

<HttpVideoStream cameraId="1" direction="IN" />
```

**Pros:**
- ✅ No deployment needed - already works
- ✅ Works on HTTPS (Vercel)
- ✅ Simple and reliable
- ✅ Uses existing infrastructure

**Cons:**
- ⚠️ MJPEG only (not WebSocket)
- ⚠️ Slightly higher latency than WebSocket

---

### 2. WebSocket Proxy (❌ Needs Separate Deployment)

**Location:** `camera-ws-proxy-server.ts` (separate Express server)

**Status:** ❌ Not deployed - needs a separate server

**What it does:**
- Proxies WebSocket connections (`ws://` → `wss://`)
- Converts insecure WebSocket to secure WebSocket
- Requires a server that can reach your cameras

**Component:** `RealtimeVideoProxy.tsx`

**How to use:**
```tsx
import { RealtimeVideoProxy } from "@/components/camera/RealtimeVideoProxy"

<RealtimeVideoProxy cameraId="1" direction="IN" />
```

**Pros:**
- ✅ Lower latency (WebSocket)
- ✅ Real-time streaming
- ✅ Supports H.264 directly

**Cons:**
- ❌ Needs separate server deployment
- ❌ Must run 24/7 on a machine that can reach cameras
- ❌ Additional cost/maintenance

---

## Recommendation

**Use HTTP Video Proxy** (`HttpVideoStream`) - it already works in production!

**Why:**
- ✅ No deployment needed
- ✅ Works on Vercel HTTPS
- ✅ Simple and reliable
- ✅ Good enough for most use cases

**When to use WebSocket Proxy:**
- Only if you need ultra-low latency
- Only if you have a server that can reach cameras
- Only if you're willing to maintain it

---

## Quick Switch

To use the HTTP proxy (no deployment needed):

1. **Update components:**
   ```tsx
   // Change from:
   import { RealtimeVideo } from "@/components/camera/RealtimeVideo"
   
   // To:
   import { HttpVideoStream } from "@/components/camera/HttpVideoStream"
   ```

2. **Update cameraId format:**
   ```tsx
   // Change from:
   <RealtimeVideo cameraId="camera-1" />
   
   // To:
   <HttpVideoStream cameraId="1" />
   ```

That's it! No deployment needed - it works on Vercel right now.
