# Finding Your INGEST_SECRET

## The Secret Name

The camera upload endpoint accepts **either**:
- `INGEST_SECRET` (new, recommended)
- `LPR_INGEST_SECRET` (legacy, also works)

**Code checks both:**
```typescript
const expectedSecret = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;
```

## Where to Find/Set It

### Option 1: Check Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for either:
   - `INGEST_SECRET`
   - `LPR_INGEST_SECRET`
3. If you see one, that's your secret! Copy it.

### Option 2: Check Your Electron App

In your Electron app, check:
- `.env` file
- Environment variables
- Configuration file

Look for:
```env
LPR_INGEST_SECRET=...
# or
INGEST_SECRET=...
```

### Option 3: Generate a New Secret

If you don't have one, generate a secure random secret:

```bash
# Generate a secure random secret (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use this online tool: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

**Recommended length:** At least 16 characters, preferably 32+ characters.

## Setting It Up

### Step 1: Set in Vercel

**Via Vercel Dashboard:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Key: `INGEST_SECRET` (or `LPR_INGEST_SECRET`)
4. Value: Your secret (paste it)
5. Environments: Select all (Production, Preview, Development)
6. Click "Save"

**Via Vercel CLI:**
```bash
vercel env add INGEST_SECRET production
# Paste your secret when prompted
```

### Step 2: Set in Electron App

**In your Electron app's `.env` file:**
```env
SITE_URL=https://gaali.vercel.app
INGEST_SECRET=your-secret-here-same-as-vercel
# or
LPR_INGEST_SECRET=your-secret-here-same-as-vercel
```

**Or in your Electron app code:**
```javascript
process.env.INGEST_SECRET = 'your-secret-here';
// or
process.env.LPR_INGEST_SECRET = 'your-secret-here';
```

### Step 3: Verify They Match

**Important:** The secret in Electron app **MUST match** the secret in Vercel exactly!

- Same value
- Same case (case-sensitive)
- No extra spaces
- No quotes (unless part of the secret)

## Testing

### Test if Secret is Set in Vercel

```bash
# This should return 401 if secret is missing, or 400 if secret is wrong
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer wrong-secret" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg

# If you get 401, secret might not be set
# If you get 400, secret is set but wrong
```

### Test with Correct Secret

```bash
# Replace YOUR_SECRET with your actual secret
curl -X POST "https://gaali.vercel.app/api/camera/upload?camera=1" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg

# Should return: {"ok": true, "cameraId": "1", "ts": ...}
```

## Common Issues

### Issue: "401 Unauthorized"

**Possible causes:**
1. Secret not set in Vercel
2. Secret doesn't match between Electron and Vercel
3. Authorization header not sent correctly

**Fix:**
1. Check Vercel Dashboard → Environment Variables
2. Verify secret is set
3. Check Electron app is sending: `Authorization: Bearer <secret>`
4. Ensure secrets match exactly

### Issue: "LPR_INGEST_SECRET not configured" (500 error)

**Cause:** Secret is not set in Vercel at all.

**Fix:**
1. Go to Vercel Dashboard → Environment Variables
2. Add `INGEST_SECRET` or `LPR_INGEST_SECRET`
3. Redeploy (or wait for auto-deploy)

## Quick Check Commands

### Check Vercel Environment Variables

```bash
# Via Vercel CLI
vercel env ls

# Look for INGEST_SECRET or LPR_INGEST_SECRET
```

### Check Electron App

```javascript
// In Electron app console
console.log('INGEST_SECRET:', process.env.INGEST_SECRET ? 'SET' : 'NOT SET');
console.log('LPR_INGEST_SECRET:', process.env.LPR_INGEST_SECRET ? 'SET' : 'NOT SET');
```

## Recommendation

**Use `INGEST_SECRET`** (not `LPR_INGEST_SECRET`) for new setups:
- Cleaner name
- More generic (works for camera uploads, weight, etc.)
- Code supports both, but `INGEST_SECRET` is preferred

If you already have `LPR_INGEST_SECRET` set up, you can keep using it - the code supports both!
