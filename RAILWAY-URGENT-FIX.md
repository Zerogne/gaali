# URGENT: Fix Railway Still Using Root Directory

Railway is **still** trying to build from the root (pnpm) instead of `camera-bridge` (npm).

## Quick Fix Options:

### Option 1: Set Environment Variable (Easiest)

1. **In Railway Dashboard:**

   - Go to your service
   - Click **"Variables"** tab
   - Click **"New Variable"**
   - Name: `RAILWAY_SERVICE_ROOT`
   - Value: `camera-bridge`
   - Click **Save**

2. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"**

### Option 2: Use Railway CLI (If UI doesn't work)

```bash
npm install -g @railway/cli
railway login
railway link
railway variables set RAILWAY_SERVICE_ROOT=camera-bridge
railway up
```

### Option 3: Modify Build Command (Workaround)

If Root Directory still doesn't work, force it in the build command:

1. **In Railway Settings:**

   - Go to **"Settings"** tab
   - Find **"Build Command"** or **"Deploy"** section
   - Set Build Command to:
     ```
     cd camera-bridge && npm install --production
     ```
   - Set Start Command to:
     ```
     cd camera-bridge && node server.js
     ```
   - Save

2. **Redeploy**

### Option 4: Create railway.toml in Root (Alternative)

I've created `railway.toml` in the root that forces Railway to:

- Change to `camera-bridge` directory
- Run `node server.js`

**Push this file:**

```bash
git add railway.toml
git commit -m "Add railway.toml to force camera-bridge directory"
git push
```

Then redeploy in Railway.

---

## Verify It's Working

After applying any fix, check Railway logs:

1. Go to **"Deployments"** tab
2. Click on latest deployment
3. Check **"Logs"**

**You should see:**

- ✅ `npm install` (NOT `pnpm install`)
- ✅ `cd camera-bridge` (if using workaround)
- ✅ `🚀 HTTP Server running on...`

**If you still see:**

- ❌ `pnpm install` → Root Directory not set correctly
- ❌ `ERR_PNPM_OUTDATED_LOCKFILE` → Still building from root

---

## Why This Happens

Railway detects build tools from the **root** of your repo:

- Sees `pnpm-lock.yaml` → Uses pnpm
- Sees `package.json` in root → Tries to build from root

**Solution:** Tell Railway to **ignore the root** and only look in `camera-bridge` folder.

---

## Recommended: Use Environment Variable

The **easiest and most reliable** method:

1. **Variables** tab → Add `RAILWAY_SERVICE_ROOT=camera-bridge`
2. **Redeploy**
3. **Check logs** → Should see `npm install` now

This is the official Railway way to set root directory.
