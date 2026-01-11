# Check Vercel Logs for 500 Error Details

## Current Error

```
{"ok":false,"error":"Failed to upload frame"}
```

**This is a generic error.** The **actual error** is in Vercel logs.

---

## How to Check Vercel Logs

### Option 1: Vercel Dashboard (Easiest)

1. Go to **Vercel Dashboard** → Your Project (`gaali`)
2. Click **Logs** tab (top menu)
3. Filter by: `/api/camera/upload` or search for `[Camera Upload]`
4. Look for recent errors with timestamp matching your upload
5. Find lines containing: `[Camera Upload] Blob upload FAILED`

**You should see something like:**
```
[Camera Upload] Blob upload FAILED for camera 1: {
  errorName: "Error",
  errorMessage: "Vercel Blob: No token found...",
  errorStack: "...",
  blobTokenSet: false,
  bodySize: 35588,
  ...
}
```

### Option 2: Vercel CLI (Real-time)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link your project
vercel link

# Watch logs in real-time
vercel logs --follow

# Filter for camera upload errors
vercel logs --follow | grep "Camera Upload"
```

---

## Common Errors You'll See

### 1. "No token found" or "BLOB_READ_WRITE_TOKEN"

**Error in logs:**
```
errorMessage: "Vercel Blob: No token found. Either configure the BLOB_READ_WRITE_TOKEN..."
blobTokenSet: false
```

**Fix:**
1. Create Vercel Blob store: Dashboard → Storage → Create Database → Blob
2. Redeploy after creating

### 2. "Function timeout" or "Execution timeout"

**Error in logs:**
```
errorName: "TimeoutError"
errorMessage: "Function execution exceeded..."
```

**Fix:**
- Reduce image size (compress JPEG)
- Upgrade Vercel plan (free tier has 10s limit)
- Optimize Blob upload

### 3. "Permission denied" or "Forbidden"

**Error in logs:**
```
errorMessage: "Access denied" or "Forbidden"
```

**Fix:**
- Check Blob store permissions in Vercel Dashboard
- Ensure Blob store is in same project
- Check token permissions

### 4. "Quota exceeded" or "Storage limit"

**Error in logs:**
```
errorMessage: "Storage quota exceeded" or "Limit exceeded"
```

**Fix:**
- Check Vercel Blob storage usage
- Upgrade plan if needed
- Clean up old files

### 5. Network/Connection errors

**Error in logs:**
```
errorMessage: "ECONNREFUSED" or "Network error"
```

**Fix:**
- Check Vercel status page
- Retry later
- Check network connectivity

---

## What the Logs Will Show

After the code update, logs will show:

```json
{
  "errorName": "Error",
  "errorMessage": "Vercel Blob: No token found...",
  "errorStack": "Error: ...\n    at ...",
  "blobTokenSet": false,
  "blobTokenLength": 0,
  "bodySize": 35588,
  "blobKey": "cameras/1/latest.jpg",
  "timestamp": "2024-01-10T..."
}
```

**This tells you exactly what's wrong!**

---

## Quick Fixes Based on Error

### If "No token found":
```bash
# Create Blob store in Vercel Dashboard
# Then redeploy:
vercel --prod
```

### If "Timeout":
- Reduce JPEG quality/size
- Or upgrade Vercel plan

### If "Permission denied":
- Check Blob store settings
- Verify token permissions

### If "Quota exceeded":
- Check storage usage
- Clean up or upgrade

---

## Next Steps

1. **Check Vercel Logs** (Dashboard → Logs)
2. **Find the actual error message**
3. **Share the error** and I'll help fix it
4. **Or follow the fix above** based on the error type

The logs will tell you exactly what's wrong! 🔍
