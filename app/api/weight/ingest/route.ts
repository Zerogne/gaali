import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getWeightCollection } from "@/lib/db/weight";

const ingestSchema = z.object({
  siteId: z.string(),
  weight: z.number(),
  unit: z.string(),
  raw: z.string().optional(),
  ts: z.string().optional(),
  deviceIp: z.string().optional(),
  devicePort: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get request body as string for signature verification
    const bodyText = await request.text();
    let body: any;
    
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Verify signature if both secret and signature are provided (optional)
    const signature = request.headers.get("x-signature");
    const secret = process.env.INGEST_SECRET;

    // Only verify signature if both secret and signature are provided
    // This allows the weight bridge to connect without authentication
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(bodyText)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Signature mismatch");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
      // Signature verified successfully
    } else if (secret && !signature) {
      // Secret is set but no signature provided - accept request but log warning
      console.warn(
        "Warning: INGEST_SECRET is set but no signature provided. Accepting request without verification."
      );
    }

    // Validate request body
    const validated = ingestSchema.parse({
      siteId: body.siteId,
      weight: body.weight,
      unit: body.unit,
      raw: body.raw || "",
      ts: body.ts || new Date().toISOString(),
      deviceIp: body.deviceIp || "",
      devicePort: body.devicePort || 0,
    });

    // Store weight data in MongoDB
    const collection = await getWeightCollection();
    const receivedAt = new Date().toISOString();
    const weightData = {
      siteId: validated.siteId,
      weight: validated.weight,
      unit: validated.unit,
      raw: validated.raw,
      ts: validated.ts,
      deviceIp: validated.deviceIp,
      devicePort: validated.devicePort,
      receivedAt: receivedAt,
    };

    // Insert new weight record (handle duplicate key errors gracefully)
    try {
      await collection.insertOne(weightData);
    } catch (insertError: any) {
      // If it's a duplicate key error, that's okay - data already exists
      // This can happen if the same request is sent twice quickly
      if (insertError.code === 11000) {
        console.warn(`[Weight Ingest] Duplicate key error (data already exists), continuing...`);
      } else {
        // Re-throw if it's a different error
        throw insertError;
      }
    }

    // Also update the latest weight for this siteId (for quick access)
    await collection.updateOne(
      { siteId: validated.siteId, isLatest: true },
      { 
        $set: { 
          ...weightData,
          isLatest: true,
          updatedAt: receivedAt,
        } 
      },
      { upsert: true }
    );

    console.log("Weight ingested:", weightData);

    return NextResponse.json({
      success: true,
      data: weightData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Weight ingest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

