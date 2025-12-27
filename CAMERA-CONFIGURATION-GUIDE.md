# Camera Configuration Guide

## ⚠️ IMPORTANT: Camera Cannot Send to Render Directly

**The camera must send to your LOCAL computer's IP address, NOT to Render!**

- **Render** (`gaali.onrender.com`) is for the **frontend** to connect to via WebSocket
- **Your local computer** is where the camera sends HTTP POST requests
- The camera is on your local network and cannot reach Render directly

## Setup Flow

```
Camera (192.168.1.100)
    ↓ HTTP POST
Your Computer (192.168.1.50) ← camera-bridge running here
    ↓ WebSocket
Render (gaali.onrender.com) ← frontend connects here
    ↓
Your Browser (Vercel app)
```

## Step 1: Find Your Computer's Local IP Address

**On Windows:**
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Type: `ipconfig`
4. Look for "IPv4 Address" under your network adapter
5. Write it down (e.g., `192.168.1.50`)

**On Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Step 2: Run Camera Bridge Locally

You need to run the camera-bridge on your local computer:

```bash
cd camera-bridge
npm install
npm start
```

Or in development mode:
```bash
npm run dev
```

The bridge will listen on:
- **HTTP Port 3000**: Receives camera POST requests
- **WebSocket Port 3001**: Frontend connects here (local) or Render (production)

## Step 3: Configure Camera to Send to Your Local IP

1. **Access Camera Web Interface**
   - Open `http://192.168.1.100/main.htm` in your browser
   - Login (default: `admin` / `admin`)

2. **Navigate to HTTP Push Settings**
   - Go to: **Advanced settings** → **Advanced Networks** → **HTTP push**

3. **Configure Settings:**
   ```
   Master server priority: ✅ Enable
   Server address: 192.168.1.50  ← YOUR COMPUTER'S IP (not Render!)
   Port: 3000
   SSL connection: ❌ Disable
   Verification method: Anonymous
   
   Push license plate recognition results: ✅ Enable
   Address: /plate
   Content detail level: all
   ```

4. **Save** the settings

## Step 4: Test Camera Connection

1. **Check camera-bridge logs** - you should see:
   ```
   📥 Received camera push request
   ✅ Plate received: [PLATE_NUMBER]
   📡 Broadcasting plate event to X WebSocket client(s)
   ```

2. **If you see "0 WebSocket client(s)"**:
   - Local: Make sure frontend is running and connected to `ws://localhost:3001`
   - Production: Make sure Vercel has `NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://gaali.onrender.com` set

## Step 5: Configure Production (Vercel)

In **Vercel Dashboard** → **Settings** → **Environment Variables**:

Add:
- **Name:** `NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL`
- **Value:** `wss://gaali.onrender.com`
- **Environment:** All (Production, Preview, Development)

Then **redeploy** your Vercel app.

## Troubleshooting

### Camera Not Sending Plates

1. **Check camera-bridge is running locally:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"ok":true,...}`

2. **Check camera can reach your computer:**
   - From camera web interface, try "Push test" button
   - Check camera-bridge logs for incoming requests

3. **Check firewall:**
   - Windows: Allow port 3000 through firewall
   - Make sure your computer's IP is accessible from camera's network

### Frontend Not Receiving Plates

1. **Local development:**
   - Check browser console for WebSocket connection to `ws://localhost:3001`
   - Check camera-bridge logs show "Broadcasting to X client(s)"

2. **Production:**
   - Check Vercel environment variable is set correctly
   - Check Render service is running: `https://gaali.onrender.com/health`
   - Check browser console for WebSocket connection to `wss://gaali.onrender.com`

### Camera Web Interface Not Accessible

1. **Try different browsers** (Chrome, Firefox, Edge)
2. **Try incognito/private mode**
3. **Check camera IP:** `ping 192.168.1.100`
4. **Try different ports:** `http://192.168.1.100:8080`, `http://192.168.1.100:88`
5. **Factory reset camera** and try default credentials

## Summary

- ✅ Camera → Your Local Computer (192.168.1.50:3000)
- ✅ Your Local Computer → Render (via WebSocket)
- ✅ Frontend (Vercel) → Render (via WebSocket)
- ❌ Camera → Render (NOT POSSIBLE - camera is on local network)

