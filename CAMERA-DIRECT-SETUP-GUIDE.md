# Direct Camera Connection Setup Guide

## Goal

Connect cameras directly to your site via HTTPS for real-time video, while keeping license plate recognition working.

## Your Camera IPs

- **Camera 1 (IN):** `192.168.1.50`
- **Camera 2 (OUT):** `192.168.1.49`
- **HTTPS Port:** `443` (or your camera's HTTPS port)

## Architecture

```
┌─────────────────┐
│  Camera 1       │
│  192.168.1.50   │──HTTPS──┐
└─────────────────┘         │
                             │
┌─────────────────┐         ├──> Your Site
│  Camera 2       │──HTTPS──┤     (HTTPS)
│  192.168.1.49   │         │
└─────────────────┘         │
                             │
                             ├──> /api/lpr/ingest (License Plates) ✅
                             ├──> /api/camera/proxy (Video Proxy) 🆕
                             └──> Frontend (Displays Video)
```

## Step 1: Store Camera IPs in Company Settings

Update your company in MongoDB:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1Port: 443,  // HTTPS port
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2Port: 443,  // HTTPS port
        camera2Username: "admin",
        camera2Password: "admin"
      }
    }
  }
);
```

## Step 2: Configure Camera for License Plates (Keep Working)

**In Camera Web Interface:**

1. Go to **HTTP Push** or **Event Push** settings
2. Configure:
   - **Server Address:** `your-site.com` (your production domain)
   - **Port:** `443`
   - **SSL Connection:** ✅ Enable
   - **Address/Path:** `/api/lpr/ingest`
   - **Method:** `POST`
   - **Authentication Header:** `Authorization: Bearer YOUR_LPR_INGEST_SECRET`

This keeps your existing license plate recognition working! ✅

## Step 3: Frontend Video Display

### Option A: Use Video Proxy (Recommended)

The site proxies video from cameras to avoid CORS issues:

```typescript
// In RealtimeVideo.tsx or session forms
<video 
  src={`/api/camera/proxy?camera=${cameraId === 'camera-1' ? '1' : '2'}`}
  autoPlay
  muted
  playsInline
/>
```

### Option B: Direct HTTPS (If CORS Allowed)

If cameras allow CORS, use direct URLs:

```typescript
// Get video URL from API
const response = await fetch('/api/camera/video');
const { camera1, camera2 } = await response.json();

// Use direct URL
<video src={camera1.url} autoPlay />
```

## Step 4: Update Frontend Components

### Update InSessionForm.tsx

Replace MJPEG loading with proxy:

```typescript
// Instead of:
<img src={streamUrl} />

// Use:
<video 
  src="/api/camera/proxy?camera=1"
  autoPlay
  muted
  playsInline
  className="w-full h-full object-contain"
/>
```

### Update OutSessionForm.tsx

Same for camera 2:

```typescript
<video 
  src="/api/camera/proxy?camera=2"
  autoPlay
  muted
  playsInline
  className="w-full h-full object-contain"
/>
```

## API Endpoints Created

### 1. GET /api/camera/video
Returns HTTPS video URLs for company's cameras.

**Response:**
```json
{
  "companyId": "company-1",
  "camera1": {
    "ip": "192.168.1.50",
    "port": 443,
    "url": "https://192.168.1.50:443/video.mjpeg",
    "configured": true
  },
  "camera2": {
    "ip": "192.168.1.49",
    "port": 443,
    "url": "https://192.168.1.49:443/video.mjpeg",
    "configured": true
  }
}
```

### 2. GET /api/camera/proxy?camera=1
Proxies video stream from camera to frontend (avoids CORS).

**Usage:**
```
<video src="/api/camera/proxy?camera=1" />
<video src="/api/camera/proxy?camera=2" />
```

### 3. POST /api/lpr/ingest (Existing - Keep This!)
Receives license plate data. ✅ **Already working, keep it!**

## Camera HTTPS Configuration

### Enable HTTPS on Camera

1. **Access camera web interface:**
   - `https://192.168.1.50` (or HTTP first, then enable HTTPS)

2. **Enable HTTPS:**
   - Network → HTTPS Settings
   - Enable HTTPS
   - Set port (usually 443)
   - Generate/install certificate

3. **Find Video Stream Path:**
   - Common paths: `/video.mjpeg`, `/stream`, `/video`, `/mjpeg`
   - Check camera documentation
   - Test: `https://192.168.1.50:443/video.mjpeg`

### Test Camera HTTPS Stream

```bash
# Test if camera HTTPS stream works
curl -k https://192.168.1.50:443/video.mjpeg

# With authentication
curl -k -u admin:admin https://192.168.1.50:443/video.mjpeg
```

## Testing

### 1. Test Video Proxy API

```bash
# Test camera 1
curl https://your-site.com/api/camera/proxy?camera=1

# Should return video stream
```

### 2. Test Video URL API

```bash
curl https://your-site.com/api/camera/video

# Should return camera URLs
```

### 3. Test License Plate (Keep Working)

```bash
curl -X POST https://your-site.com/api/lpr/ingest \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "TEST123",
    "recognizedAt": "2025-01-15 14:30:00",
    "cameraIp": "192.168.1.50"
  }'
```

## Frontend Integration

### Update Components to Use Proxy

**In `components/sessions/InSessionForm.tsx`:**

```typescript
// Replace MJPEG img with video proxy
<div className="w-1/2 aspect-video bg-black rounded-lg overflow-hidden">
  <video
    src="/api/camera/proxy?camera=1"
    autoPlay
    muted
    playsInline
    className="w-full h-full object-contain"
    onError={(e) => {
      console.error("Failed to load camera video:", e);
    }}
  />
</div>
```

**In `components/sessions/OutSessionForm.tsx`:**

```typescript
<video
  src="/api/camera/proxy?camera=2"
  autoPlay
  muted
  playsInline
  className="w-full h-full object-contain"
/>
```

## Security Notes

### SSL Certificates

Cameras may have self-signed certificates. The proxy endpoint handles this by not verifying certificates (for development). In production:

1. Install valid SSL certificates on cameras, OR
2. Use a reverse proxy with valid certificate

### Authentication

Camera credentials are stored in company settings and used by the proxy endpoint. They're not exposed to the frontend.

## Summary

✅ **License Plate Recognition:** Keep `/api/lpr/ingest` - already working  
🆕 **Video Streaming:** New `/api/camera/proxy` endpoint  
✅ **Per-Company IPs:** Camera IPs from company settings  
✅ **HTTPS Support:** Cameras connect via HTTPS  
✅ **No Hardcoded IPs:** Each company has different camera IPs  

## Files Created

1. ✅ `app/api/camera/video/route.ts` - Get video URLs
2. ✅ `app/api/camera/proxy/route.ts` - Proxy video streams
3. ✅ `CAMERA-DIRECT-CONNECTION-SETUP.md` - Setup guide
4. ✅ `CAMERA-DIRECT-SETUP-GUIDE.md` - This guide

## Next Steps

1. Update company database with camera IPs (192.168.1.50, 192.168.1.49)
2. Test camera HTTPS streams
3. Update frontend components to use `/api/camera/proxy`
4. Verify license plate recognition still works
