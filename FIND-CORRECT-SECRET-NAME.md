# Find the Correct Secret Environment Variable Name

## Current Code Checks For:

The camera upload endpoint checks for **either**:
- `INGEST_SECRET` 
- `LPR_INGEST_SECRET`

Line 112 in `app/api/camera/upload/route.ts`:
```typescript
const expectedSecret = process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET;
```

## What You Need to Do:

### Option 1: Check What's Actually Set in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for **any** variable that contains "SECRET", "AUTH", or "TOKEN"
3. Find the one that has the value: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`
4. **That's your secret name!**

### Option 2: Check All Possible Names

The codebase uses these secret names:

**Camera Upload (`/api/camera/upload`):**
- `INGEST_SECRET` ✅
- `LPR_INGEST_SECRET` ✅

**LPR Ingest (`/api/lpr/ingest`):**
- `LPR_INGEST_SECRET` ✅

**Weight Ingest (`/api/weight/ingest`):**
- `INGEST_SECRET` ✅

**Camera Events:**
- `CAMERA_AUTH` (different - for camera IP auth)

### Option 3: Use What License Plates Use

Since license plates work, check what secret name they use. The LPR ingest endpoint uses:
- `LPR_INGEST_SECRET`

So if license plates work, your secret is probably set as `LPR_INGEST_SECRET` in Vercel.

---

## Quick Check: What Name Does License Plates Use?

If license plates are working, they use `LPR_INGEST_SECRET`. So:

**Your secret name is probably:** `LPR_INGEST_SECRET`

**And the code will find it because:**
```typescript
process.env.INGEST_SECRET || process.env.LPR_INGEST_SECRET
// If LPR_INGEST_SECRET is set, it will use that!
```

---

## Fix: Update Code to Use the Correct Name

If you have a different name, tell me what it is and I'll update the code.

Or, if you want to use a specific name, we can update the code to check for that name.

---

## Quick Answer

**Based on your codebase:**
- The camera upload accepts: `INGEST_SECRET` OR `LPR_INGEST_SECRET`
- License plates use: `LPR_INGEST_SECRET`
- So **use `LPR_INGEST_SECRET`** - it works for both!

**In Vercel Dashboard, make sure you have:**
- Key: `LPR_INGEST_SECRET`
- Value: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`

**In Electron app, use:**
```javascript
const INGEST_SECRET = process.env.LPR_INGEST_SECRET; // This is what license plates use
```
