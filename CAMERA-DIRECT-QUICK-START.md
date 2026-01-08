# Quick Start: Direct Camera Connection

## What You Need

- Camera 1 IP: `192.168.1.50`
- Camera 2 IP: `192.168.1.49`
- Cameras support HTTPS ✅
- License plate recognition working ✅

## 3 Steps to Setup

### Step 1: Update Company Database

```javascript
db.companies.updateOne(
  { companyId: "your-company-id" },
  {
    $set: {
      cameraSettings: {
        camera1Ip: "192.168.1.50",
        camera1Port: 443,
        camera1Username: "admin",
        camera1Password: "admin",
        camera2Ip: "192.168.1.49",
        camera2Port: 443,
        camera2Username: "admin",
        camera2Password: "admin"
      }
    }
  }
);
```

### Step 2: Configure Camera for License Plates

**Keep this working!** In camera settings:
- Server: `your-site.com`
- Port: `443`
- SSL: ✅ Enable
- Path: `/api/lpr/ingest`
- Auth: `Bearer YOUR_LPR_INGEST_SECRET`

### Step 3: Test

1. Open `/in-session` - Should see camera 1 video
2. Open `/out-session` - Should see camera 2 video
3. Test license plate - Should still work ✅

## How It Works

- **Video:** `/api/camera/proxy?camera=1` → Gets video from `192.168.1.50` via HTTPS
- **Plates:** Camera → HTTPS POST → `/api/lpr/ingest` → Database ✅

## That's It!

Video streams directly from cameras via HTTPS, license plates keep working!
