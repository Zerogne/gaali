# ⚠️ Vercel Configuration Required

## Current Status

✅ **Bridge Service**: Running correctly  
✅ **Secret in Bridge**: Updated to match main app  
❌ **Vercel API**: Missing `LPR_INGEST_SECRET` environment variable

## The Problem

The bridge service is trying to push to Vercel, but Vercel doesn't have `LPR_INGEST_SECRET` configured, so it's rejecting all requests with "Authentication required".

## Solution: Add Environment Variable to Vercel

### Step 1: Go to Vercel Dashboard

1. Open [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **gaali**

### Step 2: Add Environment Variable

1. Click **Settings** (in the top navigation)
2. Click **Environment Variables** (in the left sidebar)
3. Click **Add New** button
4. Fill in:
   - **Key**: `LPR_INGEST_SECRET`
   - **Value**: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Click **Save**

### Step 3: Redeploy

**IMPORTANT**: After adding the environment variable, you must redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Wait for deployment to complete

### Step 4: Test

After redeploying, test the API:

```bash
curl -X POST https://gaali.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "TEST123",
    "recognizedAt": "2025-12-23 20:30:00",
    "cameraIp": "192.168.1.100"
  }'
```

Should return: `{"ok":true}`

## Current Configuration

- **Bridge Secret**: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=` ✅
- **Vercel Secret**: Not set ❌
- **Bridge Status**: Running ✅
- **Vercel Status**: Waiting for configuration ⏳

## After Configuration

Once you add the secret and redeploy:

1. ✅ Bridge will successfully push to Vercel
2. ✅ Plates will be stored in MongoDB
3. ✅ Frontend will auto-fill plate numbers

## Quick Checklist

- [ ] Add `LPR_INGEST_SECRET` to Vercel environment variables
- [ ] Set value: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`
- [ ] Select all environments (Production, Preview, Development)
- [ ] Redeploy Vercel app
- [ ] Test API endpoint (should return `{"ok":true}`)
- [ ] Configure camera HTTP push settings
- [ ] Test end-to-end with actual plate recognition
