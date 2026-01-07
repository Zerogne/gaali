# Railway Deployment Guide - Camera Bridge

## Step-by-Step: Deploy camera-bridge to Railway

### Railway Terminology:

- **Project** = Your overall project (contains multiple services)
- **Service** = One deployment/app (you'll create one for camera-bridge)

### Step 1: Create a New Service

1. **In your Railway Project**, click **"+ New"** or **"New Service"**
2. Select **"GitHub Repo"**
3. Choose your repository: `gaali`
4. Railway will create a new service

### Step 2: Configure Root Directory

**IMPORTANT:** Railway needs to know to use the `camera-bridge` folder, not the root.

**Option A: In Service Settings (if available)**

1. Click on your **service** (the one you just created)
2. Click **"Settings"** tab (top navigation)
3. Look for **"Root Directory"** or **"Source"** section
4. Set it to: `camera-bridge`
5. Click **Save**

**Option B: If Root Directory is not visible**
Railway might detect it automatically, OR you can use a `railway.json` file (already created in `camera-bridge/` folder).

**Option C: Use Railway CLI (Alternative)**
If the UI doesn't show Root Directory, use CLI:

```bash
cd camera-bridge
railway link
railway variables set RAILWAY_SERVICE_ROOT=camera-bridge
```

**Option D: Create Service from Subdirectory (Easier)**

1. In Railway, when creating a new service
2. After selecting your repo, look for **"Configure"** or **"Settings"** button
3. There should be a **"Root Directory"** field - set to `camera-bridge`
4. OR Railway might ask "Which directory?" - select `camera-bridge`

### Step 3: Configure Start Command

1. Still in **Settings** tab
2. Find **"Start Command"** (or "Deploy" section)
3. Set it to: `node server.js`
4. Click **Save**

### Step 4: Set Environment Variables

Go to **Variables** tab and add:

```env
HTTP_PORT=3002
WS_PORT=3001
NODE_ENV=production
```

**How to add:**

1. Click **"Variables"** tab
2. Click **"New Variable"**
3. Add each variable one by one:
   - Name: `HTTP_PORT`, Value: `3002`
   - Name: `WS_PORT`, Value: `3001`
   - Name: `NODE_ENV`, Value: `production`
4. Click **Save** after each

### Step 5: Configure Ports (Important!)

Railway automatically assigns ports, but we need to expose them:

1. Go to **Settings** tab
2. Scroll to **"Networking"** section
3. You'll see **"Public Networking"** - click **"Generate Domain"**
4. This creates a public URL for your service

**For WebSocket (Port 3001):**

- Railway will expose your service on a public domain
- The port will be automatically handled by Railway
- You'll get a URL like: `camera-bridge-production.up.railway.app`

### Step 6: Deploy

1. Go to **"Deployments"** tab
2. Click **"Deploy"** or Railway will auto-deploy
3. Wait for deployment to complete (2-3 minutes)
4. Check logs to ensure it started successfully

### Step 7: Get Your URLs

After deployment:

1. Go to **Settings** → **Networking**
2. You'll see your **Public Domain**: `camera-bridge-production.up.railway.app`
3. Railway handles HTTPS automatically, so use `wss://` for WebSocket

### Step 8: Configure Vercel

Add to Vercel environment variables:

```
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://camera-bridge-production.up.railway.app
```

**Note:** Railway automatically handles the port, so you don't need `:3001` in the URL.

### Step 9: Configure Camera

**If camera can reach the internet:**

- Server address: `camera-bridge-production.up.railway.app`
- Port: Railway will handle this (check Railway logs or use port 443 for HTTPS)
- Path: `/plate`

**However, Railway might not expose HTTP port 3002 directly.** You may need to:

- Use Railway's public domain with HTTPS
- Or configure Railway to expose both ports (see troubleshooting below)

---

## Alternative: Using Railway CLI

If you prefer command line:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd camera-bridge
railway link

# Set root directory (if needed)
railway variables set RAILWAY_SERVICE_ROOT=camera-bridge

# Set environment variables
railway variables set HTTP_PORT=3002
railway variables set WS_PORT=3001
railway variables set NODE_ENV=production

# Deploy
railway up
```

---

## Troubleshooting

### Issue: Service not starting

**Check logs:**

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **Logs** for errors

**Common issues:**

- Missing dependencies → Check `package.json` has all deps
- Wrong start command → Should be `node server.js`
- Port conflicts → Railway handles ports automatically

### Issue: Can't connect to WebSocket

**Railway port handling:**

- Railway exposes services on port 443 (HTTPS) automatically
- Your WebSocket should use `wss://your-domain.railway.app`
- Railway routes traffic to your app's internal port 3001

**Check:**

1. Railway service is running (green status)
2. Public domain is generated
3. Vercel env var uses `wss://` (not `ws://`)

### Issue: Camera can't reach Railway

**Problem:** Camera is on private network (`192.168.x.x`)

**Solutions:**

1. **If camera has internet access:**

   - Use Railway's public domain
   - Configure camera to use HTTPS: `https://camera-bridge-production.up.railway.app/plate`

2. **If camera is isolated:**
   - You need a local bridge on client's network
   - Use Railway only for WebSocket to Vercel
   - Or use Cloudflare Tunnel instead

### Issue: Railway only exposes one port

**Railway limitation:** Railway typically exposes one public domain per service.

**Solution for two ports (HTTP + WebSocket):**

- Railway can handle both on the same domain
- Use `/plate` for HTTP POST (camera)
- Use WebSocket upgrade on same domain (frontend)
- Your `server.js` should handle both on the same port, or Railway will route both

**Better approach:** Modify `server.js` to use one port for both HTTP and WebSocket (Railway will handle routing).

---

## Quick Checklist

- [ ] Railway service created
- [ ] Root directory set to `camera-bridge`
- [ ] Start command: `node server.js`
- [ ] Environment variables set (HTTP_PORT, WS_PORT, NODE_ENV)
- [ ] Public domain generated
- [ ] Deployment successful (green status)
- [ ] Vercel env var updated with Railway URL
- [ ] Camera configured (if it can reach internet)

---

## Next Steps

After Railway is deployed:

1. **Test WebSocket connection:**

   - Open your Vercel site
   - Check browser console for: `✅✅✅ Camera bridge WebSocket CONNECTED!`

2. **Test camera push:**

   - If camera can reach Railway, configure it
   - If not, set up local bridge + Cloudflare Tunnel

3. **Monitor:**
   - Check Railway logs regularly
   - Monitor Railway usage (free tier has limits)

---

## Cost

- **Free tier:** $5 credit/month (usually enough for low traffic)
- **Paid:** Starts at $5/month if you exceed free tier
- **No credit card required** for free tier
