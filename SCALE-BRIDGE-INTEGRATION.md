# Scale Bridge Integration Guide

This guide explains how to integrate a weight scale device (running in TCP server mode) into your Electron app using the scale bridge module.

## Overview

The scale bridge connects to your weight scale device via TCP (the scale acts as a TCP server) and exposes a WebSocket interface for your frontend to receive real-time weight data.

## Architecture

```
Scale Device (TCP Server)
    ↓ TCP Connection
Electron App (Scale Bridge)
    ↓ WebSocket (ws://localhost:9000/service)
Frontend (Next.js App)
```

## Prerequisites

1. **Scale Device Configuration:**
   - Scale device must be configured to run in **TCP Server mode**
   - Note the scale device's IP address and TCP port
   - Ensure the scale device is on the same network as your Electron app

2. **Electron App:**
   - Node.js environment with `net` and `ws` modules
   - Access to the scale bridge module (`electron-scale-bridge.js`)

## Scale Device Setup

### Configure Scale as TCP Server

1. Access your scale device's configuration interface (usually via web interface or configuration software)
2. Set the device to **TCP Server mode** (not TCP Client mode)
3. Configure:
   - **IP Address:** The scale device's IP (e.g., `192.168.1.100`)
   - **TCP Port:** The port the scale listens on (e.g., `4001`)
   - **Data Format:** Note the data format (JSON, plain text, etc.)
   - **Message Delimiter:** Note how messages are separated (`\n`, `\r\n`, etc.)

### Common Scale Device Settings

- **Mode:** TCP Server / Server Mode
- **Port:** Usually 4001, 4002, or 8000 (check device manual)
- **Protocol:** TCP/IP
- **Data Format:** Varies by manufacturer (JSON, CSV, plain number, etc.)

## Electron App Integration

### Step 1: Install Dependencies

The scale bridge uses Node.js built-in modules (`net`, `http`) and `ws`:

```bash
npm install ws
```

### Step 2: Import and Initialize Scale Bridge

In your Electron `main.js` or main process file:

```javascript
const { app } = require('electron');
const ScaleBridge = require('./camera-bridge/electron-scale-bridge');

let scaleBridge;

app.whenReady().then(async () => {
  try {
    scaleBridge = new ScaleBridge({
      // Scale device TCP server configuration
      scaleHost: process.env.SCALE_HOST || '192.168.1.100',
      scalePort: parseInt(process.env.SCALE_PORT || '4001', 10),
      
      // WebSocket server port (frontend connects here)
      wsPort: parseInt(process.env.SCALE_WS_PORT || '9000', 10),
      
      // Optional: Customize data parsing
      dataEncoding: 'utf8',
      dataDelimiter: '\n',
      
      // Optional: Event handlers
      onWeightReceived: (weightData) => {
        console.log(`⚖️ Weight: ${weightData.weight} ${weightData.unit}`);
      },
      
      onScaleConnected: () => {
        console.log('✅ Scale connected');
      },
      
      onScaleDisconnected: (hadError) => {
        console.log('⚠️ Scale disconnected');
      }
    });
    
    await scaleBridge.start();
    console.log('✅ Scale bridge ready');
  } catch (error) {
    console.error('❌ Failed to start scale bridge:', error);
  }
});

// Cleanup on app quit
app.on('before-quit', async () => {
  if (scaleBridge) {
    await scaleBridge.stop();
  }
});
```

### Step 3: Environment Variables (Optional)

Create a `.env` file or set environment variables:

```env
SCALE_HOST=192.168.1.100
SCALE_PORT=4001
SCALE_WS_PORT=9000
```

### Step 4: Test Connection

1. Start your Electron app
2. Check console logs for connection status
3. Test health endpoint: `curl http://localhost:9000/health`

## Frontend Integration

The frontend already has a hook (`useScaleBridge`) that connects to `ws://127.0.0.1:9000/service`. The scale bridge is compatible with this existing hook.

### Using the Existing Hook

```typescript
import { useScaleBridge } from "@/app/hooks/useScaleBridge";

function MyComponent() {
  const { status, lastJson, errorMessage } = useScaleBridge();
  
  useEffect(() => {
    if (lastJson && typeof lastJson === 'object') {
      const weightData = lastJson as { weight: number; unit: string };
      console.log(`Weight: ${weightData.weight} ${weightData.unit}`);
    }
  }, [lastJson]);
  
  return (
    <div>
      <p>Status: {status}</p>
      {lastJson && (
        <p>Weight: {(lastJson as any).weight} {(lastJson as any).unit}</p>
      )}
    </div>
  );
}
```

## Data Format Handling

The scale bridge automatically parses weight data from various formats:

### Supported Formats

1. **JSON:**
   ```json
   {"weight": 1500.5, "unit": "kg"}
   {"value": 1500.5, "unit": "kg"}
   ```

2. **Plain Number:**
   ```
   1500.5
   ```

3. **Formatted String:**
   ```
   Weight: 1500.5 kg
   1500.5kg
   ```

