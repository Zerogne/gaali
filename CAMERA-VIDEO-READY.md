# Camera Real-Time Video - Ready to Test! 🎥

## ✅ Setup Complete

Everything is configured and ready to test:

1. ✅ **Frontend:** Uses `/api/camera/proxy?camera=1` and `?camera=2`
2. ✅ **Proxy Endpoint:** Configured with multiple video path fallbacks
3. ✅ **Ports:** HTTP (443), RTSP (8557), WebSocket (9080)
4. ✅ **Auto-Detection:** Tries multiple video paths automatically

## 🚀 Quick Start

### Step 1: Update Database (REQUIRED)

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

### Step 2: Test

1. **Open `/in-session` page** - Should show Camera 1 video
2. **Open `/out-session` page** - Should show Camera 2 video
3. **Check browser console** for connection logs

## 🔍 What Happens

1. Frontend loads `<video src="/api/camera/proxy?camera=1" />`
2. Proxy endpoint gets camera IP from company settings
3. Tries multiple video paths automatically:
   - `/video.mjpeg`
   - `/stream`
   - `/video`
   - `/mjpeg`
   - `/cgi-bin/video.cgi`
4. Streams video to browser

## 📊 Success Indicators

✅ **Video displays** (not black screen)  
✅ **Console shows:** "📹 Loading camera 1 video stream from HTTPS..."  
✅ **Console shows:** "✅ Successfully connected to camera 1 at https://..."  
✅ **Network tab:** `/api/camera/proxy?camera=1` returns 200 status  
✅ **Video plays automatically**

## ⚠️ Troubleshooting

### "Camera not configured"
→ Update database with camera IPs (Step 1)

### "Failed to connect to camera"
→ Check:
- Camera IP is correct
- Camera is accessible from server
- Camera credentials are correct
- Camera HTTPS port is 443

### Black screen
→ Check browser console for errors

### Video path not found
→ The proxy tries multiple paths automatically. Check server logs to see which paths were tried.

## 🎯 Test Checklist

- [ ] Database updated with camera IPs
- [ ] Logged in to site
- [ ] Open `/in-session` page
- [ ] Check browser console
- [ ] Video should display automatically

## 📝 Next Steps

Once video is working:
1. ✅ License plates continue to work via `/api/lpr/ingest`
2. ✅ Video streams in real-time
3. ✅ Each company can have different camera IPs

**You're all set!** Update the database and test! 🚀
