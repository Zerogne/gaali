import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLprCollection } from "@/lib/db/lpr";

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
      return NextResponse.json(
        { ok: false, error: "LPR_INGEST_SECRET not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validated = ingestSchema.parse(body);

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

    // Store in MongoDB
    const collection = await getLprCollection();
    const document = {
      plateNumber: validated.plateNumber,
      recognizedAt: validated.recognizedAt,
      cameraIp: validated.cameraIp || null,
      imagePath: validated.imagePath || null,
      imageUrl: imageUrl,
      receivedAt: new Date().toISOString(),
      source: "bridge",
    };

    await collection.insertOne(document);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("LPR ingest error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
