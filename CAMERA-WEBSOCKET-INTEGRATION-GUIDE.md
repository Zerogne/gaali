# Camera WebSocket Integration Guide

Complete solution for integrating IP camera live streaming via WebSocket.

## Architecture

```
Browser → WebSocket Proxy (Express) → Camera WebSocket (ws://camera-ip:9080/h264)
```

### Why a Proxy?

1. **Same-origin WebSocket**: Browser connects to `ws://your-domain/ws/camera` (same origin)
2. **No mixed content**: Avoids `https://site` + `ws://lan-ip` mixed content issues
3. **Server-side auth**: Handle authentication before connecting to camera
4. **Error handling**: Better error messages and logging server-side

## Setup Steps

### 1. Detect Camera WebSocket Path

Run the detection script to find the correct WebSocket path:

```bash
npx tsx scripts/detect-camera-websocket-path.ts 192.168.1.50 9080
```

This will test common paths (`/`, `/h264`, `/stream`, `/video`, etc.) and detect:
- Which path works
- Stream format (MPEG-TS, JPEG, PNG, H.264)
- First bytes of data

### 2. Start WebSocket Proxy Server

Run the Express WebSocket proxy server:

```bash
npx tsx camera-ws-proxy-server.ts
```

Or add to your existing Express server.

**Environment variables:**
```bash
WS_PROXY_PORT=3001  # Port for WebSocket proxy (default: 3001)
```

### 3. Update Frontend Component

Use `RealtimeVideoProxy` component in your pages:

```tsx
import { RealtimeVideoProxy } from "@/components/camera/RealtimeVideoProxy"

// In your page/component
<RealtimeVideoProxy 
  cameraId="1" 
  direction="IN"
  showActionButton={true}
  onActionClick={() => handleAction()}
/>
```

**Environment variable:**
```bash
NEXT_PUBLIC_WS_PROXY_URL=ws://localhost:3001/ws/camera
# In production: wss://your-domain.com/ws/camera
```

## Stream Format Detection

The component auto-detects stream format from first bytes:

| Format | Signature | Player |
|--------|-----------|--------|
| MPEG-TS | `0x47` (sync byte) | JSMpeg |
| JPEG | `FF D8 FF` | `<img>` with Blob URL |
| PNG | `89 50 4E 47` | `<img>` with Blob URL |
| H.264 | `00 00 00 01` or `00 00 01` | jmuxer or MediaSource |

## Implementation Details

### WebSocket Proxy Server (`camera-ws-proxy-server.ts`)

**Features:**
- Accepts client connections on `/ws/camera?camera=1`
- Connects to camera WebSocket (`ws://camera-ip:9080/h264`)
- Forwards binary data without modification
- Handles cleanup on disconnect/errors
- Supports multiple concurrent connections

**Query Parameters:**
- `camera`: "1" or "2" (required)
- `companyId`: Company ID for multi-tenant (optional)

### Frontend Component (`RealtimeVideoProxy.tsx`)

**Features:**
- Auto-detects stream format
- Uses appropriate player (JSMpeg, `<img>`, MediaSource)
- Handles reconnection on disconnect
- Memory leak prevention (revokes Blob URLs)
- Clean teardown on unmount

**Props:**
- `cameraId`: "1" or "2"
- `direction`: "IN" | "OUT" (optional)
- `showActionButton`: boolean (optional)
- `onActionClick`: callback function (optional)

## Production Considerations

### 1. HTTPS/WSS

In production, use `wss://` (secure WebSocket):

```typescript
// In camera-ws-proxy-server.ts
const wss = new WebSocketServer({ 
  server: httpsServer, // Use HTTPS server
  path: "/ws/camera",
})
```

### 2. Authentication

Add authentication to WebSocket proxy:

```typescript
wss.on("connection", (clientWs, request) => {
  // Verify session token
  const token = url.searchParams.get("token")
  if (!verifyToken(token)) {
    clientWs.close(1008, "Unauthorized")
    return
  }
  // ... rest of connection logic
})
```

### 3. Database Configuration

Update proxy to fetch camera config from database:

```typescript
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

### 4. Error Handling

Add retry logic and error reporting:

```typescript
// In RealtimeVideoProxy.tsx
const MAX_RETRIES = 5
let retryCount = 0

ws.onclose = () => {
  if (retryCount < MAX_RETRIES) {
    retryCount++
    setTimeout(() => connectVideoStream(), 3000 * retryCount)
  }
}
```

## Troubleshooting

### Connection Fails

1. **Check camera WebSocket path**: Run detection script
2. **Verify camera IP/port**: Test with `wscat -c ws://192.168.1.50:9080/h264`
3. **Check proxy server**: Verify it's running and accessible
4. **Browser console**: Check for WebSocket errors

### No Video Display

1. **Check stream format**: Look at browser console for format detection
2. **Verify player initialization**: Check if JSMpeg/jmuxer loaded
3. **Check data flow**: Verify messages are being received

### Memory Leaks

1. **Blob URLs**: Ensure `URL.revokeObjectURL()` is called
2. **WebSocket cleanup**: Close connections on unmount
3. **Player cleanup**: Destroy JSMpeg/jmuxer instances

## Next Steps

1. **Install JSMpeg** (for MPEG-TS):
   ```bash
   npm install jsmpeg
   ```

2. **Install jmuxer** (for H.264):
   ```bash
   npm install jmuxer
   ```

3. **Update component** to use jmuxer for H.264 streams

4. **Add authentication** to WebSocket proxy

5. **Deploy proxy server** alongside Next.js app

## Files Created

- `scripts/detect-camera-websocket-path.ts` - Path detection script
- `camera-ws-proxy-server.ts` - Express WebSocket proxy server
- `components/camera/RealtimeVideoProxy.tsx` - Frontend component with auto-detection
- `app/api/camera/ws-proxy/route.ts` - Next.js API route (placeholder)

## Testing

1. **Test path detection**:
   ```bash
   npx tsx scripts/detect-camera-websocket-path.ts 192.168.1.50 9080
   ```

2. **Test proxy server**:
   ```bash
   npx tsx camera-ws-proxy-server.ts
   wscat -c ws://localhost:3001/ws/camera?camera=1
   ```

3. **Test frontend**: Load page with `RealtimeVideoProxy` component
