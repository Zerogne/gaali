import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Environment schema
const envSchema = z.object({
  CAMERA_BASE_URL: z.string().url(),
  CAMERA_RESULT_ID: z.coerce.number().default(6),
  POLL_MS: z.coerce.number().positive().default(700),
  CLOUD_BASE_URL: z.string().url(),
  LPR_INGEST_SECRET: z.string().min(16),
  FETCH_IMAGE: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

const env = envSchema.parse(process.env);

interface CameraResponse {
  PlateResult?: {
    license?: string;
    trigger_time?: string;
    image_path?: string;
    image_sd_path?: string;
  };
}

interface DedupKey {
  plateNumber: string;
  recognizedAt: string;
  imagePath: string;
}

// Global state
let lastDedupKey: string | null = null;
let retryDelay = 1000; // Start with 1 second

/**
 * Generate deduplication key
 */
function getDedupKey(data: DedupKey): string {
  return `${data.plateNumber}|${data.recognizedAt}|${data.imagePath}`;
}

/**
 * Fetch snapshot image as base64 (placeholder for future implementation)
 * TODO: Update snapshot endpoint once discovered in camera Network panel
 */
async function tryFetchSnapshotBase64(
  imagePath: string | null | undefined
): Promise<{ base64: string; contentType: string } | null> {
  if (!imagePath || !env.FETCH_IMAGE) {
    return null;
  }

  try {
    // Construct full URL
    const imageUrl = `${env.CAMERA_BASE_URL}${imagePath}`;
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return { base64, contentType };
  } catch (error) {
    console.error(`Failed to fetch snapshot: ${imagePath}`, error);
    return null;
  }
}

/**
 * Poll camera for latest plate recognition
 */
async function pollCamera(): Promise<DedupKey | null> {
  try {
    // Build URL with query parameters
    const queryObj = JSON.stringify({ result_id: env.CAMERA_RESULT_ID });
    const timestamp = Date.now();
    const url = `${env.CAMERA_BASE_URL}/ivs_result.php?${encodeURIComponent(queryObj)}&_=${timestamp}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`Camera API returned ${response.status}`);
      return null;
    }

    const text = await response.text();
    let data: CameraResponse;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // Try parsing as stringified JSON
      try {
        data = JSON.parse(text.replace(/^["']|["']$/g, ""));
      } catch {
        console.warn("Failed to parse camera response:", text.slice(0, 100));
        return null;
      }
    }

    const plateResult = data.PlateResult;
    if (!plateResult) {
      return null;
    }

    const plateNumber = plateResult.license;
    const recognizedAt = plateResult.trigger_time;
    const imagePath =
      plateResult.image_path || plateResult.image_sd_path || "";

    if (!plateNumber || !recognizedAt) {
      return null;
    }

    return {
      plateNumber: plateNumber.trim(),
      recognizedAt: recognizedAt.trim(),
      imagePath: imagePath.trim(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Camera request timeout");
    } else {
      console.error("Camera polling error:", error);
    }
    return null;
  }
}

/**
 * Push plate event to cloud API with exponential backoff retry
 */
async function pushToCloud(data: DedupKey): Promise<boolean> {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Optionally fetch image
      const imageData = await tryFetchSnapshotBase64(data.imagePath);

      const payload: any = {
        plateNumber: data.plateNumber,
        recognizedAt: data.recognizedAt,
        cameraIp: new URL(env.CAMERA_BASE_URL).hostname,
        imagePath: data.imagePath || null,
      };

      if (imageData) {
        payload.imageBase64 = imageData.base64;
        payload.imageContentType = imageData.contentType;
      }

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

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || "Cloud API returned error");
      }

      // Success - reset retry delay
      retryDelay = 1000;
      console.log(
        `✓ Pushed plate: ${data.plateNumber} at ${data.recognizedAt}`
      );
      return true;
    } catch (error) {
      attempt++;
      const errorMsg =
        error instanceof Error ? error.message : String(error);

      if (attempt >= maxRetries) {
        console.error(
          `✗ Failed to push after ${maxRetries} attempts: ${errorMsg}`
        );
        return false;
      }

      // Exponential backoff with cap at ~10 seconds
      retryDelay = Math.min(retryDelay * 2, 10000);
      const delayMs = retryDelay + Math.random() * 1000; // Add jitter

      console.warn(
        `Retry ${attempt}/${maxRetries} in ${Math.round(delayMs)}ms: ${errorMsg}`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
}

/**
 * Main polling loop
 */
async function main() {
  console.log("🚀 Camera Bridge Service Starting...");
  console.log(`📷 Camera: ${env.CAMERA_BASE_URL}`);
  console.log(`☁️  Cloud: ${env.CLOUD_BASE_URL}`);
  console.log(`⏱️  Poll interval: ${env.POLL_MS}ms`);
  console.log("");

  // Self-scheduling async loop
  const pollLoop = async () => {
    try {
      const plateData = await pollCamera();

      if (plateData) {
        const key = getDedupKey(plateData);

        // Only push if this is a new event
        if (key !== lastDedupKey) {
          lastDedupKey = key;
          await pushToCloud(plateData);
        }
      }

      // Schedule next poll
      setTimeout(pollLoop, env.POLL_MS);
    } catch (error) {
      console.error("Unexpected error in polling loop:", error);
      // Continue polling even on error
      setTimeout(pollLoop, env.POLL_MS * 2); // Wait a bit longer on error
    }
  };

  // Start polling
  pollLoop();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n👋 Shutting down gracefully...");
    process.exit(0);
  });
}

// Prevent unhandled promise rejections from crashing
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the service
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
