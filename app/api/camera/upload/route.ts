// CAMERA REAL-TIME VIDEO FEATURE REMOVED
// This endpoint is disabled
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: "Camera real-time video feature has been removed" },
    { status: 410 } // 410 Gone - feature removed
  );
}
