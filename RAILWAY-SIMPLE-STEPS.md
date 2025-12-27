# Railway Simple Steps - Camera Bridge

## The Process (Step by Step)

### What You're Doing:

You're creating a **new service** that will deploy the `camera-bridge` folder from your GitHub repo.

---

## Step-by-Step:

### Step 1: Create New Service

1. In Railway, click **"+ New"** button
2. You'll see options like:

   - **"Empty Service"**
   - **"GitHub Repo"**
   - **"Template"**
   - etc.

3. **Select "GitHub Repo"** (NOT "Empty Service")
4. Choose your `gaali` repository
5. Railway will create a service and start deploying

### Step 2: Configure Root Directory

**After Railway creates the service**, you need to tell it to use the `camera-bridge` folder:

**Method A: During Creation (If Available)**

- When you select the repo, Railway might show a configuration screen
- Look for **"Root Directory"** or **"Source Path"**
- Set to: `camera-bridge`

**Method B: After Service is Created**

1. Click on your **service** (the card that appeared)
2. Go to **"Settings"** tab
3. Find **"Root Directory"** (might be under "Source" or "Build" section)
4. Set to: `camera-bridge`
5. Save

**Method C: Using Environment Variable**

1. Go to **"Variables"** tab in your service
2. Add new variable:
   - Name: `RAILWAY_SERVICE_ROOT`
   - Value: `camera-bridge`

### Step 3: Set Start Command

1. In **Settings** tab
2. Find **"Start Command"** or **"Command"**
3. Set to: `node server.js`
4. Save

### Step 4: Add Environment Variables

In **Variables** tab, add:

- `HTTP_PORT` = `3002`
- `WS_PORT` = `3001`
- `NODE_ENV` = `production`

### Step 5: Generate Domain

1. In **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `camera-bridge-production.up.railway.app`)

---

## Important Notes:

✅ **DO:** Select "GitHub Repo" when creating service  
❌ **DON'T:** Select "Empty Service" (that's for manual setup)

✅ **DO:** Set Root Directory to `camera-bridge`  
❌ **DON'T:** Leave it empty (Railway will try to deploy from root)

---

## If You Already Created an Empty Service:

1. Go to your service
2. In **Settings** tab
3. Look for **"Connect Repo"** or **"Source"** section
4. Connect your GitHub repo
5. Then set Root Directory to `camera-bridge`

---

## Quick Checklist:

- [ ] Created service from "GitHub Repo" (not empty)
- [ ] Set Root Directory to `camera-bridge`
- [ ] Set Start Command to `node server.js`
- [ ] Added environment variables (HTTP_PORT, WS_PORT, NODE_ENV)
- [ ] Generated public domain
- [ ] Deployment successful (green status)
- [ ] Updated Vercel with Railway URL

---

## What Railway Will Do:

1. Clone your GitHub repo
2. Look in the `camera-bridge` folder (because you set Root Directory)
3. Run `npm install` (automatic)
4. Run `node server.js` (your start command)
5. Expose it on a public domain

---

## Troubleshooting:

**If deployment fails:**

- Check **Deployments** tab → **Logs**
- Common issues:
  - Root Directory not set → Railway can't find `package.json`
  - Start command wrong → Service won't start
  - Missing dependencies → Check `package.json`

**If you can't find Root Directory:**

- Use the environment variable method: `RAILWAY_SERVICE_ROOT=camera-bridge`
- Or use Railway CLI (see RAILWAY-QUICK-SETUP.md)
