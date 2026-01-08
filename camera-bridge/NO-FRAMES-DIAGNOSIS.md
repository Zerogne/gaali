# Diagnosis: WebSocket Connected but No Frames

## Your Test Results

✅ **WebSocket Connected** - Connection is working  
✅ **Connection Confirmed** - Server responded  
❌ **No Frames Received** - 0 frames in 10 seconds

## The Problem

The Electron app is **not sending video frames**. This means:

1. ✅ WebSocket server is running
2. ✅ Frontend can connect
3. ❌ Camera SDK is not sending frames, OR
4. ❌ Frames are not being broadcast

## Next Steps: Check Electron Console

Open your **Electron app's console** (main process) and look for:

### What You Should See (if working):
```
✅ Video stream server ready
✅ Connected to camera-1, handle: [number]
✅ Video stream started for camera-1
📹 FRAME CALLBACK CALLED! camera-1 0 ...
📤 Broadcasted frame to 1 client(s)
```

### What You're Probably NOT Seeing:
- "FRAME CALLBACK CALLED" messages
- "Broadcasted frame" messages

## Add This Logging to Your Electron App

Add this to your `onVideoFrame` function in Electron main.js:

```javascript
function onVideoFrame(cameraId, dataType, dataInfo) {
  // ADD THIS FIRST LINE
  console.log('📹 FRAME CALLBACK CALLED!', {
    cameraId,
    dataType,
    format: dataInfo?.format,
    hasBuffer: !!dataInfo?.buffer
  });

  const clientCount = videoStreamServer.getClientCount(cameraId);
  console.log(`   Clients: ${clientCount}`);

  if (clientCount === 0) {
    console.log('   ⚠️ No clients, skipping');
    return;
  }

  if (dataType === 0) { // VIDEO
    console.log('   ✅ Processing VIDEO frame');
    
    let frameBase64 = null;
    
    if (dataInfo.format === 'JPEG' || dataInfo.format === 1) {
      const buffer = Buffer.from(dataInfo.buffer);
      frameBase64 = buffer.toString('base64');
      console.log(`   ✅ Converted to base64: ${frameBase64.length} chars`);
      
      videoStreamServer.broadcastFrame(cameraId, frameBase64);
      console.log(`   📤 Broadcasted to ${clientCount} client(s)`);
    } else {
      console.warn(`   ⚠️ Unsupported format: ${dataInfo.format}`);
    }
  }
}
```

## Check Camera SDK Connection

Also add logging to your camera setup:

```javascript
async function startCameraStream(camera) {
  console.log(`📹 Starting ${camera.id}...`);
  
  const handle = vzlpr.VzLPRClient_Open(
    camera.ip,
    camera.port,
    camera.username,
    camera.password
  );
  
  console.log(`   Handle: ${handle}`); // Should NOT be -1
  
  if (handle === -1) {
    throw new Error('Failed to connect');
  }

  // Set callback
  console.log('   Setting callback...');
  const callback = (handle, userData, dataType, dataInfo) => {
    console.log('📞 CALLBACK TRIGGERED!', dataType); // ADD THIS
    onVideoFrame(camera.id, dataType, dataInfo);
  };
  
  vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);
  console.log('   ✅ Callback set');

  // Start playback
  const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
  console.log(`   PlayHandle: ${playHandle}`); // Should NOT be -1
  
  if (playHandle === -1) {
    throw new Error('Failed to start playback');
  }
  
  console.log(`✅ ${camera.id} started`);
}
```

## What to Look For in Electron Console

### If You See "CALLBACK TRIGGERED":
✅ Camera SDK callback is working  
→ Check if frames are being processed

### If You DON'T See "CALLBACK TRIGGERED":
❌ Camera SDK callback is not being called  
→ Check:
1. Is camera connected? (handle not -1)
2. Is callback set correctly?
3. Is playback started? (playHandle not -1)
4. Is camera actually streaming? (check camera web interface)

## Common Issues

### Issue 1: Camera Not Connected
**Symptom:** Handle is -1

**Fix:**
- Check camera IP, port, username, password
- Verify camera is online
- Check network connectivity

### Issue 2: Playback Not Started
**Symptom:** PlayHandle is -1

**Fix:**
- Check camera supports real-time playback
- Verify SDK initialization
- Check camera SDK documentation

### Issue 3: Callback Not Called
**Symptom:** No "CALLBACK TRIGGERED" messages

**Fix:**
- Verify callback signature matches SDK
- Check if camera is actually streaming
- Try different camera SDK initialization order

### Issue 4: Frames Received But Not Broadcast
**Symptom:** "CALLBACK TRIGGERED" but no "Broadcasted frame"

**Fix:**
- Check frame format
- Verify base64 conversion
- Check broadcastFrame() is being called

## Quick Test: Send Test Frame

Add this to your Electron app to test if broadcasting works:

```javascript
// After videoStreamServer.start():
setInterval(() => {
  // Minimal valid JPEG (1x1 pixel)
  const testFrame = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  videoStreamServer.broadcastFrame('camera-1', testFrame);
  console.log('🧪 Sent test frame');
}, 1000);
```

**If test frames appear in browser:**
- ✅ WebSocket broadcasting works
- ❌ Issue is with camera SDK

**If test frames don't appear:**
- ❌ Issue is with WebSocket broadcasting

## Summary

Your WebSocket connection is working perfectly. The issue is that **no frames are being sent from Electron**.

**Next step:** Check Electron console for:
1. "CALLBACK TRIGGERED" - Camera SDK callback
2. "FRAME CALLBACK CALLED" - Frame processing
3. "Broadcasted frame" - Frame broadcasting

Share what you see in Electron console!
