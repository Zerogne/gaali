# Fix: Invalid cameraId: null Error

## Error You're Seeing

```
[Camera Upload] Invalid cameraId: null
```

**This means:** The `camera` query parameter is missing in the URL.

---

## What cameraId Is (NOT the Camera IP!)

**Important:** `cameraId` is NOT the camera IP address!

- `cameraId` = Just "1" or "2" (a simple identifier)
- Camera IP = The actual IP like `192.168.1.49` (used for RTSP connection, NOT for upload)

**You have 2 cameras:**
- Camera 1 → `cameraId="1"` → Shows on dashboard as "IN" direction
- Camera 2 → `cameraId="2"` → Shows on dashboard as "OUT" direction

---

## The Fix: Add ?camera=1 or ?camera=2 to URL

### Correct URL Format:

```
POST https://gaali.vercel.app/api/camera/upload?camera=1
```

**Or for camera 2:**
```
POST https://gaali.vercel.app/api/camera/upload?camera=2
```

---

## Fix in Your Electron App

### Check Your Code

Make sure you're calling `pushVideoToWebsiteAPI` with a cameraId:

```javascript
// ✅ CORRECT: Pass cameraId as first parameter
pushVideoToWebsiteAPI('1', jpegBuffer, timestamp);  // For camera 1
pushVideoToWebsiteAPI('2', jpegBuffer, timestamp);  // For camera 2

// ❌ WRONG: Missing cameraId or passing null
pushVideoToWebsiteAPI(null, jpegBuffer, timestamp);  // ❌ Will cause null error
pushVideoToWebsiteAPI(undefined, jpegBuffer, timestamp);  // ❌ Will cause null error
```

### Example: How to Determine cameraId from Camera IP

In your Electron app, you need to map camera IP to cameraId:

```javascript
// Map camera IPs to camera IDs
const cameraMapping = {
  '192.168.1.49': '1',  // Camera 1 (IN direction)
  '192.168.1.50': '2',  // Camera 2 (OUT direction)
};

// When you get a frame from camera IP
function onFrameFromCamera(cameraIp, jpegBuffer) {
  const cameraId = cameraMapping[cameraIp];
  
  if (!cameraId) {
    console.error(`❌ Unknown camera IP: ${cameraIp}`);
    return;
  }
  
  // Upload with cameraId
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now());
}
```

### Example: If You Have Separate Streams

```javascript
// Camera 1 stream
function setupCamera1() {
  const rtspUrl = 'rtsp://admin:admin@192.168.1.49:8557/h264';
  const cameraId = '1';  // ← Hardcode for camera 1
  
  // FFmpeg extraction...
  onFrameExtracted((jpegBuffer) => {
    pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now());
  });
}

// Camera 2 stream
function setupCamera2() {
  const rtspUrl = 'rtsp://admin:admin@192.168.1.50:8557/h264';
  const cameraId = '2';  // ← Hardcode for camera 2
  
  // FFmpeg extraction...
  onFrameExtracted((jpegBuffer) => {
    pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now());
  });
}
```

---

## Quick Test (curl)

```bash
# Test with camera=1
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg

# Test with camera=2
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=2" \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**Notice:** `?camera=1` in the URL!

---

## Common Mistakes

### ❌ Wrong: Missing cameraId

```javascript
// ❌ Electron code calling without cameraId
pushVideoToWebsiteAPI(null, jpegBuffer);  // ❌ Wrong
pushVideoToWebsiteAPI(undefined, jpegBuffer);  // ❌ Wrong
```

**URL will be:** `https://gaali.vercel.app/api/camera/upload` (missing `?camera=1`)

### ❌ Wrong: Using camera IP as cameraId

```javascript
// ❌ Wrong - don't use IP as cameraId
pushVideoToWebsiteAPI('192.168.1.49', jpegBuffer);  // ❌ Wrong!
```

**API only accepts:** `"1"` or `"2"`, not IP addresses!

### ✅ Correct: Use "1" or "2"

```javascript
// ✅ Correct
pushVideoToWebsiteAPI('1', jpegBuffer);  // For camera at 192.168.1.49
pushVideoToWebsiteAPI('2', jpegBuffer);  // For camera at 192.168.1.50
```

**URL will be:** `https://gaali.vercel.app/api/camera/upload?camera=1` ✅

---

## Summary

**cameraId is:**
- Just "1" or "2" (NOT the camera IP)
- A simple identifier to distinguish your 2 cameras
- Must be passed as query parameter: `?camera=1`

**Camera IP is:**
- Used for RTSP connection: `rtsp://admin:admin@192.168.1.49:8557/h264`
- NOT sent to the upload API
- Just used locally in Electron to connect to the camera

**The fix:**
- Make sure your Electron app calls `pushVideoToWebsiteAPI('1', ...)` or `pushVideoToWebsiteAPI('2', ...)`
- Don't pass `null`, `undefined`, or camera IP as cameraId
