# Add Camera WebSocket Settings to Database

This guide shows you how to add camera WebSocket settings to your companies in MongoDB.

## Quick Method: MongoDB Shell

### Option 1: Run the MongoDB Script

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Load and run the script
load('scripts/add-camera-settings.mongodb.js')
```

### Option 2: Copy-Paste into MongoDB Shell

```javascript
// Connect to your database
use your-database-name

// Add camera settings to all companies without settings
db.companies.updateMany(
  {
    $or: [
      { cameraSettings: { $exists: false } },
      { cameraSettings: null }
    ]
  },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1HttpPort: 443,
        camera1RtspPort: 8557,
        camera1WebSocketPort: 8557,  // Real-time video WebSocket port
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2HttpPort: 443,
        camera2RtspPort: 8557,
        camera2WebSocketPort: 8557,  // Real-time video WebSocket port
        camera2Username: "admin",
        camera2Password: "admin"
      },
      updatedAt: new Date()
    }
  }
)
```

### Option 3: Update Specific Company

```javascript
// Update camera settings for a specific company
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1HttpPort: 443,
        camera1RtspPort: 8557,
        camera1WebSocketPort: 8557,
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2HttpPort: 443,
        camera2RtspPort: 8557,
        camera2WebSocketPort: 8557,
        camera2Username: "admin",
        camera2Password: "admin"
      },
      updatedAt: new Date()
    }
  }
)
```

## Method 2: Using TypeScript Script

```bash
# Run the TypeScript script
npx tsx scripts/add-camera-settings-to-companies.ts

# Or with custom settings
CAMERA1_IP=192.168.1.50 \
CAMERA1_WS_PORT=8557 \
CAMERA2_IP=192.168.1.49 \
CAMERA2_WS_PORT=8557 \
npx tsx scripts/add-camera-settings-to-companies.ts
```

## Method 3: Using API Endpoint

### Get Current Camera Settings

```bash
curl -X GET http://localhost:3000/api/company/camera-settings \
  -H "Cookie: your-session-cookie"
```

### Update Camera Settings

```bash
curl -X PUT http://localhost:3000/api/company/camera-settings \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "cameraSettings": {
      "camera1Ip": "192.168.1.50",
      "camera1HttpPort": 443,
      "camera1RtspPort": 8557,
      "camera1WebSocketPort": 8557,
      "camera1Username": "admin",
      "camera1Password": "admin",
      "camera2Ip": "192.168.1.49",
      "camera2HttpPort": 443,
      "camera2RtspPort": 8557,
      "camera2WebSocketPort": 8557,
      "camera2Username": "admin",
      "camera2Password": "admin"
    }
  }'
```

## Verify Settings Were Added

```javascript
// Check if camera settings exist
db.companies.find(
  { companyId: "your-company-id" },
  { cameraSettings: 1 }
)

// List all companies with camera settings
db.companies.find(
  { cameraSettings: { $exists: true } },
  { companyId: 1, name: 1, "cameraSettings.camera1WebSocketPort": 1, "cameraSettings.camera2WebSocketPort": 1 }
)
```

## Important Notes

1. **WebSocket Port:** Port `8557` is for real-time video streaming (used by `RealtimeVideo` component)
2. **HTTP Port:** Port `443` is for HTTPS video proxy
3. **RTSP Port:** Port `8557` is for RTSP streaming (if needed)
4. **Per-Company:** Each company can have different camera IPs and settings
5. **Default Values:** If WebSocket port is not set, the code defaults to `8557`

## Troubleshooting

### If settings don't appear:

1. **Check company exists:**
   ```javascript
   db.companies.findOne({ companyId: "your-company-id" })
   ```

2. **Check cameraSettings field:**
   ```javascript
   db.companies.findOne(
     { companyId: "your-company-id" },
     { cameraSettings: 1 }
   )
   ```

3. **Manually add settings:**
   ```javascript
   db.companies.updateOne(
     { companyId: "your-company-id" },
     {
       $set: {
         "cameraSettings.camera1WebSocketPort": 8557,
         "cameraSettings.camera2WebSocketPort": 8557
       }
     }
   )
   ```

## Files Created

1. **`app/api/company/camera-settings/route.ts`** - API endpoint to get/update camera settings
2. **`scripts/add-camera-settings-to-companies.ts`** - TypeScript script to add settings
3. **`scripts/add-camera-settings.mongodb.js`** - MongoDB shell script

## Next Steps

After adding camera settings:
1. Restart your Next.js application
2. Check the camera video API: `/api/camera/video`
3. Test the `RealtimeVideo` component on dashboard/session pages
