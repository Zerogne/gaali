# Quick Add Camera Settings to Database

## Easiest Method: MongoDB Shell

Just run this in your MongoDB shell (mongosh):

```javascript
use your-database-name

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

**That's it!** This will add camera settings to all companies that don't have them.

## Verify It Worked

```javascript
// Check one company
db.companies.findOne(
  { companyId: "your-company-id" },
  { cameraSettings: 1 }
)

// Count how many have settings
db.companies.countDocuments({ cameraSettings: { $exists: true } })
```

## Done! ✅

Your camera WebSocket settings are now in the database.
