# Quick Setup: Upstash Redis

## ✅ Migration Complete

Code has been migrated from `@vercel/kv` to `@upstash/redis`.

---

## What You Need to Do

### 1. Create Upstash Redis (if not already done)

**Via Vercel Dashboard:**
1. Go to **Vercel Dashboard** → Your Project
2. Click **Storage** tab
3. Click **Create Database** → Select **Upstash Redis**
4. Name it: `gaali-redis` (or any name)
5. Click **Create**
6. ✅ **Done!** Vercel automatically adds env vars

### 2. Verify Environment Variables

After creating Upstash Redis, Vercel **automatically** adds:

- ✅ `UPSTASH_REDIS_REST_URL`
- ✅ `UPSTASH_REDIS_REST_TOKEN`

**To verify:**
1. Vercel Dashboard → Settings → Environment Variables
2. You should see both variables listed

### 3. Set INGEST_SECRET (if not already)

1. Vercel Dashboard → Settings → Environment Variables
2. Add `INGEST_SECRET` with your secret value
3. Must match the secret in your Electron app

### 4. Redeploy

After setup, redeploy:

```bash
vercel --prod
```

Or push a commit to trigger auto-deploy.

---

## NPM Packages

✅ **Installed:** `@upstash/redis`
❌ **Removed:** `@vercel/kv`

---

## Environment Variables Checklist

Required in Vercel:

- [ ] `UPSTASH_REDIS_REST_URL` (auto-added when creating Upstash Redis)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (auto-added when creating Upstash Redis)
- [ ] `INGEST_SECRET` (you must set this manually)
- [ ] `BLOB_READ_WRITE_TOKEN` (for Vercel Blob - separate setup)

---

## Test It

```bash
# Test upload
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg

# Test latest
curl "https://gaali.vercel.app/api/camera/latest?camera=1"
```

---

## Troubleshooting

**Error: "Missing UPSTASH_REDIS_REST_URL"**
→ Create Upstash Redis in Vercel Dashboard

**Error: "401 Unauthorized"**
→ Set `INGEST_SECRET` in Vercel Dashboard

**Error: "Redis.fromEnv() failed"**
→ Check env vars are set and redeploy

---

## Full Details

See `UPSTASH-REDIS-MIGRATION.md` for complete documentation.
