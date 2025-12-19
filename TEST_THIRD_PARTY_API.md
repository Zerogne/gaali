# Testing Third-Party File-Based API

## Overview
The file-based approach works as follows:
1. **Save Data**: POST to `/api/third-party/save` (requires authentication)
2. **Get File URL**: Returns a URL like `/api/third-party/data/{code}`
3. **Send URL via WebSocket**: The URL is sent to the 3rd party app
4. **3rd Party Fetches**: The app fetches data from the URL (public access)

## Testing Steps

### 1. Test Through UI (Recommended)

#### Using Settings Page WebSocket Test Panel:
1. Navigate to **Settings** page (`/settings`)
2. Go to **"3-р талын апп"** tab
3. Click **"Connect"** to establish WebSocket connection
4. Click **"Send Sample Data"** button
5. Check the logs to see:
   - ✅ Data saved to file
   - ✅ Unique code generated
   - ✅ File URL created
   - ✅ URL sent via WebSocket

#### Using HTML Test Page:
1. Open `http://localhost:3000/test-websocket.html`
2. Click **"Connect"** button
3. Click **"Send Sample Data"** button
4. Check console logs for the same information

### 2. Test Retrieve Endpoint Directly

The retrieve endpoint is **public** (no auth required) for 3rd party access:

```bash
# Test with a non-existent code (should return 404)
curl http://localhost:3000/api/third-party/data/NONEXISTENT

# Expected response:
# {"error":"Data not found for code: NONEXISTENT"}
```

### 3. Test Full Flow (After Saving Data)

Once you've saved data through the UI:

1. **Get the unique code** from the logs (e.g., `311001202401180001`)
2. **Test retrieve endpoint**:
   ```bash
   curl http://localhost:3000/api/third-party/data/311001202401180001
   ```
3. **Expected**: JSON data matching what was saved

### 4. Verify Data Structure

The saved data should match this format:
```json
[
  {
    "CAR": "Цайны зам",
    "CON": "2024/01-1234",
    "DRN": "Б.ЭНХБАТ ЕТ74102419 96650888",
    "LPC": "ПАТРИКЕЙН ХХК",
    "PRM": "PRM000123",
    "SLN": "ZW00341369-ZW00341381",
    "TRL": "1330СЧ",
    "UPC": "Erlian",
    "AKT": "311001202401180001",
    "NET": 15000,
    "WGT": 20000,
    "VNO": "3826ДГН",
    "CT1": "CTN0001000",
    "CT2": "CTN0002000",
    "CT3": "CTN0003000",
    "CT4": "CTN0004000",
    "TID": "TID0005000000",
    "CMN": "CMN0006000"
  }
]
```

## API Endpoints

### POST `/api/third-party/save`
- **Auth**: Required (must be logged in)
- **Body**: 
  ```json
  {
    "uniqueCode": "311001202401180001",
    "data": [...]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "code": "311001202401180001",
    "url": "https://gaali.vercel.app/api/third-party/data/311001202401180001",
    "message": "Data saved successfully"
  }
  ```

### GET `/api/third-party/data/[code]`
- **Auth**: Optional (public access allowed for 3rd party)
- **Response**: JSON array with the saved data
- **Headers**: Includes `Access-Control-Allow-Origin: *` for CORS

## Database Structure

Data is stored in MongoDB collection: `third_party_data`

Document structure:
```json
{
  "code": "311001202401180001",
  "companyId": "company_123",
  "data": [...],
  "createdAt": "2024-01-18T10:00:00Z",
  "accessedAt": "2024-01-18T10:00:00Z",
  "accessCount": 0
}
```

## Troubleshooting

### Save endpoint returns 401
- **Cause**: Not authenticated
- **Solution**: Log in first, then test through UI

### Retrieve endpoint returns 404
- **Cause**: Code doesn't exist
- **Solution**: Save data first through UI, then use the code from logs

### CORS errors
- **Cause**: 3rd party app might have CORS restrictions
- **Solution**: The endpoint already includes `Access-Control-Allow-Origin: *` header

## Next Steps

1. ✅ Test save endpoint through UI
2. ✅ Verify data is saved to database
3. ✅ Test retrieve endpoint with saved code
4. ✅ Verify WebSocket sends URL correctly
5. ✅ Test with actual 3rd party app

