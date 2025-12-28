# Disable Camera-Bridge WebSocket Connection

If you're using **direct camera connection** (camera → Vercel directly), you don't need the camera-bridge WebSocket connection. The frontend will automatically skip trying to connect to the bridge.

## How It Works

The frontend uses `useCameraBridgeWebSocket()` hook which:
- ✅ Works with bridge connection (connects to WebSocket on port 3001)
- ✅ Gracefully skips when using direct connection
- ✅ Falls back to polling `/api/lpr/latest` when WebSocket isn't available

## Configuration

### Option 1: Environment Variable (Recommended)

Set this in your Vercel environment variables or `.env.local`:

```env
NEXT_PUBLIC_CAMERA_DIRECT_CONNECTION=true
```

**When set to `true`:**
- ✅ WebSocket bridge connection is disabled
- ✅ Frontend only uses polling (`/api/lpr/latest`)
- ✅ No connection attempts to `ws://localhost:3001`
- ✅ No console errors about failed WebSocket connections

**When not set or `false`:**
- ✅ WebSocket bridge connection is attempted
- ✅ Falls back to polling if bridge not available
- ✅ Works with both bridge and direct connections

### Option 2: Disable WebSocket URL

Alternatively, you can disable the WebSocket URL:

```env
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=disabled
```

or

```env
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=
```

## Which Option to Use?

**Use Option 1** (`NEXT_PUBLIC_CAMERA_DIRECT_CONNECTION=true`) if:
- ✅ You're using direct camera connection
- ✅ Camera connects directly to Vercel
- ✅ You want to explicitly disable bridge WebSocket

**Use Option 2** if:
- ✅ You want to keep bridge option available but disabled by default
- ✅ You might switch between bridge and direct connection

**Don't set either** if:
- ✅ You're using camera-bridge and want WebSocket real-time updates
- ✅ You want the frontend to try WebSocket first, then fall back to polling

## How Frontend Handles This

The frontend automatically:
1. Checks `NEXT_PUBLIC_CAMERA_DIRECT_CONNECTION` environment variable
2. If `true`, skips WebSocket connection attempts
3. Uses polling (`/api/lpr/latest`) instead
4. No console errors or connection attempts

The polling still works perfectly and gives you plate data with about 1 second delay (which is fine for most use cases).

## Summary

**For Direct Connection:**
```env
NEXT_PUBLIC_CAMERA_DIRECT_CONNECTION=true
```

**For Bridge Connection:**
(Don't set the variable, or set it to `false`)

That's it! The frontend will automatically use the right method.

