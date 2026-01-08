# Camera WebSocket Update - Dashboard Video

## What Changed

The dashboard page's `RealtimeVideo` component now connects **directly to camera WebSocket** (port 9080) instead of `localhost:3004`.

## Before

- Connected to: `ws://localhost:3004/video/camera-1` (Electron bridge)
- Required Electron app running

## After

- Connects to: `wss://192.168.1.50:9080` (Camera 1) or `wss://192.168.1.49:9080` (Camera 2)
- Direct connection to camera WebSocket
- No Electron app needed

## How It Works

1. **Dashboard loads** → `RealtimeVideo` component mounts
2. **Fetches camera config** → Calls `/api/camera/video`
3. **Gets WebSocket URL** → `wss://camera-ip:9080` from company settings
4. **Connects directly** → WebSocket connection to camera
5. **Receives video frames** → Displays in real-time

## Configuration

Make sure your company database has WebSocket ports configured:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1WebSocketPort: 9080,  // ✅ WebSocket port
        camera2Ip: "192.168.1.49",
        camera2WebSocketPort: 9080,  // ✅ WebSocket port
        // ... other settings
      }
    }
  }
);
```

## WebSocket Protocol

The component uses:
- **Secure WebSocket:** `wss://` (HTTPS-based WebSocket)
- **Port:** `9080` (as specified)
- **Direct connection:** No proxy needed

## Fallback

If camera WebSocket is not configured, it falls back to:
- Environment variable: `NEXT_PUBLIC_VIDEO_WS_URL`
- Default: `ws://localhost:3004/video/{cameraId}` (Electron bridge)

## Testing

1. **Update database** with WebSocket ports
2. **Open dashboard** (`/`)
3. **Check browser console** for:
   - `📹 Using camera 1 WebSocket: wss://192.168.1.50:9080`
   - `Video stream connected for camera camera-1`
4. **Video should display** directly from camera

## Troubleshooting

### "Failed to connect"
- Check camera WebSocket port is 9080
- Verify camera IP is correct
- Check if camera requires authentication
- Try `ws://` instead of `wss://` if SSL not enabled

### "Camera not configured"
- Update company database with `camera1WebSocketPort: 9080`
- Check `/api/camera/video` returns WebSocket URLs

### Still connecting to localhost:3004
- Check browser console for which URL is being used
- Verify database has WebSocket ports set
- Check API response: `curl /api/camera/video`

## Summary

✅ **Dashboard video** now connects directly to camera WebSocket (port 9080)  
✅ **No Electron app** needed for dashboard video  
✅ **Session pages** still use HTTP proxy (`/api/camera/proxy`)  
✅ **License plates** continue to work via `/api/lpr/ingest`  
