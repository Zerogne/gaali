# Next Steps - Camera Integration

## ✅ What's Done

1. ✅ Bridge service running on port 3000
2. ✅ Camera configured with HTTP push
3. ✅ Proxy fix applied (needs deployment)
4. ✅ Frontend using correct hooks

## 🔍 Current Status Check

### 1. Test Camera Push (From Camera Network)

The camera should now be able to push to your bridge. To verify:

1. **Trigger a plate recognition** on the camera (drive a vehicle past it, or use test mode if available)
2. **Check bridge service logs** - you should see:
   ```
   ✓ Pushed plate: [PLATE_NUMBER] at [TIME]
   ```
   OR
   ```
   ✗ Failed to push to cloud: [ERROR]
   ```

### 2. Check Vercel Configuration

The bridge can receive from camera, but needs Vercel configured:

**Test Vercel API:**

```bash
curl -X POST https://gaali.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: application/json" \
  -d '{"plateNumber":"TEST","recognizedAt":"2025-12-23 20:50:00","cameraIp":"192.168.1.100"}'
```

**If you get "Authentication required":**

- Go to Vercel Dashboard → Settings → Environment Variables
- Add: `LPR_INGEST_SECRET=BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`
- Redeploy your app

### 3. Deploy Proxy Fix

The `/api/lpr/latest` endpoint fix needs to be deployed:

1. **Commit and push** the `proxy.ts` changes
2. **Wait for Vercel deployment** to complete
3. **Test frontend** - should be able to poll without auth errors

## 🧪 Testing Checklist

- [ ] Bridge service running (check: `curl http://localhost:3000/health`)
- [ ] Camera configured (Server: `192.168.1.176`, Port: `3000`, Address: `/plate`)
- [ ] Trigger plate recognition on camera
- [ ] Check bridge logs for incoming push
- [ ] Verify Vercel has `LPR_INGEST_SECRET` configured
- [ ] Test Vercel API endpoint (should return `{"ok":true}`)
- [ ] Deploy proxy fix to Vercel
- [ ] Test frontend - plate should auto-fill

## 🎯 Expected Flow

```
1. Camera detects plate
   ↓
2. Camera POSTs to http://192.168.1.176:3000/plate
   ↓
3. Bridge receives and forwards to https://gaali.vercel.app/api/lpr/ingest
   ↓
4. Vercel stores in MongoDB
   ↓
5. Frontend polls /api/lpr/latest
   ↓
6. Plate auto-fills in form
```

## 🐛 Troubleshooting

### Bridge not receiving pushes

- Check camera configuration (IP, port, address)
- Check firewall allows port 3000
- Test from camera network: `curl http://192.168.1.176:3000/health`

### Bridge can't push to Vercel

- Check Vercel has `LPR_INGEST_SECRET` configured
- Verify secret matches: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`
- Redeploy Vercel after adding secret

### Frontend shows errors

- Deploy proxy fix (allow `/api/lpr/latest`)
- Check browser console for specific errors
- Verify you're logged into the web app

## 📝 Quick Commands

```bash
# Check bridge health
curl http://localhost:3000/health

# Test bridge push endpoint
curl -X POST http://localhost:3000/plate \
  -H "Content-Type: application/json" \
  -d '{"PlateResult":{"license":"TEST","trigger_time":"2025-12-23 20:50:00"}}'

# Test Vercel API
curl -X POST https://gaali.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: application/json" \
  -d '{"plateNumber":"TEST","recognizedAt":"2025-12-23 20:50:00","cameraIp":"192.168.1.100"}'

# Check latest LPR event
curl https://gaali.vercel.app/api/lpr/latest
```
