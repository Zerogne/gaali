# Camera Integration Summary

This document summarizes the complete integration of your Vehicle Identification Smart Camera with your Vercel-deployed web application.

## What Was Integrated

### 1. Camera Bridge Service
A local bridge service that connects your camera (on local network) to your Vercel API (in the cloud). Supports two modes:

- **HTTP Push Mode**: Camera pushes events directly to bridge service
- **Polling Mode**: Bridge service polls camera API periodically

### 2. API Endpoints
- `/api/lpr/ingest` - Receives plate recognition events from bridge
- `/api/lpr/latest` - Returns latest plate event for frontend polling

### 3. Frontend Integration
- Auto-fill hook (`useLatestLpr`) that polls for new plate events
- Integration with session forms (`InSessionForm`, `OutSessionForm`)
- Camera status indicators and toggle controls

### 4. Documentation
- Complete camera setup guide with UI screenshots
- Quick start guide for rapid deployment
- Detailed troubleshooting guides

## File Structure

```
camera-bridge/
├── src/
│   ├── index.ts              # Main entry point (mode selector)
│   ├── http-push-receiver.ts # HTTP push receiver service
│   └── polling-service.ts    # Polling service
├── .env.example              # Environment variable template
└── README.md                 # Bridge service documentation

docs/
├── camera-setup-guide.md     # Complete camera configuration guide
├── QUICK-START.md            # Quick start instructions
├── INTEGRATION-SUMMARY.md   # This file
├── camera-integration.md     # Original camera integration docs
└── lpr-integration.md        # LPR integration architecture

app/api/lpr/
├── ingest/route.ts          # POST endpoint for receiving events
└── latest/route.ts           # GET endpoint for frontend polling

hooks/
└── useLatestLpr.ts           # Frontend hook for auto-fill
```

## Integration Flow

### HTTP Push Mode
```
Camera (192.168.1.100)
  ↓ HTTP POST /plate
Bridge Service (192.168.1.50:3000)
  ↓ HTTPS POST /api/lpr/ingest
Vercel API
  ↓ Store in MongoDB
Frontend polls /api/lpr/latest
  ↓ Auto-fill plate number
```

### Polling Mode
```
Bridge Service
  ↓ Polls /ivs_result.php every 700ms
Camera (192.168.1.100)
  ↓ Returns plate recognition data
Bridge Service
  ↓ HTTPS POST /api/lpr/ingest
Vercel API
  ↓ Store in MongoDB
Frontend polls /api/lpr/latest
  ↓ Auto-fill plate number
```

## Configuration Steps

### 1. Vercel Environment Variables
```env
LPR_INGEST_SECRET=your-secret-here
MONGODB_URI=your-mongodb-uri
MONGODB_DB=gaali
MONGODB_COLLECTION=lpr_events
```

### 2. Camera Configuration
- **IP**: 192.168.1.100
- **HTTP Port**: 80
- **RTSP Port**: 8557
- **WebSocket Port**: 9080

For HTTP Push mode, configure:
- Server address: Bridge service IP
- Port: 3000
- Push endpoint: `/plate`

### 3. Bridge Service Configuration
Create `.env` in `camera-bridge/`:
```env
MODE=push  # or "poll" or "both"
BRIDGE_PORT=3000
CAMERA_BASE_URL=http://192.168.1.100
CLOUD_BASE_URL=https://your-app.vercel.app
LPR_INGEST_SECRET=your-secret-here
```

## Key Features

✅ **Dual Mode Support**: HTTP push or polling
✅ **Automatic Deduplication**: Prevents duplicate events
✅ **Retry Logic**: Exponential backoff for failed requests
✅ **Real-time Updates**: Low latency plate recognition
✅ **Frontend Auto-fill**: Automatic form population
✅ **Error Handling**: Graceful error recovery
✅ **Health Checks**: Service monitoring endpoints
✅ **UTF-8 Support**: Cyrillic and other character sets

## Testing

### Test Bridge Service
```bash
curl http://localhost:3000/health
```

### Test Camera API (Polling)
```bash
curl "http://192.168.1.100/ivs_result.php?{\"result_id\":6}&_=$(date +%s)"
```

### Test Vercel API
```bash
curl -X POST https://your-app.vercel.app/api/lpr/ingest \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "TEST123",
    "recognizedAt": "2025-12-23 19:00:00",
    "cameraIp": "192.168.1.100"
  }'
```

## Deployment

### Bridge Service
Run on a machine in the same network as the camera:

```bash
cd camera-bridge
npm install
npm run build
npm start
```

Or use PM2/systemd for production (see `QUICK-START.md`).

### Vercel
Deploy normally - all API routes are included in the Next.js app.

## Monitoring

### Bridge Service Logs
- Success: `✓ Pushed plate: {plate} at {time}`
- Errors: `✗ Failed to push: {error}`
- Health: Available at `/health` endpoint

### Vercel Logs
- Check Function logs in Vercel dashboard
- Monitor `/api/lpr/ingest` endpoint
- Check MongoDB for stored events

### Frontend
- Browser console for API errors
- Camera status indicator in UI
- Network tab for polling requests

## Troubleshooting

See:
- `docs/camera-setup-guide.md` - Camera configuration issues
- `docs/QUICK-START.md` - Quick troubleshooting
- `camera-bridge/README.md` - Bridge service issues

## Next Steps

1. ✅ Configure camera HTTP push settings (if using push mode)
2. ✅ Set up bridge service on local network
3. ✅ Configure Vercel environment variables
4. ✅ Test integration end-to-end
5. ✅ Deploy bridge service as system service
6. ✅ Monitor logs and adjust as needed

## Support

For issues:
1. Check camera logs: Equipment maintenance → Log detection
2. Check bridge service logs
3. Check Vercel function logs
4. Review browser console
5. Test each component individually

## Camera UI Reference

All camera configuration screens are documented in `docs/camera-setup-guide.md` with specific instructions for:
- HTTP Push configuration
- Network settings
- License plate recognition parameters
- Whitelist configuration
- Peripheral management
- And more...
