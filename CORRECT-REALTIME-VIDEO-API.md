# Correct Real-Time Video API Endpoint

## ✅ Correct Endpoint for Real-Time Video Upload

**URL:** `POST https://gaali.vercel.app/api/camera/upload?camera=1` (or `camera=2`)

**Authentication:**
```
Authorization: Bearer YOUR_INGEST_SECRET
```

**Headers:**
```
Content-Type: image/jpeg
Authorization: Bearer YOUR_INGEST_SECRET
x-ts: 1234567890 (optional, Unix timestamp in milliseconds)
```

**Body:**
- Raw binary JPEG frame (not base64, not JSON)
- Max size: 250KB

---

## Complete Example (Correct)

### Electron App Code

```javascript
const SITE_URL = 'https://gaali.vercel.app';
const INGEST_SECRET = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;

async function pushVideoToWebsiteAPI(cameraId, jpegBuffer, timestamp = null) {
  // Validate
  if (!INGEST_SECRET) {
    console.error(`❌ [Camera ${cameraId}] INGEST_SECRET not configured`);
    return false;
  }

  if (!jpegBuffer || jpegBuffer.length === 0) {
    console.warn(`⚠️ [Camera ${cameraId}] Empty JPEG buffer`);
    return false;
  }

  try {
    // ✅ CORRECT: Construct URL with camera query parameter
    const uploadUrl = new URL(`${SITE_URL}/api/camera/upload`);
    uploadUrl.searchParams.set('camera', cameraId); // "1" or "2"

    // ✅ CORRECT: Send binary JPEG with proper headers
    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'Authorization': `Bearer ${INGEST_SECRET}`,  // ✅ Must have "Bearer " prefix
        'x-ts': (timestamp || Date.now()).toString(),
      },
      body: jpegBuffer, // ✅ Direct binary Buffer, NOT base64, NOT JSON
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      
      if (response.status === 401) {
        console.error(`❌ [Camera ${cameraId}] Unauthorized - Check INGEST_SECRET matches Vercel`);
        return false;
      }

      if (response.status === 429) {
        console.debug(`⏳ [Camera ${cameraId}] Rate limited (throttling)`);
        return false;
      }

      console.error(`❌ [Camera ${cameraId}] Upload failed:`, response.status, errorText);
      return false;
    }

    const result = await response.json();
    if (result.ok) {
      return true;
    } else {
      console.error(`❌ [Camera ${cameraId}] Upload failed:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Camera ${cameraId}] Upload error:`, error.message);
    return false;
  }
}
```

---

## Test with curl (Verify It Works)

```bash
# Replace YOUR_INGEST_SECRET with your actual secret
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  -H "Content-Type: image/jpeg" \
  -H "x-ts: $(date +%s%3N)" \
  --data-binary @test-frame.jpg
```

**Expected Response:**
```json
{
  "ok": true,
  "cameraId": "1",
  "ts": 1234567890
}
```

**Error Responses:**
- `401 Unauthorized` → Secret doesn't match or header format wrong
- `400 Bad Request` → Invalid cameraId (must be "1" or "2") or Content-Type wrong
- `413 Payload Too Large` → Frame > 250KB
- `429 Too Many Requests` → Rate limit exceeded (> 15 uploads/sec)

---

## Common Mistakes ❌

### ❌ Wrong: Using wrong endpoint

```javascript
// ❌ WRONG - This is for getting latest frame, not uploading
fetch('/api/camera/latest?camera=1', { method: 'POST', ... })
```

### ❌ Wrong: Missing "Bearer " prefix

```javascript
// ❌ WRONG
headers: {
  'Authorization': INGEST_SECRET  // Missing "Bearer " prefix
}

// ✅ CORRECT
headers: {
  'Authorization': `Bearer ${INGEST_SECRET}`  // Has "Bearer " prefix
}
```

### ❌ Wrong: Sending base64 JSON

