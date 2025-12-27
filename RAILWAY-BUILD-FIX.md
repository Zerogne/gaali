# Fix Railway Build Failures

## The Problem

Railway is trying to build from the **root** directory (which uses `pnpm`) instead of the `camera-bridge` folder (which uses `npm`).

## Solution: Set Root Directory in Railway

### Step 1: Set Environment Variable (REQUIRED)

**In Railway Dashboard:**

1. Go to your **service**
2. Click **"Variables"** tab
3. Add new variable:
   - **Name:** `RAILWAY_SERVICE_ROOT`
   - **Value:** `camera-bridge`
4. **Save**

### Step 2: Clear Build Command Override

**In Railway Settings:**

1. Go to **"Settings"** tab
2. Find **"Build Command"** (or "Deploy" → "Build Command")
3. **Clear it** (leave it empty) - Railway will auto-detect from `camera-bridge/package.json`
4. Find **"Start Command"**
5. Set to: `node server.js` (Railway will run this from `camera-bridge` folder automatically)
6. **Save**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** (or delete and recreate the service)
3. Check logs - should now see `npm install` instead of `pnpm install`

---

## Alternative: Use Railway CLI

If the UI doesn't work:

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

# Clear build command (if set)
railway variables unset RAILWAY_BUILD_COMMAND

# Set start command
railway variables set RAILWAY_START_COMMAND="node server.js"

# Redeploy
railway up
```

---

## Why Builds Are Failing

Railway's auto-detection:
1. Sees `pnpm-lock.yaml` in root → Tries to use pnpm
2. Sees root `package.json` → Tries to build Next.js app
3. **Ignores** `camera-bridge` folder unless `RAILWAY_SERVICE_ROOT` is set

**The fix:** Set `RAILWAY_SERVICE_ROOT=camera-bridge` environment variable.

---

## Verify It's Fixed

After setting the environment variable and redeploying:

1. Check **"Deployments"** → **"Logs"**
2. You should see:
   ```
   ✅ npm install (NOT pnpm install)
   ✅ 🚀 HTTP Server running on...
   ```

3. If you still see:
   ```
   ❌ pnpm install
   ❌ ERR_PNPM_OUTDATED_LOCKFILE
   ```
   → The environment variable is NOT set correctly

---

## Quick Checklist

- [ ] Set `RAILWAY_SERVICE_ROOT=camera-bridge` in Variables
- [ ] Clear/remove Build Command override in Settings
- [ ] Set Start Command to `node server.js` (or leave empty)
- [ ] Redeploy service
- [ ] Check logs - should see `npm install`
- [ ] Verify server starts successfully

---

## If Still Failing

1. **Delete the service** in Railway
2. **Create a new service** from GitHub repo
3. **IMMEDIATELY** set `RAILWAY_SERVICE_ROOT=camera-bridge` **before** first deploy
4. Then deploy

Sometimes Railway caches the root directory detection, so starting fresh helps.

