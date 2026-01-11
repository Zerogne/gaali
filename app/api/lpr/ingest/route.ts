import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLprCollection } from "@/lib/db/lpr";
import { getCompaniesCollection } from "@/lib/db/companyDb";

// Cloudinary upload (optional)
async function uploadToCloudinary(
  imageBase64: string,
  contentType: string
): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  try {
    // Extract base64 data (handle both with and without data URI prefix)
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    // Upload to Cloudinary using data URI format
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    
    // Cloudinary accepts data URI format directly
    const dataUri = `data:${contentType};base64,${base64Data}`;
    formData.append("file", dataUri);
    
    // Use upload preset if available, otherwise use API key/auth
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (uploadPreset) {
      formData.append("upload_preset", uploadPreset);
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Cloudinary upload failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

const ingestSchema = z.object({
  plateNumber: z.string(),
  recognizedAt: z.string(), // "YYYY-MM-DD HH:mm:ss"
  cameraIp: z.string().optional(),
  imagePath: z.string().nullable().optional(),
  imageBase64: z.string().nullable().optional(),
  imageContentType: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.LPR_INGEST_SECRET;

    if (!expectedSecret) {
      console.error("[LPR Ingest] LPR_INGEST_SECRET not configured in environment");
      return NextResponse.json(
        { ok: false, error: "LPR_INGEST_SECRET not configured" },
        { status: 500 }
      );
    }

    if (!authHeader) {
      console.warn("[LPR Ingest] No Authorization header provided");
      return NextResponse.json(
        { ok: false, error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    // Case-insensitive Bearer check
    const authLower = authHeader.toLowerCase().trim();
    if (!authLower.startsWith("bearer ")) {
      console.warn(`[LPR Ingest] Invalid Authorization header format. Received: ${authHeader.substring(0, 20)}...`);
      return NextResponse.json(
        { ok: false, error: "Authorization header must start with 'Bearer '" },
        { status: 401 }
      );
    }

    // Extract and trim token
    const token = authHeader.substring(7).trim();
    const expectedTrimmed = expectedSecret.trim();

    // Debug logging (only show partial secret)
    const secretPreview = expectedTrimmed.length > 4 
      ? `${expectedTrimmed.substring(0, 4)}...` 
      : "***";
    const tokenPreview = token.length > 4 
      ? `${token.substring(0, 4)}...` 
      : "***";

    console.log(`[LPR Ingest] Auth attempt - Expected: ${secretPreview}, Received: ${tokenPreview}, Length match: ${token.length === expectedTrimmed.length}`);

    if (token !== expectedTrimmed) {
      console.error(`[LPR Ingest] Token mismatch - Expected length: ${expectedTrimmed.length}, Received length: ${token.length}`);
      return NextResponse.json(
        { 
          ok: false, 
          error: "Invalid authentication token",
          debug: process.env.NODE_ENV === "development" ? {
            expectedLength: expectedTrimmed.length,
            receivedLength: token.length,
            expectedPreview: secretPreview,
            receivedPreview: tokenPreview
          } : undefined
        },
        { status: 401 }
      );
    }

    console.log("[LPR Ingest] Authentication successful");

    // Parse and validate body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[LPR Ingest] Failed to parse JSON body:", parseError);
      return NextResponse.json(
        { ok: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    let validated: any;
    try {
      validated = ingestSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error("[LPR Ingest] Validation error:", validationError.errors);
        return NextResponse.json(
          { ok: false, error: "Invalid request body", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Upload image to Cloudinary if provided
    let imageUrl: string | null = null;
    if (
      validated.imageBase64 &&
      validated.imageContentType &&
      process.env.CLOUDINARY_CLOUD_NAME
    ) {
      imageUrl = await uploadToCloudinary(
        validated.imageBase64,
        validated.imageContentType
      );
    }

    // Find which company owns this camera IP
    let companyId: string | null = null;
    if (validated.cameraIp) {
      try {
        const companiesCollection = await getCompaniesCollection();
        const company = await companiesCollection.findOne({
          $or: [
            { "cameraSettings.camera1Ip": validated.cameraIp },
            { "cameraSettings.camera2Ip": validated.cameraIp },
          ],
        });
        if (company) {
          companyId = (company as any).companyId;
          console.log(
            `[LPR Ingest] Mapped camera IP ${validated.cameraIp} to company ${companyId}`
          );
        } else {
          console.warn(
            `[LPR Ingest] Camera IP ${validated.cameraIp} not found in any company's camera settings`
          );
        }
      } catch (error) {
        console.error("[LPR Ingest] Error looking up company by camera IP:", error);
        // Continue without companyId - better than failing the entire request
      }
    }

    // Store in MongoDB
    const collection = await getLprCollection();
    const document = {
      plateNumber: validated.plateNumber,
      recognizedAt: validated.recognizedAt,
      cameraIp: validated.cameraIp || null,
      companyId: companyId, // Store company ID for filtering
      imagePath: validated.imagePath || null,
      imageUrl: imageUrl,
      receivedAt: new Date().toISOString(),
      source: "bridge",
    };

    await collection.insertOne(document);

    // #region agent log - Debug LPR ingest success
    console.log(`[DEBUG-LPR-INGEST] Successfully stored LPR data:`, {
      plateNumber: validated.plateNumber,
      recognizedAt: validated.recognizedAt,
      cameraIp: validated.cameraIp,
      companyId: companyId,
      receivedAt: document.receivedAt,
    });
    // #endregion

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Validation errors are already handled above
    if (error instanceof z.ZodError) {
      console.error("[LPR Ingest] Zod validation error:", error.errors);
      return NextResponse.json(
        { ok: false, error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[LPR Ingest] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
