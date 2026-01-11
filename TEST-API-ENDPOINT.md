# How to Test the Camera Upload API

## ❌ Wrong: Running curl in Browser Console

You can't run `curl` commands in the browser console. `curl` is a **terminal/command-line tool**, not JavaScript.

---

## ✅ Option 1: Test in Terminal/Command Prompt

### On Mac/Linux:
```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test-frame.jpg
```

### On Windows (PowerShell):
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_INGEST_SECRET"
    "Content-Type" = "image/jpeg"
}
Invoke-RestMethod -Uri "https://gaali.vercel.app/api/camera/upload?camera=1" -Method Post -Headers $headers -InFile "test-frame.jpg"
```

### On Windows (Command Prompt):
```cmd
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" -H "Authorization: Bearer YOUR_INGEST_SECRET" -H "Content-Type: image/jpeg" --data-binary @test-frame.jpg
```

**Replace `YOUR_INGEST_SECRET` with your actual secret from Vercel Dashboard.**

---

## ✅ Option 2: Test in Browser Console (JavaScript)

Open browser DevTools (F12) → Console tab, then paste:

```javascript
// Replace YOUR_INGEST_SECRET with your actual secret
const secret = 'YOUR_INGEST_SECRET';

// First, you need to convert a file to binary
// Option A: If you have a file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/jpeg';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  
  const response = await fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'image/jpeg',
      'x-ts': Date.now().toString(),
    },
    body: arrayBuffer,
  });
  
  const result = await response.json();
  console.log('Response:', result);
};
fileInput.click();
```

**Or simpler - create a test image and upload:**

```javascript
// Create a small test JPEG (1x1 pixel)
const canvas = document.createElement('canvas');
canvas.width = 1;
canvas.height = 1;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 1, 1);

canvas.toBlob(async (blob) => {
  const secret = 'YOUR_INGEST_SECRET'; // Replace with your secret
  
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
    console.log('✅ Upload successful!');
  } else {
    console.error('❌ Upload failed:', result.error);
  }
}, 'image/jpeg', 0.9);
```

---

## ✅ Option 3: Use Postman or Insomnia

1. **Method:** POST
2. **URL:** `https://gaali.vercel.app/api/camera/upload?camera=1`
3. **Headers:**
   - `Authorization: Bearer YOUR_INGEST_SECRET`
   - `Content-Type: image/jpeg`
   - `x-ts: 1234567890` (optional)
4. **Body:** Binary → Select file → Choose a JPEG image

---

## ✅ Option 4: Create a Test HTML Page

Create a file `test-upload.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Camera Upload</title>
</head>
<body>
  <h1>Test Camera Upload</h1>
  <input type="file" id="fileInput" accept="image/jpeg">
  <button onclick="upload()">Upload</button>
  <pre id="result"></pre>

  <script>
    const secret = 'YOUR_INGEST_SECRET'; // Replace with your secret
    
    async function upload() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];
      
      if (!file) {
        alert('Please select a JPEG file');
        return;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        const response = await fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secret}`,
            'Content-Type': 'image/jpeg',
            'x-ts': Date.now().toString(),
          },
          body: arrayBuffer,
        });
        
        const result = await response.json();
        document.getElementById('result').textContent = JSON.stringify(result, null, 2);
        
        if (result.ok) {
          console.log('✅ Upload successful!');
        } else {
          console.error('❌ Upload failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('result').textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

Open this file in your browser and test!

---

## Expected Responses

### ✅ Success (200 OK):
```json
{
  "ok": true,
  "cameraId": "1",
  "ts": 1234567890
}
```

### ❌ Unauthorized (401):
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```
**Fix:** Check `INGEST_SECRET` matches between Electron and Vercel

### ❌ Bad Request (400):
```json
{
  "ok": false,
  "error": "Invalid cameraId. Must be one of: 1, 2"
}
```
**Fix:** Use `camera=1` or `camera=2` only

### ❌ Payload Too Large (413):
```json
{
  "ok": false,
  "error": "Payload too large. Maximum size: 250KB"
}
```
**Fix:** Reduce JPEG file size

---

## Quick Test (Simplest)

**In Terminal:**
```bash
# Replace YOUR_SECRET with actual secret
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**In Browser Console (JavaScript):**
```javascript
// Replace YOUR_SECRET with actual secret
fetch('https://gaali.vercel.app/api/camera/upload?camera=1', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET',
    'Content-Type': 'image/jpeg',
  },
  body: new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9])], { type: 'image/jpeg' })
})
.then(r => r.json())
.then(console.log);
```

---

## Summary

- ❌ **Don't run `curl` in browser console** - it's a terminal command
- ✅ **Use terminal/command prompt** for curl commands
- ✅ **Use JavaScript `fetch()`** in browser console
- ✅ **Use Postman/Insomnia** for GUI testing
- ✅ **Create HTML test page** for easy testing

The easiest way: **Open Terminal/Command Prompt** and run the curl command there!
