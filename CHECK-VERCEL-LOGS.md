# Check Vercel Logs for Detailed Error

## Current Error

```
{"ok":false,"error":"Failed to upload frame"}
```

This is a **generic error message**. To see the **actual error**, check Vercel logs.

---

## How to Check Vercel Logs

### Option 1: Vercel Dashboard (Easiest)

1. Go to **Vercel Dashboard** → Your Project (`gaali`)
2. Click **Logs** tab (top menu)
3. Look for recent errors
4. Find lines containing: `[Camera Upload] Blob upload failed`
5. You'll see the **actual error message** there

### Option 2: Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link your project (if not already)
vercel link

# Watch logs in real-time
vercel logs --follow
```

### Option 3: Check Recent Deployments

1. Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **View Function Logs**
4. Look for errors in `/api/camera/upload`

---

## What to Look For in Logs

You should see something like:

```
[Camera Upload] Blob upload failed for camera 1: {
  message: "Vercel Blob: No token found...",
  stack: "...",
  blobTokenSet: false,
  bodySize: 35588
}
```

**Common errors you might see:**

1. **"No token found" or "BLOB_READ_WRITE_TOKEN"**
   - **Fix:** Create Vercel Blob store (Dashboard → Storage → Create Database → Blob)

2. **"Invalid token"**
   - **Fix:** Delete and recreate Blob store, or manually set token

3. **"Blob store not found"**
   - **Fix:** Ensure Blob store is in the same project

4. **Network/Timeout errors**
   - **Fix:** Check Vercel status, retry later

---

## Quick Fix Checklist

### Most Likely Issue: Blob Store Not Created

1. **Create Blob Store:**
   - Vercel Dashboard → Storage → Create Database → Blob
   - Name: `gaali-camera-frames`
   - Click Create

2. **Verify Token:**
   - Settings → Environment Variables
   - Should see: `BLOB_READ_WRITE_TOKEN`
   - If missing, Blob creation failed - try again

3. **Redeploy:**
   ```bash
   vercel --prod
   ```
   Or push a commit to trigger auto-deploy

4. **Test Again:**
   ```bash
   curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
     -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
     -H "Content-Type: image/jpeg" \
     --data-binary @test.jpg
   ```

---

## Improved Error Message (After Next Deploy)

After you redeploy with the updated code, you'll get more helpful error messages:

**If Blob token not set:**
```json
{
  "ok": false,
  "error": "Blob storage not configured. Please create Vercel Blob store in Dashboard → Storage → Create Database → Blob, then redeploy."
}
```

**If Blob upload fails for other reasons:**
```json
{
  "ok": false,
  "error": "Failed to upload frame to Blob storage: [actual error message]. Check Vercel logs for details."
}
```

---

## Current Status

✅ **Working:**
- Authentication (401 would mean secret wrong)
- Request reaching server
- Request format correct

❌ **Not Working:**
- Blob upload (500 error)
- Most likely: Blob store not created

---

## Next Steps

1. **Check Vercel Logs** to see the actual error (Dashboard → Logs)
2. **Create Blob Store** if `BLOB_READ_WRITE_TOKEN` is missing (Dashboard → Storage)
3. **Redeploy** after creating Blob store
4. **Test again**

The logs will tell you exactly what's wrong!
