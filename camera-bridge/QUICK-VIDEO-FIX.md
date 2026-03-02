# Quick Fix: Black Screen Video Issue

## Most Common Issues

### 1. Camera SDK Callback Not Being Called

**Check in Electron console:**
- Do you see "Frame received" logs?
- If NO → Camera callback not working

**Fix:**
```javascript
// Make sure callback is set AFTER opening camera:
const handle = vzlpr.VzLPRClient_Open(...);
vzlpr.VzLPRClient_SetVideoDataCallback(handle, (h, userData, dataType, dataInfo) => {
  console.log('📹 CALLBACK CALLED!', dataType, dataInfo?.format); // ADD THIS
  onVideoFrame(cameraId, dataType, dataInfo);
}, null);
```

### 2. Frames Not Being Broadcast

**Check in Electron console:**
- Do you see "Sent frame" logs?
- If NO → Frames not being sent

**Fix:**
```javascript
// In onVideoFrame, add logging:
function onVideoFrame(cameraId, dataType, dataInfo) {
  console.log('📹 Frame received!', cameraId, dataType); // ADD THIS
  
  if (dataType === 0) {
    const frameBase64 = Buffer.from(dataInfo.buffer).toString('base64');
    console.log('📤 Broadcasting frame...'); // ADD THIS
    videoStreamServer.broadcastFrame(cameraId, frameBase64);
  }
}
```

### 3. Frontend Not Receiving Frames

**Check in Browser console (F12):**
- Do you see WebSocket messages?
- If NO → Frames not reaching frontend

**Fix:**
Add logging to your WebSocket client:
```typescript
ws.onmessage = (event) => {
  console.log('📨 Message received!', event.data.length); // ADD THIS
  // ... rest of code
};
```

### 4. Video Element Not Updating

**Check:**
- Is `videoRef.current` set?
- Is `src` being updated?

**Fix:**
```typescript
if (message.type === "frame" && videoRef.current) {
  console.log('✅ Setting video src'); // ADD THIS
  videoRef.current.src = `data:image/jpeg;base64,${message.data}`;
  console.log('✅ Video src set:', videoRef.current.src.substring(0, 50)); // ADD THIS
}
```

## Quick Test

Add this to Electron main.js to send test frames:

```javascript
// After videoStreamServer.start():
setInterval(() => {
  // Create a simple test frame (1x1 red pixel as JPEG)
  const testFrame = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  videoStreamServer.broadcastFrame('camera-1', testFrame);
  console.log('📤 Sent test frame');
}, 1000);
```

If test frame displays → Camera SDK issue
If test frame doesn't display → WebSocket/frontend issue

## Most Likely Issue

**Camera SDK callback not being called or frame format mismatch.**

Check:
1. Is `VzLPRClient_StartRealPlay` returning valid handle?
2. Is callback signature correct?
3. What is `dataInfo.format` value?

Add this logging:
```javascript
const callback = (handle, userData, dataType, dataInfo) => {
  console.log('CALLBACK:', {
    handle,
    dataType,
    format: dataInfo?.format,
    bufferType: typeof dataInfo?.buffer,
    bufferLength: dataInfo?.buffer?.length
  });
  onVideoFrame(cameraId, dataType, dataInfo);
};
```
