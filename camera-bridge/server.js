const express = require("express");
const { WebSocketServer } = require("ws");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple authentication token (set via environment variable for security)
const CONTROL_TOKEN = process.env.CAMERA_BRIDGE_CONTROL_TOKEN || "change-me-in-production";

// WebSocket clients storage
const wsClients = new Set();

// Broadcast plate event to all connected WebSocket clients
function broadcastPlateEvent(plateNumber) {
  const message = JSON.stringify({
    type: "plate_event",
    plate: plateNumber,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡📡📡 Broadcasting plate event to ${wsClients.size} WebSocket client(s): ${plateNumber}`);
  console.log(`📡 Message to send:`, message);

  if (wsClients.size === 0) {
    console.log(`⚠️⚠️⚠️ NO WEBSOCKET CLIENTS CONNECTED! Frontend is not connected!`);
    console.log(`⚠️ Make sure the frontend WebSocket is connecting to ws://localhost:${WS_PORT}`);
  }

  let sentCount = 0;
  let errorCount = 0;
  wsClients.forEach((client, index) => {
    console.log(`📡 Checking client ${index + 1}, readyState: ${client.readyState} (1 = OPEN)`);
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
        sentCount++;
        console.log(`✅✅✅ Sent plate event to client ${index + 1}`);
      } catch (error) {
        console.error(`❌ Error sending WebSocket message to client ${index + 1}:`, error);
        wsClients.delete(client);
        errorCount++;
      }
    } else {
      console.log(`⚠️ Client ${index + 1} is not OPEN (readyState: ${client.readyState}), removing`);
      wsClients.delete(client);
    }
  });

  if (sentCount > 0) {
    console.log(`✅✅✅ Successfully sent plate event to ${sentCount} client(s)`);
  } else {
    console.log(`❌❌❌ FAILED to send plate event to any clients!`);
    console.log(`❌ Total clients: ${wsClients.size}, Sent: ${sentCount}, Errors: ${errorCount}`);
  }
}

// HTTP POST endpoint - receives plate data from camera
app.post("/plate", (req, res) => {
  const alarm = req.body?.AlarmInfoPlate;
  const plateResultRaw = alarm?.result?.PlateResult;

  // PlateResult sometimes comes as an object, sometimes an array
  const plateResult = Array.isArray(plateResultRaw)
    ? plateResultRaw[0]
    : plateResultRaw;

  const plate = plateResult?.license || plateResult?.License || null;

  if (plate) {
    console.log("✅ Plate received:", plate);
    
    // Broadcast to WebSocket clients immediately
    broadcastPlateEvent(plate);
  } else {
    console.log("⚠️ No plate detected in request");
  }

  // Always respond OK to camera (like the working version)
  res.send("OK");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Control endpoints for PM2 management
app.post("/control/start", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.body?.token;
  
  if (token !== CONTROL_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 start server.js --name camera-bridge || pm2 restart camera-bridge");
    res.json({ success: true, message: "Camera bridge started/restarted", output: stdout });
  } catch (error) {
    // PM2 not available - server is already running
    res.json({ success: true, message: "Server is already running (PM2 not available)", note: "Running directly without PM2" });
  }
});

app.post("/control/stop", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.body?.token;
  
  if (token !== CONTROL_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 stop camera-bridge");
    res.json({ success: true, message: "Camera bridge stopped", output: stdout });
  } catch (error) {
    // PM2 not available - can't stop (would need process.exit)
    res.json({ success: false, message: "PM2 not available. Cannot stop server directly.", note: "Use platform controls to stop the service" });
  }
});

app.post("/control/restart", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.body?.token;
  
  if (token !== CONTROL_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 restart camera-bridge");
    res.json({ success: true, message: "Camera bridge restarted", output: stdout });
  } catch (error) {
    // PM2 not available - return message
    res.json({ success: false, message: "PM2 not available. Cannot restart directly.", note: "Use platform controls to restart the service" });
  }
});

