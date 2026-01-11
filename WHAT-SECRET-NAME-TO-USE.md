# What Secret Environment Variable Name to Use

## Current Situation

**Camera Upload endpoint checks for:**
- `INGEST_SECRET` OR `LPR_INGEST_SECRET`

**LPR Ingest endpoint (license plates) uses:**
- `LPR_INGEST_SECRET` only

**Weight Ingest endpoint uses:**
- `INGEST_SECRET` only

---

## Which One Should You Use?

Since **license plates work** (you mentioned they work), they use:
- **`LPR_INGEST_SECRET`**

So that's probably what's set in your Vercel Dashboard.

---

## Check What's Actually Set in Vercel

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for variables that contain "SECRET" or "INGEST"
3. Find the one that has your secret value: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`
4. **Tell me the exact name** and I'll update the code to use it

---

## If You Want to Use `LPR_INGEST_SECRET` (Recommended)

Since license plates use `LPR_INGEST_SECRET` and they work, use the same:

**In Vercel Dashboard:**
- Key: `LPR_INGEST_SECRET`
- Value: `BmnNpCZXGcA/LGVSXnGXugqwV+/TFWagPZuBzzTdB9w=`

**In Electron App:**
```javascript
const INGEST_SECRET = process.env.LPR_INGEST_SECRET;
```

**The camera upload code already checks for `LPR_INGEST_SECRET`, so it should work!**

---

## Or Tell Me the Correct Name

If you have a **different name** set in Vercel, tell me what it is and I'll update the code to check for that name instead.

**Common possibilities:**
- `LPR_INGEST_SECRET` ✅ (what license plates use)
- `INGEST_SECRET` ✅ (what camera upload checks for)
- `CAMERA_INGEST_SECRET` ❓
- `VIDEO_INGEST_SECRET` ❓
- Something else?

**Just tell me the exact name from Vercel Dashboard and I'll fix it!**
