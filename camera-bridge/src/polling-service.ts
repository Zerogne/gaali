import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment schema
// Note: CAMERA_BASE_URL is optional here because this module is imported even in push mode
// It will be validated when startPollingService() is actually called
const envSchema = z.object({
  CAMERA_BASE_URL: z.string().url().optional(),
  CAMERA_RESULT_ID: z.coerce.number().default(6),
  POLL_MS: z.coerce.number().positive().default(700),
  CLOUD_BASE_URL: z.string().url(),
  LPR_INGEST_SECRET: z.string().min(16),
  CAMERA_AUTH: z.string().optional(), // Format: "username:password"
  FETCH_IMAGE: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

const env = envSchema.parse(process.env);

// This will be set when startPollingService() is called
let cameraBaseUrl: string | undefined = env.CAMERA_BASE_URL;

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
let sessionCookie: string | null = null;
let lastLoginTime: number = 0;
const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh session every 5 minutes

/**
 * Generate deduplication key
 */
function getDedupKey(data: DedupKey): string {
  return `${data.plateNumber}|${data.recognizedAt}|${data.imagePath}`;
}

/**
 * Fetch snapshot image as base64 (placeholder for future implementation)
 */
async function tryFetchSnapshotBase64(
  imagePath: string | null | undefined
): Promise<{ base64: string; contentType: string } | null> {
  if (!imagePath || !env.FETCH_IMAGE) {
    return null;
  }

  try {
    // Construct full URL
    if (!cameraBaseUrl) throw new Error("CAMERA_BASE_URL not set");
    const imageUrl = `${cameraBaseUrl}${imagePath}`;
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
 * Login to camera and get session cookie
 */
async function loginToCamera(): Promise<string | null> {
  if (!env.CAMERA_AUTH) {
    return null;
  }

  try {
    const [username, password] = env.CAMERA_AUTH.split(":");
    if (!username || !password) {
      return null;
    }

    // First, try to GET the login page to establish a session
    if (!cameraBaseUrl) throw new Error("CAMERA_BASE_URL not set");
    const loginPageUrl = `${cameraBaseUrl}/login.htm`;
    const getResponse = await fetch(loginPageUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    
    // Get any cookies from the initial request
    const initialCookie = getResponse.headers.get("set-cookie");
    const cookies: string[] = [];
    if (initialCookie) {
      cookies.push(initialCookie);
    }

    // Try to login via POST
    const response = await fetch(loginPageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(cookies.length > 0 ? { "Cookie": cookies.join("; ") } : {}),
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });

    const responseText = await response.text();
    
    // Check if login was successful (not "FAILED")
    if (responseText === "FAILED" || responseText.includes("FAILED")) {
      console.warn("Camera login failed - check credentials in .env (CAMERA_AUTH)");
      return null;
    }

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      // Extract cookie value - handle multiple cookies
      const cookieParts = setCookie.split(",").map(c => c.trim());
      for (const cookiePart of cookieParts) {
        const match = cookiePart.match(/([^=]+)=([^;]+)/);
        if (match) {
          const cookieName = match[1];
          const cookieValue = match[2];
          // Look for session-related cookies
          if (cookieName.toLowerCase().includes("session") || 
              cookieName.toLowerCase().includes("sid") ||
              cookieValue !== "0") {
            sessionCookie = `${cookieName}=${cookieValue}`;
            lastLoginTime = Date.now();
            console.log("✓ Camera login successful");
            return sessionCookie;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.warn("Failed to login to camera:", error);
    return null;
  }
}

/**
 * Poll camera for latest plate recognition
 */
async function pollCamera(): Promise<DedupKey | null> {
  try {
    // Refresh session if needed
    if (
      !sessionCookie ||
      Date.now() - lastLoginTime > SESSION_REFRESH_INTERVAL
    ) {
      await loginToCamera();
    }

    // Build URL with query parameters
    if (!cameraBaseUrl) throw new Error("CAMERA_BASE_URL not set");
    const queryObj = JSON.stringify({ result_id: env.CAMERA_RESULT_ID });
    const timestamp = Date.now();
    const url = `${cameraBaseUrl}/ivs_result.php?${encodeURIComponent(queryObj)}&_=${timestamp}`;

    // Prepare headers
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    // Add Basic Auth if configured
    if (env.CAMERA_AUTH) {
      const [username, password] = env.CAMERA_AUTH.split(":");
      if (username && password) {
        const credentials = Buffer.from(`${username}:${password}`).toString("base64");
        headers["Authorization"] = `Basic ${credentials}`;
      }
    }

    // Add session cookie if available
    if (sessionCookie) {
      headers["Cookie"] = sessionCookie;
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      // If we get 401/403, try to re-login
      if ((response.status === 401 || response.status === 403) && env.CAMERA_AUTH) {
        console.warn("Authentication failed, attempting to re-login...");
        sessionCookie = null;
        await loginToCamera();
        // Retry once after login
        const retryResponse = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(5000),
        });
        if (!retryResponse.ok) {
          console.warn(`Camera API returned ${retryResponse.status} after re-login`);
          return null;
        }
        const retryText = await retryResponse.text();
        return parseCameraResponse(retryText);
      }
      console.warn(`Camera API returned ${response.status}`);
      return null;
    }

    const text = await response.text();
    return parseCameraResponse(text);
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
 * Parse camera response text into CameraResponse
 */
function parseCameraResponse(text: string): DedupKey | null {
  // Check if response is HTML (login page or error)
  if (text.includes("<HTML>") || text.includes("login") || text.includes("TimeOut")) {
    // If we have auth configured, this might mean session expired
    if (env.CAMERA_AUTH) {
      console.warn("Received HTML response (likely login page), session may have expired");
    }
    return null;
  }

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
        cameraIp: cameraBaseUrl ? new URL(cameraBaseUrl).hostname : "unknown",
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

      const result = await response.json() as { ok?: boolean; error?: string };
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
export function startPollingService(): void {
  // Validate required environment variables
  if (!env.CAMERA_BASE_URL) {
    console.error("❌ CAMERA_BASE_URL required for polling mode");
    process.exit(1);
  }

  // At this point, CAMERA_BASE_URL is guaranteed to be defined
  cameraBaseUrl = env.CAMERA_BASE_URL!;

  console.log("🚀 Camera Polling Service Starting...");
  console.log(`📷 Camera: ${cameraBaseUrl}`);
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
}
