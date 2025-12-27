# Code Changes for Direct vs Bridge Connection

## ✅ Good News: No Code Changes Required!

Your existing code already supports both direct and bridge connections. Here's why:

## How It Works

### Data Flow (Both Methods)

**Direct Connection (Removed):**
```
Camera (HTTPS) 
  → Vercel /api/lpr/ingest (via bridge service)
  → MongoDB
  → Frontend polls /api/lpr/latest ✅
```

**Bridge Connection:**
```
Camera (HTTP)
  → Bridge /plate
  → Vercel /api/lpr/ingest
  → MongoDB
  → Frontend polls /api/lpr/latest ✅
```

### Frontend Code

The frontend uses `useLatestLpr()` hook which:
- Polls `/api/lpr/latest` endpoint every 1 second
- Works with **both** direct and bridge connections
- No changes needed! ✅

**Example usage (already in your code):**
```typescript
const { latest, error } = useLatestLpr(1000); // Polls every 1 second
```

### Optional: WebSocket (Bridge Only)

Your code also has `useCameraBridgeWebSocket()` for real-time updates:

**With Bridge:**
- ✅ WebSocket works (connects to bridge on port 3001)
- ✅ Polling also works as backup
- ✅ Faster real-time updates

**With Direct Connection:**
- ❌ WebSocket won't connect (no bridge server)
- ✅ Polling still works (1 second delay)
- ✅ Still fully functional

**Note:** The WebSocket connection gracefully fails if bridge isn't available, so your code handles both cases.

## Settings Panel

The Settings panel (`components/settings-panel.tsx`) has bridge-specific fields:
- Bridge IP address
- Bridge port
- Connection mode

**These are just UI configuration fields** - they don't affect the actual data flow. They're mainly for:
- Documentation/reference
- Testing bridge connection
- Bridge control buttons

**No code changes needed** - if you use direct connection, you just don't use these settings.

## What You Need to Configure

### For Direct Connection:
**Note:** Direct connection has been removed. Use the bridge service instead.

### For Bridge Connection:
1. **Camera Settings:** Configure camera to POST to bridge IP:3002
2. **Bridge Service:** Run camera-bridge on local server
3. **Vercel Environment:** Set `LPR_INGEST_SECRET` (already done)
4. **Settings Panel:** Optionally configure bridge IP/port for testing

## Summary

| Component | Direct Connection | Bridge Connection | Code Changes Needed? |
|-----------|------------------|-------------------|---------------------|
| **Frontend Polling** | ✅ Works | ✅ Works | ❌ None |
| **WebSocket** | ❌ Not available | ✅ Works (optional) | ❌ None (gracefully handles missing bridge) |
| **Settings Panel** | ✅ Works (ignore bridge fields) | ✅ Works | ❌ None |
| **API Endpoints** | ❌ Removed | ✅ `/api/lpr/ingest` exists | ❌ None |

## Conclusion

**No code changes required!** 

Your code already supports both connection methods. Just configure:
- **Direct:** Camera settings → Vercel
- **Bridge:** Camera settings → Bridge → Vercel

The frontend will work with either method automatically. 🎉

