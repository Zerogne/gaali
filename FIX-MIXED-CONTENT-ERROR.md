# Fix Mixed Content Error

## Problem

```
Mixed Content: The page at 'https://gaali.vercel.app/' was loaded over HTTPS, 
but attempted to connect to the insecure WebSocket endpoint 'ws://192.168.1.49:9080/h264'. 
This request has been blocked; this endpoint must be available over WSS.
```

**Root Cause:** HTTPS pages cannot connect to `ws://` (insecure WebSocket). Browsers block this for security.

## Solution Applied

✅ **Updated all components to use `RealtimeVideoProxy`** instead of direct `RealtimeVideo`:

- `app/page.tsx` (dashboard)
- `components/sessions/InSessionForm.tsx`
- `components/sessions/OutSessionForm.tsx`

**Changed:**
- `RealtimeVideo` → `RealtimeVideoProxy`
- `cameraId="camera-1"` → `cameraId="1"` (proxy uses numeric IDs)

## Required Setup

### 1. Deploy WebSocket Proxy Server

The proxy server (`camera-ws-proxy-server.ts`) **MUST** run on a server that can reach your cameras:

```bash
# On your server (same network as cameras)
cd /path/to/gaali
npx tsx camera-ws-proxy-server.ts
```

Or with PM2:
```bash
pm2 start camera-ws-proxy-server.ts --name camera-ws-proxy --interpreter tsx
```

**Requirements:**
- Server must be on same network as cameras (or have VPN access)
- Server must be accessible from the internet (for production)
- Server must have SSL certificate (for `wss://`)

### 2. Set Environment Variable in Vercel

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

Add:
```
NEXT_PUBLIC_WS_PROXY_URL=wss://your-proxy-server.com/ws/camera
```

**Important:**
- Use `wss://` (secure WebSocket) not `ws://`
- Include the full path: `/ws/camera`
- Example: `wss://proxy.gaali.com/ws/camera`

### 3. Proxy Server Configuration

The proxy server will:
- Accept connections from browser: `wss://your-proxy-server.com/ws/camera?camera=1`
- Connect to camera: `ws://192.168.1.50:9080/h264`
- Forward binary data without modification

## Architecture

```
Browser (HTTPS)
    ↓
wss://your-proxy-server.com/ws/camera?camera=1
    ↓
WebSocket Proxy Server (on your network)
    ↓
ws://192.168.1.50:9080/h264
    ↓
Starlight Camera
```

## Testing

1. **Check proxy server is running:**
   ```bash
   curl http://your-proxy-server:3001/health
   ```

2. **Test WebSocket connection:**
   ```bash
   wscat -c wss://your-proxy-server.com/ws/camera?camera=1
   ```

3. **Check browser console:**
   - Should see: `✅ [Camera 1] WebSocket proxy connected`
   - Should NOT see mixed content errors

## If Proxy Server Not Available

If you don't have a proxy server yet, the component will show:
```
WebSocket proxy URL not configured. 
Please set NEXT_PUBLIC_WS_PROXY_URL environment variable.
```

**Options:**
1. **Deploy proxy server** (recommended for production)
2. **Use HTTP instead of HTTPS** (not recommended, only for testing)
3. **Use camera's built-in HTTPS WebSocket** (if camera supports `wss://`)

## Next Steps

1. ✅ Components updated to use proxy
2. ⏳ Deploy WebSocket proxy server
3. ⏳ Set `NEXT_PUBLIC_WS_PROXY_URL` in Vercel
4. ⏳ Test connection

## Files Updated

- ✅ `app/page.tsx` - Dashboard uses `RealtimeVideoProxy`
- ✅ `components/sessions/InSessionForm.tsx` - Uses `RealtimeVideoProxy`
- ✅ `components/sessions/OutSessionForm.tsx` - Uses `RealtimeVideoProxy`
- ✅ `components/camera/RealtimeVideoProxy.tsx` - Added error handling for missing proxy URL
