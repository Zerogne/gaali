# Fix: Missing Authorization Header

## Error You're Seeing

```
[Camera Upload] Missing or invalid Authorization header
```

**This means:** Your Electron app is not sending the `Authorization` header correctly when uploading frames.

---

## The Fix

Your Electron app needs to send:

```
Authorization: Bearer YOUR_INGEST_SECRET
```

### Check Your Electron Code

In your Electron app, make sure you're sending the header like this:

```javascript
const response = await fetch(uploadUrl.toString(), {
  method: 'POST',
  headers: {
    'Content-Type': 'image/jpeg',
    'Authorization': `Bearer ${INGEST_SECRET}`,  // ← Must have "Bearer " prefix!
    'x-ts': (timestamp || now).toString(),
  },
  body: jpegBuffer,
});
```

**Important points:**
1. Header name: `Authorization` (case-sensitive)
2. Header value: `Bearer <secret>` (must include "Bearer " prefix with space)
3. Secret must match: `INGEST_SECRET` in Electron must equal `INGEST_SECRET` in Vercel

---

## Common Mistakes

### ❌ Wrong: Missing "Bearer " prefix

```javascript
headers: {
  'Authorization': INGEST_SECRET,  // ❌ Wrong - missing "Bearer "
}
```

### ❌ Wrong: Wrong header name

```javascript
headers: {
  'Auth': `Bearer ${INGEST_SECRET}`,  // ❌ Wrong - should be "Authorization"
}
```

### ❌ Wrong: Secret not set

```javascript
const INGEST_SECRET = undefined;  // ❌ Not set!
headers: {
  'Authorization': `Bearer ${INGEST_SECRET}`,  // ❌ Will be "Bearer undefined"
}
```

### ✅ Correct

```javascript
const INGEST_SECRET = 'your-secret-here';  // ✅ Set
headers: {
  'Authorization': `Bearer ${INGEST_SECRET}`,  // ✅ Correct format
}
```

---

## Full Example: Correct Electron Code

```javascript
const SITE_URL = process.env.SITE_URL || 'https://gaali.vercel.app';
const INGEST_SECRET = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;

async function pushVideoToWebsiteAPI(cameraId, jpegBuffer, timestamp = null) {
  // Validate inputs
  if (!INGEST_SECRET) {
    console.error(`❌ [Camera ${cameraId}] INGEST_SECRET not configured`);
    return false;
  }

  if (!jpegBuffer || jpegBuffer.length === 0) {
    console.warn(`⚠️ [Camera ${cameraId}] Empty JPEG buffer`);
    return false;
  }

  try {
    // Construct URL
    const uploadUrl = new URL(`${SITE_URL}/api/camera/upload`);
    uploadUrl.searchParams.set('camera', cameraId);

    // ✅ CORRECT: Include Authorization header with "Bearer " prefix
    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'Authorization': `Bearer ${INGEST_SECRET}`,  // ← Must be exactly this format
        'x-ts': (timestamp || Date.now()).toString(),
      },
      body: jpegBuffer, // Direct binary Buffer
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

## Debugging Steps

### Step 1: Check if Secret is Set in Electron

Add this to your Electron app code:

```javascript
console.log('INGEST_SECRET:', process.env.INGEST_SECRET ? 'SET' : 'NOT SET');
console.log('INGEST_SECRET length:', process.env.INGEST_SECRET?.length || 0);
```

**If "NOT SET":**
- Set it in your Electron app's `.env` file or environment variables
- Restart your Electron app

### Step 2: Check Header Format

Add logging before the fetch:

```javascript
const headers = {
  'Content-Type': 'image/jpeg',
  'Authorization': `Bearer ${INGEST_SECRET}`,
  'x-ts': (timestamp || Date.now()).toString(),
};

console.log('Authorization header:', headers['Authorization']?.substring(0, 20) + '...');
// Should print: "Bearer your-secret..."

// Then use headers in fetch
const response = await fetch(uploadUrl.toString(), {
  method: 'POST',
  headers: headers,
  body: jpegBuffer,
});
```

### Step 3: Check Secret Matches Vercel

1. **Get secret from Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Find `INGEST_SECRET` or `LPR_INGEST_SECRET`
   - Copy the value

2. **Compare with Electron:**
   - Check your Electron app's `.env` file
   - Ensure values match exactly (case-sensitive, no extra spaces)

### Step 4: Test with curl

Test the API directly to verify it works:

```bash
# Replace YOUR_SECRET with your actual secret
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**If curl works but Electron doesn't:**
- Electron is not sending the header correctly
- Check the header format in Electron code

**If curl also fails with 401:**
- Secret doesn't match between Vercel and your test
- Check Vercel environment variables

---

## Checklist

- [ ] `INGEST_SECRET` is set in Electron app environment
- [ ] `INGEST_SECRET` matches the value in Vercel Dashboard
- [ ] Header name is exactly `Authorization` (case-sensitive)
- [ ] Header value starts with `Bearer ` (with space after "Bearer")
- [ ] No extra spaces or quotes around the secret
- [ ] Electron app has been restarted after setting environment variables
- [ ] Vercel has been redeployed after setting environment variables

---

## Quick Test

Add this test function to your Electron app:

```javascript
async function testUploadAuth() {
  const INGEST_SECRET = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;
  
  if (!INGEST_SECRET) {
    console.error('❌ INGEST_SECRET not set!');
    return;
  }

  console.log('✅ INGEST_SECRET is set (length:', INGEST_SECRET.length, ')');
  console.log('✅ Header will be: Authorization: Bearer', INGEST_SECRET.substring(0, 10) + '...');

  // Test with a small dummy payload
  const testBuffer = Buffer.from('fake-jpeg-data');
  const uploadUrl = new URL('https://gaali.vercel.app/api/camera/upload');
  uploadUrl.searchParams.set('camera', '1');

  try {
    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'Authorization': `Bearer ${INGEST_SECRET}`,
      },
      body: testBuffer,
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);

    if (response.status === 401) {
      console.error('❌ 401 Unauthorized - Secret does not match Vercel');
    } else if (response.status === 400) {
      console.log('⚠️ 400 Bad Request - Expected (test payload is invalid JPEG, but auth worked!)');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Call it
testUploadAuth();
```

**Expected results:**
- `401 Unauthorized` → Secret doesn't match (fix: set correct secret)
- `400 Bad Request` → Auth worked! (expected - test payload isn't valid JPEG)
- `Missing Authorization header` → Header not being sent (fix: check fetch code)

---

## Still Having Issues?

1. **Check Electron console** for error messages
2. **Check Vercel logs** for detailed error info
3. **Test with curl** to verify API works independently
4. **Verify environment variables** are loaded correctly in Electron

If you're still stuck, share:
- Electron console output
- The exact fetch code you're using
- Whether curl test works or not