```javascript
// ❌ WRONG - Don't send JSON with base64
fetch(url, {
  method: 'POST',
  body: JSON.stringify({
    imageData: base64String,  // ❌ Wrong format
    cameraId: "1",
  })
})

// ✅ CORRECT - Send raw binary JPEG
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'image/jpeg',  // ✅ Important!
  },
  body: jpegBuffer  // ✅ Raw binary Buffer
})
```

### ❌ Wrong: Using wrong secret name

```javascript
// ❌ WRONG - If your Vercel uses INGEST_SECRET, don't use LPR_INGEST_SECRET
const secret = process.env.LPR_INGEST_SECRET;

// ✅ CORRECT - Try both, use whichever is set
const secret = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;
```

---

## Environment Variables Setup

### In Electron App (.env or environment)

```env
SITE_URL=https://gaali.vercel.app
INGEST_SECRET=your-secret-here-same-as-vercel
# OR
LPR_INGEST_SECRET=your-secret-here-same-as-vercel
```

### In Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Key:** `INGEST_SECRET` (or `LPR_INGEST_SECRET`)
   - **Value:** Your secret (must match Electron app)
   - **Environments:** Production, Preview, Development

**Important:** The secret in Electron **MUST match** the secret in Vercel exactly!

---

## Complete Integration Example

```javascript
// In your Electron app - FFmpeg frame callback
function onFrameExtracted(cameraId, jpegBuffer) {
  // jpegBuffer is a Node.js Buffer containing raw JPEG data
  
  // Upload to website
  pushVideoToWebsiteAPI(cameraId, jpegBuffer, Date.now()).catch((err) => {
    console.error(`[Camera ${cameraId}] Upload error:`, err);
  });
  
  // Keep your existing local streaming code (doesn't interfere)
}
```

---

## Verification Checklist

### Electron App:
- [ ] `INGEST_SECRET` is set in environment
- [ ] `INGEST_SECRET` matches Vercel's `INGEST_SECRET`
- [ ] Using correct endpoint: `/api/camera/upload?camera=1`
- [ ] Header format: `Authorization: Bearer ${INGEST_SECRET}`
- [ ] Sending raw binary JPEG (not base64, not JSON)
- [ ] Content-Type header: `image/jpeg`
- [ ] Camera ID is "1" or "2"

### Vercel:
- [ ] `INGEST_SECRET` (or `LPR_INGEST_SECRET`) is set in Environment Variables
- [ ] Endpoint `/api/camera/upload` is deployed
- [ ] Upstash Redis is created (for storing frame pointers)
- [ ] Vercel Blob is created (for storing frames)

---

## Quick Debug Commands

### 1. Check if secret is set (Electron)

```javascript
console.log('INGEST_SECRET:', process.env.INGEST_SECRET ? 'SET' : 'NOT SET');
console.log('LPR_INGEST_SECRET:', process.env.LPR_INGEST_SECRET ? 'SET' : 'NOT SET');
```

### 2. Test API directly (curl)

```bash
# Get your secret from Vercel Dashboard first, then:
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET_HERE" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

### 3. Check Vercel logs

- Go to Vercel Dashboard → Your Project → Logs
- Look for:
  - `📹 [Camera 1] Frame uploaded` → Success!
  - `[Camera Upload] Missing or invalid Authorization header` → Header issue
  - `[Camera Upload] Invalid authentication token` → Secret mismatch

---

## Summary

**✅ Correct Endpoint:**
```
POST https://gaali.vercel.app/api/camera/upload?camera=1
```

**✅ Correct Headers:**
```
Authorization: Bearer YOUR_INGEST_SECRET
Content-Type: image/jpeg
x-ts: 1234567890 (optional)
```

**✅ Correct Body:**
- Raw binary JPEG Buffer (NOT base64, NOT JSON)

**✅ Required:**
- `INGEST_SECRET` must match between Electron and Vercel
- Camera ID must be "1" or "2"
- Frame size must be ≤ 250KB
