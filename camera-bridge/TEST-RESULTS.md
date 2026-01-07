# HTTP Push Mode - Test Results

## ✅ Bridge Service Status

**Status**: Running successfully in HTTP Push mode

- **Mode**: `push`
- **Port**: `3000`
- **Health Check**: ✅ Working (`http://localhost:3000/health`)
- **Push Endpoint**: ✅ Receiving requests (`http://localhost:3000/plate`)

## ⚠️ Current Issue

The bridge service is receiving push requests but **cannot forward to Vercel** because:

**Error**: `Failed to push to cloud`

**Root Cause**: `LPR_INGEST_SECRET` is not configured in Vercel or doesn't match.

## 🔧 Fix Required

### Step 1: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **gaali**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key**: `LPR_INGEST_SECRET`
   - **Value**: `lpoxMfgdDwyGMjd5ydhQTqygN76GSM6Twjpt7a39uVY=`
   - **Environment**: Production, Preview, Development (select all)
6. Click **Save**
7. **Redeploy** your app (go to Deployments → ... → Redeploy)

### Step 2: Verify Configuration

After redeploying, test the Vercel API:

```bash
curl -X POST https://gaali.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer lpoxMfgdDwyGMjd5ydhQTqygN76GSM6Twjpt7a39uVY=" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "TEST123",
    "recognizedAt": "2025-12-23 20:25:00",
    "cameraIp": "192.168.1.100"
  }'
```

Should return: `{"ok":true}`

### Step 3: Configure Camera

Once Vercel is configured, set up the camera:

1. Open `http://192.168.1.100/main.htm`
2. Go to **Advanced settings** → **Advanced Networks** → **HTTP push**
3. Configure:
   - **Server address**: `192.168.1.176`
   - **port**: `3000`
   - **Push license plate recognition results**: Enable
   - **address**: `/plate`
4. Click **Sure** to save
5. Test using **Push test** tab

## 📊 Test Results

### Bridge Service
- ✅ Health endpoint: Working
- ✅ Push endpoint: Receiving requests
- ❌ Cloud forwarding: Failing (needs Vercel config)

### Next Steps
1. Add `LPR_INGEST_SECRET` to Vercel
2. Redeploy Vercel app
3. Configure camera HTTP push
4. Test end-to-end

## 🎯 Expected Flow (Once Configured)

```
Camera detects plate
  ↓ HTTP POST to http://192.168.1.176:3000/plate
Bridge Service receives
  ↓ HTTPS POST to https://gaali.vercel.app/api/lpr/ingest
Vercel API stores in MongoDB
  ↓ Frontend polls /api/lpr/latest
Plate auto-fills in form
```
