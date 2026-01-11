# How to Find Your INGEST_SECRET

## Step 1: Check Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project (`gaali`)
2. Click **Settings** (top menu)
3. Click **Environment Variables** (left sidebar)
4. Look for one of these keys:
   - `INGEST_SECRET`
   - `LPR_INGEST_SECRET`

5. **Click the eye icon** to reveal the value
6. **Copy the secret value** (it's the long string)

---

## Step 2: Use the Secret in Tests

### In Browser Console:

Replace `YOUR_SECRET` with the actual secret you copied:

```javascript
// Replace with your actual secret from Vercel
const secret = 'your-actual-secret-here-from-vercel-dashboard';

fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${secret}`,  // Use your actual secret
    'Content-Type': 'image/jpeg',
    'x-ts': Date.now().toString(),
  },
  body: new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9])], { type: 'image/jpeg' })
})
.then(r => r.json())
.then(result => {
  console.log('Response:', result);
  if (result.ok) {
    console.log('✅ Success!');
  } else {
    console.error('❌ Failed:', result.error);
  }
});
```

### In Terminal (curl):

```bash
# Replace YOUR_ACTUAL_SECRET with the secret from Vercel
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_ACTUAL_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

---

## Step 3: If Secret Doesn't Exist

If you don't see `INGEST_SECRET` or `LPR_INGEST_SECRET` in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. **Key:** `INGEST_SECRET`
4. **Value:** Generate a secure random string (see below)
5. **Environments:** Select all (Production, Preview, Development)
6. Click **Save**

### Generate a Secure Secret:

**Option 1: Online**
- Go to: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" (256-bit)
- Copy one of the keys

**Option 2: Terminal**
```bash
# Generate a secure 32-byte base64 secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Base64 Generator**
- Go to: https://www.base64encode.org/
- Generate random string, encode it

**Recommended:** At least 32 characters, random, secure.

---

## Step 4: Create a Test Image File (for curl)

If you don't have `test-frame.jpg`, create one:

### Option 1: Download a test image

```bash
# Download a small test image
curl -o test.jpg https://via.placeholder.com/100x100.jpg
```

### Option 2: Create a minimal JPEG (1x1 pixel)

Save this as `create-test-jpg.html`:

```html
<!DOCTYPE html>
<html>
<body>
  <canvas id="canvas" width="1" height="1"></canvas>
  <a id="download" download="test.jpg">Download Test JPEG</a>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      document.getElementById('download').href = url;
      document.getElementById('download').click();
    }, 'image/jpeg');
  </script>
</body>
</html>
```

Open in browser, click download link.

### Option 3: Use any existing JPEG

Just use any `.jpg` file you have on your computer:

```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_ACTUAL_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/your/image.jpg
```

---

## Quick Test (No File Needed)

### Browser Console (Creates test image automatically):

```javascript
// Step 1: Get your secret from Vercel Dashboard first!
const secret = 'PASTE_YOUR_SECRET_HERE'; // ← Replace this!

// Step 2: Create a test JPEG programmatically
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
      'Authorization': `Bearer ${secret}`,  // Your actual secret
      'Content-Type': 'image/jpeg',
      'x-ts': Date.now().toString(),
    },
    body: blob,
  });
  
  const result = await response.json();
  console.log('✅ Response:', result);
  
  if (result.ok) {
    console.log('✅ Upload successful! Camera:', result.cameraId, 'Timestamp:', result.ts);
  } else {
    console.error('❌ Upload failed:', result.error);
  }
}, 'image/jpeg', 0.9);
```

---

## Checklist

- [ ] Found `INGEST_SECRET` or `LPR_INGEST_SECRET` in Vercel Dashboard
- [ ] Copied the secret value
- [ ] Replaced `YOUR_SECRET` with actual secret in test code
- [ ] Have a test image file (or using browser method that creates one)
- [ ] Tested the API call

---

## If Still Getting 401 Unauthorized

1. **Double-check secret matches:**
   - Secret in Vercel Dashboard
   - Secret you're using in the test
   - Must match **exactly** (case-sensitive, no extra spaces)

2. **Check header format:**
   - Must be: `Authorization: Bearer YOUR_SECRET`
   - Not: `Authorization: YOUR_SECRET` (missing "Bearer ")
   - Not: `Authorization: bearer YOUR_SECRET` (wrong case)

3. **Verify secret is set for correct environment:**
   - In Vercel, check which environments the secret is set for
   - Make sure it's set for Production (if testing production URL)

4. **Redeploy after setting secret:**
   - If you just added the secret, redeploy:
     ```bash
     vercel --prod
     ```
   - Or push a commit to trigger auto-deploy

---

## Summary

**The issue:** You're using `"YOUR_SECRET"` literally - you need to replace it with your actual secret from Vercel Dashboard.

**Quick fix:**
1. Get secret from: Vercel Dashboard → Settings → Environment Variables
2. Copy the value
3. Replace `YOUR_SECRET` in your test code with the actual value
4. Test again!
