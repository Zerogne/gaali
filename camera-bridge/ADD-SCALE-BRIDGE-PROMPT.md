# Prompt: Add Scale Bridge to Camera-Bridge App

## Task

Add scale bridge functionality to the existing `camera-bridge/server.js` to connect to a weight scale device running in TCP server mode. The scale bridge should:

1. Connect to the scale device via TCP (scale acts as TCP server)
2. Parse weight data from the scale device
3. Broadcast weight data via WebSocket to frontend clients
4. Run alongside the existing camera bridge functionality
5. Use the same HTTP server and optionally the same WebSocket server (or separate port)

## Requirements

### Scale Device Configuration
- Scale device runs in **TCP Server mode** (not client mode)
- Scale device IP: Configurable via `SCALE_HOST` environment variable (default: `192.168.1.100`)
- Scale device TCP port: Configurable via `SCALE_PORT` environment variable (default: `4001`)
- Scale sends weight data automatically when available

### Integration Requirements
1. **Add TCP client connection** to scale device in `server.js`
2. **Add WebSocket endpoint** for scale data (can use same WebSocket server or separate)
   - If same server: Use path-based routing (e.g., `/scale` vs `/plate`)
   - If separate: Use different port (e.g., `9000` for scale, `3001` for plate)
3. **Parse weight data** from various formats (JSON, plain number, formatted string)
4. **Broadcast weight events** to connected WebSocket clients
5. **Handle reconnection** automatically if scale disconnects
6. **Add health check** endpoint for scale status

### Data Format
Scale bridge should handle multiple data formats:
- JSON: `{"weight": 1500.5, "unit": "kg"}`
- Plain number: `1500.5`
- Formatted: `Weight: 1500.5 kg`

Broadcast format to WebSocket:
```json
{
  "type": "weight_event",
  "weight": 1500.5,
  "unit": "kg",
  "raw": "original message from scale",
  "timestamp": "2025-01-15T14:30:00.000Z"
}
```

## Implementation Steps

### Step 1: Add Required Modules

At the top of `server.js`, add:
```javascript
const net = require('net');
```

### Step 2: Add Scale Bridge Configuration

After the existing configuration, add:
```javascript
// Scale bridge configuration
const SCALE_HOST = process.env.SCALE_HOST || '192.168.1.100';
const SCALE_PORT = parseInt(process.env.SCALE_PORT || '4001', 10);
const SCALE_WS_PORT = parseInt(process.env.SCALE_WS_PORT || '9000', 10);
const SCALE_ENABLED = process.env.SCALE_ENABLED !== 'false'; // Enable by default
```

### Step 3: Add Scale Bridge State

Add after `wsClients` declaration:
```javascript
// Scale bridge state
let scaleTcpClient = null;
let scaleWsClients = new Set();
let isScaleConnected = false;
let scaleReconnectTimeout = null;
let scaleReconnectAttempts = 0;
const MAX_SCALE_RECONNECT_ATTEMPTS = 10;
const SCALE_RECONNECT_DELAY = 3000;
```

### Step 4: Add Scale Data Parsing Function

Add function to parse weight from scale messages:
```javascript
function parseWeightFromScale(message) {
  try {
    // Try JSON first
    try {
      const json = JSON.parse(message);
      if (json.weight !== undefined) {
        return {
          weight: parseFloat(json.weight),
          unit: json.unit || 'kg',
          raw: message
        };
      }
      if (json.value !== undefined) {
        return {
          weight: parseFloat(json.value),
          unit: json.unit || 'kg',
          raw: message
        };
      }
    } catch (e) {
      // Not JSON, continue
    }
    
    // Try extracting number from string
    const numberMatch = message.match(/(\d+\.?\d*)/);
    if (numberMatch) {
      const weight = parseFloat(numberMatch[1]);
      if (!isNaN(weight) && weight > 0) {
        const unitMatch = message.match(/(kg|g|lb|lbs|ton)/i);
        return {
          weight: weight,
          unit: unitMatch ? unitMatch[1].toLowerCase() : 'kg',
          raw: message
        };
      }
    }
    
    // Direct number
    const directNumber = parseFloat(message.trim());
    if (!isNaN(directNumber) && directNumber > 0) {
      return {
        weight: directNumber,
        unit: 'kg',
        raw: message
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing weight:', error);
    return null;
  }
}
```