4. **Custom Format (with regex):**
   ```javascript
   const bridge = new ScaleBridge({
     parseWeightRegex: /Weight[:\s]+(\d+\.?\d*)/i
   });
   ```

### Custom Parsing

If your scale device uses a unique format, you can customize parsing:

```javascript
const bridge = new ScaleBridge({
  parseWeightRegex: /YourCustomFormat(\d+\.?\d*)/i,
  dataDelimiter: '\r\n', // Custom delimiter
  dataEncoding: 'ascii' // Custom encoding
});
```

## Configuration Options

### ScaleBridge Constructor Options

| Option | Type | Default | Description |
|-------|------|---------|-------------|
| `scaleHost` | string | `'192.168.1.100'` | Scale device IP address |
| `scalePort` | number | `4001` | Scale device TCP port |
| `wsPort` | number | `9000` | WebSocket server port |
| `reconnectDelay` | number | `3000` | Reconnection delay (ms) |
| `maxReconnectAttempts` | number | `10` | Max reconnection attempts |
| `tcpTimeout` | number | `30000` | TCP connection timeout (ms) |
| `dataEncoding` | string | `'utf8'` | Data encoding |
| `dataDelimiter` | string | `'\n'` | Message delimiter |
| `parseWeightRegex` | RegExp | `null` | Custom weight extraction regex |
| `onWeightReceived` | function | `null` | Callback when weight received |
| `onScaleConnected` | function | `null` | Callback when scale connects |
| `onScaleDisconnected` | function | `null` | Callback when scale disconnects |
| `onError` | function | `null` | Callback on errors |

## Troubleshooting

### Scale Device Not Connecting

1. **Check Scale Device Configuration:**
   - Verify TCP Server mode is enabled
   - Verify IP address and port are correct
   - Check if scale device firewall is blocking connections

2. **Check Network:**
   ```bash
   # Test if scale device is reachable
   ping 192.168.1.100
   
   # Test TCP port (if you have telnet or nc)
   telnet 192.168.1.100 4001
   # or
   nc -zv 192.168.1.100 4001
   ```

3. **Check Electron App Logs:**
   - Look for connection errors in console
   - Check if TCP connection is being established

### Weight Data Not Parsing

1. **Check Data Format:**
   - Enable verbose logging to see raw data
   - Verify the data format matches expected format

2. **Customize Parsing:**
   - Use `parseWeightRegex` for custom formats
   - Adjust `dataDelimiter` if messages use different separators

### WebSocket Clients Not Receiving Data

1. **Check WebSocket Connection:**
   - Verify frontend is connecting to `ws://localhost:9000/service`
   - Check browser console for WebSocket errors

2. **Check Scale Connection:**
   - Verify scale device is connected (check logs)
   - Test health endpoint: `curl http://localhost:9000/health`

## Testing

### Test Scale Bridge Standalone

You can test the scale bridge module directly:

```bash
# Set environment variables
export SCALE_HOST=192.168.1.100
export SCALE_PORT=4001
export SCALE_WS_PORT=9000

# Run the module
node camera-bridge/electron-scale-bridge.js
```

### Test Health Endpoint

```bash
curl http://localhost:9000/health
```

Expected response:
```json
{
  "status": "ok",
  "scale": {
    "connected": true,
    "host": "192.168.1.100",
    "port": 4001
  },
  "websocket": {
    "port": 9000,
    "clients": 1
  }
}
```

### Test WebSocket Connection

Use a WebSocket client or browser console:

```javascript
const ws = new WebSocket('ws://localhost:9000/service');
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Weight received:', data);
};
```

## Integration with Camera Bridge

The scale bridge can run alongside the camera bridge in the same Electron app. See `electron-scale-integration-example.js` for a complete example.

## API Reference

### Methods

#### `start()`
Start the scale bridge (connects to scale device and starts WebSocket server).

Returns: `Promise<void>`

#### `stop()`
Stop the scale bridge (closes all connections).

Returns: `Promise<void>`

#### `getStatus()`
Get current connection status.

Returns: `Object` with:
- `scaleConnected`: boolean
- `scaleHost`: string
- `scalePort`: number
- `wsPort`: number
- `wsClients`: number
- `reconnectAttempts`: number

#### `addHealthEndpoint()`
Add HTTP health check endpoint at `/health`.

## Example: Complete Integration

See `camera-bridge/electron-scale-integration-example.js` for a complete example showing:
- Scale bridge initialization
- Camera bridge integration
- Event handling
- Cleanup on app quit

## Notes

1. **TCP Server Mode:** The scale device must be in TCP Server mode. The Electron app acts as a TCP client connecting to the scale.

2. **Port Conflicts:** Make sure the WebSocket port (default 9000) doesn't conflict with other services.

3. **Data Format:** Different scale manufacturers use different data formats. You may need to customize parsing based on your device.

4. **Reconnection:** The bridge automatically reconnects if the scale device disconnects, with exponential backoff.

5. **Multiple Scales:** To support multiple scales, create multiple `ScaleBridge` instances with different ports.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Electron app console logs
3. Test scale device connection independently
4. Verify network connectivity
