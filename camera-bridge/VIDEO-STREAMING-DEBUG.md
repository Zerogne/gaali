# Video Streaming Debug Guide

## Problem: WebSocket Connected but Black Screen

If the WebSocket shows "connected" but video is black, follow these steps:

## Step 1: Check Electron Console Logs

Open your Electron app's console (main process) and check for:

### ✅ Expected Logs:
```
✅ Video stream server ready
🔌 WebSocket endpoint: ws://localhost:3004/video/{cameraId}
✅ Connected to camera-1, handle: [number]
✅ Video stream started for camera-1
```

### ❌ Missing Logs Indicate:
- **No "Video stream server ready"** → Server not started
- **No "Connected to camera"** → Camera SDK not connecting
- **No "Video stream started"** → Playback not started

## Step 2: Verify Camera SDK Callback is Being Called

Add logging to your `onVideoFrame` function in Electron main.js:

```javascript
function onVideoFrame(cameraId, dataType, dataInfo) {
  // ADD THIS LOGGING
  console.log(`📹 Frame received for ${cameraId}:`, {
    dataType,
    format: dataInfo?.format,
    hasBuffer: !!dataInfo?.buffer,
    bufferSize: dataInfo?.buffer?.length
  });

  if (videoStreamServer.getClientCount(cameraId) === 0) {
    console.log(`⚠️ No clients for ${cameraId}, skipping frame`);
    return;
  }

  if (dataType === 0) { // VIDEO
    let frameBase64 = null;

    if (dataInfo.format === 'JPEG' || dataInfo.format === 1 || dataInfo.format === 'MJPEG') {
      const buffer = Buffer.from(dataInfo.buffer);
      frameBase64 = buffer.toString('base64');
      console.log(`✅ Converted frame to base64, size: ${frameBase64.length} chars`);
    } else {
      console.warn(`⚠️ Unsupported format: ${dataInfo.format}`);
      return;
    }

    if (frameBase64) {
      videoStreamServer.broadcastFrame(cameraId, frameBase64);
      console.log(`📤 Broadcasted frame for ${cameraId}`);
    }
  } else {
    console.log(`ℹ️ Non-video data type: ${dataType}`);
  }
}
```

**What to check:**
- If you see "Frame received" → Camera SDK is working ✅
- If you DON'T see "Frame received" → Camera callback not being called ❌

## Step 3: Enable Frame Broadcasting Logs

Uncomment logging in `electron-video-stream-server.js`:

```javascript
// In broadcastFrame method, uncomment:
if (sentCount > 0) {
  console.log(`📹 Sent frame to ${sentCount} client(s) for ${cameraId}`);
}
```

**What to check:**
- If you see "Sent frame" → Frames are being sent ✅
- If you DON'T see "Sent frame" → Frames not being broadcast ❌

## Step 4: Check Browser Console

Open browser DevTools (F12) and check Console tab:

### Expected Logs:
```
Connecting to video stream for camera camera-1...
Video stream connected for camera camera-1
Connected to camera camera-1
```

### Check for Frame Messages:
Add logging to see if frames are received:

```javascript
// In your WebSocket client, add logging to ws.onmessage:
ws.onmessage = (event) => {
  console.log(`📨 Received message for ${cameraId}:`, {
    isBlob: event.data instanceof Blob,
    isString: typeof event.data === 'string',
    dataLength: event.data?.length || 0
  });

  // ... rest of code
  try {
    const message = JSON.parse(event.data);
    console.log(`📨 Parsed message:`, {
      type: message.type,
      hasData: !!message.data,
      dataLength: message.data?.length || 0
    });
    
    if (message.type === "frame" && videoRef.current) {
      console.log(`✅ Setting video src for ${cameraId}`);
      videoRef.current.src = `data:image/jpeg;base64,${message.data}`;
    }
  } catch (err) {
    console.error(`❌ Parse error:`, err);
  }
};
```

**What to check:**
- If you see "Received message" → WebSocket is receiving data ✅
- If you see "Setting video src" → Frame is being set ✅
- If you DON'T see "Received message" → No frames being sent ❌

## Step 5: Test WebSocket Connection Manually

Open browser console and test:

```javascript
const ws = new WebSocket('ws://localhost:3004/video/camera-1');
ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (event) => {
  console.log('📨 Message received:', {
    type: typeof event.data,
    length: event.data.length,
    preview: event.data.substring(0, 100)
  });
  try {
    const msg = JSON.parse(event.data);
    console.log('📨 Parsed:', msg.type, msg.data ? 'has data' : 'no data');
  } catch (e) {
    console.log('📨 Not JSON');
  }
};
ws.onerror = (err) => console.error('❌ Error:', err);
```

