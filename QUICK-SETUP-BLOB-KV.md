# Quick Setup: Vercel Blob + KV

## Error You're Seeing

```
Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN
Vercel Blob: No token found. Either configure the BLOB_READ_WRITE_TOKEN
```

**This means:** Vercel Blob store and KV database haven't been created yet.

## Solution: Create Blob + KV (5 minutes)

### Step 1: Create Vercel Blob Store

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to **Vercel Dashboard** → Your Project
2. Click **Storage** tab (in the top menu)
3. Click **Create Database** → Select **Blob**
4. Name it: `gaali-camera-frames` (or any name)
5. Click **Create**
6. ✅ **Done!** Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your env vars

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Link your project (if not already linked)
vercel link

# Create Blob store
vercel blob create

# Follow prompts:
# - Name: gaali-camera-frames
# - Region: Choose closest to you
```

### Step 2: Create Vercel KV Database

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to **Vercel Dashboard** → Your Project
2. Click **Storage** tab
3. Click **Create Database** → Select **KV** (Redis)
4. Name it: `gaali-kv` (or any name)
5. Click **Create**
6. ✅ **Done!** Vercel automatically adds:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

**Option B: Via Vercel CLI**

```bash
# Create KV database
vercel kv create

# Follow prompts:
# - Name: gaali-kv
# - Region: Choose closest to you
```

### Step 3: Verify Environment Variables

After creating Blob and KV, Vercel **automatically** adds these to your project:

**Blob:**
- `BLOB_READ_WRITE_TOKEN` ✅

**KV:**
- `KV_REST_API_URL` ✅
- `KV_REST_API_TOKEN` ✅

**To verify:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. You should see all 3 variables listed

### Step 4: Redeploy (or wait for auto-deploy)

After creating Blob and KV:

**Option A: Wait for auto-deploy**
- Vercel will automatically redeploy when env vars change
- Wait 1-2 minutes

**Option B: Manual redeploy**
```bash
# Trigger a new deployment
vercel --prod

# Or push a commit
git commit --allow-empty -m "Trigger deploy after Blob+KV setup"
git push
```

### Step 5: Test Again

After redeploy, test the upload:

```bash
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

**Should now work!** ✅

---

## Visual Guide

### Vercel Dashboard → Storage Tab

```
┌─────────────────────────────────────┐
│  Vercel Dashboard                   │
│  ┌───────────────────────────────┐  │
│  │  Storage                      │  │  ← Click here
│  └───────────────────────────────┘  │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Create       │  │ Create       │ │
│  │ Database     │  │ Database     │ │
│  └──────────────┘  └──────────────┘ │
│       ↓                  ↓            │
│   [Blob]            [KV/Redis]       │
└─────────────────────────────────────┘
```

### After Creating

```
Environment Variables (auto-added):
✅ BLOB_READ_WRITE_TOKEN
✅ KV_REST_API_URL
✅ KV_REST_API_TOKEN
```

---

## Troubleshooting

### Issue: "Storage" tab not visible

**Cause:** You might not have access or need to upgrade plan.

**Fix:**
- Check you're on the correct project
- Free tier supports Blob + KV (with limits)
- If still not visible, check Vercel account permissions

### Issue: Can't create Blob/KV

**Possible causes:**
- Account limits reached
- Payment method required (for Pro tier)
- Region not available

**Fix:**
- Check Vercel account status
- Try different region
- Contact Vercel support if needed

### Issue: Environment variables not appearing

**Fix:**
1. Wait 1-2 minutes (Vercel needs time to sync)
2. Refresh the Environment Variables page
3. Check if variables are in a different environment (Production vs Preview)
4. Try creating Blob/KV again

### Issue: Still getting errors after setup

**Fix:**
1. **Redeploy** - Environment variables only apply to new deployments
   ```bash
   vercel --prod
   ```
2. **Check variables exist:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all 3 variables are there
3. **Check variable names:**
   - Must be exactly: `BLOB_READ_WRITE_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
   - Case-sensitive!

---

## Cost (Free Tier)

**Vercel Blob (Free Tier):**
- 1 GB storage
- 1 GB bandwidth/month
- ✅ Enough for testing/development

**Vercel KV (Free Tier):**
- 256 MB storage
- 30M commands/month
- ✅ More than enough for camera frames

**For production (2 cameras @ 10 fps):**
- Blob: ~$0.01/month (overwrites same file)
- KV: ~$1.73/month (3.46M commands/day)
- **Total: ~$1.74/month** (very affordable!)

---

## Quick Checklist

- [ ] Created Vercel Blob store
- [ ] Created Vercel KV database
- [ ] Verified environment variables are set (Dashboard → Settings → Environment Variables)
- [ ] Redeployed (or waited for auto-deploy)
- [ ] Tested upload endpoint
- [ ] No more errors! ✅

---

## Next Steps

Once Blob + KV are set up:

1. ✅ **Set `INGEST_SECRET`** (if not already done)
   - Vercel Dashboard → Settings → Environment Variables
   - Add `INGEST_SECRET` with your secret value

2. ✅ **Update Electron app**
   - Set `INGEST_SECRET` in Electron app's environment
   - Must match Vercel's `INGEST_SECRET`

3. ✅ **Test end-to-end**
   - Electron app uploads frames
   - Browser shows camera preview
   - No errors in Vercel logs

---

## Summary

**The errors mean:**
- ❌ Blob store not created → Create it
- ❌ KV database not created → Create it

**The fix:**
1. Create Blob store (Dashboard → Storage → Create Database → Blob)
2. Create KV database (Dashboard → Storage → Create Database → KV)
3. Wait for auto-deploy (or manually redeploy)
4. ✅ Done!

**Time needed:** ~5 minutes

After this, your camera upload should work! 🎉
