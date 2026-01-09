# Real-Time Video Streaming Checklist

## ✅ What We've Done

1. ✅ **Camera settings added to MongoDB** - All 4 companies have camera WebSocket settings
2. ✅ **WebSocket port configured** - Port 8557 set for real-time video
3. ✅ **API endpoint working** - `/api/camera/video` returns WebSocket URLs
4. ✅ **RealtimeVideo component ready** - Fetches config and connects to camera WebSocket

## ⚠️ Potential Issues to Check

### 1. **WebSocket URL Path** (Most Likely Issue)
**Current:** `wss://192.168.1.50:8557` (root path)
**Problem:** Cameras might need a specific path like `/stream`, `/video`, `/ws`, etc.

**Check:**
- Camera documentation for WebSocket endpoint path
- Try different paths: `/stream`, `/video`, `/ws`, `/live`

**Fix:**
```typescript
// In app/api/camera/video/route.ts, line 69
const wsPath = "/stream"; // or "/video", "/ws", etc. - check camera docs
```

### 2. **SSL/WSS vs WS** (Common Issue)
**Current:** Using `wss://` (secure WebSocket)
**Problem:** 
- Cameras might use `ws://` (non-secure) instead
- Self-signed certificates might cause browser to reject connection
- Browser security might block mixed content

**Check:**
- Camera documentation - does it use WSS or WS?
- Browser console for SSL errors
- Network tab for connection failures

**Fix:**
```typescript
// In app/api/camera/video/route.ts, line 70-71
// Change from wss:// to ws:// if camera doesn't support SSL
const camera1WebSocketUrl = camera1Ip
  ? `ws://${camera1Ip}:${camera1WebSocketPort}${wsPath}` // Use ws:// instead of wss://
  : null;
```

### 3. **Authentication** (May Be Needed)
**Current:** No authentication in WebSocket URL
**Problem:** Cameras might require username/password

**Check:**
- Camera documentation for WebSocket authentication
- Try basic auth in URL: `wss://username:password@ip:port`

**Fix:**
```typescript
// In app/api/camera/video/route.ts
const username = cameraSettings.camera1Username || "admin";
const password = cameraSettings.camera1Password || "admin";
const auth = `${username}:${password}@`;
const camera1WebSocketUrl = camera1Ip
  ? `wss://${auth}${camera1Ip}:${camera1WebSocketPort}${wsPath}`
  : null;
```

### 4. **Network Connectivity**
**Problem:** Browser can't reach camera IPs directly

**Check:**
- Are camera IPs reachable from browser? (Try `ping` or `curl`)
- Firewall blocking port 8557?
- Same network/subnet?

**Fix:**
- Ensure browser and cameras are on same network
- Check firewall rules
- Test with `curl` or `wscat`: `wscat -c ws://192.168.1.50:8557`

### 5. **Camera WebSocket Support**
**Problem:** Camera might not actually support WebSocket on port 8557

**Check:**
- Camera documentation/API specs
- Test WebSocket connection manually:
  ```bash
  # Install wscat: npm install -g wscat
  wscat -c ws://192.168.1.50:8557
  # or
  wscat -c wss://192.168.1.50:8557
  ```

