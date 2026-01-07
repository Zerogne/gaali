import { createServer, IncomingMessage, ServerResponse } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment schema
const envSchema = z.object({
  BRIDGE_PORT: z.coerce.number().default(3000), // Match test2: port 3000
  WS_PORT: z.coerce.number().default(3001), // Match test2 HTML: port 3001
  CLOUD_BASE_URL: z.string().url().optional(), // Make optional for simple test2 mode
  LPR_INGEST_SECRET: z.string().min(16).optional(), // Make optional for simple test2 mode
});

const env = envSchema.parse(process.env);

// WebSocket clients storage
const wsClients = new Set<WebSocket>();

// Schema for camera HTTP push payload
// Based on the camera's plate recognition result format
const cameraPushSchema = z.object({
  PlateResult: z
    .object({
      license: z.string().optional(),
      plate: z.string().optional(),
      plateNumber: z.string().optional(),
      trigger_time: z.string().optional(),
      recognizedAt: z.string().optional(),
      image_path: z.string().optional(),
      image_sd_path: z.string().optional(),
      vehicle_color: z.string().optional(),
      plate_width: z.number().optional(),
      whitelist: z.string().optional(),
      trigger_type: z.string().optional(),
    })
    .optional(),
  // Alternative formats
  plate: z.string().optional(),
  plateNumber: z.string().optional(),
  license: z.string().optional(),
  recognizedAt: z.string().optional(),
  trigger_time: z.string().optional(),
  image_path: z.string().optional(),
});

/**
 * Extract plate number from various camera response formats
 * Handles AlarmInfoPlate.result.PlateResult format (can be object or array)
 */
function extractPlateNumber(data: any): string | null {
  if (!data) return null;

  // Handle AlarmInfoPlate.result.PlateResult format
  if (data.AlarmInfoPlate?.result?.PlateResult) {
    const plateResultRaw = data.AlarmInfoPlate.result.PlateResult;
    // PlateResult can be an object or an array
    const plateResult = Array.isArray(plateResultRaw)
      ? plateResultRaw[0]
      : plateResultRaw;
    
    const plate = plateResult?.license || plateResult?.License || plateResult?.plate || plateResult?.plateNumber;
    if (plate) return plate.trim();
  }

  // Check PlateResult object (direct)
  if (data.PlateResult) {
    const plateResult = Array.isArray(data.PlateResult)
      ? data.PlateResult[0]
      : data.PlateResult;
    const plate =
      plateResult.license ||
      plateResult.License ||
      plateResult.plate ||
      plateResult.plateNumber;
    if (plate) return plate.trim();
  }

  // Check direct fields
  const plate = data.plate || data.plateNumber || data.license || data.License;
  if (plate) return plate.trim();

  return null;
}

/**
 * Extract recognition time from various formats
 */
function extractRecognizedAt(data: any): string {
  // Handle AlarmInfoPlate format
  if (data.AlarmInfoPlate?.result?.PlateResult) {
    const plateResultRaw = data.AlarmInfoPlate.result.PlateResult;
    const plateResult = Array.isArray(plateResultRaw) ? plateResultRaw[0] : plateResultRaw;
    if (plateResult?.trigger_time) return plateResult.trigger_time.trim();
    if (plateResult?.recognizedAt) return plateResult.recognizedAt.trim();
  }

  if (data.PlateResult) {
    const plateResult = Array.isArray(data.PlateResult) ? data.PlateResult[0] : data.PlateResult;
    if (plateResult?.trigger_time) {
      return plateResult.trigger_time.trim();
    }
    if (plateResult?.recognizedAt) {
      return plateResult.recognizedAt.trim();
    }
  }
  if (data.trigger_time) {
    return data.trigger_time.trim();
  }
  if (data.recognizedAt) {
    return data.recognizedAt.trim();
  }
  // Fallback to current time
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

/**
 * Extract image path from various formats
 */
function extractImagePath(data: any): string | null {
  // Handle AlarmInfoPlate format
  if (data.AlarmInfoPlate?.result?.PlateResult) {
    const plateResultRaw = data.AlarmInfoPlate.result.PlateResult;
    const plateResult = Array.isArray(plateResultRaw) ? plateResultRaw[0] : plateResultRaw;
    if (plateResult?.image_path) return plateResult.image_path.trim();
    if (plateResult?.image_sd_path) return plateResult.image_sd_path.trim();
  }

  if (data.PlateResult) {
    const plateResult = Array.isArray(data.PlateResult) ? data.PlateResult[0] : data.PlateResult;
    if (plateResult?.image_path) {
      return plateResult.image_path.trim();
    }
    if (plateResult?.image_sd_path) {
      return plateResult.image_sd_path.trim();
    }
  }
  if (data.image_path) {
    return data.image_path.trim();
  }
  return null;
}

/**
 * Broadcast plate event to all connected WebSocket clients
 */
function broadcastPlateEvent(plateNumber: string): void {
  const message = JSON.stringify({
    type: "plate_event",
    plate: plateNumber,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Broadcasting plate event to ${wsClients.size} WebSocket client(s): ${plateNumber}`);

  let sentCount = 0;
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
        // Remove dead connection
        wsClients.delete(client);
      }
    } else {
      // Remove non-open connections
      wsClients.delete(client);
    }
  });

  if (sentCount > 0) {
    console.log(`✅ Sent plate event to ${sentCount} client(s)`);
  } else {
    console.warn(`⚠️ No active WebSocket clients to send plate event to`);
  }
}

/**
 * Forward plate event to cloud API (optional - only if configured)
 */
async function pushToCloud(payload: {
  plateNumber: string;
  recognizedAt: string;
  cameraIp: string;
  imagePath: string | null;
}): Promise<boolean> {
  if (!env.CLOUD_BASE_URL || !env.LPR_INGEST_SECRET) {
    return true; // Skip cloud push if not configured (test2 mode)
  }

  try {
    const response = await fetch(`${env.CLOUD_BASE_URL}/api/lpr/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.LPR_INGEST_SECRET}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Cloud API error ${response.status}:`, errorText);
      throw new Error(
        `Cloud API returned ${response.status}: ${errorText}`
      );
    }

    const result = await response.json() as { ok?: boolean; error?: string };
    if (!result.ok) {
      console.error(`❌ Cloud API returned error:`, result.error);
      throw new Error(result.error || "Cloud API returned error");
    }

    console.log(
      `✓ Pushed plate: ${payload.plateNumber} at ${payload.recognizedAt}`
    );
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error pushing to cloud:`, errorMsg);
    return false;
  }
}

