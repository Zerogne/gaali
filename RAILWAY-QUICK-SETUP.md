# Railway Quick Setup - Camera Bridge

## Simple Steps (Updated for Current Railway UI)

### Step 1: Create New Service

1. Log into Railway: https://railway.app
2. You should see your **Project** (the one with your GitHub repo)
3. Click **"+ New"** button (top right) or **"New Service"**
4. Select **"GitHub Repo"**
5. Choose your `gaali` repository

### Step 2: Set Root Directory (Where to Find It)

Railway's UI might vary, but try these locations:

**Location 1: During Service Creation**

- When you select the repo, Railway might show a **"Configure"** or **"Settings"** button
- Click it and look for **"Root Directory"** or **"Source Path"**
- Set to: `camera-bridge`

**Location 2: In Service Settings (After Creation)**

1. Click on your **service** (the card/box that appeared)
2. Click **"Settings"** tab (top menu)
3. Look for:
   - **"Root Directory"**
   - **"Source"** → **"Root Directory"**
   - **"Build"** → **"Root Directory"**
   - **"Deploy"** → **"Root Directory"**

**Location 3: In Variables (Sometimes Here)**

1. Click **"Variables"** tab
2. Look for `RAILWAY_SERVICE_ROOT` variable
3. If it exists, set value to: `camera-bridge`
4. If it doesn't exist, create it:
   - Click **"New Variable"**
   - Name: `RAILWAY_SERVICE_ROOT`
   - Value: `camera-bridge`

**Location 4: Use railway.json (Automatic)**

- The `camera-bridge/railway.json` file I created should help
- Railway might auto-detect it
- If not, the Root Directory setting is still needed

### Step 3: Set Start Command

1. In your **service**, go to **"Settings"** tab
2. Find **"Deploy"** section
3. Look for **"Start Command"** or **"Command"**
4. Set to: `node server.js`
5. Save

### Step 4: Add Environment Variables

1. Click **"Variables"** tab in your service
2. Click **"New Variable"** (or **"Raw Editor"**)
3. Add these three variables:

```
HTTP_PORT=3002
WS_PORT=3001
NODE_ENV=production
```

### Step 5: Generate Public Domain

1. In **Settings** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** or **"Public Networking"**
4. Railway will create a URL like: `camera-bridge-production.up.railway.app`
5. Copy this URL

### Step 6: Deploy

Railway should auto-deploy. If not:

1. Go to **"Deployments"** tab
2. Click **"Deploy"** or **"Redeploy"**
3. Wait for it to finish (green checkmark)

### Step 7: Check Logs

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Check **"Logs"** tab
4. You should see: `🚀 HTTP Server running on...`

### Step 8: Update Vercel

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://your-railway-url.up.railway.app
```

Replace `your-railway-url` with your actual Railway domain.

---

## If You Can't Find Root Directory

**Try this alternative approach:**

1. **Create the service normally** (Railway will deploy from root)
2. **Check if it works** - Railway might auto-detect the `camera-bridge` folder
3. **If it doesn't work**, Railway will show errors in logs
4. **Then use Railway CLI** to set root directory:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your service
cd camera-bridge
railway link

# Set root directory
railway variables set RAILWAY_SERVICE_ROOT=camera-bridge

# Or use the service command
railway service
# Then select your service and set root directory
```

---

## What Railway Shows You

When you create a service, Railway shows:

- **Service name** (you can rename it to "camera-bridge")
- **Status** (building, deploying, running)
- **URL** (after domain is generated)

Click on the **service card** to see:

- **Overview** tab (status, logs)
- **Deployments** tab (deployment history)
- **Variables** tab (environment variables)
- **Settings** tab (configuration - this is where Root Directory should be)
- **Metrics** tab (usage stats)

---

## Still Can't Find It?

**Screenshot locations to check:**

1. When creating service → Look for "Configure" or "Advanced" button
2. Service Settings → Scroll through all sections
3. Service Settings → "Source" or "Build" section
4. Service Settings → "Deploy" section

**Or tell me:**

- What tabs/sections you see in your service settings
- I can guide you to the exact location

---

## Quick Test

After deployment, test if it's working:

```bash
# Test health endpoint
curl https://your-railway-url.up.railway.app/health

# Should return: {"status":"ok"}
```

If it works, Railway found the right folder! If not, we need to set Root Directory.
