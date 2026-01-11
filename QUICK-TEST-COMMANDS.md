# Quick Test Commands (Copy-Paste Ready)

## Step 1: Get Your Secret from Vercel

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `INGEST_SECRET` or `LPR_INGEST_SECRET`
3. Click eye icon to reveal
4. Copy the value

---

## Step 2: Test in Browser Console (Easiest - No File Needed)

Open Browser DevTools (F12) → Console, paste this:

```javascript
// ⚠️ REPLACE 'YOUR_SECRET_HERE' WITH YOUR ACTUAL SECRET FROM VERCEL
const secret = 'YOUR_SECRET_HERE';

// Create a test JPEG (100x100 red square)
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FF0000';
ctx.fillRect(0, 0, 100, 100);

canvas.toBlob(async (blob) => {
  console.log('📤 Uploading test frame...');
  
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
  console.log('📥 Response:', result);
  
  if (result.ok) {
    console.log('✅ SUCCESS! Camera:', result.cameraId, 'Timestamp:', result.ts);
  } else {
    console.error('❌ FAILED:', result.error);
    if (result.error === 'Unauthorized') {
      console.error('💡 Tip: Check your secret matches Vercel Dashboard');
    }
  }
}, 'image/jpeg', 0.9);
```

**Just replace `YOUR_SECRET_HERE` with your actual secret!**

---

## Step 3: Test with curl (Terminal)

### First, create a test image:

```bash
# Option A: Download a test image
curl -o test.jpg https://via.placeholder.com/100x100.jpg

# Option B: Use any existing JPEG file
# (replace /path/to/image.jpg with your file path)
```

### Then test:

```bash
# ⚠️ REPLACE 'YOUR_SECRET_HERE' WITH YOUR ACTUAL SECRET FROM VERCEL
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET_HERE" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**Expected output:**
```json
{"ok":true,"cameraId":"1","ts":1234567890}
```

---

## Quick Fix for Your Current Errors

### Error 1: 401 Unauthorized
**Problem:** Using literal `"YOUR_SECRET"` instead of actual secret  
**Fix:** Get secret from Vercel Dashboard and replace it

### Error 2: File not found (test-frame.jpg)
**Fix:** Download a test image first:
```bash
curl -o test.jpg https://via.placeholder.com/100x100.jpg
```

Or use the browser console method above (no file needed).

---

## One-Liner Test (Browser Console)

```javascript
// Replace SECRET with your actual secret from Vercel
fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {method:'POST', headers:{'Authorization':'Bearer SECRET','Content-Type':'image/jpeg'}, body:new Blob([new Uint8Array([0xFF,0xD8,0xFF,0xD9])], {type:'image/jpeg'})}).then(r=>r.json()).then(r=>console.log(r.ok?'✅ Success!':`❌ ${r.error}`));
```

(Just replace `SECRET` with your actual secret)

---

## What to Expect

### ✅ Success Response:
```json
{
  "ok": true,
  "cameraId": "1",
  "ts": 1704123456789
}
```

### ❌ Error Responses:

**401 Unauthorized:**
```json
{"ok": false, "error": "Unauthorized"}
```
→ Secret doesn't match or header format wrong

**400 Bad Request:**
```json
{"ok": false, "error": "Invalid cameraId. Must be one of: 1, 2"}
```
→ Use `camera=1` or `camera=2` only

**413 Payload Too Large:**
```json
{"ok": false, "error": "Payload too large. Maximum size: 250KB"}
```
→ File too large (reduce JPEG size)

---

## Most Important

**Replace `YOUR_SECRET_HERE` with your actual secret from:**
- Vercel Dashboard → Settings → Environment Variables → `INGEST_SECRET` or `LPR_INGEST_SECRET`

That's it! The secret must match exactly between your test and Vercel.
