# Third-Party API Format Update

## Format Change

The third-party API has updated its data format to include new fields.

### Old Format
```json
{
  "AKT": "...",
  "CAR": "...",
  "CMN": "...",
  "CON": "...",
  "CT1": "...",
  "DRN": "...",
  "LPC": "...",
  "NET": 0,
  "SLN": "...",
  "TRL": "...",
  "UPC": "...",
  "VNO": "...",
  "WGT": 0
}
```

### New Format
```json
{
  "CAR": "...",
  "CON": "...",
  "DRN": "...",
  "LPC": "...",
  "PRM": "...",    // NEW: Premium/Permit number
  "SLN": "...",
  "TRL": "...",
  "UPC": "...",
  "AKT": "...",
  "NET": 0,
  "WGT": 0,
  "VNO": "...",
  "CT1": "...",
  "CT2": "...",    // NEW: Container 2
  "CT3": "...",    // NEW: Container 3
  "CT4": "...",    // NEW: Container 4
  "TID": "...",    // NEW: Transaction ID
  "CMN": "..."
}
```

## New Fields Added

1. **PRM** - Premium/Permit number
2. **CT2** - Container 2
3. **CT3** - Container 3
4. **CT4** - Container 4
5. **TID** - Transaction ID

## Files Updated

### 1. `hooks/useThirdPartyAutofill.ts`
- Added new fields (PRM, CT2, CT3, CT4, TID) to data being sent
- Maps form data to new format

### 2. `public/js/scale-autofill.js`
- Added new fields to `FIELD_MAPPING`
- Supports autofill for new fields

### 3. `components/sessions/InSessionForm.tsx`
- Added new fields to `thirdPartyData` array
- All fields included (empty strings if not available)

### 4. `components/sessions/OutSessionForm.tsx`
- Added new fields to `thirdPartyData` array
- All fields included (empty strings if not available)

### 5. `app/api/truck-sessions/route.ts`
- Added new fields to `thirdPartyData` array
- Supports both old and new formats

### 6. `app/api/truck-sessions/by-code/[code]/route.ts`
- Updated third-party format response
- Includes all new fields

## Backward Compatibility

✅ **All old fields are still included** - No breaking changes
✅ **New fields added** - Empty strings if not available
✅ **Both formats supported** - Works with old and new API versions

## Field Mapping

| Field | Description | Source |
|-------|-------------|--------|
| **PRM** | Premium/Permit number | `formData.premium` or `formData.prm` |
| **CT2** | Container 2 | `formData.container2` |
| **CT3** | Container 3 | `formData.container3` |
| **CT4** | Container 4 | `formData.container4` |
| **TID** | Transaction ID | `formData.transactionId` or `formData.tid` |

## Result

✅ **All components updated** to include new fields
✅ **Backward compatible** - Old fields still work
✅ **Forward compatible** - New fields included
✅ **No breaking changes** - Existing functionality preserved

The system now supports both the old and new third-party API formats!
