# Production WebSocket Setup Guide

Since you can only test in production, you **MUST** use the WebSocket proxy. Direct connection will fail.

## Why Proxy is Required in Production

1. **HTTPS Site** → Can't connect to `ws://` (mixed content blocked)
2. **Remote Users** → Can't reach private IPs like `192.168.1.50`
3. **Same-Origin Policy** → Browser blocks cross-origin WebSocket

## Setup Steps

### 1. Deploy WebSocket Proxy Server

The proxy server (`camera-ws-proxy-server.ts`) needs to run **on the same network as your cameras** (or have VPN access).

**Option A: Deploy as separate service (Recommended)**

Deploy to a server that can reach your cameras:

```bash
# On your server (same network as cameras)
cd /path/to/gaali
npx tsx camera-ws-proxy-server.ts
```

Or use PM2 for production:

```bash
npm install -g pm2
pm2 start camera-ws-proxy-server.ts --name camera-ws-proxy --interpreter tsx
pm2 save
pm2 startup
```

**Option B: Integrate into existing Express server**

If you have an Express server, add the WebSocket proxy there.

### 2. Configure Environment Variables

**In your Next.js app (production):**

```bash
# .env.production
NEXT_PUBLIC_WS_PROXY_URL=wss://your-domain.com/ws/camera
# or if proxy is on different domain:
NEXT_PUBLIC_WS_PROXY_URL=wss://proxy.your-domain.com/ws/camera
```

**In proxy server:**

```bash
# .env (on proxy server)
WS_PROXY_PORT=3001
MONGODB_URI=your-mongodb-uri  # If fetching camera config from DB
```

### 3. Update Proxy Server to Use Database

Update `camera-ws-proxy-server.ts` to fetch camera config from database:

```typescript
// In wss.on("connection")
if (companyId) {
  const company = await getCompany(companyId)
  const settings = company?.cameraSettings
  if (settings) {
    cameraConfig = {
      ip: cameraId === "1" ? settings.camera1Ip : settings.camera2Ip,
      port: cameraId === "1" ? settings.camera1WebSocketPort : settings.camera2WebSocketPort,
      path: "/h264", // or from settings
    }
  }
}
```

### 4. Use RealtimeVideoProxy Component

Replace `RealtimeVideo` with `RealtimeVideoProxy` in your pages:

**Before (Direct - won't work in production):**
```tsx
import { RealtimeVideo } from "@/components/camera/RealtimeVideo"

<RealtimeVideo cameraId="camera-1" direction="IN" />
```

**After (Proxy - works in production):**
```tsx
import { RealtimeVideoProxy } from "@/components/camera/RealtimeVideoProxy"

<RealtimeVideoProxy cameraId="1" direction="IN" />
```

### 5. Update Pages

Update these files to use `RealtimeVideoProxy`:

- `app/page.tsx` (dashboard)
- `components/sessions/InSessionForm.tsx`
- `components/sessions/OutSessionForm.tsx`

## Production Architecture

```
User Browser (HTTPS)
    ↓
wss://your-domain.com/ws/camera?camera=1
    ↓
WebSocket Proxy Server (on your network)
    ↓
ws://192.168.1.50:9080/h264
    ↓
Camera
```

## Quick Migration Checklist

- [ ] Deploy `camera-ws-proxy-server.ts` to server with camera access
- [ ] Set `NEXT_PUBLIC_WS_PROXY_URL` environment variable
- [ ] Update proxy server to fetch camera config from database
- [ ] Replace `RealtimeVideo` with `RealtimeVideoProxy` in components
- [ ] Test connection in production
- [ ] Monitor proxy server logs for errors

## Testing in Production

1. **Check proxy server is running:**
   ```bash
   curl http://your-proxy-server:3001/health
   ```

2. **Test WebSocket connection:**
   ```bash
   wscat -c wss://your-domain.com/ws/camera?camera=1
   ```

3. **Check browser console:**
   - Should see: `✅ [Camera 1] WebSocket proxy connected`
   - Should see: `📹 [Camera 1] Stream format detected: ...`

## Troubleshooting

### Connection Fails

1. **Check proxy server logs** - Is it connecting to camera?
2. **Check camera IP/port** - Can proxy server reach camera?
3. **Check WebSocket path** - Run detection script to find correct path
4. **Check environment variable** - Is `NEXT_PUBLIC_WS_PROXY_URL` set correctly?

### No Video Display

1. **Check stream format** - Look at browser console for format detection
2. **Check player initialization** - Is JSMpeg/jmuxer loading?
3. **Check data flow** - Are messages being received?

### Mixed Content Errors

- Make sure proxy URL uses `wss://` (secure) not `ws://`
- Make sure proxy server has SSL certificate

## Security Considerations

1. **Add authentication** to WebSocket proxy:
   ```typescript
   const token = url.searchParams.get("token")
   if (!verifyToken(token)) {
     clientWs.close(1008, "Unauthorized")
   }
   ```

2. **Rate limiting** - Prevent too many connections

3. **IP whitelist** - Only allow connections from your domain

## Next Steps

1. Deploy proxy server
2. Update components to use `RealtimeVideoProxy`
3. Test in production
4. Monitor and adjust
