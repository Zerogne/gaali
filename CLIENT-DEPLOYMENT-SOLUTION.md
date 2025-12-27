# Client Deployment Solution - Camera Bridge

Since you're deploying for a client and using Vercel, here are the **practical options** that don't require managing a complex server:

## 🎯 Recommended Solution: Railway.app (Easiest for Clients)

**Why Railway?**
- ✅ Free tier available (or $5/month for production)
- ✅ One-click deploy from GitHub
- ✅ Automatic HTTPS/SSL
- ✅ No server management needed
- ✅ Works with Vercel seamlessly

### Setup Steps (5 minutes)

1. **Create Railway Account:**
   - Go to https://railway.app
   - Sign up with GitHub
   - Free tier includes $5 credit/month

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Navigate to bridge folder
   cd camera-bridge
   
   # Deploy
   railway init
   railway up
   ```

3. **Get the URL:**
   - Railway gives you a URL like: `camera-bridge-production.up.railway.app`
   - Copy this URL

4. **Configure Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://camera-bridge-production.up.railway.app:3001`
   - Or if Railway provides HTTPS: `wss://camera-bridge-production.up.railway.app`

5. **Configure Camera:**
   - **Problem:** Camera is on private network (`192.168.x.x`)
   - **Solution:** Camera needs to reach Railway server
     - Option A: If camera has internet access, use Railway's public URL
     - Option B: Run a small local bridge on client's network (see below)

---

## 🏠 Alternative: Client's Local Computer/Server

If your client has a computer/server on-site where the camera is:

### Option A: Run on Client's Windows PC

1. **Install Node.js** on client's computer
2. **Copy `camera-bridge` folder** to their computer
3. **Create startup script** so it runs automatically:

**Windows (startup.bat):**
```batch
@echo off
cd C:\path\to\camera-bridge
node server.js
```

4. **Add to Windows Startup:**
   - Press `Win+R`, type `shell:startup`
   - Copy `startup.bat` there
   - Or use Task Scheduler to run on boot

5. **Use ngrok/Cloudflare Tunnel** to expose to Vercel:
   ```bash
   ngrok http 3001
   # Or Cloudflare Tunnel (better for production)
   ```

### Option B: Raspberry Pi (Best for Permanent Installation)

**Cost:** ~$50 one-time

1. **Buy Raspberry Pi 4** (or any small Linux device)
2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Deploy bridge:**
   ```bash
   cd camera-bridge
   npm install --production
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Expose with Cloudflare Tunnel** (free, reliable):
   ```bash
   # Install Cloudflare T2. **Deploy Bridge Service:**
unnel
   # Configure tunnel
   # Get public URL
   ```

5. **Update Vercel env var** with Cloudflare Tunnel URL

**Pros:**
- ✅ Low power (runs 24/7)
- ✅ Small footprint
- ✅ One-time cost
- ✅ No monthly fees

---

## ☁️ Alternative: Render.com (Free Tier)

Similar to Railway, but with a free tier:

1. **Sign up:** https://render.com
2. **Create Web Service**
3. **Connect GitHub repo**
4. **Settings:**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: `Node`
5. **Get URL** and configure Vercel

**Note:** Free tier spins down after inactivity. For production, need paid plan ($7/month).

---

## 🔧 Hybrid Solution: Local Bridge + Cloud Tunnel

**Best of both worlds:**

1. **Run bridge locally** on client's network (Windows PC, Raspberry Pi, or small server)
2. **Use Cloudflare Tunnel** (free) to expose WebSocket to Vercel
3. **Camera connects directly** to local bridge (fast, reliable)
4. **Vercel connects** via Cloudflare Tunnel (secure, free)

### Setup:

1. **On client's local machine:**
   ```bash
   cd camera-bridge
   npm install --production
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

2. **Install Cloudflare Tunnel:**
   ```bash
   # Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   # Or use Docker
   ```

3. **Configure tunnel** to expose port 3001

4. **Get tunnel URL** and add to Vercel env vars

5. **Camera uses local IP** (e.g., `192.168.1.50:3002`)

---

## 💰 Cost Comparison

| Solution | Setup Cost | Monthly Cost | Reliability | Client-Friendly |
|----------|------------|--------------|-------------|-----------------|
| **Railway.app** | Free | $0-5 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Render.com** | Free | $0-7 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Raspberry Pi + Cloudflare** | $50 | $0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Client's PC + ngrok** | Free | $0-8 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **VPS (DigitalOcean)** | Free | $6 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 My Recommendation for Your Client

**Best Option: Railway.app**

**Why?**
1. ✅ **Easiest setup** - 5 minutes, no server management
2. ✅ **Free tier** - $5 credit/month (usually enough)
3. ✅ **Automatic HTTPS** - No SSL certificate setup
4. ✅ **GitHub integration** - Easy updates
5. ✅ **Client-friendly** - They don't need to manage anything

**However, there's one challenge:**
- Camera is on private network (`192.168.x.x`)
- Railway server is on the internet
- Camera needs to reach Railway

**Solutions:**
1. **If camera has internet access:** Configure camera to push to Railway's public URL
2. **If camera is isolated:** Use hybrid approach (local bridge + tunnel)

---

## 📋 Quick Setup Guide for Railway

### Step 1: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd camera-bridge
railway init
railway up
```

### Step 2: Get Railway URL

Railway will give you a URL like:
- `camera-bridge-production.up.railway.app`

### Step 3: Configure Ports

Railway uses environment variables for ports. Create `railway.json` or set in Railway dashboard:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Set environment variables in Railway:
- `HTTP_PORT=3002`
- `WS_PORT=3001`

### Step 4: Configure Vercel

Add to Vercel environment variables:
```
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://camera-bridge-production.up.railway.app:3001
```

### Step 5: Configure Camera

**If camera can reach internet:**
- Server address: `camera-bridge-production.up.railway.app`
- Port: `3002` (or Railway's assigned port)
- Path: `/plate`

**If camera is isolated (private network only):**
- You'll need a local bridge on client's network
- Use Railway for WebSocket only, or use Cloudflare Tunnel instead

---

## 🚀 Even Simpler: Use Vercel Serverless Functions?

**Wait, can we use Vercel API routes instead?**

Unfortunately, **no** because:
- ❌ Vercel functions are serverless (timeout after ~10 seconds)
- ❌ Can't maintain WebSocket connections
- ❌ Camera needs to push to a persistent endpoint
- ❌ WebSocket requires long-lived connection

**But we could:**
- Use Vercel API route to receive camera pushes (HTTP POST)
- Store in database
- Frontend polls database or uses Server-Sent Events

**However:** This loses real-time WebSocket benefits and adds latency.

---

## ✅ Final Recommendation

**For your client, I recommend:**

1. **Railway.app** (easiest, no server management)
   - Free tier available
   - 5-minute setup
   - Automatic HTTPS
   - Works with Vercel

2. **If camera can't reach internet:** Hybrid approach
   - Local bridge on client's network (Raspberry Pi or their PC)
   - Cloudflare Tunnel to expose to Vercel
   - One-time setup, then it just works

Would you like me to create a step-by-step Railway deployment guide, or help set up the hybrid solution?
