# Prompt: Add Real-Time Weight Passing to Electron App

## Task

Add real-time weight data passing from a weight scale device to the frontend in your Electron app. The scale device runs in TCP server mode, and weight data should be automatically received and broadcast to the frontend via WebSocket in real-time.

## Requirements

### Scale Device Setup
- Scale device must be configured in **TCP Server mode** (not client mode)
- Scale device IP address: Configurable (default: `192.168.1.100`)
- Scale device TCP port: Configurable (default: `4001`)
- Scale device automatically sends weight data when available

### Integration Requirements
1. **Import scale bridge module** into Electron main process
2. **Initialize scale bridge** when Electron app starts
3. **Connect to scale device** via TCP (scale acts as TCP server)
4. **Start WebSocket server** for frontend connections (port 9000)
5. **Automatically parse and broadcast** weight data to frontend
6. **Handle reconnection** if scale disconnects
7. **Clean up** on app quit

## Architecture

```
Scale Device (TCP Server)
    ↓ TCP Connection
Electron Main Process (Scale Bridge)
    ↓ WebSocket (ws://localhost:9000/service)
Frontend (Next.js) - uses useScaleBridge hook
```

## Implementation Steps

### Step 1: Copy Scale Bridge Module

Ensure `electron-scale-bridge.js` is in your Electron app directory (or accessible path).

### Step 2: Install Dependencies

In your Electron app's `package.json`, ensure `ws` is installed:

```bash
npm install ws
```

Or add to `package.json`:
```json
{
  "dependencies": {
    "ws": "^8.18.0"
  }
}
```

### Step 3: Import Scale Bridge in Main Process

In your Electron `main.js` (or main process file), add:

```javascript
const { app } = require('electron');
const ScaleBridge = require('./camera-bridge/electron-scale-bridge'); // Adjust path as needed

let scaleBridge;
```

### Step 4: Initialize Scale Bridge on App Ready

In your `app.whenReady()` handler, add scale bridge initialization:

```javascript
app.whenReady().then(async () => {
  try {
    // Initialize scale bridge
    scaleBridge = new ScaleBridge({
      // Scale device TCP server configuration
      scaleHost: process.env.SCALE_HOST || '192.168.1.100',
      scalePort: parseInt(process.env.SCALE_PORT || '4001', 10),
      
      // WebSocket server port (frontend connects here)
      wsPort: parseInt(process.env.SCALE_WS_PORT || '9000', 10),
      
      // Optional: Customize data parsing based on your scale device
      dataEncoding: 'utf8', // or 'ascii', 'latin1', etc.
      dataDelimiter: '\n', // Scale device message delimiter (common: '\n', '\r\n', '\r')
      parseWeightRegex: null, // Optional: Custom regex if needed, e.g., /Weight[:\s]+(\d+\.?\d*)/i
      
      // Optional: Event handlers for logging or custom processing
      onWeightReceived: (weightData) => {
        console.log(`⚖️ Weight received: ${weightData.weight} ${weightData.unit}`);
        // You can add custom logic here:
        // - Save to database
        // - Send to API
        // - Trigger actions
        // - Update IPC to renderer process if needed
      },
      
      onScaleConnected: () => {
        console.log('✅ Scale device connected');
        // Optional: Send IPC message to renderer to update UI
        // mainWindow.webContents.send('scale-connected');
      },
      
      onScaleDisconnected: (hadError) => {
        console.log(`⚠️ Scale device disconnected${hadError ? ' (with error)' : ''}`);
        // Optional: Send IPC message to renderer to update UI
        // mainWindow.webContents.send('scale-disconnected');
      },
      
      onError: (error) => {
        console.error('❌ Scale bridge error:', error);
        // Optional: Send IPC message to renderer to show error
        // mainWindow.webContents.send('scale-error', error.message);
      }
    });
    
    // Add health check endpoint (optional but recommended)
    scaleBridge.addHealthEndpoint();
    
    // Start the scale bridge
    await scaleBridge.start();
    console.log('✅ Scale bridge ready - weight data will be passed in real-time');
    
    // Optional: Log status periodically
    setInterval(() => {
      const status = scaleBridge.getStatus();
      console.log('📊 Scale bridge status:', status);
    }, 30000); // Every 30 seconds
    
  } catch (error) {
    console.error('❌ Failed to initialize scale bridge:', error);
    // Handle error - maybe show dialog to user
  }
});
```