### 6. **Browser Console Errors**
**Check browser console for:**
- `WebSocket connection failed`
- `Mixed Content` errors (if using http:// for site but wss:// for camera)
- `CORS` errors
- `SSL certificate` errors
- Connection timeout errors

### 7. **Camera Port Confusion**
**Current:** Port 8557 for WebSocket real-time video
**Verify:**
- Is 8557 actually the WebSocket port or is it RTSP?
- You said "realtime video port is 8557" - confirm this is WebSocket, not RTSP
- Port 9080 might be for WebSocket data (not video)

**If 9080 is actually for video WebSocket:**
```javascript
// Update in MongoDB:
db.companies.updateMany(
  {},
  {
    $set: {
      "cameraSettings.camera1WebSocketPort": 9080,
      "cameraSettings.camera2WebSocketPort": 9080
    }
  }
)
```

## 🧪 Testing Steps

### Step 1: Check API Returns Correct URL
```bash
# While logged in, check browser console or run:
curl http://localhost:3000/api/camera/video \
  -H "Cookie: your-session-cookie"

# Should return:
# {
#   "camera1": {
#     "webSocketUrl": "wss://192.168.1.50:8557",
#     ...
#   }
# }
```

### Step 2: Test WebSocket Connection Manually
```bash
# Install wscat
npm install -g wscat

# Test connection (try both ws:// and wss://)
wscat -c ws://192.168.1.50:8557
wscat -c wss://192.168.1.50:8557

# Try with paths
wscat -c ws://192.168.1.50:8557/stream
wscat -c ws://192.168.1.50:8557/video

# Try with authentication
wscat -c ws://admin:admin@192.168.1.50:8557
```

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Network tab → WS (WebSocket) filter
3. Navigate to dashboard/session page
4. Look for WebSocket connection attempts
5. Check Console tab for errors

### Step 4: Check RealtimeVideo Component Logs
The component has extensive logging. Check browser console for:
- `🔌 [camera-1] Connection attempt #1`
- `✅ [camera-1] WebSocket connected successfully!`
- `📨 [camera-1] Message received`
- `❌ [camera-1] WebSocket error`

## 🔧 Quick Fixes to Try

### Fix 1: Change to WS (non-secure)
```typescript
// app/api/camera/video/route.ts, line 70-71
const camera1WebSocketUrl = camera1Ip
  ? `ws://${camera1Ip}:${camera1WebSocketPort}${wsPath}` // Changed from wss:// to ws://
  : null;
```

### Fix 2: Add WebSocket Path
```typescript
// app/api/camera/video/route.ts, line 69
const wsPath = "/stream"; // or "/video", "/ws" - check camera docs
```

### Fix 3: Use Port 9080 Instead
```typescript
// app/api/camera/video/route.ts, line 39
const camera1WebSocketPort = cameraSettings.camera1WebSocketPort || 9080; // Changed from 8557 to 9080
```

### Fix 4: Add Authentication
```typescript
// app/api/camera/video/route.ts
const username = cameraSettings.camera1Username || "admin";
const password = cameraSettings.camera1Password || "admin";
const auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
const camera1WebSocketUrl = camera1Ip
  ? `wss://${auth}${camera1Ip}:${camera1WebSocketPort}${wsPath}`
  : null;
```

## 📊 Diagnostic Commands

```bash
# Check if camera is reachable
ping 192.168.1.50

# Check if port is open
telnet 192.168.1.50 8557
# or
nc -zv 192.168.1.50 8557

# Test HTTPS endpoint
curl -k https://192.168.1.50:443/video.mjpeg

# Test WebSocket with curl (if supported)
curl --http1.1 --include \
     --no-buffer \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     http://192.168.1.50:8557/
```

## 🎯 Most Likely Solution

Based on your setup, the most likely issues are:

1. **Wrong WebSocket path** - Try `/stream` or `/video` instead of root
2. **Wrong protocol** - Try `ws://` instead of `wss://`
3. **Wrong port** - Port 9080 might be for video WebSocket, not 8557
4. **Authentication needed** - Add username/password to URL

## ✅ Success Indicators

You'll know it's working when you see in browser console:
- ✅ `[camera-1] WebSocket connected successfully!`
- ✅ `[camera-1] Message received` (multiple messages)
- ✅ Video frames appearing in the `<video>` element
- ✅ Network tab shows WebSocket connection with status 101 (Switching Protocols)

## 📝 Next Steps

1. **Check camera documentation** - Find exact WebSocket endpoint path and protocol
2. **Test with wscat** - Verify camera WebSocket works manually
3. **Check browser console** - Look for specific error messages
4. **Try different paths/protocols** - Use Fix 1-4 above
5. **Verify port** - Confirm if 8557 or 9080 is correct for video WebSocket