/**
 * Handle HTTP POST request from camera
 */
async function handleCameraPush(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      console.log("📥 Received camera push request");
      console.log("📦 Request body length:", body.length);
      console.log("📦 Request body preview:", body.slice(0, 500));
      
      // Parse request body
      let data: any;
      try {
        data = JSON.parse(body);
        console.log("✅ Parsed JSON successfully");
      } catch {
        // Try parsing as form data or other formats
        console.warn("❌ Failed to parse JSON, received:", body.slice(0, 200));
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
        return;
      }

      // Extract plate information (matches the working Express server format)
      const plateNumber = extractPlateNumber(data);
      if (!plateNumber) {
        console.warn("⚠️ No plate number found in request. Data structure:", JSON.stringify(data, null, 2));
        // Still respond OK to camera (like the Express server does)
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
        return;
      }
      
      console.log(`✅ Plate received: ${plateNumber}`);

      const recognizedAt = extractRecognizedAt(data);
      const imagePath = extractImagePath(data);
      const cameraIp = req.socket.remoteAddress || "192.168.1.100";

      // Broadcast to WebSocket clients IMMEDIATELY (like test2)
      broadcastPlateEvent(plateNumber);

      // Always respond OK immediately (like test2 Express server)
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");

      // Push to cloud asynchronously (don't block camera response)
      if (env.CLOUD_BASE_URL && env.LPR_INGEST_SECRET) {
        pushToCloud({
          plateNumber,
          recognizedAt,
          cameraIp,
          imagePath,
        }).catch((error) => {
          console.error(`❌ Failed to push plate ${plateNumber} to cloud:`, error);
        });
      }
    } catch (error) {
      console.error("Error handling camera push:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    }
  });

  req.on("error", (error) => {
    console.error("Request error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Request error" }));
  });
}

/**
 * Health check endpoint
 */
function handleHealthCheck(
  req: IncomingMessage,
  res: ServerResponse
): void {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      ok: true,
      service: "camera-bridge-http-push",
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Start HTTP push receiver server with WebSocket support
 */
export function startHttpPushReceiver(): void {
  const server = createServer((req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Route requests
    if (req.url === "/health" || req.url === "/") {
      handleHealthCheck(req, res);
    } else if (req.url === "/plate" || req.url?.startsWith("/plate")) {
      handleCameraPush(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Not found" }));
    }
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ port: env.WS_PORT });

  wss.on("connection", (ws: WebSocket, req: any) => {
    const clientIp = req.socket?.remoteAddress || "unknown";
    console.log(`🔌 WebSocket client connected from ${clientIp} (total: ${wsClients.size + 1})`);
    wsClients.add(ws);

    // Send welcome message
    try {
      ws.send(JSON.stringify({
        type: "connected",
        message: "Connected to plate feed",
      }));
      console.log(`✅ Welcome message sent to client from ${clientIp}`);
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }

    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.ping();
        } catch (error) {
          clearInterval(pingInterval);
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds

    // Single close handler that handles all cleanup
    ws.on("close", (code, reason) => {
      clearInterval(pingInterval);
      wsClients.delete(ws);
      console.log(`🔌 WebSocket client disconnected (code: ${code}, reason: ${reason?.toString() || 'none'}, total: ${wsClients.size})`);
    });

    ws.on("error", (error: Error) => {
      clearInterval(pingInterval);
      console.error("WebSocket client error:", error);
      wsClients.delete(ws);
    });
  });

  server.listen(env.BRIDGE_PORT, () => {
    console.log(`🚀 HTTP Push Receiver listening on port ${env.BRIDGE_PORT}`);
    console.log(`📡 Ready to receive camera pushes at http://0.0.0.0:${env.BRIDGE_PORT}/plate`);
    console.log(`🔌 WebSocket server listening on port ${env.WS_PORT}`);
    console.log(`☁️  Forwarding to: ${env.CLOUD_BASE_URL}/api/lpr/ingest`);
    console.log("");
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log("\n👋 Shutting down HTTP push receiver...");
    // Close all WebSocket connections
    wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    wss.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
