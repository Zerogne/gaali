# HTTP Push Mode - Production Setup

## ✅ Bridge Service Status

The bridge service is now configured for **HTTP Push mode** and is running!

- **Status**: ✅ Running on port 3000
- **Mode**: `push`
- **Bridge IP**: `192.168.1.176` (your machine's IP)
- **Endpoint**: `http://192.168.1.176:3000/plate`

## Step 1: Configure Vercel Environment Variables

**IMPORTANT**: You must add `LPR_INGEST_SECRET` to your Vercel project!

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `gaali`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
LPR_INGEST_SECRET=lpoxMfgdDwyGMjd5ydhQTqygN76GSM6Twjpt7a39uVY=
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=gaali
MONGODB_COLLECTION=lpr_events
```

5. **Redeploy** your Vercel app after adding variables

## Step 2: Configure Camera HTTP Push

1. **Open Camera Web Interface:**
   - Go to `http://192.168.1.100/main.htm`
   - Log in with `admin:admin`

2. **Navigate to HTTP Push Settings:**
   - Click **"Advanced settings"** tab
   - Click **"Advanced Networks"** in left sidebar
   - Click **"HTTP push"** sub-tab

3. **Configure Basic Settings:**
   - **Master server priority**: Check "Enable"
   - **Server address**: `192.168.1.176` (your bridge machine IP)
   - **port**: `3000`
   - **SSL connection**: Uncheck (unless using HTTPS)
   - **Verification method**: Select "Anonymous"
   - **Timeout (s)**: `5`

4. **Configure Push Settings:**
   - **Push license plate recognition results**: 
     - ✅ Check "Enable"
     - **address**: `/plate`
     - **Content detail level**: Select "all"
     - **Send pictures**: Optional (check if you want images)

5. **Save Configuration:**
   - Click the orange **"Sure"** button
   - Wait for confirmation

6. **Test Connection:**
   - Click the **"Push test"** tab
   - Click **"Confirm"** to test
   - Should show successful connection

## Step 3: Verify Bridge Service

The bridge service should be running. Check:

```bash
curl http://localhost:3000/health
```

Should return:
```json
{"ok":true,"service":"camera-bridge-http-push","timestamp":"..."}
```

## Step 4: Test End-to-End

1. **Trigger a plate recognition** (drive vehicle past camera or use test mode)
2. **Check bridge service logs** - should show:
   ```
   ✓ Pushed plate: [PLATE_NUMBER] at [TIME]
   ```
3. **Check Vercel API** - plate should appear in MongoDB
4. **Check frontend** - plate should auto-fill in form

## Troubleshooting

### "Authentication required" Error

This means `LPR_INGEST_SECRET` is not set in Vercel or doesn't match.

**Fix:**
1. Add `LPR_INGEST_SECRET` to Vercel environment variables
2. Make sure it matches: `lpoxMfgdDwyGMjd5ydhQTqygN76GSM6Twjpt7a39uVY=`
3. Redeploy Vercel app

### Camera Can't Reach Bridge

**Check:**
1. Bridge service is running: `curl http://localhost:3000/health`
2. Firewall allows port 3000
3. Camera and bridge are on same network
4. Test from camera network: `ping 192.168.1.176`

### No Events Appearing

**Check:**
1. Camera HTTP push is enabled
2. Camera server address is correct (`192.168.1.176:3000`)
3. Bridge service logs show incoming requests
4. Vercel API logs show successful ingestions

## Current Configuration

- **Bridge IP**: `192.168.1.176`
- **Bridge Port**: `3000`
- **Push Endpoint**: `http://192.168.1.176:3000/plate`
- **Vercel URL**: `https://gaali.vercel.app`
- **Secret**: `lpoxMfgdDwyGMjd5ydhQTqygN76GSM6Twjpt7a39uVY=`

## Next Steps

1. ✅ Bridge service is running
2. ⏳ Add `LPR_INGEST_SECRET` to Vercel (if not already done)
3. ⏳ Configure camera HTTP push settings
4. ⏳ Test with actual plate recognition
