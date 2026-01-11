# How License Plate and Weight Data Are Pulled

This document explains how your system receives and processes license plate recognition (LPR) and weight scale data.

---

## 📋 Overview

Your system uses **two separate data flows**:

1. **License Plate Recognition (LPR)** - From Electron app → Next.js API → Frontend polling
2. **Weight Scale Data** - From Scale device → Electron bridge → Next.js API → Frontend polling/WebSocket

---

## 🚗 License Plate Recognition (LPR) Flow

### Architecture

```
Electron App (Camera Bridge)
    ↓
    [Detects license plate from camera]
    ↓
POST /api/lpr/ingest
    ↓
MongoDB (stores plate data)
    ↓
GET /api/lpr/latest (polled by frontend)
    ↓
Frontend (useLprPlateAutofill hook)
    ↓
Auto-fills plate number in forms
```

### 1. **Electron App Sends Plate Data**

**Endpoint:** `POST /api/lpr/ingest`

**Location:** `app/api/lpr/ingest/route.ts`

**Authentication:** Requires `Authorization: Bearer <LPR_INGEST_SECRET>`

**Request Body:**
```json
{
  "plateNumber": "Б1234АВ",
  "recognizedAt": "2024-01-15 14:30:00",
  "cameraIp": "192.168.1.50",
  "imagePath": "/path/to/image.jpg",
  "imageBase64": "base64-encoded-image-data",
  "imageContentType": "image/jpeg"
}
```

**What it does:**
- Validates authentication token
- Optionally uploads image to Cloudinary (if configured)
- Stores plate data in MongoDB (`lpr` collection)
- Returns `{ ok: true }`

### 2. **Frontend Polls for Latest Plate**

**Endpoint:** `GET /api/lpr/latest`

**Location:** `app/api/lpr/latest/route.ts`

**Response:**
```json
{
  "plateNumber": "Б1234АВ",
  "recognizedAt": "2024-01-15 14:30:00",
  "imageUrl": "https://cloudinary.com/...",
  "imagePath": "/path/to/image.jpg",
  "cameraIp": "192.168.1.50",
  "receivedAt": "2024-01-15T14:30:00.000Z"
}
```

**Frontend Hook:** `hooks/useLprPlateAutofill.ts`

**How it works:**
- Polls `/api/lpr/latest` every **1 second** (configurable)
- Only auto-fills when:
  - User is **not** actively typing
  - Field is empty OR equals previous auto-filled value
  - At least 1.5 seconds have passed since last keystroke
- Tracks focus state to prevent overwriting user input

**Usage in Forms:**
```typescript
// In InSessionForm.tsx and OutSessionForm.tsx
const cameraAutofill = useLprPlateAutofill();

// Bind to plate input field
cameraAutofill.bindToInput({
  getValue: () => plateValue,
  setValue: (val) => setPlateValue(val),
  isFocused: () => plateInputRef.current === document.activeElement,
});

// Track user typing
<input
  onChange={(e) => {
    setPlateValue(e.target.value);
    cameraAutofill.trackTyping(); // Prevents auto-fill while typing
  }}
/>
```

---

## ⚖️ Weight Scale Data Flow

### Architecture

```
Scale Device (TCP Server Mode)
    ↓
Electron App (Scale Bridge - WebSocket ws://127.0.0.1:9000/service)
    ↓
POST /api/weight/ingest
    ↓
MongoDB (stores weight data)
    ↓
GET /api/weight/latest?siteId=... (polled by frontend)
    ↓
Frontend (useWeightStatus hook)
    ↓
Displays weight in forms
```

### 1. **Electron Scale Bridge Receives Weight**

**WebSocket:** `ws://127.0.0.1:9000/service`

**Location:** Electron app connects to scale device in TCP server mode

**What happens:**
- Scale device sends weight data via TCP
- Electron bridge receives it and forwards to Next.js API
- Also broadcasts via WebSocket for real-time updates

### 2. **Weight Data Sent to API**

**Endpoint:** `POST /api/weight/ingest`

**Location:** `app/api/weight/ingest/route.ts`

**Authentication:** Optional signature verification (uses `INGEST_SECRET` if provided)

**Request Body:**
```json
{
  "siteId": "site-1",
  "weight": 15000.5,
  "unit": "kg",
  "raw": "WGT\n15000.5",
  "ts": "2024-01-15T14:30:00.000Z",
  "deviceIp": "192.168.1.100",
  "devicePort": 4000
}
```

**What it does:**
- Validates request body
- Optionally verifies signature (if `INGEST_SECRET` and `x-signature` header provided)
- Stores weight data in MongoDB (`weight` collection)
- Updates latest weight record for quick access (`isLatest: true`)
- Returns `{ success: true, data: {...} }`

### 3. **Frontend Gets Latest Weight**