app.get("/control/status", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query?.token;
  
  if (token !== CONTROL_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 jlist");
    const processes = JSON.parse(stdout);
    const cameraBridge = processes.find((p) => p.name === "camera-bridge");
    
    if (cameraBridge) {
      res.json({
        success: true,
        running: cameraBridge.pm2_env?.status === "online",
        status: cameraBridge.pm2_env?.status,
        uptime: cameraBridge.pm2_env?.pm_uptime,
        restarts: cameraBridge.pm2_env?.restart_time,
        process: {
          pid: cameraBridge.pid,
          name: cameraBridge.name,
          status: cameraBridge.pm2_env?.status,
          memory: cameraBridge.monit?.memory,
          cpu: cameraBridge.monit?.cpu,
        }
      });
    } else {
      res.json({ success: true, running: false, status: "not found" });
    }
  } catch (error) {
    // PM2 not available (e.g., on Render) - return running status based on process
    res.json({
      success: true,
      running: true,
      status: "online",
      note: "PM2 not available, running directly",
      process: {
        pid: process.pid,
        name: "camera-bridge",
        status: "online"
      }
    });
  }
});

// Serve static files (for the HTML test page)
app.use(express.static("public"));

// Start HTTP server on port 3002 (3000 is used by Next.js, 3001 is WebSocket)
// Camera should be configured to send POST requests to http://YOUR_IP:3002/plate
// On Render, use PORT environment variable (Render assigns dynamic port like 10000)
const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT || 3002;
const server = app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log("🚀 HTTP Server running on http://0.0.0.0:" + HTTP_PORT);
  console.log("📡 Ready to receive camera pushes at http://0.0.0.0:" + HTTP_PORT + "/plate");
  console.log("💡 Make sure your camera is configured to send POST requests to this URL");
});

// Create WebSocket server
// On Render (when PORT is set), attach to same HTTP server (Render only exposes one port)
// Otherwise, use separate port 3001 for local development
const wss = process.env.PORT 
  ? new WebSocketServer({ server: server }) // Use same server on Render
  : new WebSocketServer({ port: process.env.WS_PORT || 3001, host: "0.0.0.0" }); // Separate port for local

wss.on("connection", (ws, req) => {
  const clientIp = req.socket?.remoteAddress || "unknown";
  const clientUrl = req.url || "unknown";
  console.log(`🔌🔌🔌 WebSocket client CONNECTED from ${clientIp} (total: ${wsClients.size + 1})`);
  console.log(`🔌 Client URL: ${clientUrl}`);
  console.log(`🔌 Client headers:`, JSON.stringify(req.headers, null, 2));
  wsClients.add(ws);
  console.log(`🔌 Total connected clients: ${wsClients.size}`);

  // Send welcome message
  try {
    const welcomeMsg = JSON.stringify({
      type: "connected",
      message: "Connected to plate feed",
    });
    ws.send(welcomeMsg);
    console.log(`✅ Welcome message sent to client from ${clientIp}`);
    console.log(`✅ Welcome message content:`, welcomeMsg);
  } catch (error) {
    console.error("❌ Error sending welcome message:", error);
  }

  ws.on("close", (code, reason) => {
    wsClients.delete(ws);
    console.log(`🔌🔌🔌 WebSocket client DISCONNECTED from ${clientIp}`);
    console.log(`🔌 Disconnect code: ${code}, reason: ${reason}`);
    console.log(`🔌 Remaining clients: ${wsClients.size}`);
  });

  ws.on("error", (error) => {
    console.error(`❌❌❌ WebSocket client ERROR from ${clientIp}:`, error);
    wsClients.delete(ws);
    console.log(`🔌 Remaining clients after error: ${wsClients.size}`);
  });

  ws.on("message", (message) => {
    console.log(`📨📨📨 Received message from ${clientIp}:`, message.toString());
    try {
      const parsed = JSON.parse(message.toString());
      console.log(`📨 Parsed message:`, parsed);
    } catch (e) {
      console.log(`📨 Message is not JSON (that's okay)`);
    }
  });
});

wss.on("listening", () => {
  console.log(`🔌 WebSocket server listening on port ${WS_PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down...");
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

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down...");
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
