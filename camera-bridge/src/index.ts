import dotenv from "dotenv";
import { z } from "zod";
import { startHttpPushReceiver } from "./http-push-receiver.js";
import { startPollingService } from "./polling-service.js";

// Load environment variables
dotenv.config();

// Environment schema - supports both HTTP push and polling modes
const envSchema = z.object({
  // Mode selection
  MODE: z.enum(["push", "poll", "both"]).default("poll"),
  
  // HTTP Push mode settings
  BRIDGE_PORT: z.coerce.number().default(3000),
  
  // Polling mode settings
  CAMERA_BASE_URL: z.string().url().optional(),
  CAMERA_RESULT_ID: z.coerce.number().default(6),
  POLL_MS: z.coerce.number().positive().default(700),
  CAMERA_AUTH: z.string().optional(), // Format: "username:password"
  
  // Common settings
  CLOUD_BASE_URL: z.string().url(),
  LPR_INGEST_SECRET: z.string().min(16),
  FETCH_IMAGE: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

const env = envSchema.parse(process.env);

/**
 * Main entry point
 */
async function main() {
  console.log("🚀 Camera Bridge Service Starting...");
  console.log(`📡 Mode: ${env.MODE}`);
  console.log(`☁️  Cloud: ${env.CLOUD_BASE_URL}`);
  console.log("");

  // Start services based on mode
  if (env.MODE === "push" || env.MODE === "both") {
    if (!env.BRIDGE_PORT) {
      console.error("❌ BRIDGE_PORT required for HTTP push mode");
      process.exit(1);
    }
    startHttpPushReceiver();
        }

  if (env.MODE === "poll" || env.MODE === "both") {
    if (!env.CAMERA_BASE_URL) {
      console.error("❌ CAMERA_BASE_URL required for polling mode");
      process.exit(1);
    }
    startPollingService();
  }

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
