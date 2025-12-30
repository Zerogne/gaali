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

    // Verify signature if secret is set
    const signature = request.headers.get("x-signature");
    const secret = process.env.INGEST_SECRET;

    if (secret) {
      if (!signature) {
        return NextResponse.json(
          { error: "Missing signature header" },
          { status: 400 }
        );
      }

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
    } else {
      console.warn(
        "Warning: INGEST_SECRET not set, accepting requests without verification"
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
    const weightData = {
      siteId: validated.siteId,
      weight: validated.weight,
      unit: validated.unit,
      raw: validated.raw,
      ts: validated.ts,
      deviceIp: validated.deviceIp,
      devicePort: validated.devicePort,
      receivedAt: new Date().toISOString(),
    };

    // Insert new weight record
    await collection.insertOne(weightData);

    // Also update the latest weight for this siteId (for quick access)
    await collection.updateOne(
      { siteId: validated.siteId, isLatest: true },
      { 
        $set: { 
          ...weightData,
          isLatest: true,
          updatedAt: new Date().toISOString(),
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

