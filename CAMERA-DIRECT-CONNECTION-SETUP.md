# Direct Camera Connection Setup (HTTPS)

## Overview

Connect cameras directly to your site via HTTPS for real-time video streaming, while keeping license plate recognition working.

## Architecture

```
Camera 1 (192.168.1.50) ──HTTPS──┐
                                   ├──> Your Site (HTTPS)
Camera 2 (192.168.1.49) ──HTTPS──┘
                                   │
                                   ├──> /api/lpr/ingest (License Plates) ✅ Keep this
                                   ├──> /api/camera/video (Video Streams) 🆕 New
                                   └──> WebSocket → Frontend (Real-time Video)
```

## Camera Configuration

### Camera 1 (IN Camera)
- **IP:** `192.168.1.50`
- **HTTPS Port:** `443` (or your camera's HTTPS port)
- **Video Stream URL:** `https://192.168.1.50:443/video.mjpeg`
- **License Plate Endpoint:** `https://your-site.com/api/lpr/ingest`

### Camera 2 (OUT Camera)
- **IP:** `192.168.1.49`
- **HTTPS Port:** `443` (or your camera's HTTPS port)
- **Video Stream URL:** `https://192.168.1.49:443/video.mjpeg`
- **License Plate Endpoint:** `https://your-site.com/api/lpr/ingest`

## Setup Steps

### Step 1: Store Camera IPs Per Company

Update company in database with camera settings:

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

### Step 2: Configure Camera for License Plates (Keep Existing)

**Camera HTTP Push Settings:**
- **Server Address:** `your-site.com` (your production domain)
- **Port:** `443` (HTTPS)
- **SSL Connection:** ✅ Enable
- **Address/Path:** `/api/lpr/ingest`
- **Method:** `POST`
- **Authentication:** Bearer token (set `LPR_INGEST_SECRET`)

This keeps your existing license plate recognition working.

### Step 3: Frontend Video Display

The frontend will get video URLs from the API and display them:

**Option A: Direct HTTPS Video (Simple)**
```typescript
// Get video URLs from API
const response = await fetch('/api/camera/video');
const { camera1, camera2 } = await response.json();

// Use in video element
<video src={camera1.url} autoPlay />
```

**Option B: WebSocket Proxy (Better for Real-time)**
- Site receives video from cameras
- Site broadcasts via WebSocket
- Frontend receives via WebSocket

## API Endpoints

### GET /api/camera/video
Returns HTTPS video URLs for current company's cameras.

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

### POST /api/camera/video
Receives video frames from cameras (if cameras support pushing video).

### POST /api/lpr/ingest (Existing - Keep This)
Receives license plate data from cameras. ✅ **Keep this working!**

## Frontend Integration

### Update RealtimeVideo Component

Modify to use direct HTTPS URLs when available:

```typescript
// In RealtimeVideo.tsx
useEffect(() => {
  // Try direct HTTPS first
  fetch('/api/camera/video')
    .then(res => res.json())
    .then(config => {
      if (config.camera1?.url && cameraId === 'camera-1') {
        // Use direct HTTPS stream
        videoRef.current.src = config.camera1.url;
      } else if (config.camera2?.url && cameraId === 'camera-2') {
        // Use direct HTTPS stream
        videoRef.current.src = config.camera2.url;
      } else {
        // Fallback to WebSocket
        connectWebSocket();
      }
    });
}, [cameraId]);
```

## Camera HTTPS Configuration

### For Cameras That Support HTTPS Streaming

1. **Enable HTTPS on Camera:**
   - Camera web interface → Network → HTTPS
   - Enable HTTPS
   - Set port (usually 443)

2. **Configure Video Stream Path:**
   - Common paths: `/video.mjpeg`, `/stream`, `/video`
   - Check your camera documentation

3. **Test HTTPS Stream:**
   ```bash
   curl -k https://192.168.1.50:443/video.mjpeg
   # Should return video stream
   ```

## Security Considerations

### HTTPS Certificate

Cameras may have self-signed certificates. Options:

1. **Accept self-signed (development):**
   ```typescript
   // In browser, user may need to accept certificate
   // Or use fetch with rejectUnauthorized: false (server-side)
   ```

2. **Use proper certificates (production):**
   - Install valid SSL certificate on cameras
   - Or use reverse proxy with valid certificate

### Authentication

If cameras require authentication:

```typescript
// Add credentials to URL
const url = `https://admin:admin@192.168.1.50:443/video.mjpeg`;
// Or use fetch with credentials
fetch(url, {
  headers: {
    'Authorization': 'Basic ' + btoa('admin:admin')
  }
});
```

## Testing

### 1. Test Video URL API

```bash
curl https://your-site.com/api/camera/video
```

Should return camera URLs for logged-in company.

### 2. Test Direct Camera Stream

```bash
curl -k https://192.168.1.50:443/video.mjpeg
```

Should return video stream (if camera supports it).

### 3. Test License Plate (Keep Working)

```bash
curl -X POST https://your-site.com/api/lpr/ingest \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"plateNumber":"TEST123","recognizedAt":"2025-01-15 14:30:00"}'
```

## Alternative: Proxy Video Through Site

If cameras can't be accessed directly from browser:

1. **Site proxies video from camera:**
   ```
   Camera → HTTPS → Site API → WebSocket → Frontend
   ```

2. **Create proxy endpoint:**
   ```typescript
   // app/api/camera/proxy/route.ts
   export async function GET(request: NextRequest) {
     const cameraId = request.nextUrl.searchParams.get('camera');
     const company = await getCompany(companyId);
     const cameraIp = cameraId === '1' ? company.cameraSettings.camera1Ip : company.cameraSettings.camera2Ip;
     
     // Fetch from camera and stream to client
     const cameraUrl = `https://${cameraIp}:443/video.mjpeg`;
     const response = await fetch(cameraUrl);
     return new Response(response.body, {
       headers: { 'Content-Type': 'multipart/x-mixed-replace' }
     });
   }
   ```

3. **Frontend uses proxy:**
   ```typescript
   <video src="/api/camera/proxy?camera=1" autoPlay />
   ```

## Summary

✅ **License Plate Recognition:** Keep `/api/lpr/ingest` working  
🆕 **Video Streaming:** Use `/api/camera/video` for HTTPS URLs  
✅ **Per-Company IPs:** Camera IPs stored in company settings  
✅ **HTTPS Support:** Cameras connect via HTTPS  

## Next Steps

1. Update company database with camera IPs
2. Test camera HTTPS streams
3. Update frontend to use video URLs
4. Keep license plate endpoint working
