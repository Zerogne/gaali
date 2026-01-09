# Camera WebSocket Settings in MongoDB

## Location

Camera WebSocket settings are stored in the **`companies`** collection (shared collection, not company-scoped).

## MongoDB Structure

```javascript
{
  _id: ObjectId("..."),
  companyId: "your-company-id",
  name: "Company Name",
  // ... other company fields ...
  cameraSettings: {
    camera1Ip: "192.168.1.50",
    camera1HttpPort: 443,
    camera1RtspPort: 8557,
    camera1WebSocketPort: 8557,  // ← WebSocket port for real-time video
    camera1Username: "admin",
    camera1Password: "password",
    camera2Ip: "192.168.1.49",
    camera2HttpPort: 443,
    camera2RtspPort: 8557,
    camera2WebSocketPort: 8557,  // ← WebSocket port for real-time video
    camera2Username: "admin",
    camera2Password: "password"
  }
}
```

## How to View Camera WebSocket Settings

### 1. Using MongoDB Shell (mongosh)

```javascript
// Connect to your database
use your-database-name

// Find all companies with camera settings
db.companies.find(
  { cameraSettings: { $exists: true } },
  { 
    companyId: 1, 
    name: 1, 
    "cameraSettings.camera1WebSocketPort": 1,
    "cameraSettings.camera2WebSocketPort": 1,
    "cameraSettings.camera1Ip": 1,
    "cameraSettings.camera2Ip": 1
  }
)

// Find specific company's camera settings
db.companies.findOne(
  { companyId: "your-company-id" },
  { cameraSettings: 1 }
)

// View only WebSocket ports
db.companies.findOne(
  { companyId: "your-company-id" },
  { 
    "cameraSettings.camera1WebSocketPort": 1,
    "cameraSettings.camera2WebSocketPort": 1
  }
)
```

### 2. Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to **`companies`** collection
4. Find your company document (filter by `companyId`)
5. Expand the **`cameraSettings`** field
6. Look for:
   - `camera1WebSocketPort`
   - `camera2WebSocketPort`

### 3. Using Code (Node.js/TypeScript)

```typescript
import { getCompaniesCollection } from "@/lib/db/companyDb"

// Get company with camera settings
const companiesCollection = await getCompaniesCollection()
const company = await companiesCollection.findOne(
  { companyId: "your-company-id" },
  { cameraSettings: 1 }
)

console.log("Camera 1 WebSocket Port:", company?.cameraSettings?.camera1WebSocketPort)
console.log("Camera 2 WebSocket Port:", company?.cameraSettings?.camera2WebSocketPort)
```

## How to Update Camera WebSocket Settings

### Using MongoDB Shell

```javascript
// Update WebSocket port for camera 1
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      "cameraSettings.camera1WebSocketPort": 8557,
      "cameraSettings.camera2WebSocketPort": 8557
    }
  }
)

// Update all camera settings at once
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1HttpPort: 443,
        camera1RtspPort: 8557,
        camera1WebSocketPort: 8557,  // Real-time video WebSocket port
        camera1Username: "admin",
        camera1Password: "password",
        camera2Ip: "192.168.1.49",
        camera2HttpPort: 443,
        camera2RtspPort: 8557,
        camera2WebSocketPort: 8557,  // Real-time video WebSocket port
        camera2Username: "admin",
        camera2Password: "password"
      }
    }
  }
)
```

### Using API (if endpoint exists)

```typescript
// If you have an API endpoint to update camera settings
const response = await fetch("/api/company/camera-settings", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    companyId: "your-company-id",
    cameraSettings: {
      camera1WebSocketPort: 8557,
      camera2WebSocketPort: 8557,
      // ... other settings
    }
  })
})
```

## Important Notes

1. **Collection Name:** `companies` (shared, not company-scoped)
2. **Field Path:** `cameraSettings.camera1WebSocketPort` and `cameraSettings.camera2WebSocketPort`
3. **Port Usage:**
   - **8557** = Real-time video WebSocket port (used by `RealtimeVideo` component)
   - **9080** = Other WebSocket data (not for video)
   - **443** = HTTP/HTTPS port
4. **Default Values:** If WebSocket port is not set, defaults to `8557` in code
5. **Per-Company:** Each company has its own camera settings

## Quick Check Query

```javascript
// Quick check: Does company have camera WebSocket settings?
db.companies.findOne(
  { companyId: "your-company-id" },
  { 
    companyId: 1,
    name: 1,
    "cameraSettings.camera1WebSocketPort": 1,
    "cameraSettings.camera2WebSocketPort": 1,
    "cameraSettings.camera1Ip": 1,
    "cameraSettings.camera2Ip": 1
  }
)
```

## Troubleshooting

### If cameraSettings doesn't exist:

```javascript
// Initialize cameraSettings for a company
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1WebSocketPort: 8557,
        camera2WebSocketPort: 8557
      }
    }
  }
)
```

### If WebSocket port is missing:

```javascript
// Add WebSocket port to existing cameraSettings
db.companies.updateOne(
  { 
    companyId: "your-company-id",
    cameraSettings: { $exists: true }
  },
  {
    $set: {
      "cameraSettings.camera1WebSocketPort": 8557,
      "cameraSettings.camera2WebSocketPort": 8557
    }
  }
)
```

## Related Files

- `lib/companies/metadata.ts` - CompanyMetadata interface with cameraSettings
- `lib/db/companyDb.ts` - `getCompaniesCollection()` function
- `app/api/camera/video/route.ts` - Reads cameraSettings to build WebSocket URLs
- `components/camera/RealtimeVideo.tsx` - Uses WebSocket URLs from API
