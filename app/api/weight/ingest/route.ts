import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getWeightCollection } from "@/lib/db/weight";
import { getCompaniesCollection } from "@/lib/db/companyDb";

const ingestSchema = z.object({
  siteId: z.string(),
  weight: z.number(),
  unit: z.string(),
  raw: z.string().optional(),
  ts: z.string().optional(),
  deviceIp: z.string().optional(),
  devicePort: z.number().optional(),
  cameraIp: z.string().optional(), // Add cameraIp for company mapping (sent together with plate)
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
      cameraIp: body.cameraIp || null,
    });

    // Find which company owns this camera IP (same logic as LPR). Required for per-company autofill.
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
            `[Weight Ingest] Mapped camera IP ${validated.cameraIp} to company ${companyId}`
          );
        } else {
          console.warn(
            `[Weight Ingest] Camera IP ${validated.cameraIp} not found in any company's camera settings - weight will not appear in any company's autofill`
          );
        }
      } catch (error) {
        console.error("[Weight Ingest] Error looking up company by camera IP:", error);
        // Continue without companyId - data will be stored but not shown to any company
      }
    } else {
      console.warn(
        "[Weight Ingest] No cameraIp in request - cannot map to company. Send cameraIp (same as LPR) so weight autofill is scoped per company."
      );
    }

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
      cameraIp: validated.cameraIp || null,
      companyId: companyId, // Store company ID for filtering
      receivedAt: receivedAt,
    };

    // Insert new weight record (handle duplicate key errors gracefully)
    try {
      await collection.insertOne(weightData);
    } catch (insertError: any) {
      // If it's a duplicate key error, that's okay - data already exists
      if (insertError.code === 11000) {
        console.warn(`[Weight Ingest] Duplicate key error (data already exists), continuing...`);
      } else {
        throw insertError;
      }
    }

    // Create a copy without _id for the upsert (MongoDB adds _id to weightData during insertOne)
    const { _id, ...weightDataWithoutId } = weightData as any;

    // Update the latest weight for this siteId and companyId (for quick access)
    await collection.updateOne(
      { siteId: validated.siteId, companyId: companyId || null, isLatest: true },
      { 
        $set: { 
          ...weightDataWithoutId,
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

