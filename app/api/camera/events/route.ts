import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to fetch camera events
 * Prevents CORS issues and hides authentication credentials
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.CAMERA_BASE_URL;
  const eventPath = process.env.CAMERA_EVENT_PATH || "/ivs_result.php";
  const auth = process.env.CAMERA_AUTH;

  if (!baseUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "CAMERA_BASE_URL not configured",
        ts: Date.now(),
      },
      { status: 500 }
    );
  }

  try {
    const url = `${baseUrl}${eventPath}`;
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Add Basic Auth if configured
    if (auth) {
      const [username, password] = auth.split(":");
      if (username && password) {
        const credentials = Buffer.from(`${username}:${password}`).toString(
          "base64"
        );
        headers["Authorization"] = `Basic ${credentials}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      });
    } catch (fetchError) {
      // Handle network errors, timeouts, etc.
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Unknown fetch error";

      return NextResponse.json(
        {
          ok: false,
          error: `Failed to connect to camera: ${errorMessage}. Check CAMERA_BASE_URL and network connectivity.`,
          ts: Date.now(),
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Camera API returned ${response.status}: ${response.statusText}`,
          ts: Date.now(),
        },
        { status: 200 } // Return 200 so client can handle the error in the response body
      );
    }

    // Try to parse as JSON, but handle stringified JSON or plain text
    let data: any;
    const text = await response.text();

    try {
      data = JSON.parse(text);
    } catch {
      // If not JSON, try parsing as stringified JSON
      try {
        data = JSON.parse(text.replace(/^["']|["']$/g, ""));
      } catch {
        // If still not JSON, return raw text
        data = { raw: text };
      }
    }

    // Extract plate number from various possible locations
    const plate = extractPlateFromData(data);

    return NextResponse.json({
      ok: true,
      plate,
      raw: data,
      ts: Date.now(),
    });
  } catch (error) {
    console.error("Camera API error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        ts: Date.now(),
      },
      { status: 500 }
    );
  }
}

/**
 * Robust plate extraction from various camera response formats
 */
function extractPlateFromData(data: any): string | null {
  if (!data) return null;

  // Check common direct keys (in order of likelihood)
  const directKeys = [
    "plate",
    "plateNumber",
    "license",
    "licensePlate",
    "car_no",
    "CarNo",
    "vehicleNumber",
    "number",
  ];

  for (const key of directKeys) {
    if (data[key] && typeof data[key] === "string") {
      return normalizePlate(data[key]);
    }
  }

  // Check nested objects
  if (data.result) {
    for (const key of directKeys) {
      if (data.result[key] && typeof data.result[key] === "string") {
        return normalizePlate(data.result[key]);
      }
    }
  }

  if (data.data) {
    // If data is an array, take the newest (last) entry
    if (Array.isArray(data.data) && data.data.length > 0) {
      const latest = data.data[data.data.length - 1];
      for (const key of directKeys) {
        if (latest[key] && typeof latest[key] === "string") {
          return normalizePlate(latest[key]);
        }
      }
    }
    // If data is an object
    else if (typeof data.data === "object") {
      for (const key of directKeys) {
        if (data.data[key] && typeof data.data[key] === "string") {
          return normalizePlate(data.data[key]);
        }
      }
    }
  }

  // Check if data itself is an array
  if (Array.isArray(data) && data.length > 0) {
    const latest = data[data.length - 1];
    for (const key of directKeys) {
      if (latest[key] && typeof latest[key] === "string") {
        return normalizePlate(latest[key]);
      }
    }
  }

  return null;
}

/**
 * Normalize plate number: trim, uppercase, remove invalid chars
 */
function normalizePlate(plate: string): string {
  if (!plate) return "";

  // Trim whitespace
  let normalized = plate.trim();

  // Remove weird characters except letters, numbers, spaces, and hyphens
  normalized = normalized.replace(/[^A-Za-zА-ЯЁа-яё0-9\s-]/g, "");

  // Uppercase
  normalized = normalized.toUpperCase();

  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized || "";
}
