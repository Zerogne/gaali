# Why Use WebSocket Proxy Server?

## The Problem with Direct WebSocket Connection

### 1. **Browser Security (Mixed Content)**
If your website is served over **HTTPS** (`https://your-site.com`), browsers **block** connections to:
- `ws://192.168.1.50:9080` (non-secure WebSocket)
- `wss://192.168.1.50:9080` (if camera has self-signed certificate)

**Error you'll see:**
```
Mixed Content: The page was loaded over HTTPS, but attempted to connect to the insecure WebSocket endpoint 'ws://192.168.1.50:9080/'. This request has been blocked.
```

### 2. **CORS (Cross-Origin Resource Sharing)**
Browsers enforce **same-origin policy**:
- Your site: `https://your-site.com`
- Camera: `ws://192.168.1.50:9080` (different origin)
- Browser blocks the connection

### 3. **Production Deployment**
In production, users' browsers **cannot reach private IPs**:
- Camera IP: `192.168.1.50` (private/local network)
- User's browser: On different network (can't access `192.168.1.50`)
- Connection fails

### 4. **Self-Signed Certificates**
If camera uses `wss://` with self-signed certificate:
- Browser shows security warning
- User must manually accept certificate (bad UX)
- Some browsers block it entirely

## The Solution: WebSocket Proxy

```
Browser → ws://your-domain.com/ws/camera → Server → ws://192.168.1.50:9080/h264
```

### Benefits:

1. **Same-Origin Connection**
   - Browser connects to `ws://your-domain.com/ws/camera` (same origin)
   - No CORS issues
   - No mixed content warnings

2. **Server Can Access Camera**
   - Server is on same network as camera (or has VPN access)
   - Server can connect to `192.168.1.50:9080`
   - Server forwards data to browser

3. **Authentication**
   - Server can verify user session before connecting to camera
   - Camera credentials stay on server (not exposed to browser)

4. **Error Handling**
   - Server can handle camera connection errors gracefully
   - Better error messages for users

## When Can You Use Direct Connection?

### ✅ Direct Connection Works In:

1. **Local Development (HTTP)**
   - Site: `http://localhost:3000`
   - Camera: `ws://192.168.1.50:9080`
   - No mixed content (both HTTP)
   - Same local network

2. **Local Network Only**
   - All devices on same network
   - No production deployment needed
   - Development/testing only

### ❌ Direct Connection Fails In:

1. **Production (HTTPS)**
   - Site: `https://your-site.com`
   - Camera: `ws://192.168.1.50:9080`
   - Mixed content blocked

2. **Different Networks**
   - User's browser: Internet
   - Camera: Private network
   - Can't reach camera IP

3. **Mobile Devices**
   - User on mobile data
   - Camera on WiFi
   - Different networks

## Current Implementation

### Option 1: Direct Connection (Current `RealtimeVideo.tsx`)
```tsx
// Works in development/local network only
const ws = new WebSocket(`wss://192.168.1.50:8557/h264`)
```

**Pros:**
- Simple, no proxy needed
- Works in development

**Cons:**
- Fails in production (HTTPS)
- Fails if user not on same network
- Mixed content issues

### Option 2: WebSocket Proxy (New `RealtimeVideoProxy.tsx`)
```tsx
// Works everywhere (dev + production)
const ws = new WebSocket(`ws://your-domain.com/ws/camera?camera=1`)
// Server proxies to: ws://192.168.1.50:9080/h264
```

**Pros:**
- Works in production
- Works from any network
- No mixed content issues
- Better security

**Cons:**
- Requires proxy server
- Slightly more complex

## Recommendation

### For Development:
Use **direct connection** (`RealtimeVideo.tsx`) - simpler, works on local network

### For Production:
Use **WebSocket proxy** (`RealtimeVideoProxy.tsx`) - required for HTTPS sites and remote users

## Hybrid Approach

You can use both:

```tsx
// Auto-detect: use proxy in production, direct in development
const wsUrl = process.env.NODE_ENV === 'production'
  ? `${process.env.NEXT_PUBLIC_WS_PROXY_URL}?camera=${cameraId}` // Proxy
  : `wss://192.168.1.50:8557/h264` // Direct (dev only)
```

## Summary

| Scenario | Direct Connection | Proxy Server |
|----------|------------------|--------------|
| Local dev (HTTP) | ✅ Works | ✅ Works |
| Production (HTTPS) | ❌ Blocked | ✅ Works |
| User on different network | ❌ Can't reach camera | ✅ Works |
| Mobile device | ❌ Different network | ✅ Works |

**Bottom line:** Proxy is **required for production**, but **optional for local development**.
