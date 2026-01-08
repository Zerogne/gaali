# Fix: Black Screen - WebSocket Connected but No Video

## Your Current Status

✅ **WebSocket Connected** - Both cameras show "Video stream connected"  
❌ **No Frames Received** - Video is black because no frames are coming through

## The Problem

The WebSocket connection is working, but the Electron app is not sending video frames. This means:

1. ✅ WebSocket server is running
2. ✅ Frontend is connecting correctly  
3. ❌ Camera SDK callback is not being called, OR
4. ❌ Frames are not being broadcast

## Step 1: Check Electron Console

**Open your Electron app's console** (main process) and look for:

### What You Should See:
```
✅ Video stream server ready
🔌 WebSocket endpoint: ws://localhost:3004/video/{cameraId}
✅ Connected to camera-1, handle: [number]
✅ Video stream started for camera-1
📹 Frame received for camera-1: ...
📤 Broadcasted frame to 1 client(s)
```

### What You're Probably NOT Seeing:
- "Frame received" messages
- "Broadcasted frame" messages

## Step 2: Add Frame Reception Logging

Add this to your Electron `main.js` in the `onVideoFrame` function:

```javascript
function onVideoFrame(cameraId, dataType, dataInfo) {
  // ADD THIS LOGGING FIRST
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

## Step 3: Check Camera SDK Callback

If you DON'T see "FRAME CALLBACK CALLED!" in Electron console, the camera SDK callback is not being called.

**Verify your camera setup code:**

```javascript
async function startCameraStream(camera) {
  console.log(`📹 Starting ${camera.id}...`);
  
  // Step 1: Open connection
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

  // Step 2: Set callback - THIS IS CRITICAL
  console.log('   Setting callback...');
  const callback = (handle, userData, dataType, dataInfo) => {
    console.log('📞 CALLBACK TRIGGERED!', dataType); // ADD THIS
    onVideoFrame(camera.id, dataType, dataInfo);
  };
  
  vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);
  console.log('   ✅ Callback set');

  // Step 3: Start playback
  const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
  console.log(`   PlayHandle: ${playHandle}`); // Should NOT be -1
  
  if (playHandle === -1) {
    throw new Error('Failed to start playback');
  }
  
  console.log(`✅ ${camera.id} started`);
}
```

## Step 4: Test with Manual Frame

Add this to test if WebSocket broadcasting works:

```javascript
// After videoStreamServer.start(), add:
setInterval(() => {
  // Create a minimal valid JPEG (1x1 pixel)
  const testFrame = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
  
  videoStreamServer.broadcastFrame('camera-1', testFrame);
  videoStreamServer.broadcastFrame('camera-2', testFrame);
  console.log('🧪 Sent test frames');
}, 1000);
```

**If test frames display:**
- ✅ WebSocket and frontend work
- ❌ Issue is with camera SDK callback

**If test frames don't display:**
- ❌ Issue is with WebSocket or frontend

## Step 5: Add Frontend Logging

Add this to `RealtimeVideo.tsx` to see if frames are received:

```typescript
ws.onmessage = (event) => {
  console.log('📨 MESSAGE RECEIVED!', {
    isBlob: event.data instanceof Blob,
    isString: typeof event.data === 'string',
    length: event.data?.length || 0,
    preview: typeof event.data === 'string' ? event.data.substring(0, 50) : 'blob'
  });

  // ... existing code ...
  
  try {
    const message = JSON.parse(event.data);
    console.log('📨 PARSED:', {
      type: message.type,
      hasData: !!message.data,
      dataLength: message.data?.length || 0
    });
    
    if (message.type === "frame" && videoRef.current) {
      console.log('✅ Setting video src');
      videoRef.current.src = `data:image/jpeg;base64,${message.data}`;
      console.log('✅ Video src set, length:', videoRef.current.src.length);
    }
  } catch (err) {
    console.error('❌ Parse error:', err);
  }
};
```

## Most Common Issues

### Issue 1: Camera SDK Callback Not Called

**Symptoms:**
- No "FRAME CALLBACK CALLED" in Electron console
- WebSocket connected but no frames

**Solutions:**
1. Verify `VzLPRClient_StartRealPlay` returns valid handle (not -1)
2. Check callback signature matches SDK requirements
3. Verify camera is actually streaming (check camera web interface)
4. Try different camera SDK initialization order

### Issue 2: Frame Format Mismatch

**Symptoms:**
- "FRAME CALLBACK CALLED" appears
- But "Unsupported format" warning

**Solutions:**
1. Check what `dataInfo.format` actually is
2. Add format conversion if needed
3. Try using buffer directly if format is unknown

### Issue 3: Frames Not Broadcasting

**Symptoms:**
- Frames received but not sent to WebSocket

**Solutions:**
1. Check `videoStreamServer.broadcastFrame()` is being called
2. Verify WebSocket clients are connected
3. Check for errors in broadcastFrame

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Electron console shows "Video stream server ready"
- [ ] Electron console shows "Connected to camera-X, handle: [number]"
- [ ] Electron console shows "Video stream started for camera-X"
- [ ] Electron console shows "FRAME CALLBACK CALLED" or "CALLBACK TRIGGERED"
- [ ] Electron console shows "Broadcasted frame"
- [ ] Browser console shows "MESSAGE RECEIVED"
- [ ] Browser console shows "Setting video src"

**Where it stops = where the problem is!**

## Next Steps

1. Add the logging code above
2. Check Electron console for frame callbacks
3. Check browser console for received messages
4. Share the logs to identify exact issue
