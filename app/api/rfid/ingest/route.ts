import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getRfidCollection } from "@/lib/db/rfid";
import { getCompaniesCollection } from "@/lib/db/companyDb";

const ingestSchema = z.object({
  siteId: z.string().optional(), // Optional: Gaali Bridge may send only rfid (+ optional cameraIp)
  rfid: z.string().min(1),
  raw: z.string().optional(),
  ts: z.string().optional(),
  deviceIp: z.string().optional(),
  devicePort: z.number().optional(),
  cameraIp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Read body as text so we can verify signature (optional)
    const bodyText = await request.text();
    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Optional signature verification (same pattern as weight ingest)
    const signature = request.headers.get("x-signature");
    const secret = process.env.INGEST_SECRET;
    if (secret && signature) {
      const expected = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
      if (signature !== expected) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else if (secret && !signature) {
      console.warn(
        "Warning: INGEST_SECRET is set but no signature provided. Accepting request without verification."
      );
    }

    // Be tolerant to common field names from RFID readers/bridges
    const rfidValue =
      body.rfid ??
      body.uid ??
      body.tagId ??
      body.tag ??
      body.cardId ??
      body.card ??
      "";

    const defaultSiteId =
      process.env.RFID_DEFAULT_SITE_ID ||
      process.env.NEXT_PUBLIC_RFID_SITE_ID ||
      "default";
    const validated = ingestSchema.parse({
      siteId: body.siteId ?? defaultSiteId,
      rfid: typeof rfidValue === "string" ? rfidValue : String(rfidValue),
      raw: body.raw || "",
      ts: body.ts || new Date().toISOString(),
      deviceIp: body.deviceIp || "",
      devicePort: body.devicePort || 0,
      cameraIp: body.cameraIp || null,
    });
    const siteId = validated.siteId || defaultSiteId;

    // Map company by camera IP (optional)
    let companyId: string | null = null;
    if (validated.cameraIp) {
      try {
        const companies = await getCompaniesCollection();
        const company = await companies.findOne({
          $or: [{ "cameraSettings.camera1Ip": validated.cameraIp }, { "cameraSettings.camera2Ip": validated.cameraIp }],
        });
        if (company) {
          companyId = (company as any).companyId;
          console.log(`[RFID Ingest] Mapped camera IP ${validated.cameraIp} to company ${companyId}`);
        } else {
          console.warn(`[RFID Ingest] Camera IP ${validated.cameraIp} not found in any company's camera settings`);
        }
      } catch (error) {
        console.error("[RFID Ingest] Error looking up company by camera IP:", error);
      }
    }

    const receivedAt = new Date().toISOString();
    const rfidData = {
      siteId,
      rfid: validated.rfid,
      raw: validated.raw,
      ts: validated.ts,
      deviceIp: validated.deviceIp,
      devicePort: validated.devicePort,
      cameraIp: validated.cameraIp || null,
      companyId,
      receivedAt,
    };

    const collection = await getRfidCollection();

    // Insert event (ignore dupes)
    try {
      await collection.insertOne(rfidData);
    } catch (insertError: any) {
      if (insertError?.code === 11000) {
        console.warn("[RFID Ingest] Duplicate key error (data already exists), continuing...");
      } else {
        throw insertError;
      }
    }

    // Upsert latest for quick access
    const { _id, ...rfidDataWithoutId } = rfidData as any;
    await collection.updateOne(
      { siteId, companyId: companyId || null, isLatest: true },
      {
        $set: {
          ...rfidDataWithoutId,
          isLatest: true,
          updatedAt: receivedAt,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: rfidData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    console.error("RFID ingest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

