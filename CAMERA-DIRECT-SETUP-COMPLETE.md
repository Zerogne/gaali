# Complete Setup: Direct Camera Connection via HTTPS

## What Was Created

### 1. API Endpoints

✅ **GET /api/camera/video** - Returns HTTPS video URLs for company's cameras  
✅ **GET /api/camera/proxy?camera=1** - Proxies video stream from camera to frontend  
✅ **POST /api/lpr/ingest** - License plate recognition (keep working) ✅

### 2. Frontend Updates

✅ **InSessionForm.tsx** - Uses `/api/camera/proxy?camera=1` for video  
✅ **OutSessionForm.tsx** - Uses `/api/camera/proxy?camera=2` for video

### 3. Company Settings

✅ **CompanyMetadata** - Added `cameraSettings` field for per-company camera IPs

## Your Camera Configuration

- **Camera 1 (IN):** `192.168.1.50:443`
- **Camera 2 (OUT):** `192.168.1.49:443`
- **HTTPS:** ✅ Supported

## Setup Steps

### Step 1: Update Company Database

Set camera IPs for your company:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1Port: 443,
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2Port: 443,
        camera2Username: "admin",
        camera2Password: "admin"
      }
    }
  }
);
```

### Step 2: Configure Camera for License Plates (Keep Working!)

**Camera HTTP Push Settings:**
- **Server:** `your-site.com`
- **Port:** `443`
- **SSL:** ✅ Enable
- **Path:** `/api/lpr/ingest`
- **Method:** `POST`
- **Auth:** `Authorization: Bearer YOUR_LPR_INGEST_SECRET`

✅ **This keeps your license plate recognition working!**

### Step 3: Test Video Proxy

```bash
# Test camera 1
curl https://your-site.com/api/camera/proxy?camera=1

# Test camera 2
curl https://your-site.com/api/camera/proxy?camera=2
```

### Step 4: Verify Frontend

1. Open `/in-session` page
2. Should see video from camera 1 (192.168.1.50)
3. Open `/out-session` page
4. Should see video from camera 2 (192.168.1.49)

## How It Works

```
Camera 1 (192.168.1.50)
    ↓ HTTPS
Site API (/api/camera/proxy?camera=1)
    ↓ Streams video
Frontend (<video> element)
```

**License Plates:**
```
Camera → HTTPS POST → /api/lpr/ingest → Database ✅
```

## Troubleshooting

### Video Not Loading

1. **Check camera IPs in database:**
   ```javascript
   db.companies.findOne({ companyId: "your-company-id" }, { cameraSettings: 1 });
   ```

2. **Test camera HTTPS directly:**
   ```bash
   curl -k https://192.168.1.50:443/video.mjpeg
   ```

3. **Check API response:**
   ```bash
   curl https://your-site.com/api/camera/video
   ```

4. **Check browser console** for errors

### License Plates Not Working

1. **Verify camera push settings:**
   - Server: `your-site.com`
   - Path: `/api/lpr/ingest`
   - Auth token matches `LPR_INGEST_SECRET`

2. **Test endpoint:**
   ```bash
   curl -X POST https://your-site.com/api/lpr/ingest \
     -H "Authorization: Bearer YOUR_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"plateNumber":"TEST","recognizedAt":"2025-01-15 14:30:00"}'
   ```

## Summary

✅ **Video Streaming:** Direct HTTPS from cameras via proxy  
✅ **License Plates:** Keep `/api/lpr/ingest` working  
✅ **Per-Company IPs:** Camera IPs stored in company settings  
✅ **No Hardcoded IPs:** Each company has different camera IPs  
✅ **HTTPS Support:** Cameras connect via HTTPS  

## Files Created/Updated

1. ✅ `app/api/camera/video/route.ts` - Get video URLs
2. ✅ `app/api/camera/proxy/route.ts` - Proxy video streams
3. ✅ `components/sessions/InSessionForm.tsx` - Uses video proxy
4. ✅ `components/sessions/OutSessionForm.tsx` - Uses video proxy
5. ✅ `lib/companies/metadata.ts` - Added cameraSettings
6. ✅ `app/api/camera/config/route.ts` - Gets IPs from company

Everything is ready! Just update your company database with camera IPs.
