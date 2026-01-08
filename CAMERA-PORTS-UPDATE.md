# Camera Ports Update - Quick Reference

## Ports Configured

- **HTTP/HTTPS:** `443` (for MJPEG streaming)
- **RTSP:** `8557` (for RTSP streaming)
- **WebSocket:** `9080` (for WebSocket streaming)

## Database Update

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

## What Changed

1. ✅ **CompanyMetadata** - Added separate ports for HTTP, RTSP, WebSocket
2. ✅ **Video API** - Returns URLs for all three protocols
3. ✅ **Proxy API** - Uses HTTP port 443 (current implementation)

## Current Usage

- **Frontend:** Uses `/api/camera/proxy?camera=1` (HTTP port 443)
- **Works:** Directly in HTML5 video elements
- **No changes needed:** Current implementation continues to work

## Available URLs

After database update, `/api/camera/video` returns:
- `httpUrl`: `https://192.168.1.50:443/video.mjpeg` (current)
- `rtspUrl`: `rtsp://192.168.1.50:8557/stream` (future)
- `webSocketUrl`: `wss://192.168.1.50:9080` (future)
