# Electron App Integration Guide

This guide explains how to integrate your Electron app with the site's plate recognition API.

## API Endpoint

**URL:** `POST /api/lpr/ingest`

**Base URL:**
- Development: `http://localhost:3000/api/lpr/ingest`
- Production: `https://your-domain.com/api/lpr/ingest`

## Authentication

The endpoint requires Bearer token authentication. Include the `LPR_INGEST_SECRET` in the Authorization header.

**Header:**
```
Authorization: Bearer YOUR_LPR_INGEST_SECRET
```

**Environment Variable:**
Set `LPR_INGEST_SECRET` in your Next.js environment variables (must match between Electron app and site).

## Request Format

### Required Fields

```json
{
  "plateNumber": "Б1234АВ",
  "recognizedAt": "2025-01-15 14:30:00"
}
```

### Optional Fields

```json
{
  "plateNumber": "Б1234АВ",
  "recognizedAt": "2025-01-15 14:30:00",
  "cameraIp": "192.168.1.50",
  "imagePath": "/path/to/image.jpg",
  "imageBase64": "base64_encoded_image_string",
  "imageContentType": "image/jpeg"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plateNumber` | string | Yes | The recognized license plate number |
| `recognizedAt` | string | Yes | Timestamp in format: "YYYY-MM-DD HH:mm:ss" |
| `cameraIp` | string | No | IP address of the camera that captured the plate |
| `imagePath` | string | No | Local file path to the plate image |
| `imageBase64` | string | No | Base64-encoded image data |
| `imageContentType` | string | No | MIME type of the image (e.g., "image/jpeg", "image/png") |

## Example Electron App Code

### JavaScript/TypeScript Example

```javascript
// In your Electron main process or renderer process

const SITE_URL = process.env.SITE_URL || 'https://your-domain.com';
const LPR_INGEST_SECRET = process.env.LPR_INGEST_SECRET || 'your-secret-here';

async function sendPlateToSite(plateData) {
  try {
    const response = await fetch(`${SITE_URL}/api/lpr/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LPR_INGEST_SECRET}`
      },
      body: JSON.stringify({
        plateNumber: plateData.plateNumber,
        recognizedAt: plateData.recognizedAt, // Format: "YYYY-MM-DD HH:mm:ss"
        cameraIp: plateData.cameraIp || null,
        imagePath: plateData.imagePath || null,
        imageBase64: plateData.imageBase64 || null,
        imageContentType: plateData.imageContentType || null
      })
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      console.log('✅ Plate sent successfully:', plateData.plateNumber);
      return { success: true };
    } else {
      console.error('❌ Error sending plate:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// Usage example
const plateData = {
  plateNumber: 'Б1234АВ',
  recognizedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), // "2025-01-15 14:30:00"
  cameraIp: '192.168.1.50'
};

sendPlateToSite(plateData);
```

### With Image Upload

```javascript
const fs = require('fs');
const path = require('path');

async function sendPlateWithImage(plateNumber, imagePath) {
  try {
    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageContentType = path.extname(imagePath) === '.png' ? 'image/png' : 'image/jpeg';

    const plateData = {
      plateNumber: plateNumber,
      recognizedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      cameraIp: '192.168.1.50',
      imageBase64: imageBase64,
      imageContentType: imageContentType
    };

    return await sendPlateToSite(plateData);
  } catch (error) {
    console.error('Error reading image:', error);
    return { success: false, error: error.message };
  }
}
```

## Response Format

### Success Response

```json
{
  "ok": true
}
```

**Status Code:** 200

### Error Responses

#### Authentication Error (401)

```json
{
  "ok": false,
  "error": "Missing or invalid Authorization header"
}
```

or

```json
{
  "ok": false,
  "error": "Invalid authentication token"
}
```

#### Validation Error (400)

```json
{
  "ok": false,
  "error": "Invalid request body",
  "details": [
    {
      "path": ["plateNumber"],
      "message": "Required"
    }
  ]
}
```

#### Server Error (500)

```json
{
  "ok": false,
  "error": "Internal server error"
}
```

## Configuration

### Environment Variables

Set these in your Electron app's environment or config file:

