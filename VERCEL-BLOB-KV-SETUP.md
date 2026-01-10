# Vercel Blob + KV Setup Guide

## Why Blob + KV Instead of In-Memory Map?

### Problem with In-Memory Storage
The previous implementation used a `Map` in memory to store frames:
```typescript
const latestFrames = new Map<string, { frameBase64: string; timestamp: number }>();
```

**Why this fails in production:**
1. **Serverless Functions are Stateless**: Each API request may hit a different serverless function instance. There's no shared memory between requests.
2. **Cold Starts**: New instances start with empty memory, losing all stored frames.
3. **Base64 Overhead**: Storing base64-encoded JPEGs in memory is inefficient (33% larger than binary).
4. **No Persistence**: Server restart = data loss.
5. **Limited Memory**: Serverless functions have memory limits. Storing frames can exhaust memory quickly.

### Solution: Vercel Blob + KV

**Vercel Blob:**
- Stores binary JPEG files persistently
- Public URLs for direct `<img>` access
- No base64 encoding overhead
- Scales automatically
- CDN-backed (fast global delivery)

**Vercel KV (Redis):**
- Stores frame pointers (URL + timestamp) as lightweight JSON
- Shared across all serverless function instances
- Fast lookups (~1ms)
- Persistent storage
- Built-in expiration support

**Architecture:**
```
Electron → POST binary JPEG → Blob (cameras/1/latest.jpg) → KV (pointer: {url, ts})
Browser → GET /api/camera/latest → KV (read pointer) → <img src={blobUrl}>
```

---

## Environment Variables

### Required in Vercel Dashboard

1. **`INGEST_SECRET`** (or reuse `LPR_INGEST_SECRET`)
   - **Description**: Secret token for authenticating Electron app uploads
   - **Example**: `your-secret-token-here-12345`
   - **Where to set**: Vercel Dashboard → Project → Settings → Environment Variables
   - **Environments**: Production, Preview, Development

2. **`BLOB_READ_WRITE_TOKEN`**
   - **Auto-provided by Vercel** when Blob is enabled
   - **How to get**: Vercel Dashboard → Storage → Blob → Your Store → Settings → Tokens
   - **Note**: Created automatically if Blob store is set up

3. **`KV_REST_API_URL`**
   - **Auto-provided by Vercel** when KV is enabled
   - **How to get**: Vercel Dashboard → Storage → KV → Your Database → Settings → API URL

4. **`KV_REST_API_TOKEN`**
   - **Auto-provided by Vercel** when KV is enabled
   - **How to get**: Vercel Dashboard → Storage → KV → Your Database → Settings → API Token

5. **`KV_REST_API_READ_ONLY_TOKEN`** (optional)
   - Only needed if you want read-only access from client-side code
   - Not required for this implementation

---

## Setup Steps

### 1. Create Vercel Blob Store

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Link your project (if not already linked)
vercel link

# Create Blob store
vercel blob create
```

Or via Vercel Dashboard:
1. Go to your project → Storage → Blob
2. Click "Create Store"
3. Name it (e.g., `gaali-camera-frames`)
4. Note: Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your env vars

### 2. Create Vercel KV Database

```bash
# Create KV database
vercel kv create
```

Or via Vercel Dashboard:
1. Go to your project → Storage → KV
2. Click "Create Database"
3. Name it (e.g., `gaali-kv`)
4. Note: Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your env vars

### 3. Verify Environment Variables

After creating Blob and KV, verify these are set in Vercel:

```bash
# Check env vars (via Vercel CLI)
vercel env ls

# Or check in Dashboard:
# Settings → Environment Variables
```

You should see:
- `BLOB_READ_WRITE_TOKEN` ✅
- `KV_REST_API_URL` ✅
- `KV_REST_API_TOKEN` ✅
- `INGEST_SECRET` (you need to set this manually) ⚠️

### 4. Set INGEST_SECRET

```bash
# Via CLI
vercel env add INGEST_SECRET production
# Paste your secret when prompted

# Or via Dashboard:
# Settings → Environment Variables → Add New
# Key: INGEST_SECRET
# Value: your-secret-here
# Environments: Production, Preview, Development
```

### 5. Update Electron App Environment

In your Electron app's `.env` or environment configuration:

```env
SITE_URL=https://gaali.vercel.app
INGEST_SECRET=your-secret-here-same-as-vercel
UPLOAD_FPS=10
```

---

## Cost Considerations

### Vercel Blob Pricing (as of 2024)
- **Free Tier**: 1 GB storage, 1 GB bandwidth/month
- **Pro Tier**: $0.15/GB storage, $0.15/GB bandwidth

**Example calculation (2 cameras, 10 fps):**
- Frame size: ~50KB average
- Frames per day: 2 cameras × 10 fps × 3600s × 24h = 1,728,000 frames
- Storage per day: 1,728,000 × 50KB = 86.4 GB (overwrites same file, so ~100KB actual)
- Bandwidth per day: 1,728,000 × 50KB = 86.4 GB (for browser requests)

**Note**: Since we overwrite `latest.jpg`, storage stays constant (~100KB). Bandwidth depends on browser polling frequency.

### Vercel KV Pricing (as of 2024)
- **Free Tier**: 256 MB storage, 30M commands/month
- **Pro Tier**: $0.20/GB storage, $0.05 per 100K commands

**Example calculation:**
- Each upload: 2 KV writes (rate limit + pointer) = ~200 bytes
- Commands per day: 1,728,000 uploads × 2 commands = 3.46M commands
- Storage: ~700KB/day (but KV auto-expires rate limit keys, so ~1KB actual)

**Total estimated cost (Pro Tier):**
- Blob: ~$13/month (86.4GB bandwidth)
- KV: ~$1.73/month (3.46M commands)
- **Total: ~$15/month for 2 cameras at 10 fps**

---

## Testing

### 1. Test Upload Endpoint

```bash
# Create a test JPEG file
# (or use an existing JPEG)

