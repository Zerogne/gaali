# Port Correction - Real-Time Video

## Correct Port Configuration

- **WebSocket Port:** `9080` (for other WebSocket data)
- **Real-Time Video Port:** `8557` (for real-time video streaming via WebSocket)

## What Changed

### Updated Default Ports
- **Real-time video WebSocket:** Changed from `9080` to `8557`
- **WebSocket 9080:** Reserved for other WebSocket data (not video)

### Files Updated
1. `app/api/camera/video/route.ts` - Default WebSocket port changed to 8557
2. `app/api/camera/proxy/route.ts` - Comment updated
3. `lib/companies/metadata.ts` - Documentation updated
4. `components/sessions/InSessionForm.tsx` - Comment updated
5. `components/sessions/OutSessionForm.tsx` - Comment updated

## Port Usage Summary

| Port | Purpose | Protocol |
|------|---------|----------|
| **443** | HTTP/HTTPS | HTTP/HTTPS (MJPEG) |
| **8557** | Real-Time Video | WebSocket (video streaming) |
| **9080** | Other WebSocket Data | WebSocket (non-video) |

## Database Configuration

When updating company settings, use:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1HttpPort: 443,
        camera1RtspPort: 8557,
        camera1WebSocketPort: 8557,  // ✅ Real-time video uses 8557
        camera2Ip: "192.168.1.49",
        camera2HttpPort: 443,
        camera2RtspPort: 8557,
        camera2WebSocketPort: 8557,  // ✅ Real-time video uses 8557
      }
    }
  }
);
```

## Result

- ✅ Real-time video now uses WebSocket port **8557**
- ✅ WebSocket port **9080** reserved for other data
- ✅ All components updated to use correct port
