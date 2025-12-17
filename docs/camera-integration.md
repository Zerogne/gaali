# Camera Integration Guide

This document explains how to set up and configure the camera integration for automatic license plate recognition and auto-fill.

## Overview

The camera integration polls a camera API endpoint (typically running on a local network IP) to fetch license plate recognition results and automatically fills the plate number input field in the truck session forms.

## Configuration

### Environment Variables

Create or update `.env.local` in the project root with the following variables:

```bash
# Camera base IP address
CAMERA_BASE_URL=http://192.168.1.100

# The endpoint that returns latest recognition JSON
# Discover the exact path from Chrome DevTools → Network → Fetch/XHR
CAMERA_EVENT_PATH=/ivs_result.php

# Optional basic auth if camera requires login
# Format: username:password
# CAMERA_AUTH=admin:password

# Polling interval in milliseconds (how often to check for new plates)
CAMERA_POLL_MS=500
```

### Finding the Camera Endpoint Path

1. **Open Chrome DevTools** (F12 or Right-click → Inspect)
2. **Navigate to the Network tab**
3. **Filter by "Fetch/XHR"** to see only API requests
4. **Visit the camera web interface** (e.g., `http://192.168.1.100/main.htm`)
5. **Look for repeated API calls** - these are typically the plate recognition endpoints
6. **Identify the endpoint pattern** - common patterns include:
   - `/ivs_result.php`
   - `/api/ivs_result.php`
   - `/result/ivs_result.php`
   - `/cgi-bin/ivs_result.php`
7. **Copy the exact path** (including query parameters if needed) and set it as `CAMERA_EVENT_PATH`

### Example Network Request

You might see requests like:

```
GET http://192.168.1.100/ivs_result.php?t=1234567890
```

In this case, set:

```bash
CAMERA_EVENT_PATH=/ivs_result.php
```

Note: Query parameters are usually handled automatically, but if your camera requires specific parameters, you may need to modify the API route.

## API Endpoints

### GET `/api/camera/events`

Fetches the latest camera event and extracts the plate number.

**Response:**

```json
{
  "ok": true,
  "plate": "Б1234АВ",
  "raw": {
    /* raw camera response */
  },
  "ts": 1234567890
}
```

### GET `/api/camera/config`

Returns the current camera configuration (without exposing secrets).

**Response:**

```json
{
  "configured": true,
  "baseUrl": "http://192.168.1.100",
  "eventPath": "/ivs_result.php",
  "hasAuth": false,
  "pollMs": 500,
  "fullUrl": "http://192.168.1.100/ivs_result.php"
}
```

## Plate Number Extraction

The system attempts to extract plate numbers from various response formats. It checks the following keys (in order):

1. `plate`
2. `plateNumber`
3. `license`
4. `licensePlate`
5. `car_no`
6. `CarNo`
7. `vehicleNumber`
8. `number`

It also checks nested objects:

- `result.plate`, `result.license`, etc.
- `data.plate`, `data[0].plate` (for arrays, takes the newest entry)

The plate number is normalized:

- Trimmed of whitespace
- Converted to uppercase
- Invalid characters removed (keeps only letters, numbers, spaces, hyphens)

## Auto-Fill Behavior

The auto-fill feature is designed to be non-intrusive:

1. **Only fills when user is not typing**: If the input is focused or the user typed within the last 1.5 seconds, auto-fill is paused
2. **Only overwrites empty fields**: Auto-fill only updates the field if it's empty or matches the previously auto-filled value
3. **Respects user input**: Manual typing is never overwritten while the user is actively typing
4. **Toggle control**: Users can enable/disable auto-fill via a toggle switch (stored in localStorage)

## Testing

### Test Page

Visit `/camera-test` to:

- View current configuration
- Test the camera API connection
- See raw camera responses
- Verify plate extraction

### Manual Testing

1. Ensure your camera is accessible at the configured IP
2. Visit the IN or OUT session form pages
3. Enable the "Камераас автоматаар" (Auto-fill from camera) toggle
4. Watch the status indicator - it should show "Камера: холбогдож байна..." (Camera: connecting...)
5. When a plate is detected, it should automatically fill the plate number field

## Troubleshooting

### Camera Not Connecting

1. **Check network connectivity**: Ensure the server can reach the camera IP
2. **Verify IP address**: Confirm `CAMERA_BASE_URL` is correct
3. **Check firewall**: Ensure no firewall is blocking the connection
4. **Test endpoint**: Use the `/camera-test` page to verify the endpoint path

### Plate Not Extracting

1. **Check raw response**: Use `/camera-test` to see the raw camera response
2. **Verify response format**: The plate might be in a different field than expected
3. **Modify extraction logic**: Update `extractPlateFromData()` in `/app/api/camera/events/route.ts` if needed

### Auto-Fill Not Working

1. **Check toggle**: Ensure "Камераас автоматаар" is enabled
2. **Check status**: Look at the camera status indicator below the input
3. **Check console**: Open browser DevTools to see any errors
4. **Verify polling**: Check that the status shows "polling" or "connected"

## Production Deployment

### Network Requirements

In production, the Next.js server must be able to reach the camera IP address. This typically requires:

1. **Same network**: Server and camera on the same LAN
2. **VPN access**: Server connects via VPN to camera network
3. **Port forwarding**: Camera exposed via port forwarding (less secure)

### Security Considerations

- Camera credentials are stored server-side only (never exposed to browser)
- API routes handle authentication internally
- No camera credentials are sent to the client

## Support

For issues or questions:

1. Check the `/camera-test` page for diagnostic information
2. Review browser console for errors
3. Check server logs for API errors
4. Verify camera configuration matches the camera's actual API