### Step 5: Clean Up on App Quit

Add cleanup in your app quit handler:

```javascript
app.on('before-quit', async () => {
  console.log('👋 Shutting down scale bridge...');
  
  if (scaleBridge) {
    await scaleBridge.stop();
  }
  
  // ... other cleanup code
});
```

### Step 6: Environment Variables (Optional)

Create a `.env` file or set environment variables:

```env
SCALE_HOST=192.168.1.100
SCALE_PORT=4001
SCALE_WS_PORT=9000
```

Or set in your Electron app configuration.

## Complete Example

Here's a complete example showing scale bridge integration:

```javascript
const { app, BrowserWindow } = require('electron');
const ScaleBridge = require('./camera-bridge/electron-scale-bridge');
const VideoStreamServer = require('./camera-bridge/electron-video-stream-server'); // If you have camera bridge

let mainWindow;
let scaleBridge;
let videoStreamServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load your app
  mainWindow.loadURL('http://localhost:3000'); // Or your app URL
}

app.whenReady().then(async () => {
  createWindow();

  try {
    // Start video stream server (if you have cameras)
    videoStreamServer = new VideoStreamServer(3004);
    videoStreamServer.addHealthEndpoint();
    await videoStreamServer.start();
    console.log('✅ Video stream server ready');

    // Start scale bridge
    scaleBridge = new ScaleBridge({
      scaleHost: process.env.SCALE_HOST || '192.168.1.100',
      scalePort: parseInt(process.env.SCALE_PORT || '4001', 10),
      wsPort: parseInt(process.env.SCALE_WS_PORT || '9000', 10),
      
      onWeightReceived: (weightData) => {
        console.log(`⚖️ Real-time weight: ${weightData.weight} ${weightData.unit}`);
        
        // Optional: Send to renderer process via IPC
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('weight-update', {
            weight: weightData.weight,
            unit: weightData.unit,
            timestamp: weightData.timestamp
          });
        }
      },
      
      onScaleConnected: () => {
        console.log('✅ Scale connected - real-time weight passing active');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('scale-status', { connected: true });
        }
      },
      
      onScaleDisconnected: () => {
        console.log('⚠️ Scale disconnected');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('scale-status', { connected: false });
        }
      }
    });
    
    scaleBridge.addHealthEndpoint();
    await scaleBridge.start();
    console.log('✅ Scale bridge ready - real-time weight passing enabled');
    
  } catch (error) {
    console.error('❌ Failed to initialize bridges:', error);
  }
});

app.on('before-quit', async () => {
  console.log('👋 Shutting down...');
  
  if (scaleBridge) {
    await scaleBridge.stop();
  }
  
  if (videoStreamServer) {
    await videoStreamServer.stop();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

## Frontend Integration

The frontend already has the `useScaleBridge` hook that connects to `ws://localhost:9000/service`. No frontend changes needed!

The hook automatically:
- Connects to the WebSocket server
- Receives weight data in real-time
- Parses weight from messages
- Updates React state

Example frontend usage:

```typescript
import { useScaleBridge } from "@/app/hooks/useScaleBridge";

function MyComponent() {
  const { status, lastJson } = useScaleBridge();
  
  useEffect(() => {
    if (lastJson && typeof lastJson === 'object') {
      const data = lastJson as { type: string; weight: number; unit: string };
      if (data.type === 'weight') {
        console.log(`Real-time weight: ${data.weight} ${data.unit}`);
        // Use weight data in your component
      }
    }
  }, [lastJson]);
  
  return (
    <div>
      <p>Scale Status: {status}</p>
      {lastJson && (lastJson as any).type === 'weight' && (
        <p>Weight: {(lastJson as any).weight} {(lastJson as any).unit}</p>
      )}
    </div>
  );
}
```