### Step 5: Add Scale Broadcast Function

Add function to broadcast weight to WebSocket clients:
```javascript
function broadcastWeightEvent(weightData) {
  const message = JSON.stringify({
    type: "weight_event",
    weight: weightData.weight,
    unit: weightData.unit,
    raw: weightData.raw,
    timestamp: new Date().toISOString(),
  });

  console.log(`⚖️ Broadcasting weight event: ${weightData.weight} ${weightData.unit} to ${scaleWsClients.size} client(s)`);

  let sentCount = 0;
  scaleWsClients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error('Error sending weight to client:', error);
        scaleWsClients.delete(client);
      }
    } else {
      scaleWsClients.delete(client);
    }
  });

  if (sentCount > 0) {
    console.log(`✅ Sent weight event to ${sentCount} client(s)`);
  }
}
```

### Step 6: Add Scale TCP Connection Function

Add function to connect to scale device:
```javascript
function connectToScale() {
  if (!SCALE_ENABLED) {
    console.log('⚖️ Scale bridge is disabled');
    return;
  }

  if (scaleTcpClient && !scaleTcpClient.destroyed) {
    scaleTcpClient.destroy();
  }

  console.log(`⚖️ Connecting to scale device at ${SCALE_HOST}:${SCALE_PORT}...`);

  scaleTcpClient = new net.Socket();
  scaleTcpClient.setTimeout(30000);
  scaleTcpClient.setEncoding('utf8');

  scaleTcpClient.on('connect', () => {
    console.log(`✅ Connected to scale device at ${SCALE_HOST}:${SCALE_PORT}`);
    isScaleConnected = true;
    scaleReconnectAttempts = 0;
  });

  scaleTcpClient.on('data', (data) => {
    const messages = data.toString().split('\n').filter(msg => msg.trim());
    for (const message of messages) {
      const trimmed = message.trim();
      if (!trimmed) continue;
      
      console.log(`📊 Scale data received: ${trimmed}`);
      
      const weightData = parseWeightFromScale(trimmed);
      if (weightData) {
        broadcastWeightEvent(weightData);
      }
    }
  });

  scaleTcpClient.on('close', (hadError) => {
    console.log(`🔌 Scale device connection closed${hadError ? ' (with error)' : ''}`);
    isScaleConnected = false;
    
    if (scaleReconnectAttempts < MAX_SCALE_RECONNECT_ATTEMPTS) {
      scaleReconnectAttempts++;
      const delay = SCALE_RECONNECT_DELAY * scaleReconnectAttempts;
      console.log(`⏳ Scheduling scale reconnection in ${delay}ms (attempt ${scaleReconnectAttempts}/${MAX_SCALE_RECONNECT_ATTEMPTS})...`);
      scaleReconnectTimeout = setTimeout(() => {
        connectToScale();
      }, delay);
    } else {
      console.error('❌ Max scale reconnection attempts reached');
    }
  });

  scaleTcpClient.on('error', (error) => {
    console.error(`❌ Scale device connection error:`, error.message);
    isScaleConnected = false;
  });

  scaleTcpClient.on('timeout', () => {
    console.warn('⚠️ Scale device connection timeout');
    scaleTcpClient.destroy();
  });

  try {
    scaleTcpClient.connect(SCALE_PORT, SCALE_HOST);
  } catch (error) {
    console.error(`❌ Failed to connect to scale device:`, error);
  }
}
```

### Step 7: Add Scale WebSocket Server

Choose one of these options:

#### Option A: Separate WebSocket Server (Recommended)

