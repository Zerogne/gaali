# Verify Electron App is Uploading Frames

## Quick Verification Steps

### 1. Check Vercel Logs

Go to **Vercel Dashboard → Your Project → Logs** and look for:

```
📹 [Camera 1] Frame received {
  format: 'jpeg',
  timestamp: '2024-01-10T...',
  size: '45 KB'
}
```

**If you see this:** ✅ Electron app is uploading successfully!

**If you don't see this:**
- Electron app might not be running
- `INGEST_SECRET` might not match
- Network issue (Electron can't reach Vercel)

### 2. Test Latest Endpoint

```bash
curl "https://gaali.vercel.app/api/camera/latest?camera=1"
```

**Expected response if working:**
```json
{
  "ok": true,
  "cameraId": "1",
  "url": "https://xxx.public.blob.vercel-storage.com/cameras/1/latest.jpg",
  "ts": 1234567890,
  "stale": false
}
```

**If `url` is `null`:** No frames uploaded yet (Electron not sending)

**If `stale: true`:** Last frame was > 2 seconds ago (upload stopped)

### 3. Check Browser

Open your website and check:
- Camera preview should show video
- Browser console should show polling requests every 200ms
- Network tab should show `GET /api/camera/latest?camera=1` requests

---

## Common Issues & Fixes

### Issue: No frames in Vercel logs

**Check Electron app:**
1. Is Electron app running?
2. Are cameras connected?
3. Check Electron console for errors:
   ```
   ❌ [Camera 1] Upload failed: 401
   ❌ [Camera 1] INGEST_SECRET not configured
   ```

**Fix:**
- Verify `INGEST_SECRET` is set in Electron app
- Verify `INGEST_SECRET` matches Vercel environment variable
- Check `SITE_URL` is correct: `https://gaali.vercel.app`

### Issue: "401 Unauthorized" in Electron console

**Cause:** `INGEST_SECRET` doesn't match or is missing.

**Fix:**
1. Check Electron: `process.env.INGEST_SECRET` is set
2. Check Vercel: Environment variable `INGEST_SECRET` exists
3. Ensure they match exactly (no spaces, same case)

### Issue: "429 Rate Limit Exceeded"

**Cause:** Uploading too fast (> 15 frames/sec per camera).

**Fix:**
- This is normal if throttling isn't working
- Check `UPLOAD_FPS` setting (should be 8-12)
- Verify throttling code is working in Electron app

### Issue: Frames upload but browser shows "Camera Offline"

**Cause:** Stale detection (no frames for > 2 seconds).

**Check:**
1. Are frames still uploading? (Check Vercel logs)
2. Is upload frequency too low? (Should be 8-12 fps)
3. Network issues? (Check Electron console for errors)

**Fix:**
- Increase `UPLOAD_FPS` if too low
- Check network connectivity
- Verify FFmpeg is still running

---

## Debug Checklist

### Electron App Side
- [ ] Electron app is running
- [ ] Cameras are connected (check camera status in Electron)
- [ ] FFmpeg processes are running (check task manager/process list)
- [ ] `pushVideoToWebsiteAPI` function is being called (add console.log)
- [ ] No errors in Electron console
- [ ] Environment variables are set (`SITE_URL`, `INGEST_SECRET`)

### Network Side
- [ ] Electron app can reach internet
- [ ] No firewall blocking HTTPS POST
- [ ] `SITE_URL` is correct and accessible

### Vercel Side
- [ ] Blob store is created
- [ ] KV database is created
- [ ] `INGEST_SECRET` is set in environment variables
- [ ] API endpoints are deployed
- [ ] Check Vercel logs for uploads

### Browser Side
- [ ] Website is deployed
- [ ] `HttpFrameStream` component is used
- [ ] Browser console shows polling requests
- [ ] Network tab shows successful GET requests

---

## Test Upload Manually

If Electron app isn't working, test the API manually:

```bash
# Create a test JPEG file (or use existing)
# Then upload it:

curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer your-secret-here" \
  -H "Content-Type: image/jpeg" \
  -H "x-ts: $(date +%s%3N)" \
  --data-binary @test-frame.jpg
```

**Expected response:**
```json
{"ok": true, "cameraId": "1", "ts": 1234567890}
```

**Then check latest endpoint:**
```bash
curl "https://gaali.vercel.app/api/camera/latest?camera=1"
```

**Should return the Blob URL you just uploaded.**

---

## Monitoring Commands

### Watch Vercel Logs (Real-time)

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Watch logs
vercel logs --follow
```

### Check Electron Console

Look for these log patterns:

**Success:**
- (No logs if throttled - that's normal)
- Frame extraction logs (if you added them)

**Errors:**
- `❌ [Camera X] Upload failed: ...`
- `❌ [Camera X] INGEST_SECRET not configured`
- `❌ [Camera X] Upload error: ...`

### Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter: `latest`
4. Should see requests every 200ms:
   ```
   GET /api/camera/latest?camera=1&_t=...
   Status: 200 OK
   Response: {"ok": true, "url": "...", ...}
   ```

---

## Success Indicators

✅ **Everything working if you see:**

1. **Vercel Logs:**
   ```
   📹 [Camera 1] Frame received { format: 'jpeg', size: '45 KB' }
   ```

2. **Latest Endpoint:**
   ```json
   {"ok": true, "url": "https://...blob.../latest.jpg", "stale": false}
   ```

3. **Browser:**
   - Camera preview shows video
   - No "Camera Offline" overlay
   - Smooth video updates

4. **Electron Console:**
   - No errors
   - (Throttled frames don't log - that's normal)

---

## Next Steps

Once verified:
1. ✅ Monitor Vercel logs for any errors
2. ✅ Check browser performance (smooth video?)
3. ✅ Adjust `UPLOAD_FPS` if needed (8-12 fps recommended)
4. ✅ Adjust browser `pollInterval` if needed (150-250ms recommended)

If you're still having issues, check the troubleshooting section in `ELECTRON-INTEGRATION-GUIDE.md`.
