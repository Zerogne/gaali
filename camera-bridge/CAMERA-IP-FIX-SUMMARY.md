# Camera IP Fix Summary

## What Was Fixed

### 1. ✅ Removed Hardcoded Camera IPs

**Before:**
- Camera IPs were hardcoded as `192.168.1.100` in many places
- All companies would use the same IP

**After:**
- Camera IPs are stored per company in `company.cameraSettings`
- Each company can have different camera IPs
- Your cameras: `192.168.1.50` and `192.168.1.49`

### 2. ✅ Fixed MJPEG Error

**Before:**
- Error: `Failed to load 192.168.1.100/video.mjpeg`
- Components tried to load MJPEG directly from camera

**After:**
- `streamUrl` is now `null` (no MJPEG loading)
- Use WebSocket for video instead (RealtimeVideo component)
- No more MJPEG errors

### 3. ✅ Updated Camera Config API

**File:** `app/api/camera/config/route.ts`

**Changes:**
- Gets current company from session
- Returns camera IPs from company settings
- Returns `streamUrl: null` to disable MJPEG
- Falls back to environment variables if company settings not available

### 4. ✅ Updated Company Metadata

**File:** `lib/companies/metadata.ts`

**Added:**
```typescript
cameraSettings?: {
  camera1Ip?: string
  camera1Port?: number
  camera1Username?: string
  camera1Password?: string
  camera2Ip?: string
  camera2Port?: number
  camera2Username?: string
  camera2Password?: string
}
```

### 5. ✅ Updated Session Pages

**Files:**
- `app/in-session/page.tsx`
- `app/out-session/page.tsx`

**Changes:**
- Removed fallback to `NEXT_PUBLIC_CAMERA_STREAM_URL`
- Set `streamUrl` to `undefined` when API fails
- No more attempts to load MJPEG

## How to Set Camera IPs for a Company

### Method 1: Update Database

```javascript
// In MongoDB
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

### Method 2: Use Environment Variables (Temporary)

For local development, still use:
```env
CAMERA_1_IP=192.168.1.50
CAMERA_2_IP=192.168.1.49
```

## Testing

1. **Check API:**
   ```bash
   curl http://localhost:3000/api/camera/config
   ```
   Should return:
   ```json
   {
     "configured": true,
     "camera1Ip": "192.168.1.50",
     "camera2Ip": "192.168.1.49",
     "streamUrl": null
   }
   ```

2. **Check Browser Console:**
   - Should NOT see "Failed to load .../video.mjpeg"
   - streamUrl should be null/undefined

3. **Video Should Use WebSocket:**
   - Use RealtimeVideo component
   - Connects to `ws://localhost:3004/video/camera-1`

## Next Steps

1. **Update existing companies** with their camera IPs in database
2. **Create settings UI** for companies to configure camera IPs
3. **Update Electron app** to get camera IPs from company settings

## Files Changed

1. ✅ `app/api/camera/config/route.ts` - Gets IPs from company, returns null for streamUrl
2. ✅ `lib/companies/metadata.ts` - Added cameraSettings field
3. ✅ `app/in-session/page.tsx` - Removed MJPEG fallback
4. ✅ `app/out-session/page.tsx` - Removed MJPEG fallback

## Result

- ✅ No more hardcoded camera IPs
- ✅ No more MJPEG errors
- ✅ Each company can have different camera IPs
- ✅ Camera IPs stored in company metadata
- ✅ Use WebSocket for video (no MJPEG needed)
