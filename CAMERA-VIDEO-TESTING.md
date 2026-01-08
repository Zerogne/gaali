# Testing Camera Real-Time Video

## ✅ What's Already Set Up

1. ✅ Frontend components use `/api/camera/proxy?camera=1` and `?camera=2`
2. ✅ Proxy endpoint configured to fetch from cameras
3. ✅ Ports configured (HTTP: 443, RTSP: 8557, WebSocket: 9080)

## 🔧 Required Steps

### Step 1: Update Company Database

**CRITICAL:** You must update your company database with camera IPs and ports:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1HttpPort: 443,
        camera1RtspPort: 8557,
        camera1WebSocketPort: 9080,
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2HttpPort: 443,
        camera2RtspPort: 8557,
        camera2WebSocketPort: 9080,
        camera2Username: "admin",
        camera2Password: "admin"
      }
    }
  }
);
```

### Step 2: Test Camera Access

Test if your server can access the cameras:

```bash
# Test camera 1 HTTPS stream
curl -k -u admin:admin https://192.168.1.50:443/video.mjpeg

# Test camera 2 HTTPS stream
curl -k -u admin:admin https://192.168.1.49:443/video.mjpeg
```

**Note:** The video path might be different. Common paths:
- `/video.mjpeg`
- `/stream`
- `/video`
- `/mjpeg`
- `/cgi-bin/video.cgi`

### Step 3: Test Proxy Endpoint

Test the proxy endpoint from your server:

```bash
# Test camera 1 proxy
curl https://your-site.com/api/camera/proxy?camera=1

# Test camera 2 proxy
curl https://your-site.com/api/camera/proxy?camera=2
```

### Step 4: Check Browser Console

1. Open `/in-session` page
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for `/api/camera/proxy?camera=1` request

## 🔍 Troubleshooting

### Issue: "Camera not configured for this company"

**Solution:** Update company database with camera IPs (Step 1)

### Issue: "Failed to connect to camera"

**Possible causes:**
1. Camera IP is wrong
2. Camera is not accessible from server
3. Camera credentials are wrong
4. Camera HTTPS port is not 443
5. Video path is wrong (not `/video.mjpeg`)

**Check:**
```bash
# Test direct camera access
curl -k -u admin:admin https://192.168.1.50:443/video.mjpeg

# If that fails, try different paths:
curl -k -u admin:admin https://192.168.1.50:443/stream
curl -k -u admin:admin https://192.168.1.50:443/video
```

### Issue: Video shows black screen

**Possible causes:**
1. Camera stream path is wrong
2. Camera requires different authentication
3. CORS issues (should be handled by proxy)
4. Video format not supported

**Check browser console for errors**

### Issue: "401 Not authenticated"

**Solution:** Make sure you're logged in to the site

## 📝 Adjust Video Path

If your camera uses a different video path (not `/video.mjpeg`), update the proxy endpoint:

**File:** `app/api/camera/proxy/route.ts`

**Line 61:** Change the `videoPath`:
```typescript
const videoPath = "/video.mjpeg"; // Change to your camera's path
// Examples:
// const videoPath = "/stream";
// const videoPath = "/video";
// const videoPath = "/cgi-bin/video.cgi";
```

## ✅ Success Indicators

When working correctly, you should see:
1. ✅ Video element loads (no black screen)
2. ✅ Browser console shows: "📹 Loading camera 1 video stream from HTTPS..."
3. ✅ Network tab shows `/api/camera/proxy?camera=1` with status 200
4. ✅ Video plays automatically

## 🎯 Quick Test Checklist

- [ ] Company database updated with camera IPs
- [ ] Can access camera directly: `curl -k https://192.168.1.50:443/video.mjpeg`
- [ ] Proxy endpoint works: `curl https://your-site.com/api/camera/proxy?camera=1`
- [ ] Logged in to site
- [ ] Browser console shows no errors
- [ ] Video displays on `/in-session` and `/out-session` pages