Add after the existing WebSocket server setup:
```javascript
// Scale WebSocket server (separate port)
let scaleWss = null;
if (SCALE_ENABLED) {
  const scaleWssPort = SCALE_WS_PORT;
  scaleWss = new WebSocketServer({ port: scaleWssPort, host: "0.0.0.0" });

  scaleWss.on("connection", (ws, req) => {
    const clientIp = req.socket?.remoteAddress || "unknown";
    console.log(`⚖️ Scale WebSocket client connected from ${clientIp}`);
    scaleWsClients.add(ws);

    ws.send(JSON.stringify({
      type: "connected",
      message: "Connected to scale bridge",
      scaleConnected: isScaleConnected,
    }));

    ws.on("close", () => {
      console.log(`🔌 Scale WebSocket client disconnected from ${clientIp}`);
      scaleWsClients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error(`❌ Scale WebSocket error:`, error);
      scaleWsClients.delete(ws);
    });
  });

  scaleWss.on("listening", () => {
    console.log(`⚖️ Scale WebSocket server listening on port ${scaleWssPort}`);
    console.log(`🔌 Scale WebSocket endpoint: ws://localhost:${scaleWssPort}/service`);
  });
}
```

#### Option B: Same WebSocket Server (Path-based)

Modify the existing WebSocket server connection handler to route by path:
```javascript
wss.on("connection", (ws, req) => {
  const url = req.url || "";
  const clientIp = req.socket?.remoteAddress || "unknown";
  
  // Route to scale bridge if path is /scale
  if (url.startsWith("/scale") || url.startsWith("/service")) {
    console.log(`⚖️ Scale WebSocket client connected from ${clientIp}`);
    scaleWsClients.add(ws);
    
    ws.send(JSON.stringify({
      type: "connected",
      message: "Connected to scale bridge",
      scaleConnected: isScaleConnected,
    }));
    
    ws.on("close", () => {
      scaleWsClients.delete(ws);
    });
    
    ws.on("error", (error) => {
      scaleWsClients.delete(ws);
    });
    
    return; // Don't add to plate clients
  }
  
  // Existing plate event handling...
  console.log(`🔌 Plate WebSocket client connected from ${clientIp}`);
  wsClients.add(ws);
  // ... rest of existing code
});
```

### Step 8: Add Scale Health Endpoint

Add to Express routes:
```javascript
// Scale health check endpoint
app.get("/scale/health", (req, res) => {
  res.json({
    status: "ok",
    scale: {
      enabled: SCALE_ENABLED,
      connected: isScaleConnected,
      host: SCALE_HOST,
      port: SCALE_PORT,
      reconnectAttempts: scaleReconnectAttempts,
    },
    websocket: {
      port: SCALE_WS_PORT,
      clients: scaleWsClients.size,
    },
  });
});
```

### Step 9: Initialize Scale Bridge

Add after server startup:
```javascript
// Initialize scale bridge
if (SCALE_ENABLED) {
  connectToScale();
}
```

### Step 10: Add Cleanup on Shutdown

Add to existing shutdown handlers:
```javascript
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down...");
  
  // Close scale connection
  if (scaleTcpClient && !scaleTcpClient.destroyed) {
    scaleTcpClient.destroy();
  }
  
  if (scaleReconnectTimeout) {
    clearTimeout(scaleReconnectTimeout);
  }
  
  // Close scale WebSocket server
  if (scaleWss) {
    scaleWsClients.forEach((client) => {
      if (client.readyState === 1) {
        client.close();
      }
    });
    scaleWss.close();
  }
  
  // Existing cleanup...
  wsClients.forEach((client) => {
    if (client.readyState === 1) {
      client.close();
    }
  });
  wss.close();
  server.close(() => {
    process.exit(0);
  });
});
```

## Environment Variables

Add to `.env` or set in environment:
```env
# Scale bridge configuration
SCALE_ENABLED=true
SCALE_HOST=192.168.1.100
SCALE_PORT=4001
SCALE_WS_PORT=9000
```

## Testing

1. **Test scale connection:**
   ```bash
   curl http://localhost:3002/scale/health
   ```

2. **Test WebSocket connection:**
   ```javascript
   const ws = new WebSocket('ws://localhost:9000/service');
   ws.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if (data.type === 'weight_event') {
       console.log(`Weight: ${data.weight} ${data.unit}`);
     }
   };
   ```

## Expected Behavior

1. Scale bridge connects to scale device on startup
2. When scale sends weight data, it's automatically parsed and broadcast
3. Frontend clients connected to scale WebSocket receive weight events
4. If scale disconnects, automatic reconnection is attempted
5. Health endpoint shows scale connection status

## Notes

- Scale bridge runs independently from camera bridge
- Both can run simultaneously without conflicts
- Scale WebSocket uses port 9000 by default (separate from plate WebSocket on 3001)
- Scale connection is optional - if disabled, camera bridge still works normally
- Weight data is automatically parsed from common formats
- Reconnection uses exponential backoff
