# Third Party API Usage Guide

## Available Endpoints

### 1. `/api/third-party/data` (Recommended)

This endpoint serves third-party data and supports **two URL formats**:

### Format 1: Query Parameter (Recommended for other sites)
```
GET https://gaali.vercel.app/api/third-party/data?code={CODE}
```

**Example:**
```
GET https://gaali.vercel.app/api/third-party/data?code=311001202401180001
```

### Format 2: Path Parameter
```
GET https://gaali.vercel.app/api/third-party/data/{CODE}
```

**Example:**
```
GET https://gaali.vercel.app/api/third-party/data/311001202401180001
```

## How to Get the Code

The **code** is the **AKT (Пүүний актын дугаар)** that is generated when data is sent to the 3rd party app.

### Flow:
1. Our app generates data with an AKT number (format: `311001YYYYMMDD######`)
2. Data is saved to our API with this AKT as the unique code
3. Full URL is sent via WebSocket to 3rd party app: `https://gaali.vercel.app/api/third-party/data/{AKT}`
4. 3rd party app receives the URL and can fetch the data
5. **Other site** needs to use the same AKT code to pull data

### For the Other Site Configuration:

**Option 1: Base URL + Code Input**
- Base URL: `https://gaali.vercel.app/api/third-party/data`
- When pulling, append: `?code={AKT_CODE}`
- Full URL: `https://gaali.vercel.app/api/third-party/data?code=311001202401180001`

**Option 2: Full URL Template**
- URL Template: `https://gaali.vercel.app/api/third-party/data/{CODE}`
- Replace `{CODE}` with the AKT number when pulling

## Response Format

Both formats return the same JSON data:

```json
[
  {
    "CAR": "Цайны зам",
    "CON": "2024/01-1234",
    "DRN": "Б.ЭНХБАТ ЕТ74102419 96650888",
    "LPC": "ПАТРИКЕЙН ХХК",
    "PRM": "PRM001234",
    "SLN": "ZW341369-ZW341381",
    "TRL": "1330СЧ",
    "UPC": "Erlian",
    "AKT": "311001202401180001",
    "NET": 15000,
    "WGT": 20000,
    "VNO": "3826ДГН",
    "TID": "TID5000000123",
    "CMN": "CMN6000123"
  }
]
```

## Error Responses

### Missing Code
```json
{
  "error": "Code is required",
  "message": "Please provide a code parameter. Usage: /api/third-party/data?code=YOUR_CODE",
  "example": "https://gaali.vercel.app/api/third-party/data?code=311001202401180001"
}
```

### Code Not Found
```json
{
  "error": "Data not found for code: 311001202401180001"
}
```

## CORS

The endpoint includes `Access-Control-Allow-Origin: *` header, so it can be accessed from any domain.

### 2. `/api/v1/api/service` (For etos.ojus compatibility)

This endpoint provides the same functionality but uses the `/v1/api/service` path format that some other sites expect.

**Query Parameter Format:**
```
GET https://gaali.vercel.app/api/v1/api/service?code={CODE}
```

**POST Format:**
```
POST https://gaali.vercel.app/api/v1/api/service
Content-Type: application/json

{
  "code": "311001202401180001"
}
```

**Example:**
```bash
# GET with query parameter
curl "https://gaali.vercel.app/api/v1/api/service?code=311001202401180001"

# POST with body
curl -X POST "https://gaali.vercel.app/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d '{"code": "311001202401180001"}'
```

**For Other Sites Configuration:**
- If the other site expects `etos.ojus/v1/api/service`, configure it as:
  - Base URL: `https://gaali.vercel.app`
  - Path: `v1/api/service` (or full: `api/v1/api/service`)
  - Code parameter: `?code={CODE}` for GET, or in request body for POST

## Testing

You can test the endpoints using curl:

```bash
# Query parameter format (recommended endpoint)
curl "https://gaali.vercel.app/api/third-party/data?code=311001202401180001"

# Path parameter format
curl "https://gaali.vercel.app/api/third-party/data/311001202401180001"

# v1/api/service format (GET)
curl "https://gaali.vercel.app/api/v1/api/service?code=311001202401180001"

# v1/api/service format (POST)
curl -X POST "https://gaali.vercel.app/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d '{"code": "311001202401180001"}'
```

