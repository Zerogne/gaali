import { createServer, IncomingMessage, ServerResponse } from "http";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment schema
const envSchema = z.object({
  BRIDGE_PORT: z.coerce.number().default(3000),
  CLOUD_BASE_URL: z.string().url(),
  LPR_INGEST_SECRET: z.string().min(16),
});

const env = envSchema.parse(process.env);

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
 */
function extractPlateNumber(data: any): string | null {
  if (!data) return null;

  // Check PlateResult object
  if (data.PlateResult) {
    const plate =
      data.PlateResult.license ||
      data.PlateResult.plate ||
      data.PlateResult.plateNumber;
    if (plate) return plate.trim();
  }

  // Check direct fields
  const plate = data.plate || data.plateNumber || data.license;
  if (plate) return plate.trim();

  return null;
}

/**
 * Extract recognition time from various formats
 */
function extractRecognizedAt(data: any): string {
  if (data.PlateResult?.trigger_time) {
    return data.PlateResult.trigger_time.trim();
  }
  if (data.PlateResult?.recognizedAt) {
    return data.PlateResult.recognizedAt.trim();
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
  if (data.PlateResult?.image_path) {
    return data.PlateResult.image_path.trim();
  }
  if (data.PlateResult?.image_sd_path) {
    return data.PlateResult.image_sd_path.trim();
  }
  if (data.image_path) {
    return data.image_path.trim();
  }
  return null;
}

/**
 * Forward plate event to cloud API
 */
async function pushToCloud(payload: {
  plateNumber: string;
  recognizedAt: string;
  cameraIp: string;
  imagePath: string | null;
}): Promise<boolean> {
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
      throw new Error(
        `Cloud API returned ${response.status}: ${errorText}`
      );
    }

      const result = await response.json() as { ok?: boolean; error?: string };
      if (!result.ok) {
        throw new Error(result.error || "Cloud API returned error");
      }

    console.log(
      `✓ Pushed plate: ${payload.plateNumber} at ${payload.recognizedAt}`
    );
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`✗ Failed to push to cloud: ${errorMsg}`);
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
      // Parse request body
      let data: any;
      try {
        data = JSON.parse(body);
      } catch {
        // Try parsing as form data or other formats
        console.warn("Failed to parse JSON, received:", body.slice(0, 200));
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
        return;
      }

      // Extract plate information
      const plateNumber = extractPlateNumber(data);
      if (!plateNumber) {
        console.warn("No plate number found in request:", data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, message: "No plate detected" }));
        return;
      }

      const recognizedAt = extractRecognizedAt(data);
      const imagePath = extractImagePath(data);
      const cameraIp = req.socket.remoteAddress || "192.168.1.100";

      // Push to cloud
      const success = await pushToCloud({
        plateNumber,
        recognizedAt,
        cameraIp,
        imagePath,
      });

      if (success) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Failed to push to cloud" }));
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
 * Start HTTP push receiver server
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

  server.listen(env.BRIDGE_PORT, () => {
    console.log(`🚀 HTTP Push Receiver listening on port ${env.BRIDGE_PORT}`);
    console.log(`📡 Ready to receive camera pushes at http://0.0.0.0:${env.BRIDGE_PORT}/plate`);
    console.log(`☁️  Forwarding to: ${env.CLOUD_BASE_URL}/api/lpr/ingest`);
    console.log("");
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down HTTP push receiver...");
    server.close(() => {
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log("\n👋 Shutting down HTTP push receiver...");
    server.close(() => {
      process.exit(0);
    });
  });
}
