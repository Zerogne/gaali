# LPR Camera Integration Guide

Complete integration guide for connecting an on-LAN LPR camera to the cloud application.

## Architecture

```
Camera (192.168.x.x) → Bridge Service (LAN) → Vercel API (HTTPS) → MongoDB → Frontend
```

The bridge service runs locally on the same network as the camera, eliminating the need for cloud-to-LAN connectivity.

## Quick Start

### 1. Configure Vercel Environment Variables

Add to Vercel project settings (and `.env.local` for local dev):

```env
LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=gaali
MONGODB_COLLECTION=lpr_events

# Optional: Cloudinary image upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Deploy to Vercel

The Next.js app with API routes is ready to deploy. Ensure all environment variables are set.

### 3. Set Up Bridge Service

On a machine in the same network as the camera:

```bash
cd camera-bridge
cp .env.example .env
# Edit .env with your configuration
npm install
npm run build
npm start
```

**Important:** The `LPR_INGEST_SECRET` in the bridge `.env` must match the one in Vercel.

### 4. Verify Integration

1. Start the bridge service
2. Open the in-session form in the web app
3. When the camera detects a plate, it should automatically fill in the form

## Files Created

### Next.js / Vercel

- `lib/db/lpr.ts` - MongoDB collection helper
- `app/api/lpr/ingest/route.ts` - POST endpoint to receive plate events
- `app/api/lpr/latest/route.ts` - GET endpoint to fetch latest event
- `hooks/useLatestLpr.ts` - Frontend hook for polling
- `components/sessions/InSessionForm.tsx` - Updated with LPR autofill

### Bridge Service

- `camera-bridge/src/index.ts` - Main bridge service
- `camera-bridge/package.json` - Node.js dependencies
- `camera-bridge/tsconfig.json` - TypeScript configuration
- `camera-bridge/README.md` - Bridge service documentation

## API Endpoints

### POST `/api/lpr/ingest`

Receives plate events from the bridge.

**Authentication:** `Authorization: Bearer <LPR_INGEST_SECRET>`

**Request Body:**
```json
{
  "plateNumber": "1234УБА",
  "recognizedAt": "2025-12-13 15:30:45",
  "cameraIp": "192.168.1.100",
  "imagePath": "/path/to/image.jpg",
  "imageBase64": "base64-encoded-image" // optional
}
```

**Response:**
```json
{
  "ok": true
}
```

### GET `/api/lpr/latest`

Returns the latest plate event for frontend polling.

**Response:**
```json
{
  "plateNumber": "1234УБА",
  "recognizedAt": "2025-12-13 15:30:45",
  "imageUrl": "https://...", // if Cloudinary is configured
  "imagePath": "/path/to/image.jpg",
  "cameraIp": "192.168.1.100",
  "receivedAt": "2025-12-13T15:30:46.123Z"
}
```

## Frontend Integration

The `useLatestLpr()` hook automatically:
- Polls `/api/lpr/latest` every 1 second
- Deduplicates events
- Stores latest in localStorage
- Autofills plate number and time in the form

## Bridge Service Features

- ✅ Polls camera every 700ms (configurable)
- ✅ Deduplicates events by plate+time+image
- ✅ Retries failed uploads with exponential backoff
- ✅ Handles UTF-8 plates (Cyrillic supported)
- ✅ Resilient error handling
- ✅ Graceful shutdown
- ✅ Optional image snapshot fetching

## Troubleshooting

### Events not appearing
1. Check bridge logs for successful pushes
2. Verify `LPR_INGEST_SECRET` matches in both bridge and Vercel
3. Check MongoDB connection in Vercel
4. Verify camera URL is accessible from bridge machine

### Cloudinary upload not working
- Ensure all three Cloudinary env vars are set
- Check upload preset is configured in Cloudinary dashboard
- Or leave unset to skip image uploads (imagePath will still be stored)

### Frontend not autofilling
- Open browser console and check for API errors
- Verify `/api/lpr/latest` returns data
- Check network tab for polling requests

## Security Notes

- `LPR_INGEST_SECRET` must be a long random string (minimum 16 characters)
- Never commit secrets to version control
- Use different secrets for dev/staging/production
- Consider rate limiting the ingest endpoint in production

## Next Steps

1. Set up the bridge as a service (see `camera-bridge/README.md`)
2. Configure Cloudinary if you want image storage
3. Monitor bridge logs for any issues
4. Adjust polling intervals as needed
