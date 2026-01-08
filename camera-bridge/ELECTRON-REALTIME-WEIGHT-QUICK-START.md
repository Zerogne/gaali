# Quick Start: Real-Time Weight in Electron App

## What You Need

1. Scale device in **TCP Server mode**
2. Electron app with main process file (`main.js`)
3. `electron-scale-bridge.js` module

## 3-Step Integration

### Step 1: Add to Main Process

In your Electron `main.js`:

```javascript
const { app } = require('electron');
const ScaleBridge = require('./camera-bridge/electron-scale-bridge');

let scaleBridge;

app.whenReady().then(async () => {
  scaleBridge = new ScaleBridge({
    scaleHost: '192.168.1.100',  // Your scale IP
    scalePort: 4001,              // Your scale TCP port
    wsPort: 9000                  // WebSocket port for frontend
  });
  
  await scaleBridge.start();
  console.log('✅ Real-time weight passing enabled');
});

app.on('before-quit', async () => {
  if (scaleBridge) await scaleBridge.stop();
});
```

### Step 2: Configure Scale Device

Set scale device to **TCP Server mode**:
- IP: `192.168.1.100` (or your scale's IP)
- Port: `4001` (or your scale's port)

### Step 3: Frontend (Already Works!)

The frontend `useScaleBridge` hook automatically connects and receives weight in real-time. No changes needed!

## How It Works

```
Scale Device (sends weight)
    ↓ TCP
Electron App (receives & broadcasts)
    ↓ WebSocket
Frontend (updates automatically)
```

## Test

1. Start Electron app
2. Check console: `✅ Real-time weight passing enabled`
3. Place weight on scale
4. Watch frontend update automatically!

## That's It!

Weight data flows in real-time automatically. No polling, no manual requests.

See `ELECTRON-REALTIME-WEIGHT-PROMPT.md` for detailed documentation.
