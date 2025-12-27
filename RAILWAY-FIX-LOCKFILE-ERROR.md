# Fix Railway Lockfile Error

## The Problem

Railway is trying to build from the **root** of your repo (which uses `pnpm`), but you want it to build from the **`camera-bridge`** folder (which uses `npm`).

The error shows Railway detected `pnpm-lock.yaml` in the root and tried to use pnpm, but the lockfile is outdated.

## Solution: Configure Railway to Use camera-bridge Folder

### Option 1: Set Root Directory in Railway (Best)

1. **In Railway Dashboard:**

   - Go to your service
   - Click **"Settings"** tab
   - Find **"Root Directory"** (or **"Source"** → **"Root Directory"**)
   - Set to: `camera-bridge`
   - Save

2. **If Root Directory is not visible, use Environment Variable:**

   - Go to **"Variables"** tab
   - Add: `RAILWAY_SERVICE_ROOT` = `camera-bridge`
   - Save

3. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"**

### Option 2: Use Railway CLI

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

# Redeploy
railway up
```

### Option 3: Create railway.toml in Root (Alternative)

If Railway still can't find the root directory setting, create `railway.toml` in the **root** of your repo:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd camera-bridge && node server.js"
```

But this is less ideal - Option 1 is better.

---

## Why This Happens

Railway automatically detects:

- `package.json` in root → Uses npm/pnpm/yarn
- `pnpm-lock.yaml` in root → Uses pnpm
- `yarn.lock` in root → Uses yarn
- `package-lock.json` in root → Uses npm

Since your root has `pnpm-lock.yaml`, Railway tries to use pnpm for the whole repo.

**Solution:** Tell Railway to only look in the `camera-bridge` folder, which has its own `package.json` and uses `npm`.

---

## Verify It's Working

After setting Root Directory and redeploying:

1. **Check Railway Logs:**

   - Go to **"Deployments"** tab
   - Click on latest deployment
   - Check **"Logs"**
   - You should see: `npm install` (not `pnpm install`)
   - Then: `🚀 HTTP Server running on...`

2. **Test Health Endpoint:**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"ok"}`

---

## Files Created to Help

I've created:

- `camera-bridge/railway.json` - Railway config (updated)
- `camera-bridge/nixpacks.toml` - Nixpacks config (forces npm)

These files help Railway understand how to build, but **you still need to set Root Directory** in Railway's UI or via environment variable.

---

## Quick Fix Checklist

- [ ] Set Root Directory to `camera-bridge` in Railway Settings
- [ ] OR set `RAILWAY_SERVICE_ROOT=camera-bridge` environment variable
- [ ] Redeploy the service
- [ ] Check logs - should see `npm install` (not `pnpm install`)
- [ ] Verify deployment succeeds

---

## If Still Not Working

If Railway still tries to use pnpm after setting root directory:

1. **Check if Root Directory is actually set:**

   - Go to Settings → Check if `camera-bridge` is saved
   - Or check Variables → `RAILWAY_SERVICE_ROOT` exists

2. **Force npm in build command:**

   - In Settings → Build Command
   - Set to: `cd camera-bridge && npm install --production`

3. **Use Railway CLI to verify:**
   ```bash
   railway variables
   # Should show RAILWAY_SERVICE_ROOT=camera-bridge
   ```
