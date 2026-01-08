# Camera Ports Configuration

## Your Camera Ports

- **HTTP/HTTPS Port:** `443`
- **RTSP Port:** `8557`
- **WebSocket Port:** `9080`

## Updated Database Schema

The `cameraSettings` now includes separate ports for each protocol:

```javascript
cameraSettings: {
  camera1Ip: "192.168.1.50",
  camera1HttpPort: 443,        // HTTP/HTTPS for MJPEG
  camera1RtspPort: 8557,        // RTSP streaming
  camera1WebSocketPort: 9080,   // WebSocket streaming
  camera1Username: "admin",
  camera1Password: "admin",
  camera2Ip: "192.168.1.49",
  camera2HttpPort: 443,
  camera2RtspPort: 8557,
  camera2WebSocketPort: 9080,
  camera2Username: "admin",
  camera2Password: "admin"
}
```

## Update Company Database

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1HttpPort: 443,
        camera1RtspPort: 8557,
        camera1WebSocketPort: 9080,
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2HttpPort: 443,
        camera2RtspPort: 8557,
        camera2WebSocketPort: 9080,
        camera2Username: "admin",
        camera2Password: "admin"
      }
    }
  }
);
```

## Streaming Options

### Option 1: HTTP/HTTPS MJPEG (Current - Recommended)
- **Port:** `443`
- **URL:** `https://192.168.1.50:443/video.mjpeg`
- **Usage:** Works directly in HTML5 `<video>` element
- **Proxy:** `/api/camera/proxy?camera=1`

### Option 2: RTSP
- **Port:** `8557`
- **URL:** `rtsp://192.168.1.50:8557/stream`
- **Note:** RTSP cannot be played directly in HTML5 video
- **Requires:** RTSP to HLS/WebRTC conversion server (e.g., MediaMTX, FFmpeg)

### Option 3: WebSocket
- **Port:** `9080`
- **URL:** `wss://192.168.1.50:9080`
- **Note:** Requires camera to support WebSocket streaming
- **Usage:** Connect via WebSocket client, receive frames, display in canvas/video

## API Response

The `/api/camera/video` endpoint now returns all URLs:

```json
{
  "companyId": "company-1",
  "camera1": {
    "ip": "192.168.1.50",
    "httpPort": 443,
    "rtspPort": 8557,
    "webSocketPort": 9080,
    "httpUrl": "https://192.168.1.50:443/video.mjpeg",
    "rtspUrl": "rtsp://192.168.1.50:8557/stream",
    "webSocketUrl": "wss://192.168.1.50:9080",
    "configured": true
  },
  "camera2": {
    "ip": "192.168.1.49",
    "httpPort": 443,
    "rtspPort": 8557,
    "webSocketPort": 9080,
    "httpUrl": "https://192.168.1.49:443/video.mjpeg",
    "rtspUrl": "rtsp://192.168.1.49:8557/stream",
    "webSocketUrl": "wss://192.168.1.49:9080",
    "configured": true
  }
}
```

## Current Implementation

The frontend currently uses **HTTP/HTTPS MJPEG** via the proxy endpoint:
- `/api/camera/proxy?camera=1` → Uses HTTP port 443
- Works directly in HTML5 `<video>` elements
- No additional conversion needed

## Future Enhancements

If you want to use RTSP or WebSocket:

### RTSP Streaming
Would require:
1. RTSP to HLS conversion server (MediaMTX, FFmpeg)
2. Frontend to use HLS.js for playback
3. More complex setup but better quality

### WebSocket Streaming
Would require:
1. WebSocket client in frontend
2. Frame decoding (JPEG/PNG from WebSocket)
3. Canvas or video element update
4. Lower latency than MJPEG

## Summary

✅ **Updated:** Camera settings now support separate ports for HTTP, RTSP, and WebSocket  
✅ **Current:** Using HTTP/HTTPS port 443 for MJPEG streaming (works now)  
✅ **Ready:** RTSP and WebSocket URLs available for future use  
✅ **Database:** Update company settings with all three ports  

The proxy endpoint continues to use HTTP port 443 for MJPEG streaming, which works directly in the browser.
