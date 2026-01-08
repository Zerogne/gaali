# Camera SDK Explanation

## What is a Camera SDK?

**SDK** = **Software Development Kit**

A **Camera SDK** is a library/package that provides functions to communicate with and control IP cameras programmatically.

## Why Do You Need It?

IP cameras (like your license plate recognition cameras) have their own software/firmware. To get video from them in your Electron app, you need a way to:
- Connect to the camera
- Request video streams
- Receive video frames
- Control camera settings

The **Camera SDK** provides these functions.

## How It Works

```
Your Electron App
    ↓
Camera SDK (Library)
    ↓
Camera Hardware (via network)
    ↓
Video Stream
```

### Example Flow:

1. **Your Electron app** calls SDK function: `VzLPRClient_Open(ip, port, username, password)`
2. **SDK** connects to camera over network
3. **Camera** starts sending video
4. **SDK** receives video frames
5. **SDK** calls your callback function with frame data
6. **Your app** processes and displays the frame

## Common Camera SDKs

### 1. VzLPRClient SDK
- Used for license plate recognition cameras
- Provides functions like:
  - `VzLPRClient_Open()` - Connect to camera
  - `VzLPRClient_StartRealPlay()` - Start video stream
  - `VzLPRClient_SetVideoDataCallback()` - Set callback for frames

### 2. ONVIF SDK
- Standard protocol for IP cameras
- Works with many camera brands

### 3. RTSP SDK
- For cameras that support RTSP streaming
- More generic, works with many cameras

## In Your Code

Here's how the SDK is used in your Electron app:

```javascript
// 1. Import/require the SDK
const vzlpr = require('./build/Release/vzlpr.node');

// 2. Connect to camera
const handle = vzlpr.VzLPRClient_Open(
  '192.168.1.50',  // Camera IP
  8000,            // Camera port
  'admin',         // Username
  'admin'          // Password
);

// 3. Set up callback (function that gets called when frame arrives)
const callback = (handle, userData, dataType, dataInfo) => {
  // This function is called automatically when camera sends a frame
  console.log('Frame received!', dataInfo);
  // Process the frame...
};

vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);

// 4. Start video stream
const playHandle = vzlpr.VzLPRClient_StartRealPlay(handle, null);
```

## What the SDK Does

### Without SDK (Hard Way):
- You'd need to:
  - Understand camera's network protocol
  - Send raw network packets
  - Parse video stream format
  - Handle encoding/decoding
  - Manage connections manually

### With SDK (Easy Way):
- SDK handles all the complex stuff
- You just call simple functions
- SDK gives you frames in a usable format

## SDK Installation

Camera SDKs are usually:

1. **Native Modules** (Node.js addons)
   - File: `vzlpr.node` (compiled binary)
   - Platform-specific (Windows/Mac/Linux)
   - Fast, but needs compilation

2. **JavaScript Libraries**
   - File: `camera-sdk.js`
   - Works everywhere
   - May be slower

3. **System Libraries**
   - Installed on system
   - Your app links to them

## In Your Current Setup

Based on your code, you're using **VzLPRClient SDK**:

```javascript
const vzlpr = require('./build/Release/vzlpr.node');
```

This means:
- SDK file: `build/Release/vzlpr.node`
- Type: Native Node.js addon
- Functions: `VzLPRClient_*` functions

## Why No Frames Are Coming

If you're not getting frames, it could be:

1. **SDK not installed**
   - File `vzlpr.node` doesn't exist
   - SDK not compiled for your platform

2. **SDK not connecting**
   - Camera IP/port wrong
   - Camera credentials wrong
   - Network issue

3. **SDK callback not set**
   - Callback function not registered
   - Callback signature wrong

4. **Camera not streaming**
   - Camera not configured for streaming
   - Camera firmware issue

## How to Check if SDK is Working

### 1. Check if SDK file exists:
```bash
ls -la build/Release/vzlpr.node
```

### 2. Check if SDK loads:
```javascript
try {
  const vzlpr = require('./build/Release/vzlpr.node');
  console.log('✅ SDK loaded');
  console.log('Available functions:', Object.keys(vzlpr));
} catch (error) {
  console.error('❌ SDK failed to load:', error);
}
```

### 3. Check camera connection:
```javascript
const handle = vzlpr.VzLPRClient_Open('192.168.1.50', 8000, 'admin', 'admin');
console.log('Handle:', handle); // Should NOT be -1
```

### 4. Check callback is called:
```javascript
const callback = (handle, userData, dataType, dataInfo) => {
  console.log('📞 CALLBACK CALLED!', dataType); // Should see this
};
vzlpr.VzLPRClient_SetVideoDataCallback(handle, callback, null);
```

## SDK vs Direct Camera Access

### Using SDK (Recommended):
```
Your App → SDK → Camera
```
- ✅ Easy to use
- ✅ Handles complexity
- ✅ Well-tested
- ❌ Requires SDK installation

### Direct Access (Advanced):
```
Your App → Network Protocol → Camera
```
- ✅ No SDK needed
- ✅ More control
- ❌ Very complex
- ❌ Camera-specific

## Common SDK Functions

### Connection:
- `Open()` - Connect to camera
- `Close()` - Disconnect
- `Login()` - Authenticate

### Video:
- `StartRealPlay()` - Start live stream
- `StopRealPlay()` - Stop stream
- `SetVideoDataCallback()` - Set frame callback

### Control:
- `PTZControl()` - Pan/tilt/zoom
- `SetConfig()` - Change settings
- `GetConfig()` - Read settings

## Summary

**Camera SDK** = Library that lets your app talk to cameras easily

**In your case:**
- You need VzLPRClient SDK installed
- SDK connects to cameras
- SDK sends you video frames via callback
- You process frames and send to frontend

**Current issue:**
- WebSocket works ✅
- But no frames coming ❌
- Likely: SDK callback not being called
- Check Electron console for "CALLBACK TRIGGERED" messages

## Next Steps

1. Verify SDK is installed and loads
2. Check camera connection (handle not -1)
3. Verify callback is set
4. Check if callback is being called
5. If callback not called → Camera/SDK issue
6. If callback called but no frames → Processing issue