## Data Flow

1. **Scale Device** → Sends weight data via TCP (e.g., `"1500.5\n"` or `{"weight": 1500.5, "unit": "kg"}\n`)
2. **Scale Bridge** → Receives TCP data, parses weight
3. **Scale Bridge** → Broadcasts to WebSocket clients:
   ```json
   {
     "type": "weight",
     "weight": 1500.5,
     "unit": "kg",
     "raw": "original message",
     "timestamp": "2025-01-15T14:30:00.000Z"
   }
   ```
4. **Frontend Hook** → Receives WebSocket message, updates state
5. **React Component** → Re-renders with new weight data

## Testing

### 1. Test Scale Connection

Start your Electron app and check console logs:
```
⚖️ Connecting to scale device at 192.168.1.100:4001...
✅ Connected to scale device at 192.168.1.100:4001
✅ Scale bridge ready - weight data will be passed in real-time
```

### 2. Test Health Endpoint

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

### 3. Test WebSocket Connection

In browser console or frontend:
```javascript
const ws = new WebSocket('ws://localhost:9000/service');
ws.onopen = () => console.log('Connected to scale bridge');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'weight') {
    console.log(`Weight received: ${data.weight} ${data.unit}`);
  }
};
```

### 4. Verify Real-Time Updates

1. Start Electron app
2. Open frontend
3. Place weight on scale device
4. Watch console - weight data should appear automatically
5. Frontend should update in real-time

## Troubleshooting

### Scale Not Connecting

**Check:**
- Scale device is in **TCP Server mode** (not client)
- IP address and port are correct
- Scale device is on same network
- Firewall allows TCP connection

**Test:**
```bash
telnet 192.168.1.100 4001
# or
nc -zv 192.168.1.100 4001
```

### No Weight Data Received

**Check:**
- Scale device is sending data
- Data format matches expected format
- Console logs show "Scale data received"
- WebSocket clients are connected

**Debug:**
- Enable verbose logging in scale bridge
- Check raw data in console
- Verify data delimiter matches scale device

### Frontend Not Receiving Data

**Check:**
- Frontend is connecting to `ws://localhost:9000/service`
- WebSocket connection is open (check browser console)
- `useScaleBridge` hook is being used
- Check browser console for WebSocket errors

## Configuration Options

### Scale Bridge Options

| Option | Type | Default | Description |
|-------|------|---------|-------------|
| `scaleHost` | string | `'192.168.1.100'` | Scale device IP address |
| `scalePort` | number | `4001` | Scale device TCP port |
| `wsPort` | number | `9000` | WebSocket server port |
| `dataEncoding` | string | `'utf8'` | Data encoding |
| `dataDelimiter` | string | `'\n'` | Message delimiter |
| `parseWeightRegex` | RegExp | `null` | Custom weight extraction regex |
| `reconnectDelay` | number | `3000` | Reconnection delay (ms) |
| `maxReconnectAttempts` | number | `10` | Max reconnection attempts |
| `tcpTimeout` | number | `30000` | TCP timeout (ms) |

## Key Points

1. **Real-Time:** Weight data is automatically passed as soon as scale sends it
2. **No Polling:** Frontend doesn't need to request weight - it's pushed automatically
3. **Automatic Reconnection:** If scale disconnects, bridge reconnects automatically
4. **Multiple Formats:** Supports JSON, plain numbers, formatted strings
5. **Zero Frontend Changes:** Existing `useScaleBridge` hook works automatically

## Next Steps

1. Copy `electron-scale-bridge.js` to your Electron app
2. Add the initialization code to your main process
3. Configure scale device to TCP Server mode
4. Set environment variables
5. Test connection
6. Verify real-time weight passing in frontend

## Summary

This integration enables **real-time weight passing** from scale device to frontend:
- Scale device sends weight → Scale bridge receives → WebSocket broadcasts → Frontend updates
- All happens automatically in real-time
- No manual requests needed
- Works with existing frontend hook