**Option A: Polling API**

**Endpoint:** `GET /api/weight/latest?siteId=site-1`

**Location:** `app/api/weight/latest/route.ts`

**Response:**
```json
{
  "siteId": "site-1",
  "weight": 15000.5,
  "unit": "kg",
  "raw": "WGT\n15000.5",
  "ts": "2024-01-15T14:30:00.000Z",
  "deviceIp": "192.168.1.100",
  "devicePort": 4000,
  "receivedAt": "2024-01-15T14:30:00.000Z"
}
```

**Frontend Hook:** `hooks/useWeightStatus.ts`

**Option B: WebSocket (Real-time)**

**WebSocket:** `ws://127.0.0.1:9000/service`

**Frontend Hook:** `app/hooks/useScaleBridge.ts`

**What it does:**
- Connects to Electron scale bridge WebSocket
- Receives automatic weight broadcasts
- Parses weight from JSON: `{ type: 'weight', weight: number, unit: string }`
- Can also request weight by sending URL or `{ type: 'request_weight' }`

**Usage in Forms:**
```typescript
// In InSessionForm.tsx
const weightStatus = useWeightStatus({
  pollInterval: 2000, // Poll every 2 seconds
});

// Check if weight is available
if (weightStatus.status.connected && weightStatus.status.latestWeight) {
  const weight = weightStatus.status.latestWeight;
  // Use weight in form
}
```

---

## 🔑 Environment Variables

### License Plate Recognition

- `LPR_INGEST_SECRET` - Secret token for `/api/lpr/ingest` authentication
- `CLOUDINARY_CLOUD_NAME` (optional) - For image uploads
- `CLOUDINARY_API_KEY` (optional)
- `CLOUDINARY_API_SECRET` (optional)
- `CLOUDINARY_UPLOAD_PRESET` (optional)

### Weight Scale

- `INGEST_SECRET` (optional) - For signature verification on `/api/weight/ingest`

---

## 📊 Database Collections

### LPR Collection (`lpr`)

**Schema:**
```typescript
{
  plateNumber: string;
  recognizedAt: string; // "YYYY-MM-DD HH:mm:ss"
  cameraIp: string | null;
  imagePath: string | null;
  imageUrl: string | null; // Cloudinary URL
  receivedAt: string; // ISO timestamp
  source: "bridge";
}
```

### Weight Collection (`weight`)

**Schema:**
```typescript
{
  siteId: string;
  weight: number;
  unit: string;
  raw: string;
  ts: string; // ISO timestamp
  deviceIp: string;
  devicePort: number;
  receivedAt: string; // ISO timestamp
  isLatest: boolean; // true for most recent weight per siteId
}
```

---

## 🔄 Data Flow Summary

### License Plate:
1. Electron app detects plate → `POST /api/lpr/ingest`
2. Stored in MongoDB
3. Frontend polls `GET /api/lpr/latest` every 1 second
4. Auto-fills plate input when conditions are met

### Weight:
1. Scale device → Electron bridge (TCP)
2. Electron bridge → `POST /api/weight/ingest`
3. Stored in MongoDB
4. Frontend polls `GET /api/weight/latest?siteId=...` OR uses WebSocket
5. Displays weight in forms

---

## 🧪 Testing

### Test LPR Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer YOUR_LPR_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "Б1234АВ",
    "recognizedAt": "2024-01-15 14:30:00",
    "cameraIp": "192.168.1.50"
  }'
```

### Test Weight Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/weight/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "site-1",
    "weight": 15000.5,
    "unit": "kg"
  }'
```

### Check Latest Data

```bash
# Latest plate
curl https://your-app.vercel.app/api/lpr/latest

# Latest weight
curl "https://your-app.vercel.app/api/weight/latest?siteId=site-1"
```

---

## 📝 Notes

- **LPR polling interval:** 1 second (configurable in `useLprPlateAutofill`)
- **Weight polling interval:** 2 seconds (configurable in `useWeightStatus`)
- **LPR auto-fill:** Only works when user is not typing (1.5s cooldown)
- **Weight WebSocket:** Falls back to polling if WebSocket unavailable
- **Authentication:** LPR requires `LPR_INGEST_SECRET`, Weight is optional

---

## 🔍 Related Files

- `app/api/lpr/ingest/route.ts` - Receives plate data
- `app/api/lpr/latest/route.ts` - Returns latest plate
- `app/api/weight/ingest/route.ts` - Receives weight data
- `app/api/weight/latest/route.ts` - Returns latest weight
- `hooks/useLprPlateAutofill.ts` - Frontend LPR hook
- `hooks/useLatestLpr.ts` - LPR polling hook
- `hooks/useWeightStatus.ts` - Frontend weight status hook
- `app/hooks/useScaleBridge.ts` - WebSocket weight bridge hook
