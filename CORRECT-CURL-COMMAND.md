# Correct curl Command for Testing

## ❌ What You Did Wrong

1. **Missing "Bearer " prefix:**
   ```bash
   -H "Authorization: BmnNpCZXGcA/..."  # ❌ Missing "Bearer "
   ```

2. **Mixed commands (copied comment line):**
   ```bash
   url -o test.jpg https://...  # ❌ Should be "curl" not "url"
   ```

3. **Network issue with placeholder.com**

4. **test.jpg file doesn't exist**

---

## ✅ Correct Commands (Copy-Paste Ready)

### Step 1: Download Test Image

**Option A: Use a different image source**
```bash
curl -o test.jpg https://picsum.photos/100/100
```

**Option B: Use any existing JPEG on your computer**
```bash
# Just use the path to any .jpg file you have
# For example:
# cp ~/Pictures/some-image.jpg test.jpg
```

**Option C: Create minimal JPEG (if you have ImageMagick)**
```bash
convert -size 100x100 xc:red test.jpg
```

**Option D: Use browser console (no file needed) - SEE BELOW**

---

### Step 2: Test Upload (CORRECT)

```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**⚠️ IMPORTANT: Notice "Bearer " prefix before the secret!**

---

## ✅ EASIEST: Test in Browser Console (No File Needed)

Open Browser DevTools (F12) → Console, paste this:

```javascript
const secret = 'BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=';

// Create test JPEG
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FF0000';
ctx.fillRect(0, 0, 100, 100);

canvas.toBlob(async (blob) => {
  console.log('📤 Uploading...');
  
  const response = await fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,  // ✅ Has "Bearer " prefix
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
    if (result.error.includes('Blob')) {
      console.error('💡 Fix: Create Vercel Blob store (Dashboard → Storage → Create Database → Blob)');
    }
  }
}, 'image/jpeg', 0.9);
```

---

## Quick Fix Commands (Terminal)

### Download Test Image:
```bash
# Try this instead:
curl -L -o test.jpg "https://httpbin.org/image/jpeg"
```

Or use any JPEG file you already have:
```bash
# Find any JPEG on your Mac
find ~/Pictures -name "*.jpg" -type f | head -1 | xargs cp -t test.jpg
```

### Test Upload (FIXED - Notice "Bearer " prefix):
```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

---

## One-Line Command (If test.jpg exists)

```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" -H "Content-Type: image/jpeg" --data-binary @test.jpg
```

---

## Common Mistakes

### ❌ Wrong:
```bash
-H "Authorization: BmnNpCZXGcA/..."  # Missing "Bearer "
```

### ✅ Correct:
```bash
-H "Authorization: Bearer BmnNpCZXGcA/..."  # Has "Bearer " prefix
```

---

## If You Still Get 500 Error

That means Blob store is not created yet. You need to:

1. **Create Blob store:** Vercel Dashboard → Storage → Create Database → Blob
2. **Redeploy:** Push a commit or `vercel --prod`
3. **Test again**

---

## Summary

**Your mistakes:**
- ❌ Missing "Bearer " prefix in Authorization header
- ❌ Wrong command format (copied comment line)
- ❌ Network issue with placeholder.com
- ❌ test.jpg doesn't exist

**Fixed command:**
```bash
# Download test image (different source)
curl -L -o test.jpg "https://httpbin.org/image/jpeg"

# Test upload (CORRECT - has "Bearer " prefix)
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**EASIEST: Use browser console method above - no files needed!**
