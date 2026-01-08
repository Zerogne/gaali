# Testing Real-Time Video Streaming

## Test Methods

There are two ways to test video streaming:

### Method 1: Node.js Test Script (Recommended)

A command-line test script that connects to the WebSocket and reports statistics.

**Usage:**
```bash
# Test camera-1 (default)
node test-video-stream.js

# Test camera-2
node test-video-stream.js camera-2

# Test with custom port
node test-video-stream.js camera-1 3004

# Save frames to disk
node test-video-stream.js camera-1 3004 --save-frames
```

**What it does:**
- Connects to WebSocket server
- Receives video frames for 10 seconds
- Reports statistics (FPS, frame size, etc.)
- Optionally saves frames to disk
- Shows pass/fail result

**Example Output:**
```
🧪 Video Stream Test
============================================================
Camera ID: camera-1
WebSocket URL: ws://localhost:3004/video/camera-1
Test Duration: 10 seconds
Save Frames: No
============================================================

📡 Connecting to ws://localhost:3004/video/camera-1...
✅ WebSocket connected!
⏳ Waiting for video frames...

📹 Frame #10: 45.2 KB, ~15.2 FPS
📹 Frame #20: 45.8 KB, ~15.1 FPS
...

============================================================
📊 Test Results
============================================================
✅ Connected: Yes
⏱️  Duration: 10.00 seconds
📨 Total Messages: 152
📹 Frames Parsed: 152
🖼️  Frames with Data: 152
❌ Errors: 0

📈 Frame Statistics:
   Average FPS: 15.20
   Average Frame Size: 45.5 KB
   Min Interval: 60 ms
   Max Interval: 80 ms

============================================================
✅ TEST PASSED: Video streaming is working!
   Received 152 frames in 10.00 seconds
   Frame rate: ~15.20 FPS
============================================================
```

### Method 2: Browser Test Page

A visual test page that displays video in real-time.

**Usage:**
1. Open `test-video-stream-browser.html` in your browser
2. Select camera ID (camera-1 or camera-2)
3. Enter WebSocket port (default: 3004)
4. Click "Connect"
5. Watch video stream and statistics

**Features:**
- Real-time video display
- Connection status
- Frame rate counter
- Frame count
- Error tracking
- Live logs

## Prerequisites

### For Node.js Test:
```bash
npm install ws
```

### For Browser Test:
- No installation needed
- Just open the HTML file in a browser
- Make sure Electron app is running

## What to Check

### ✅ Success Indicators:
- WebSocket connects successfully
- Frames are received (frame count > 0)
- Frame rate is reasonable (5-30 FPS typical)
- No errors in logs
- Video displays (browser test)

### ❌ Failure Indicators:
- Cannot connect to WebSocket
- Connected but no frames received
- Frames received but invalid format
- High error count
- Black screen (browser test)

## Troubleshooting

### Issue: Cannot Connect to WebSocket

**Check:**
1. Is video stream server running?
   ```bash
   # Check Electron console for:
   # "✅ Video stream server ready"
   ```

2. Is port correct?
   - Default: 3004
   - Check Electron console for actual port

3. Is server accessible?
   ```bash
   curl http://localhost:3004/health
   ```

### Issue: Connected but No Frames

**Check:**
1. Is camera SDK callback being called?
   - Check Electron console for "FRAME CALLBACK CALLED"
   - If not, camera SDK issue

2. Are frames being broadcast?
   - Check Electron console for "Broadcasted frame"
   - If not, check `broadcastFrame()` calls

3. Is camera actually streaming?
   - Check camera web interface
   - Verify camera is online

### Issue: Frames Received but Invalid

**Check:**
1. Frame format
   - Should be base64-encoded JPEG
   - Check frame data in logs

2. Message format
   - Should be: `{"type":"frame","data":"base64...","timestamp":...}`
   - Check parsed message structure

## Quick Test Commands

```bash
# Quick test (10 seconds)
node test-video-stream.js camera-1

# Test both cameras
node test-video-stream.js camera-1 && node test-video-stream.js camera-2

# Test and save frames
node test-video-stream.js camera-1 3004 --save-frames

# Check saved frames
ls -lh test-frames/
```

## Expected Results

### Good Performance:
- Frame rate: 10-30 FPS
- Frame size: 20-100 KB
- No errors
- Consistent intervals

### Poor Performance:
- Frame rate: < 5 FPS
- Frame size: > 200 KB (too large)
- Many errors
- Inconsistent intervals

## Integration with CI/CD

You can use the test script in automated testing:

```bash
# Exit code 0 = pass, 1 = fail
node test-video-stream.js camera-1
if [ $? -eq 0 ]; then
  echo "Video streaming test passed"
else
  echo "Video streaming test failed"
  exit 1
fi
```

## Next Steps

1. Run the test script to verify streaming works
2. If test fails, check Electron console logs
3. Use browser test for visual verification
4. Fix issues based on test results
