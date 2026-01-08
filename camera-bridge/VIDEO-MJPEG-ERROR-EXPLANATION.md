# Why "Failed to load 192.168.1.100/video.mjpeg" Error?

## The Problem

You're seeing this error because some components in your app are trying to load video **directly from the camera** using HTTP MJPEG streams, which is different from the WebSocket approach we set up.

## Two Different Video Methods

### Method 1: Direct MJPEG (Causing Error) ❌
```
Browser → HTTP → Camera (192.168.1.100/video.mjpeg)
```
- Tries to load video directly from camera
- Requires camera to be accessible from browser
- Often fails due to CORS, network, or camera not supporting it

### Method 2: WebSocket (What We Set Up) ✅
```
Browser → WebSocket → Electron App → Camera SDK → Camera
```
- Video goes through Electron app
- Works even if camera not directly accessible
- Real-time frames via WebSocket

## Where the Error Comes From

The error is coming from these components:
- `components/sessions/CameraPanel.tsx`
- `components/sessions/InSessionForm.tsx`
- `components/sessions/OutSessionForm.tsx`

These components have code like:
```typescript
<img
  src={streamUrl}  // This is http://192.168.1.100/video.mjpeg
  onError={(e) => {
    console.error("Failed to load camera stream:", streamUrl);
  }}
/>
```

## Why It Fails

1. **Camera not accessible from browser**
   - Camera is on local network
   - Browser can't reach it directly
   - CORS restrictions

2. **MJPEG endpoint doesn't exist**
   - Camera might not have `/video.mjpeg` endpoint
   - Different camera model uses different path

3. **Authentication required**
   - Camera requires login
   - Browser can't authenticate automatically

## Solutions

### Solution 1: Remove Direct MJPEG (Recommended)

Since you're using WebSocket now, you don't need direct MJPEG. Update the components to use WebSocket instead:

**Option A: Use RealtimeVideo Component**

Replace the MJPEG loading with your `RealtimeVideo` component:

```typescript
// Instead of:
<img src={streamUrl} />

// Use:
<RealtimeVideo 
  cameraId="camera-1" 
  direction="IN"
  onActionClick={handleAction}
/>
```

**Option B: Disable MJPEG Loading**

If `streamUrl` is undefined or empty, the components won't try to load it:

```typescript
// Don't pass streamUrl prop, or pass undefined
<CameraPanel 
  streamUrl={undefined}  // This will show "Камер холбогдоогүй байна"
  // ... other props
/>
```

### Solution 2: Fix MJPEG URL (If You Want Both)

If you want to keep MJPEG as fallback:

1. **Check if camera has MJPEG endpoint:**
   ```bash
   curl http://192.168.1.100/video.mjpeg
   # or
   curl http://192.168.1.100:8080/video.mjpeg
   ```

2. **Set correct URL in environment:**
   ```env
   CAMERA_BASE_URL=http://192.168.1.100
   CAMERA_STREAM_PATH=/video.mjpeg
   # or whatever path your camera uses
   ```

3. **Or use public URL:**
   ```env
   NEXT_PUBLIC_CAMERA_STREAM_URL=http://192.168.1.100/video.mjpeg
   ```

### Solution 3: Suppress the Error (Quick Fix)

If you want to keep the code but hide the error:

```typescript
onError={(e) => {
  // Silently fail - WebSocket will handle video
  // console.error("Failed to load camera stream:", streamUrl);
}}
```

## Recommended Approach

Since you're using **WebSocket for real-time video**, you should:

1. **Remove or disable MJPEG loading** in session forms
2. **Use RealtimeVideo component** instead
3. **Remove streamUrl prop** or set it to `undefined`

This way:
- ✅ No MJPEG errors
- ✅ Uses WebSocket (faster, more reliable)
- ✅ Works even if camera not directly accessible

## Where streamUrl Comes From

The `streamUrl` is likely coming from:
- `app/api/camera/config/route.ts` - Returns camera config
- Environment variables: `CAMERA_BASE_URL` + `CAMERA_STREAM_PATH`
- Or hardcoded in components

Check where it's being set and either:
- Remove it
- Set it to `undefined`
- Or fix the URL if you want MJPEG

## Quick Fix

To stop the error immediately, find where `streamUrl` is passed to these components and set it to `undefined`:

```typescript
// In InSessionForm.tsx or OutSessionForm.tsx
<CameraPanel
  streamUrl={undefined}  // Don't try to load MJPEG
  // ... other props
/>
```

Or update the component to not show error if WebSocket is being used:

```typescript
onError={(e) => {
  // Only log if not using WebSocket
  if (!isUsingWebSocket) {
    console.error("Failed to load camera stream:", streamUrl);
  }
}}
```

## Summary

- **Error happens because:** Components try to load `http://192.168.1.100/video.mjpeg` directly
- **Why it fails:** Camera not accessible from browser or endpoint doesn't exist
- **Solution:** Use WebSocket (RealtimeVideo) instead, or disable MJPEG loading
- **Quick fix:** Set `streamUrl={undefined}` in components
