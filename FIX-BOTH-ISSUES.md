# Fix Both Issues: Authorization Header + Redis

## Current Errors

1. **`[Camera Upload] Missing or invalid Authorization header`**
   - Electron app is not sending the Authorization header correctly

2. **`[Upstash Redis] Redis client was initialized without url or token`**
   - Redis environment variables are not set in Vercel

---

## Issue 1: Fix Authorization Header (Electron App)

### Problem
Your Electron app needs to send: `Authorization: Bearer <INGEST_SECRET>`

### Fix in Electron App

Make sure your Electron app code has:

```javascript
const INGEST_SECRET = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;

// In your upload function:
const response = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'image/jpeg',
    'Authorization': `Bearer ${INGEST_SECRET}`,  // ← Must have "Bearer " prefix
    'x-ts': timestamp.toString(),
  },
  body: jpegBuffer,
});
```

### Checklist for Electron:
- [ ] `INGEST_SECRET` is set in Electron app environment
- [ ] `INGEST_SECRET` matches Vercel's `INGEST_SECRET`
- [ ] Header name is exactly `Authorization` (case-sensitive)
- [ ] Header value starts with `Bearer ` (with space after "Bearer")
- [ ] Electron app restarted after setting env vars

### Test Authorization:

```bash
# Test if secret is correct (replace YOUR_SECRET)
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**If this works but Electron doesn't:** Electron header format is wrong  
**If this also fails:** Secret doesn't match Vercel

---

## Issue 2: Fix Redis Environment Variables (Vercel)

### Problem
Redis environment variables are not set in Vercel.

### Solution: Create Upstash Redis

**Option 1: Via Vercel Dashboard (Recommended)**

1. Go to **Vercel Dashboard** → Your Project
2. Click **Storage** tab (top menu)
3. Click **Create Database**
4. Select **Upstash Redis**
5. Name it: `gaali-redis` (or any name)
6. Click **Create**
7. ✅ **Done!** Vercel automatically adds:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**Option 2: Verify If Already Created**

1. Vercel Dashboard → Settings → Environment Variables
2. Check if you see:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. If missing, create Upstash Redis (Option 1)

### After Creating Redis:

1. **Redeploy** (required for env vars to take effect):
   ```bash
   vercel --prod
   ```
   Or push a commit to trigger auto-deploy

2. **Verify in logs:**
   - Should see: `[Redis] Successfully initialized Upstash Redis client`
   - Should NOT see: `[Redis] Environment variables not set`

### Current Behavior (After Code Fix):

- ✅ **If Redis env vars are missing:** App works but logs warnings, Redis features disabled
- ✅ **If Redis env vars are set:** Everything works normally
- ✅ **No crashes:** App gracefully handles missing Redis

---

## Quick Fix Checklist

### For Authorization Header (Electron):
- [ ] Check Electron console for `INGEST_SECRET` status
- [ ] Verify header format: `Authorization: Bearer ${INGEST_SECRET}`
- [ ] Ensure secret matches Vercel's `INGEST_SECRET`
- [ ] Test with curl to verify API works

### For Redis (Vercel):
- [ ] Create Upstash Redis in Vercel Dashboard (if not exists)
- [ ] Verify env vars are set (Settings → Environment Variables)
- [ ] Redeploy application (push commit or `vercel --prod`)
- [ ] Check logs for Redis initialization message

---

## Test After Fixes

### 1. Test Upload (should work even without Redis):

```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**Expected:**
- ✅ `{"ok": true, "cameraId": "1", "ts": ...}` - Success!
- ❌ `401 Unauthorized` - Authorization header issue
- ❌ `500 Server Error` - Check Vercel logs

### 2. Test Latest (returns stale if Redis not set):

```bash
curl "https://gaali.vercel.app/api/camera/latest?camera=1"
```

**Expected (if Redis not set):**
- ✅ `{"ok": true, "cameraId": "1", "url": null, "ts": null, "stale": true}` - Works but no frames

**Expected (if Redis is set):**
- ✅ `{"ok": true, "cameraId": "1", "url": "...", "ts": ..., "stale": false}` - Full functionality

---

## Priority

1. **First:** Fix Authorization header (Electron app) - Required for uploads
2. **Second:** Set up Redis (Vercel) - Required for browser to see frames

Without Authorization: Uploads fail completely  
Without Redis: Uploads work, but browser can't retrieve frames

---

## Summary

**Authorization Issue:**
- Fix in Electron app: Ensure `Authorization: Bearer ${INGEST_SECRET}` header is sent
- Secret must match Vercel's `INGEST_SECRET`

**Redis Issue:**
- Fix in Vercel: Create Upstash Redis (Dashboard → Storage → Create Database → Upstash Redis)
- Redeploy after creating
- Code already handles missing Redis gracefully (no crashes)

Both issues are fixed in the code - you just need to:
1. Fix Electron app to send header correctly
2. Create Upstash Redis in Vercel and redeploy