# Test upload
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer your-secret-here" \
  -H "Content-Type: image/jpeg" \
  -H "x-ts: $(date +%s%3N)" \
  --data-binary @test.jpg
```

Expected response:
```json
{
  "ok": true,
  "cameraId": "1",
  "ts": 1234567890123
}
```

### 2. Test Latest Endpoint

```bash
curl "https://gaali.vercel.app/api/camera/latest?camera=1"
```

Expected response:
```json
{
  "ok": true,
  "cameraId": "1",
  "url": "https://xxxxx.public.blob.vercel-storage.com/cameras/1/latest.jpg",
  "ts": 1234567890123,
  "stale": false
}
```

### 3. Test Rate Limiting

```bash
# Send 20 rapid requests (should get 429 after 15)
for i in {1..20}; do
  curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
    -H "Authorization: Bearer your-secret-here" \
    -H "Content-Type: image/jpeg" \
    --data-binary @test.jpg &
done
wait
```

Expected: First 15 succeed (200), remaining get 429 (Rate Limit Exceeded)

---

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not defined"
- **Solution**: Create Blob store via `vercel blob create` or Dashboard
- Verify env var is set: `vercel env ls`

### "KV_REST_API_URL is not defined"
- **Solution**: Create KV database via `vercel kv create` or Dashboard
- Verify env vars are set: `vercel env ls`

### "Unauthorized" (401) on upload
- **Solution**: Check `INGEST_SECRET` matches between Electron app and Vercel
- Verify header: `Authorization: Bearer <secret>`

### Blob URL returns 403 Forbidden
- **Solution**: Ensure `access: "public"` is set in `put()` call (already done in code)
- Check Blob store settings in Dashboard → Allow public access

### Rate limit too aggressive
- **Solution**: Adjust `MAX_UPLOADS_PER_SEC` in `/app/api/camera/upload/route.ts`
- Current: 15 uploads/sec per camera

### Images not updating in browser
- **Check**: Browser cache (add cache-busting query param - already implemented: `?t=${ts}`)
- **Check**: Poll interval (default 200ms, can be adjusted via prop)
- **Check**: Stale threshold (2 seconds - camera offline if no uploads for 2s)

---

## Migration from Old Implementation

If you're migrating from the old in-memory Map implementation:

1. **Deploy new code** (with Blob + KV routes)
2. **Set up Blob and KV** (see Setup Steps above)
3. **Update Electron app** to use binary upload (see `ELECTRON-BINARY-UPLOAD.js`)
4. **Update React component** (already done - uses `/api/camera/latest`)
5. **Remove old endpoint** (`/app/api/camera/frame/route.ts` - optional, can keep for backward compat)

The new endpoints (`/api/camera/upload` and `/api/camera/latest`) are separate, so the old endpoint can coexist during migration.

---

## Security Notes

1. **Blob URLs are Public**: By design, Blob URLs are publicly accessible. Anyone with the URL can view the frame.
   - **Mitigation**: URLs are not predictable (contain random IDs)
   - **Alternative**: Use tokenized URLs if needed (requires additional setup)

2. **Rate Limiting**: Prevents abuse but allows legitimate high-frequency uploads (up to 15/sec per camera).

3. **Authentication**: Only required for uploads (POST), not for reads (GET). This is intentional - frame URLs are meant to be accessible.

4. **Camera ID Validation**: Only "1" and "2" are accepted (allowlist).

---

## Performance Optimization

1. **CDN Caching**: Vercel Blob URLs are CDN-backed. Consider setting `Cache-Control` headers if needed (currently disabled for real-time updates).

2. **Polling Frequency**: Default 200ms (5 FPS display) is a balance between responsiveness and server load. Adjustable via `pollInterval` prop.

3. **Upload Frequency**: Default 10 FPS (100ms) from Electron is throttled by `UPLOAD_INTERVAL_MS` to prevent overwhelming the API.

4. **KV Expiration**: Rate limit keys expire after 2 seconds (auto-cleanup).
