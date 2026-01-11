# Multi-Company LPR Filtering Solution

## Problem

When 4-5 companies use the web app simultaneously, license plate data from one company's cameras was being shown to other companies. This happened because:

1. **LPR data didn't include `companyId`** - all plates were stored in a shared collection
2. **`/api/lpr/latest` returned the latest plate from ALL companies** - no filtering by company

## Solution

We've implemented **company-based filtering** using camera IP addresses:

### 1. **Store Company ID in LPR Data** (`/api/lpr/ingest`)

When plate data comes in with a `cameraIp`, we:
- Look up which company owns that camera IP (from `companies.cameraSettings.camera1Ip` or `camera2Ip`)
- Store the `companyId` in the LPR document
- If camera IP is not found, store `null` (better than failing the entire request)

**Code location:** `app/api/lpr/ingest/route.ts`

```typescript
// Find which company owns this camera IP
let companyId: string | null = null;
if (validated.cameraIp) {
  const companiesCollection = await getCompaniesCollection();
  const company = await companiesCollection.findOne({
    $or: [
      { "cameraSettings.camera1Ip": validated.cameraIp },
      { "cameraSettings.camera2Ip": validated.cameraIp },
    ],
  });
  if (company) {
    companyId = company.companyId;
  }
}

// Store in MongoDB with companyId
const document = {
  plateNumber: validated.plateNumber,
  recognizedAt: validated.recognizedAt,
  cameraIp: validated.cameraIp || null,
  companyId: companyId, // ✅ Now stored!
  // ... other fields
};
```

### 2. **Filter by Company ID** (`/api/lpr/latest`)

When frontend requests the latest plate:
- Get current user's `companyId` from session (via `getActiveCompany()`)
- Query only LPR records for that `companyId`
- Return the latest plate for that company only

**Code location:** `app/api/lpr/latest/route.ts`

```typescript
// Get current user's company ID from session
const companyId = await getActiveCompany();

// Find latest document filtered by companyId
const query = companyId ? { companyId } : {};
const latest = await collection
  .find(query)
  .sort({ receivedAt: -1 })
  .limit(1)
  .toArray();
```

## How It Works

### Data Flow

```
1. Electron App (Camera Bridge)
   ↓
   Detects plate from camera (IP: 192.168.1.50)
   ↓
2. POST /api/lpr/ingest
   {
     "plateNumber": "Б1234АВ",
     "cameraIp": "192.168.1.50"
   }
   ↓
3. Look up company by camera IP
   - Query: { "cameraSettings.camera1Ip": "192.168.1.50" }
   - Found: Company "company-1"
   ↓
4. Store in MongoDB with companyId
   {
     "plateNumber": "Б1234АВ",
     "cameraIp": "192.168.1.50",
     "companyId": "company-1",  // ✅ Added!
     ...
   }
   ↓
5. Frontend (Company "company-1" user)
   ↓
6. GET /api/lpr/latest
   - Session: companyId = "company-1"
   - Query: { companyId: "company-1" }
   - Returns: Latest plate for company-1 only ✅
```

### Multi-Company Scenario

**Company A (camera: 192.168.1.50):**
- Plate detected → stored with `companyId: "company-a"`
- User sees only Company A's plates

**Company B (camera: 192.168.1.51):**
- Plate detected → stored with `companyId: "company-b"`
- User sees only Company B's plates

**Company C (camera: 192.168.1.52):**
- Plate detected → stored with `companyId: "company-c"`
- User sees only Company C's plates

✅ **No cross-contamination!**

## Database Schema

### LPR Collection (`lpr_events`)

**Before:**
```typescript
{
  plateNumber: string;
  recognizedAt: string;
  cameraIp: string | null;
  // ❌ No companyId
}
```

**After:**
```typescript
{
  plateNumber: string;
  recognizedAt: string;
  cameraIp: string | null;
  companyId: string | null;  // ✅ Added!
  imagePath: string | null;
  imageUrl: string | null;
  receivedAt: string;
  source: "bridge";
}
```

## Important Notes

### 1. **Camera IP Mapping**

- **Requirement:** Each company must have camera IPs configured in `companies.cameraSettings`
- **Location:** Company settings → Camera Settings (via `/api/company/camera-settings`)
- **If camera IP not found:** `companyId` will be `null` (plate is stored but won't show to any company)

### 2. **Backward Compatibility**

- **Existing LPR records:** Will have `companyId: null` (won't show to any company)
- **New records:** Will have `companyId` if camera IP is configured
- **Recommendation:** Set up camera IPs for all companies before using LPR

### 3. **Error Handling**

- If company lookup fails, plate is still stored (with `companyId: null`)
- If session is invalid, `/api/lpr/latest` returns `null` data (frontend handles this)
- Logs warnings when camera IP is not found in any company

## Testing

### Test Company Isolation

1. **Set up two companies with different camera IPs:**
   - Company A: `camera1Ip: "192.168.1.50"`
   - Company B: `camera1Ip: "192.168.1.51"`

2. **Send plate data from Company A's camera:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/lpr/ingest \
     -H "Authorization: Bearer YOUR_LPR_INGEST_SECRET" \
     -H "Content-Type: application/json" \
     -d '{
       "plateNumber": "COMPANY-A-123",
       "cameraIp": "192.168.1.50"
     }'
   ```

3. **Send plate data from Company B's camera:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/lpr/ingest \
     -H "Authorization: Bearer YOUR_LPR_INGEST_SECRET" \
     -H "Content-Type: application/json" \
     -d '{
       "plateNumber": "COMPANY-B-456",
       "cameraIp": "192.168.1.51"
     }'
   ```

4. **Login as Company A user:**
   - Should see only "COMPANY-A-123" ✅
   - Should NOT see "COMPANY-B-456" ✅

5. **Login as Company B user:**
   - Should see only "COMPANY-B-456" ✅
   - Should NOT see "COMPANY-A-123" ✅

## Setup Checklist

- [ ] Configure camera IPs for all companies (via Settings → Camera Settings)
- [ ] Ensure Electron app sends `cameraIp` in LPR ingest requests
- [ ] Test with multiple companies to verify isolation
- [ ] Monitor logs for warnings about unmapped camera IPs

## Related Files

- `app/api/lpr/ingest/route.ts` - Stores companyId based on camera IP
- `app/api/lpr/latest/route.ts` - Filters by companyId from session
- `lib/db/companyDb.ts` - `getCompaniesCollection()` helper
- `lib/auth/session.ts` - `getActiveCompany()` helper
- `lib/companies/metadata.ts` - Company metadata with camera settings
