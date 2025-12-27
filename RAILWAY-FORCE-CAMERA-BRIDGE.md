# Force Railway to Use camera-bridge Folder

Railway is **still** building from root. Here's how to force it:

## Method 1: Set Environment Variable (MUST DO THIS)

**In Railway Dashboard:**

1. Go to your **service**
2. Click **"Variables"** tab
3. Add new variable:
   - **Name:** `RAILWAY_SERVICE_ROOT`
   - **Value:** `camera-bridge`
4. **Save**
5. **Redeploy**

This is the **official Railway way** to set root directory.

---

## Method 2: Override Build Command in Railway Settings

If environment variable doesn't work:

1. Go to **Settings** tab
2. Find **"Build Command"** (or "Deploy" → "Build Command")
3. Set to:
   ```
   cd camera-bridge && npm install --production
   ```
4. Find **"Start Command"**
5. Set to:
   ```
   cd camera-bridge && node server.js
   ```
6. **Save**
7. **Redeploy**

---

## Method 3: Use Railway CLI

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

# Verify it's set
railway variables

# Redeploy
railway up
```

---

## Why This Keeps Happening

Railway's auto-detection:
1. Sees `pnpm-lock.yaml` in root → Uses pnpm
2. Sees `package.json` in root → Tries to build from root
3. **Ignores** the `camera-bridge` folder unless you explicitly tell it

**Solution:** You **MUST** set `RAILWAY_SERVICE_ROOT=camera-bridge` environment variable.

---

## Verify It's Fixed

After setting the environment variable and redeploying:

1. Go to **"Deployments"** tab
2. Click on latest deployment
3. Check **"Logs"**

**You should see:**
```
✅ npm install (NOT pnpm install)
✅ 🚀 HTTP Server running on...
```

**If you still see:**
```
❌ pnpm install
❌ ERR_PNPM_OUTDATED_LOCKFILE
```
→ The environment variable is NOT set correctly

---

## Quick Checklist

- [ ] Go to Railway service → Variables tab
- [ ] Add `RAILWAY_SERVICE_ROOT` = `camera-bridge`
- [ ] Save
- [ ] Redeploy
- [ ] Check logs - should see `npm install` (not `pnpm install`)
- [ ] Verify server starts: `🚀 HTTP Server running on...`

---

## If Still Not Working

1. **Delete the service** in Railway
2. **Create a new service** from GitHub repo
3. **IMMEDIATELY** set `RAILWAY_SERVICE_ROOT=camera-bridge` before first deploy
4. Then deploy

Sometimes Railway caches the root directory detection, so starting fresh helps.

