# Camera IP Configuration Per Company

## Overview

Each company can have different camera IPs. Camera IPs are stored in company metadata, not hardcoded.

## Current Camera IPs

- **Camera 1:** `192.168.1.50`
- **Camera 2:** `192.168.1.49`

## How It Works

### 1. Company Metadata Structure

Each company can have camera settings:

```typescript
{
  companyId: "company-1",
  name: "Company Name",
  cameraSettings: {
    camera1Ip: "192.168.1.50",
    camera1Port: 8000,
    camera1Username: "admin",
    camera1Password: "admin",
    camera2Ip: "192.168.1.49",
    camera2Port: 8000,
    camera2Username: "admin",
    camera2Password: "admin"
  }
}
```

### 2. API Returns Company-Specific IPs

`/api/camera/config` now:
- Gets current company from session
- Returns camera IPs from company settings
- Returns `streamUrl: null` to use WebSocket (no MJPEG errors)

### 3. Electron App Gets IPs

Electron app should get camera IPs from:
- Company settings (via API)
- Or environment variables (for local setup)

## Setting Camera IPs for a Company

### Option 1: Via Database (Recommended)

Update company document in MongoDB:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1Port: 8000,
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2Port: 8000,
        camera2Username: "admin",
        camera2Password: "admin"
      }
    }
  }
);
```

### Option 2: Via API (Future)

Create an API endpoint to update company camera settings:

```typescript
// app/api/company/camera-settings/route.ts
export async function PUT(request: Request) {
  const companyId = await getActiveCompany();
  const { cameraSettings } = await request.json();
  
  await upsertCompany({
    companyId,
    // ... other fields
    cameraSettings
  });
  
  return NextResponse.json({ success: true });
}
```

### Option 3: Via Settings UI (Future)

Add a settings page where companies can configure their camera IPs.

## Electron App Configuration

### Get Camera IPs from API

```javascript
// In Electron app
async function getCameraConfig(companyId) {
  const response = await fetch(`http://localhost:3000/api/camera/config`, {
    headers: {
      'Cookie': `company-id=${companyId}`
    }
  });
  const config = await response.json();
  return {
    camera1: {
      ip: config.camera1Ip || process.env.CAMERA_1_IP || '192.168.1.50',
      port: 8000,
      username: 'admin',
      password: 'admin'
    },
    camera2: {
      ip: config.camera2Ip || process.env.CAMERA_2_IP || '192.168.1.49',
      port: 8000,
      username: 'admin',
      password: 'admin'
    }
  };
}
```

### Or Use Environment Variables

For local development, still use environment variables:

```env
CAMERA_1_IP=192.168.1.50
CAMERA_2_IP=192.168.1.49
CAMERA_1_PORT=8000
CAMERA_2_PORT=8000
CAMERA_1_USERNAME=admin
CAMERA_2_USERNAME=admin
CAMERA_1_PASSWORD=admin
CAMERA_2_PASSWORD=admin
```

## Fixing MJPEG Error

The error `Failed to load 192.168.1.100/video.mjpeg` happens because:

1. **Old code tries to load MJPEG directly** from camera
2. **Camera IP was hardcoded** as 192.168.1.100
3. **Browser can't access** camera directly

### Solution Applied

✅ **Updated `/api/camera/config`** to:
- Return `streamUrl: null` (disables MJPEG loading)
- Get camera IPs from company settings
- Support per-company camera IPs

✅ **Updated CompanyMetadata** to include `cameraSettings`

### Result

- ❌ No more MJPEG errors (streamUrl is null)
- ✅ Camera IPs are per-company (not hardcoded)
- ✅ Use WebSocket for video (RealtimeVideo component)

## Migration Steps

1. **Update existing companies** with their camera IPs:
   ```javascript
   // For each company
   db.companies.updateOne(
     { companyId: "company-id" },
     {
       $set: {
         cameraSettings: {
           camera1Ip: "192.168.1.50", // Their actual IP
           camera2Ip: "192.168.1.49"  // Their actual IP
         }
       }
     }
   );
   ```

2. **Update Electron app** to get IPs from company settings or API

3. **Remove hardcoded IPs** from code (already done in config API)

## Testing

1. **Check API returns correct IPs:**
   ```bash
   curl http://localhost:3000/api/camera/config
   # Should return camera1Ip and camera2Ip from company settings
   ```

2. **Verify no MJPEG errors:**
   - Open browser console
   - Should NOT see "Failed to load .../video.mjpeg"
   - streamUrl should be null

3. **Test WebSocket video:**
   - Use RealtimeVideo component
   - Should connect to ws://localhost:3004/video/camera-1

## Summary

- ✅ Camera IPs are now per-company (not hardcoded)
- ✅ MJPEG error fixed (streamUrl is null)
- ✅ Use WebSocket for video streaming
- ✅ Each company can have different camera IPs
