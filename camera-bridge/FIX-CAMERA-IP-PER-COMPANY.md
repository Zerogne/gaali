# Fix: Make Camera IPs Configurable Per Company

## Problem

Currently, camera IPs are hardcoded or use environment variables, but:
- Multiple companies will use the site
- Each company has different camera IPs
- Camera IPs should be stored per company, not globally

## Solution

### Step 1: Add Camera Settings to Company Metadata

Update `lib/companies/metadata.ts` to include camera settings:

```typescript
export interface CompanyMetadata {
  companyId: string
  name: string
  description?: string
  logoUrl?: string
  logoInitials?: string
  password?: string
  createdAt: string | Date
  updatedAt: string | Date
  // ADD: Camera settings per company
  cameraSettings?: {
    camera1Ip?: string      // e.g., "192.168.1.50"
    camera1Port?: number   // e.g., 8000
    camera1Username?: string
    camera1Password?: string
    camera2Ip?: string      // e.g., "192.168.1.49"
    camera2Port?: number   // e.g., 8000
    camera2Username?: string
    camera2Password?: string
  }
}
```

### Step 2: Update Camera Config API

Update `app/api/camera/config/route.ts` to get camera IPs from company:

```typescript
import { NextResponse } from "next/server";
import { getActiveCompany } from "@/lib/auth/session";
import { getCompany } from "@/lib/companies/metadata";

export async function GET() {
  try {
    // Get current company
    const companyId = await getActiveCompany();
    const company = await getCompany(companyId);
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get camera settings from company
    const cameraSettings = company.cameraSettings || {};
    
    // Build stream URL from company settings (if needed)
    // For WebSocket approach, we don't need MJPEG URL
    let streamUrl = null;
    
    // Only set streamUrl if company has camera1Ip configured
    // But since we're using WebSocket, we can set it to null/undefined
    if (cameraSettings.camera1Ip) {
      // Optional: Build MJPEG URL if needed
      // streamUrl = `http://${cameraSettings.camera1Ip}/video.mjpeg`;
      // But we recommend using WebSocket instead, so leave it null
      streamUrl = null; // Use WebSocket instead
    }

    return NextResponse.json({
      configured: !!cameraSettings.camera1Ip,
      companyId: companyId,
      camera1Ip: cameraSettings.camera1Ip || null,
      camera2Ip: cameraSettings.camera2Ip || null,
      streamUrl: streamUrl, // null = use WebSocket instead
      // Don't expose passwords
    });
  } catch (error) {
    console.error("Error getting camera config:", error);
    return NextResponse.json({ 
      error: "Failed to get camera config",
      configured: false,
      streamUrl: null
    }, { status: 500 });
  }
}
```

### Step 3: Disable MJPEG Loading in Components

Update components to not load MJPEG if streamUrl is null:

**In `components/sessions/CameraPanel.tsx`:**

```typescript
{streamUrl ? (
  // Only show MJPEG if streamUrl is provided
  streamUrl.endsWith(".mjpeg") || streamUrl.includes("mjpeg") ? (
    <img 
      src={streamUrl}
      onError={(e) => {
        console.error("Failed to load camera stream:", streamUrl);
      }}
    />
  ) : // ... other formats
) : (
  // No streamUrl = use WebSocket (Gaali Bridge or external app)
  <div className="flex flex-col items-center justify-center text-gray-400">
    <Camera className="h-8 w-8 mb-1 opacity-50" />
    <p className="text-[10px]">Use WebSocket video stream (Gaali Bridge)</p>
  </div>
)}
```

### Step 4: Update Electron App to Use Company Camera IPs

The Electron app should get camera IPs from:
1. Company settings (if stored in database)
2. Or environment variables (for local setup)
3. Or configuration file

**For Electron app, you can:**

**Option A: Get from API**
```javascript
// In Electron app, fetch camera config from API
const response = await fetch('http://localhost:3000/api/camera/config', {
  headers: {
    'Cookie': `company-id=${companyId}` // Pass company ID
  }
});
const config = await response.json();
const camera1Ip = config.camera1Ip;
```

**Option B: Use Environment Variables (for now)**
```javascript
// Keep using env vars, but document that each company needs different values
const camera1Ip = process.env.CAMERA_1_IP || '192.168.1.50';
```

### Step 5: Fix MJPEG Error

**Quick Fix: Disable MJPEG loading**

Update `app/api/camera/config/route.ts` to return `null` for streamUrl:

```typescript
return NextResponse.json({
  // ... other fields
  streamUrl: null, // Don't use MJPEG, use WebSocket instead
});
```

This will prevent the error because components check `if (streamUrl)` before trying to load.

## Implementation Steps

1. **Update CompanyMetadata interface** - Add cameraSettings field
2. **Update camera config API** - Get IPs from company settings
3. **Disable MJPEG in components** - Set streamUrl to null
4. **Update Electron app** - Get camera IPs from company settings or env vars
5. **Add company settings UI** - Allow companies to configure their camera IPs

## Quick Fix (Immediate)

To stop the error immediately, update `app/api/camera/config/route.ts`:

```typescript
export async function GET() {
  // ... existing code ...
  
  // Return null for streamUrl to disable MJPEG loading
  return NextResponse.json({
    configured: !!baseUrl,
    baseUrl: baseUrl || "not set",
    streamPath: streamPath || "not set",
    streamUrl: null, // ← Change this to null to disable MJPEG
  });
}
```

This will stop the error because components won't try to load MJPEG.

## Long-term Solution

1. Store camera IPs in company metadata
2. Each company configures their own camera IPs
3. Electron app gets IPs from company settings
4. Use WebSocket for video (no MJPEG needed)
