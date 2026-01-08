# WebSocket Port 9080 - Usage Analysis

## Current Usage

### ✅ Dashboard Page (`/`)
- **Component:** `RealtimeVideo`
- **Connection:** Direct to camera WebSocket (port 9080)
- **URL:** `wss://192.168.1.50:9080` (Camera 1) or `wss://192.168.1.49:9080` (Camera 2)
- **Status:** ✅ Working

### ❌ Session Pages (`/in-session`, `/out-session`)
- **Component:** Direct `<video>` element
- **Connection:** HTTP proxy (`/api/camera/proxy`) on port 443
- **URL:** `https://192.168.1.50:443/video.mjpeg`
- **Status:** Currently using HTTP, **could use WebSocket 9080**

## Where We Can Use Port 9080

### 1. ✅ Dashboard Page (Already Using)
**Current:** Direct WebSocket connection to camera
**Benefits:**
- Real-time video streaming
- Lower latency
- Direct connection (no proxy)
- Better for monitoring

### 2. 🔄 Session Pages (Should Use)
**Current:** HTTP proxy on port 443
**Recommendation:** Switch to WebSocket port 9080

**Benefits of switching:**
- ✅ **Lower latency** - Direct WebSocket is faster than HTTP proxy
- ✅ **Better performance** - No server-side proxy overhead
- ✅ **Consistent experience** - Same connection method as dashboard
- ✅ **Real-time frames** - WebSocket provides frame-by-frame updates
- ✅ **Less server load** - Direct connection, no proxy processing

**How to switch:**
Replace `<video src="/api/camera/proxy?camera=1">` with `<RealtimeVideo cameraId="camera-1" />`

### 3. 📱 Mobile/Tablet Views
**Potential use:** If you have mobile views, WebSocket 9080 would be ideal
**Benefits:**
- Lower bandwidth usage (frame updates only)
- Better battery life (less processing)
- Real-time updates

### 4. 🔍 Debug/Monitoring Pages
**Potential use:** Camera status pages, debug panels
**Benefits:**
- Real-time camera status
- Live video feed for troubleshooting
- Connection quality monitoring

## Comparison: WebSocket 9080 vs HTTP Proxy 443

| Feature | WebSocket 9080 | HTTP Proxy 443 |
|---------|---------------|----------------|
| **Latency** | Lower (direct) | Higher (proxy) |
| **Server Load** | None (direct) | High (proxy) |
| **Connection Type** | Persistent | Request-based |
| **Frame Updates** | Real-time | Stream-based |
| **Browser Support** | Excellent | Excellent |
| **Firewall** | Port 9080 | Port 443 |
| **SSL/TLS** | WSS (secure) | HTTPS (secure) |
| **Authentication** | URL-based or after connect | Basic Auth in header |

## Recommendation

### ✅ Use WebSocket 9080 for:
1. **Dashboard** - ✅ Already using
2. **Session Pages** - 🔄 Should switch to WebSocket
3. **Any real-time monitoring** - Use WebSocket

### ✅ Use HTTP Proxy 443 for:
1. **Fallback** - If WebSocket fails
2. **Legacy support** - Older browsers (rare)
3. **Simple video embedding** - When you just need a video element

## Implementation Plan

### Option 1: Switch Session Pages to WebSocket (Recommended)

**Change:**
```tsx
// Current (HTTP proxy)
<video src="/api/camera/proxy?camera=1" />

// New (WebSocket)
<RealtimeVideo cameraId="camera-1" direction="IN" />
```

**Benefits:**
- Consistent with dashboard
- Better performance
- Lower server load
- Real-time updates

### Option 2: Keep Both (Hybrid)

**Use WebSocket for:**
- Dashboard monitoring
- Active session pages

**Use HTTP proxy for:**
- Fallback if WebSocket fails
- Simple video embedding

## Technical Considerations

### WebSocket 9080 Advantages:
1. **Direct connection** - No server proxy needed
2. **Lower latency** - Frame-by-frame updates
3. **Less bandwidth** - Only sends changed frames
4. **Better for real-time** - Persistent connection

### WebSocket 9080 Considerations:
1. **Firewall** - Port 9080 must be open
2. **Authentication** - May need credentials in URL
3. **Reconnection** - Need to handle disconnects
4. **Frame format** - Depends on camera protocol

## Summary

**Port 9080 (WebSocket) is best for:**
- ✅ Real-time video streaming
- ✅ Dashboard monitoring
- ✅ Active session pages
- ✅ Any place needing low latency

**Current status:**
- ✅ Dashboard: Using WebSocket 9080
- 🔄 Session pages: Should switch to WebSocket 9080
- ✅ HTTP proxy: Good for fallback

**Recommendation:** Switch session pages to use `RealtimeVideo` component with WebSocket 9080 for better performance and consistency.
