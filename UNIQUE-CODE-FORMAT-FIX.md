# Unique Code Format Fix

## Problem

The unique code format changed from:
- **Old:** `31100120251220000002` (20 digits)
- **New:** `3110020260109000002` (19 digits, incorrect date format)

## Root Cause

The code generation was missing the **company/branch code** (4 digits) in the format.

## Correct Format

**Format:** `31` + `1001`/`1002` + `YYYYMMDD` + `00002` = **19 digits**

- `31` - Company prefix (2 digits)
- `1001`/`1002` - Company/branch code (4 digits)
- `YYYYMMDD` - Date (8 digits)
- `00002` - Sequential number (5 digits)

## Changes Made

### 1. Added `companyCode` to CompanyMetadata
- New field: `companyCode?: string` (4 digits, e.g., "1001", "1002")
- Stored in company metadata

### 2. Updated `generateUniqueCode()` function
- Now fetches company code from company metadata
- Defaults to "1001" if not set
- Validates company code is 4 digits
- Includes company code in unique code generation

### 3. Updated `generate-code` API endpoint
- Uses same logic as `generateUniqueCode()`
- Includes company code in format

## Database Update Required

Set company code for each company:

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      companyCode: "1001"  // or "1002", etc.
    }
  }
);
```

## Format Examples

### Company with code 1001:
- `31100120251220000002` (19 digits)
- `31100120251220000003` (next session)

### Company with code 1002:
- `31100220251220000002` (19 digits)
- `31100220251220000003` (next session)

## Validation

- Company code must be exactly 4 digits
- Date must be exactly 8 digits (YYYYMMDD)
- Sequential number must be exactly 5 digits
- Total length: 19 digits

## Backward Compatibility

- Old codes in database will still work
- New codes will use the correct format
- If company code not set, defaults to "1001"

## Result

✅ **Format fixed:** `31` + `1001`/`1002` + `YYYYMMDD` + `00002`  
✅ **Company code included:** 4-digit code from company metadata  
✅ **Date format correct:** Always 8 digits (YYYYMMDD)  
✅ **Total length:** 19 digits  
