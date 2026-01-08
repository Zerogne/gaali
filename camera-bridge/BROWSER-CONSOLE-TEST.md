# Browser Console Test for Video Streaming

## Quick Test in Browser Console

### Step 1: Open Browser Console
1. Open your web app in browser
2. Press **F12** (or Right-click → Inspect)
3. Go to **Console** tab

### Step 2: Run Test
Copy and paste this code into the console and press Enter:

```javascript
(function testVideoStream() {
  console.log('🧪 Testing Video Stream...');
  const cameraId = 'camera-1';
  const wsUrl = `ws://localhost:3004/video/${cameraId}`;
  console.log(`📡 Connecting to: ${wsUrl}`);
  
  let frames = 0;
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => console.log('✅ CONNECTED!');
  
  ws.onmessage = (event) => {
    frames++;
    console.log(`📨 Message #${frames}:`, {
      type: typeof event.data,
      length: event.data?.length || 0
    });
    
    try {
      const msg = JSON.parse(event.data);
      console.log(`📨 Parsed:`, msg.type, msg.data ? `data: ${msg.data.length} chars` : 'no data');
      
      if (msg.type === 'frame') {
        console.log(`📹 FRAME RECEIVED! #${frames}`);
      }
    } catch (e) {
      console.error('❌ Parse error:', e);
    }
  };
  
  ws.onerror = (e) => console.error('❌ ERROR:', e);
  ws.onclose = () => console.log(`🔌 Closed. Total frames: ${frames}`);
  
  setTimeout(() => ws.close(), 10000);
})();
```

### Step 3: Check Results

**If working:**
```
✅ CONNECTED!
📨 Message #1: ...
📨 Parsed: frame data: 12345 chars
📹 FRAME RECEIVED! #1
📹 FRAME RECEIVED! #2
...
```

**If not working:**
```
❌ ERROR: ...
```
or
```
✅ CONNECTED!
📨 Message #1: ...
(but no frames)
```

## What to Look For

### ✅ Success:
- "CONNECTED!" message appears
- "FRAME RECEIVED!" messages appear
- Frame count increases

### ❌ Failure:
- Connection error
- Connected but no frames
- Parse errors

## Alternative: Use the Test File

Or use the complete test file:

1. Open `test-video-console.js`
2. Copy the entire content
3. Paste into browser console
4. Press Enter

This will run a 10-second test and show detailed statistics.

## Troubleshooting

### No "CONNECTED!" message:
- Check if Electron app is running
- Check if video stream server started
- Verify port 3004 is correct

### Connected but no frames:
- Check Electron console for "FRAME CALLBACK CALLED"
- Check if camera SDK is working
- Verify frames are being broadcast

### Parse errors:
- Check message format
- Verify JSON structure
- Check for data corruption
