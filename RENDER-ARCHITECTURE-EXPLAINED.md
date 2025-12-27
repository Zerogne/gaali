# Why Render? Architecture Explained

## The Problem

You have:

- **Camera** on local network (192.168.1.100) - can't reach internet directly
- **Frontend** on Vercel (public internet) - needs real-time plate updates
- **Local computer** - can reach both camera and internet

## The Solution: Two-Part Bridge

### Part 1: Local Bridge (Your Computer)

- Receives HTTP POST from camera
- Broadcasts to local WebSocket clients (for local development)
- **Forwards to Render** (for production frontend)

### Part 2: Render Service

- Receives forwarded plates from local bridge
- Broadcasts to all connected frontend clients via WebSocket
- Always available (24/7) for production users

## Complete Flow

```
┌─────────────────┐
│   Camera        │
│ 192.168.1.100   │
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────┐
│ Local Computer  │ ← camera-bridge running here
│ 192.168.1.50    │
│                 │
│ 1. Broadcasts to │
│    local WS     │ → Local dev frontend
│                 │
│ 2. Forwards to  │
│    Render       │ → Production frontend
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────┐
│  Render Service │ ← camera-bridge running here too
│ gaali.onrender  │
│                 │
│ Broadcasts to   │
│ all connected   │
│ frontend clients│
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  Vercel Frontend│
│  (User Browser) │
└─────────────────┘
```

## Why This Architecture?

### ✅ Benefits:

1. **Always Available**: Render service runs 24/7, even if your local computer is off
2. **Multiple Users**: Multiple frontend clients can connect to Render simultaneously
3. **No Port Forwarding**: Don't need to expose your local network to the internet
4. **Scalable**: Render handles WebSocket connections for all production users
5. **Local Development**: Still works locally for testing

### 🔄 How It Works:

1. **Camera** sends plate to your **local computer** (local network)
2. **Local bridge** forwards plate to **Render** (internet)
3. **Render** broadcasts to all connected **frontend clients** (Vercel app users)
4. **Frontend** receives plate in real-time via WebSocket

## Configuration

### Local Bridge (.env):

```env
# Forward plates to Render for production
RENDER_FORWARD_URL=https://gaali.onrender.com/plate
```

### Render Service:

- Already deployed and running
- Receives HTTP POST at `/plate` endpoint
- Broadcasts to WebSocket clients

### Frontend (Vercel):

```env
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://gaali.onrender.com
```

## Alternative: Without Render

If you don't want to use Render, you could:

1. **Expose local bridge to internet** (port forwarding + dynamic DNS)

   - ❌ Security risk
   - ❌ Requires router configuration
   - ❌ Breaks when your IP changes

2. **Use ngrok/tunnel** (temporary tunnel to local bridge)

   - ❌ Free tier has limitations
   - ❌ URL changes on restart
   - ❌ Not suitable for production

3. **Run bridge on VPS** (always-on server)
   - ✅ Works but costs money
   - ✅ More complex setup

## Summary

**Render's Purpose:**

- Provides a **persistent, public WebSocket server** for production frontend
- Receives forwarded plates from your local bridge
- Broadcasts to all connected users in real-time
- Eliminates need for port forwarding or exposing your local network

**Without Render:** You'd need to expose your local network to the internet, which is a security risk and unreliable.
