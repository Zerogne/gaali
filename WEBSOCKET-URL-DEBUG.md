# WebSocket URL Not Found - Debugging Guide

## Why "WebSocket URL not found" appears

The WebSocket URL is constructed from camera IP and port in the database. If you see this error, it means:

1. **Camera IP not set** in database → `webSocketUrl` will be `null`
2. **Camera IP set but URL still null** → Check the API response

## Diagnostic Logs Added

### Frontend Logs (RealtimeVideo.tsx)
- **Full config object** logged to see all data
- **Detailed reason** why URL is null:
  - `Camera IP not set in database`
  - `WebSocket port not set`
  - `Unknown reason`

### API Logs (app/api/camera/video/route.ts)
- **Company settings** logged before processing
- **Built WebSocket URLs** logged with IP, port, and final URL

## Check These

### 1. Database Configuration
Make sure camera IP is set:
```javascript
db.companies.findOne(
  { companyId: "your-company-id" },
  { cameraSettings: 1 }
);

// Should show:
// {
//   cameraSettings: {
//     camera1Ip: "192.168.1.50",  // ← Must be set!
//     camera1WebSocketPort: 8557, // ← Optional, defaults to 8557
//     camera2Ip: "192.168.1.49",
//     camera2WebSocketPort: 8557
//   }
// }
```

### 2. Browser Console
Check the logs for:
```
📡 [camera-1] Camera config received: { fullConfig: {...} }
```

Look for:
- `camera1.ip` - Should be `"192.168.1.50"` or your IP
- `camera1.webSocketUrl` - Should be `"wss://192.168.1.50:8557"` or null
- `reason` - Will tell you why URL is null

### 3. API Response
Check server logs for:
```
📹 [Camera Video API] Company ID: ...
📹 [Camera Video API] Built WebSocket URLs: ...
```

This shows what the API is building and why.

## Common Issues

### Issue 1: Camera IP Not Set
**Symptom:** `camera1.ip: "not set"` in logs
**Solution:** Update database with camera IP:
```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      "cameraSettings.camera1Ip": "192.168.1.50",
      "cameraSettings.camera2Ip": "192.168.1.49"
    }
  }
);
```

### Issue 2: WebSocket Port Not Set (uses default)
**Symptom:** URL is built but port might be wrong
**Solution:** Set explicit port:
```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      "cameraSettings.camera1WebSocketPort": 8557,
      "cameraSettings.camera2WebSocketPort": 8557
    }
  }
);
```

### Issue 3: API Not Authenticated
**Symptom:** `Config API returned error: { status: 401 }`
**Solution:** Make sure you're logged in

### Issue 4: Company Settings Not Found
**Symptom:** `hasCameraSettings: false` in API logs
**Solution:** Check if company exists and has cameraSettings

## Debugging Steps

1. **Check browser console** for full config object
2. **Check server logs** for API response
3. **Check database** for camera IP settings
4. **Verify authentication** - Are you logged in?
5. **Check company ID** - Is it correct?

## Expected Log Output

### Success:
```
📡 [camera-1] Camera config received: {
  fullConfig: {
    camera1: {
      ip: "192.168.1.50",
      webSocketPort: 8557,
      webSocketUrl: "wss://192.168.1.50:8557",
      configured: true
    }
  }
}
✅ [camera-1] Using camera 1 WebSocket: wss://192.168.1.50:8557
```

### Failure (IP not set):
```
📡 [camera-1] Camera config received: {
  camera1: {
    ip: "not set",
    webSocketPort: 8557,
    webSocketUrl: null
  }
}
⚠️ [camera-1] Camera 1 WebSocket URL is null/undefined: {
  reason: "Camera IP not set in database"
}
❌ [camera-1] No WebSocket URL available, cannot connect
```

## Quick Fix

If you've already set the URL in database but still see the error:

1. **Refresh the page** - Component will re-fetch config
2. **Check browser console** - Look for full config object
3. **Check API endpoint** - `curl /api/camera/video` (must be authenticated)
4. **Verify database** - Double-check camera IP is set correctly
