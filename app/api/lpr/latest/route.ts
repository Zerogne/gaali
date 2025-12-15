import { NextResponse } from "next/server";
import { getLprCollection } from "@/lib/db/lpr";

export async function GET() {
  try {
    const collection = await getLprCollection();

    // Find latest document by receivedAt
    const latest = await collection
      .find({})
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray();

    if (latest.length === 0) {
      return NextResponse.json({
        plateNumber: null,
        recognizedAt: null,
        imageUrl: null,
        imagePath: null,
        cameraIp: null,
        receivedAt: null,
      });
    }

    const doc = latest[0];

    return NextResponse.json(
      {
        plateNumber: doc.plateNumber || null,
        recognizedAt: doc.recognizedAt || null,
        imageUrl: doc.imageUrl || null,
        imagePath: doc.imagePath || null,
        cameraIp: doc.cameraIp || null,
        receivedAt: doc.receivedAt || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("LPR latest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