**What to check:**
- If you see messages → WebSocket is working ✅
- If no messages → No frames being sent ❌

## Step 6: Verify Camera SDK Integration

Check your camera connection code:

```javascript
// Make sure these are called:
const handle = vzlpr.VzLPRClient_Open(...);
console.log('Handle:', handle); // Should NOT be -1

vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);
console.log('Callback set');

const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
console.log('Play handle:', playHandle); // Should NOT be -1
```

**Common Issues:**
- `handle === -1` → Camera connection failed
- `playHandle === -1` → Playback failed to start
- Callback not set → Frames won't be received

## Step 7: Check Frame Format

Verify the frame format matches what frontend expects:

**Frontend expects:**
```json
{
  "type": "frame",
  "data": "base64_encoded_jpeg_string",
  "timestamp": 1234567890
}
```

**Verify in Electron:**
```javascript
const message = JSON.stringify({
  type: 'frame',
  data: frameBase64, // Must be base64 string
  timestamp: Date.now()
});
console.log('Sending message:', {
  type: 'frame',
  dataLength: frameBase64.length,
  dataPreview: frameBase64.substring(0, 50) + '...'
});
```

## Step 8: Test with Static Image

Temporarily send a test image to verify frontend works:

```javascript
// In Electron main.js, add test function:
function sendTestFrame(cameraId) {
  const fs = require('fs');
  const path = require('path');
  
  // Load a test image
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  if (fs.existsSync(testImagePath)) {
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64 = imageBuffer.toString('base64');
    
    videoStreamServer.broadcastFrame(cameraId, base64);
    console.log('✅ Sent test frame');
  } else {
    console.log('⚠️ Test image not found, create test-image.jpg');
  }
}

// Call it after server starts:
setInterval(() => {
  sendTestFrame('camera-1');
}, 1000); // Send every second
```

If test frame displays → Frontend works, issue is with camera SDK
If test frame doesn't display → Issue is with WebSocket or frontend

## Common Issues & Solutions

### Issue 1: Camera SDK Callback Not Called

**Symptoms:**
- No "Frame received" logs
- Camera connects but no frames

**Solutions:**
1. Verify callback is set: `VzLPRClient_SetVideoDataCallback(handle, callback, null)`
2. Check callback signature matches SDK requirements
3. Verify playback is started: `VzLPRClient_StartRealPlay`
4. Check camera SDK documentation for correct usage

### Issue 2: Frame Format Mismatch

**Symptoms:**
- Frames received but not displaying
- Browser console shows parse errors

**Solutions:**
1. Verify `dataInfo.format` matches expected format
2. Check if buffer needs conversion
3. Ensure base64 encoding is correct
4. Test with static image first

### Issue 3: No Clients Connected

**Symptoms:**
- "No clients for camera" logs
- Frames skipped

**Solutions:**
1. Verify frontend WebSocket URL: `ws://localhost:3004/video/camera-1`
2. Check cameraId matches: `camera-1` or `camera-2`
3. Verify WebSocket connection in browser console

### Issue 4: Video Element Not Updating

**Symptoms:**
- Frames received but video stays black
- Browser console shows frames

**Solutions:**
1. Check `videoRef.current` is not null
2. Verify `videoRef.current.src` is being set
3. Try using `<img>` instead of `<video>` for testing
4. Check browser console for video errors

## Quick Fix: Enhanced Logging Version

Add this enhanced version to your Electron main.js:

```javascript
function onVideoFrame(cameraId, dataType, dataInfo) {
  const clientCount = videoStreamServer.getClientCount(cameraId);
  
  console.log(`📹 [${cameraId}] Frame:`, {
    dataType,
    format: dataInfo?.format,
    bufferSize: dataInfo?.buffer?.length,
    clients: clientCount
  });

  if (clientCount === 0) {
    return;
  }

  if (dataType === 0) {
    try {
      let frameBase64 = null;

      if (dataInfo.format === 'JPEG' || dataInfo.format === 1) {
        const buffer = Buffer.from(dataInfo.buffer);
        frameBase64 = buffer.toString('base64');
        console.log(`✅ [${cameraId}] Frame converted, broadcasting to ${clientCount} client(s)`);
        
        videoStreamServer.broadcastFrame(cameraId, frameBase64);
      } else {
        console.warn(`⚠️ [${cameraId}] Unsupported format: ${dataInfo.format}`);
      }
    } catch (error) {
      console.error(`❌ [${cameraId}] Error processing frame:`, error);
    }
  }
}
```

## Next Steps

1. Add the enhanced logging
2. Check Electron console for frame logs
3. Check browser console for received messages
4. Share the logs to identify the exact issue
