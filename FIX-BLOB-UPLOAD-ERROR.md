# Fix: "Failed to upload frame" Error (500)

## ✅ Good News

- ✅ **Authentication worked!** (No 401 error)
- ✅ **Secret is correct!** (Header format is right)
- ❌ **Blob upload is failing** (500 Internal Server Error)

## ❌ Problem

The error `"Failed to upload frame"` means:
- Authentication passed ✅
- Request reached the server ✅
- But Vercel Blob upload failed ❌

**This happens when:**
- Vercel Blob store is not created
- `BLOB_READ_WRITE_TOKEN` environment variable is missing
- Blob store is not properly configured

---

## ✅ Solution: Create Vercel Blob Store

### Step 1: Create Blob Store in Vercel

1. Go to **Vercel Dashboard** → Your Project (`gaali`)
2. Click **Storage** tab (top menu)
3. Click **Create Database**
4. Select **Blob** (not Redis, not KV)
5. Name it: `gaali-camera-frames` (or any name)
6. Click **Create**
7. ✅ **Done!** Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your env vars

### Step 2: Verify Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Look for: `BLOB_READ_WRITE_TOKEN`
3. Should be automatically set after creating Blob store

### Step 3: Redeploy (Required!)

After creating Blob store, **redeploy** your application:

**Option A: Push a commit**
```bash
git commit --allow-empty -m "Trigger deploy after Blob setup"
git push
```

**Option B: Manual redeploy**
```bash
vercel --prod
```

**Important:** Environment variables only apply to **new deployments**!

---

## Verify Blob Setup

### Check Vercel Logs

After redeploying, check Vercel logs:
- Vercel Dashboard → Your Project → Logs
- Look for successful uploads: `📹 [Camera 1] Frame uploaded`

### Test Again (After Redeploy)

```javascript
// Your secret (this part is working!)
const secret = 'BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=';

const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FF0000';
ctx.fillRect(0, 0, 100, 100);

canvas.toBlob(async (blob) => {
  const response = await fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'image/jpeg',
      'x-ts': Date.now().toString(),
    },
    body: blob,
  });
  
  const result = await response.json();
  console.log('Response:', result);
  
  if (result.ok) {
    console.log('✅ SUCCESS! Camera:', result.cameraId, 'Timestamp:', result.ts);
  } else {
    console.error('❌ FAILED:', result.error);
  }
}, 'image/jpeg', 0.9);
```

**Expected after fix:**
```json
{
  "ok": true,
  "cameraId": "1",
  "ts": 1704123456789
}
```

---

## Troubleshooting

### Still getting 500 error after creating Blob?

**Check 1: Is BLOB_READ_WRITE_TOKEN set?**
- Vercel Dashboard → Settings → Environment Variables
- Look for `BLOB_READ_WRITE_TOKEN`
- If missing, Blob store creation might have failed

**Check 2: Did you redeploy?**
- Environment variables only apply to new deployments
- Must redeploy after adding env vars

**Check 3: Check Vercel Logs**
- Look for specific error messages
- Should see: `[Camera Upload] Blob upload failed for camera 1: ...`
- This will tell you the exact error

### Common Blob Errors

**Error: "No token found"**
- Fix: Create Blob store (auto-adds token)

**Error: "Invalid token"**
- Fix: Delete and recreate Blob store
- Or manually set `BLOB_READ_WRITE_TOKEN` in environment variables

**Error: "Blob store not found"**
- Fix: Ensure Blob store is created in the same Vercel project
- Check project name matches

---

## Quick Checklist

- [ ] Created Vercel Blob store (Dashboard → Storage → Create Database → Blob)
- [ ] Verified `BLOB_READ_WRITE_TOKEN` exists in Environment Variables
- [ ] Redeployed application (push commit or `vercel --prod`)
- [ ] Waited for deployment to complete
- [ ] Tested upload again
- [ ] Checked Vercel logs for detailed errors

---

## Current Status

✅ **What's Working:**
- Authentication (secret is correct)
- Authorization header format
- Request reaching server

❌ **What's Not Working:**
- Blob upload (need to create Blob store)

---

## Next Steps

1. **Create Blob store** in Vercel Dashboard
2. **Redeploy** your application
3. **Test again** with the same code (should work!)

After this, your upload should work! 🎉

---

## Summary

**The issue:** Vercel Blob store is not created, so `BLOB_READ_WRITE_TOKEN` is missing.

**The fix:**
1. Create Blob store (Vercel Dashboard → Storage → Create Database → Blob)
2. Redeploy (push commit or `vercel --prod`)
3. Test again

Your authentication is working perfectly - just need to set up Blob storage! ✅
