import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}

/** OPTIONS - CORS preflight */
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * GET /api/third-party/url-test
 * Public endpoint for the other site to verify Gaali URL is reachable and get correct format.
 * No auth required. Returns base URL, sample full URL, and curl example.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const baseOrigin = request.headers.get("x-forwarded-proto")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host") || url.host}`
      : url.origin

    const db = await getDatabase()
    const collection = db.collection("third_party_data")
    const sampleDoc = await collection.findOne(
      {},
      { projection: { code: 1 }, sort: { createdAt: -1 } }
    )
    const sampleCode = (sampleDoc as { code?: string } | null)?.code || "31102820250130000001"

    const baseUrl = `${baseOrigin}/api/v1/api/service`
    const altBaseUrl = `${baseOrigin}/api/third-party/data`
    const fullUrl = `${baseUrl}?number=${sampleCode}`

    const result = {
      ok: true,
      message: "Gaali URL is reachable. Use these URLs for pulling data.",
      baseUrl,
      altBaseUrl,
      fullUrlExample: fullUrl,
      parameterName: "number",
      sampleCode,
      curlExample: `curl "${fullUrl}"`,
      supportedParams: ["number", "code"],
      corsEnabled: true,
    }

    return NextResponse.json(result, {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    })
  } catch (error) {
    console.error("❌ url-test error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
