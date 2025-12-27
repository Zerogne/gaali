const express = require("express");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

const app = express();

// CORS middleware - allow requests from your Vercel app
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow requests from any origin (for local development)
  // In production, you might want to restrict this to your Vercel domain
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Authentication token (set via environment variable for security)
const CONTROL_TOKEN = process.env.CAMERA_BRIDGE_CONTROL_TOKEN || "change-me-in-production";
const CONTROL_PORT = process.env.CONTROL_PORT || 3003;

// Helper function to check authentication
function checkAuth(req) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.body?.token || req.query?.token;
  return token === CONTROL_TOKEN;
}

// Start camera-bridge service
app.post("/control/start", async (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Try to start, or restart if already running
    const { stdout, stderr } = await execAsync(
      "cd " + __dirname + " && pm2 start ecosystem.config.js || pm2 restart camera-bridge || pm2 start server.js --name camera-bridge"
    );
    res.json({ success: true, message: "Camera bridge started/restarted", output: stdout });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to start camera bridge", 
      details: error.message,
      note: "Make sure PM2 is installed and camera-bridge directory is correct"
    });
  }
});

// Stop camera-bridge service
app.post("/control/stop", async (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 stop camera-bridge");
    res.json({ success: true, message: "Camera bridge stopped", output: stdout });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to stop camera bridge", 
      details: error.message,
      note: "Service may not be running"
    });
  }
});

// Restart camera-bridge service
app.post("/control/restart", async (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 restart camera-bridge");
    res.json({ success: true, message: "Camera bridge restarted", output: stdout });
  } catch (error) {
    // If restart fails, try to start it
    try {
      const { stdout: startStdout } = await execAsync(
        "cd " + __dirname + " && pm2 start ecosystem.config.js || pm2 start server.js --name camera-bridge"
      );
      res.json({ success: true, message: "Camera bridge started (was not running)", output: startStdout });
    } catch (startError) {
      res.status(500).json({ 
        error: "Failed to restart camera bridge", 
        details: error.message 
      });
    }
  }
});

// Get status of camera-bridge service
app.get("/control/status", async (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { stdout, stderr } = await execAsync("pm2 jlist");
    const processes = JSON.parse(stdout);
    const cameraBridge = processes.find((p) => p.name === "camera-bridge");
    
    if (cameraBridge) {
      const status = cameraBridge.pm2_env?.status;
      res.json({
        success: true,
        running: status === "online",
        status: status,
        uptime: cameraBridge.pm2_env?.pm_uptime,
        restarts: cameraBridge.pm2_env?.restart_time,
        process: {
          pid: cameraBridge.pid,
          name: cameraBridge.name,
          status: status,
          memory: cameraBridge.monit?.memory,
          cpu: cameraBridge.monit?.cpu,
        }
      });
    } else {
      res.json({ success: true, running: false, status: "not_found", message: "Camera bridge is not running" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to get status", 
      details: error.message,
      note: "Make sure PM2 is installed"
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "camera-bridge-control", timestamp: new Date().toISOString() });
});

const server = app.listen(CONTROL_PORT, "0.0.0.0", () => {
  console.log(`🎮 Control API server running on http://0.0.0.0:${CONTROL_PORT}`);
  console.log(`🔐 Using token: ${CONTROL_TOKEN.substring(0, 8)}... (set CAMERA_BRIDGE_CONTROL_TOKEN env var to change)`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /control/status?token=TOKEN - Get service status`);
  console.log(`   POST /control/start - Start service`);
  console.log(`   POST /control/stop - Stop service`);
  console.log(`   POST /control/restart - Restart service`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down control server...");
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down control server...");
  server.close(() => {
    process.exit(0);
  });
});

