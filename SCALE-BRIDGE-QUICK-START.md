# Scale Bridge Quick Start

## Overview

This guide helps you quickly integrate a weight scale device (TCP server mode) into your Electron app.

## What Was Created

1. **`electron-scale-bridge.js`** - Scale bridge module that:
   - Connects to scale device via TCP (scale acts as TCP server)
   - Exposes WebSocket server for frontend (`ws://localhost:9000/service`)
   - Automatically parses and broadcasts weight data

2. **`electron-scale-integration-example.js`** - Complete integration example showing how to use the scale bridge in your Electron app

3. **`SCALE-BRIDGE-INTEGRATION.md`** - Comprehensive documentation

4. **Updated `useScaleBridge.ts`** - Frontend hook updated to handle automatic weight broadcasts

## Quick Setup (3 Steps)

### Step 1: Install Dependencies

In your Electron app directory (or camera-bridge directory):

```bash
npm install ws
```

### Step 2: Configure Scale Device

1. Set scale device to **TCP Server mode** (not client mode)
2. Note the scale device IP (e.g., `192.168.1.100`)
3. Note the TCP port (e.g., `4001`)

### Step 3: Add to Electron App

In your Electron `main.js`:

```javascript
const ScaleBridge = require('./camera-bridge/electron-scale-bridge');

let scaleBridge;

app.whenReady().then(async () => {
  scaleBridge = new ScaleBridge({
    scaleHost: '192.168.1.100',  // Your scale device IP
    scalePort: 4001,              // Your scale device TCP port
    wsPort: 9000                  // WebSocket port (frontend connects here)
  });
  
  await scaleBridge.start();
  console.log('✅ Scale bridge ready');
});

app.on('before-quit', async () => {
  if (scaleBridge) {
    await scaleBridge.stop();
  }
});
```

## How It Works

```
Scale Device (TCP Server)
    ↓ TCP Connection
Electron App (Scale Bridge)
    ↓ WebSocket (ws://localhost:9000/service)
Frontend (Next.js) - uses existing useScaleBridge hook
```

1. Scale device sends weight data via TCP
2. Scale bridge receives and parses the data
3. Scale bridge broadcasts to all connected WebSocket clients
4. Frontend hook (`useScaleBridge`) receives the data automatically

## Frontend Usage

The frontend already works! The existing `useScaleBridge` hook will automatically receive weight data:

```typescript
import { useScaleBridge } from "@/app/hooks/useScaleBridge";

function MyComponent() {
  const { status, lastJson } = useScaleBridge();
  
  useEffect(() => {
    if (lastJson && typeof lastJson === 'object') {
      const data = lastJson as { type: string; weight: number; unit: string };
      if (data.type === 'weight') {
        console.log(`Weight: ${data.weight} ${data.unit}`);
      }
    }
  }, [lastJson]);
}
```

## Testing

1. Start your Electron app
2. Check console for: `✅ Scale bridge ready`
3. Test health: `curl http://localhost:9000/health`
4. Check frontend - weight data should appear automatically

## Troubleshooting

### Scale Not Connecting

- Verify scale is in **TCP Server mode** (not client)
- Check IP and port are correct
- Test connection: `telnet 192.168.1.100 4001`

### No Weight Data

- Check Electron console for connection status
- Verify scale device is sending data
- Check WebSocket connection in browser console

## Next Steps

- See `SCALE-BRIDGE-INTEGRATION.md` for detailed documentation
- See `electron-scale-integration-example.js` for complete example
- Customize data parsing if your scale uses a unique format