```env
SITE_URL=https://your-domain.com
LPR_INGEST_SECRET=your-secret-here-must-match-site
```

**Important:** The `LPR_INGEST_SECRET` must match the `LPR_INGEST_SECRET` environment variable set in your Next.js site.

### Site Configuration

In your Next.js site's `.env.local` or production environment:

```env
LPR_INGEST_SECRET=your-secret-here-must-be-at-least-16-characters
```

## Testing

### Test with curl

```bash
curl -X POST https://your-domain.com/api/lpr/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LPR_INGEST_SECRET" \
  -d '{
    "plateNumber": "Б1234АВ",
    "recognizedAt": "2025-01-15 14:30:00",
    "cameraIp": "192.168.1.50"
  }'
```

### Test Response

You should receive:
```json
{"ok": true}
```

## Real-Time Updates

The site's frontend receives plate data in two ways:

### Option 1: Polling (Automatic - No Extra Setup)
- Frontend polls `/api/lpr/latest` every 1 second
- **Delay:** Up to 1 second
- **Setup:** Just send to `/api/lpr/ingest` - that's it!
- **Works:** Yes, automatically

### Option 2: WebSocket (Instant - Optional)
For instant real-time updates (no 1-second delay), your Electron app can also send to the camera-bridge WebSocket server:

**WebSocket URL:** `ws://your-bridge-server:3001`

**Message Format:**
```json
{
  "type": "plate_event",
  "plate": "Б1234АВ",
  "timestamp": "2025-01-15T14:30:00.000Z"
}
```

**Example Code:**
```javascript
// Connect to WebSocket (optional - for instant updates)
const ws = new WebSocket('ws://your-bridge-server:3001');

ws.onopen = () => {
  console.log('Connected to bridge WebSocket');
};

// Send plate event
function sendPlateToWebSocket(plateNumber) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'plate_event',
      plate: plateNumber,
      timestamp: new Date().toISOString()
    }));
  }
}

// Send to both API (for storage) and WebSocket (for instant updates)
async function sendPlate(plateNumber) {
  // 1. Send to API for storage (required)
  await sendPlateToSite({ plateNumber, recognizedAt: ... });
  
  // 2. Send to WebSocket for instant updates (optional)
  sendPlateToWebSocket(plateNumber);
}
```

**Note:** The WebSocket server must be running (camera-bridge/server.js). If you only send to `/api/lpr/ingest`, the frontend will still receive updates via polling (1-second delay).

## Integration Checklist

- [ ] Set `LPR_INGEST_SECRET` in both Electron app and Next.js site (must match)
- [ ] Configure `SITE_URL` in Electron app (production URL)
- [ ] Format `recognizedAt` as "YYYY-MM-DD HH:mm:ss"
- [ ] Include `Authorization: Bearer {secret}` header in requests
- [ ] Handle error responses appropriately
- [ ] Test connection with a sample plate number
- [ ] Verify plates appear in the site's LPR feed
- [ ] (Optional) Connect to WebSocket for instant updates

## Notes

1. **Timestamp Format:** The `recognizedAt` field must be in format "YYYY-MM-DD HH:mm:ss" (24-hour format)

2. **Image Upload:** If you provide `imageBase64`, the site will automatically upload it to Cloudinary (if configured) and store the URL

3. **Deduplication:** The site stores all plate events. Make sure your Electron app doesn't send duplicate events for the same plate recognition

4. **Rate Limiting:** Consider implementing rate limiting in your Electron app to avoid overwhelming the server

5. **Error Handling:** Always check the response status and handle errors appropriately in your Electron app

## Troubleshooting

### "Missing or invalid Authorization header"
- Ensure you're including the `Authorization: Bearer {secret}` header
- Check that the header format is correct

### "Invalid authentication token"
- Verify `LPR_INGEST_SECRET` matches between Electron app and site
- Check for extra spaces or characters in the secret

### "Invalid request body"
- Verify `plateNumber` is a string
- Check `recognizedAt` format is "YYYY-MM-DD HH:mm:ss"
- Ensure JSON is properly formatted

### Network errors
- Check `SITE_URL` is correct and accessible
- Verify network connectivity
- Check firewall settings

