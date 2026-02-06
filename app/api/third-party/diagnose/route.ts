import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getCompaniesCollection, getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"

/**
 * GET /api/third-party/diagnose
 * Diagnostic endpoint to troubleshoot pull/send issues.
 * Requires auth. Returns DB counts, sample codes, and configuration.
 */
export async function GET() {
  try {
    let companyId: string | null = null
    try {
      companyId = await getActiveCompany()
    } catch {
      return NextResponse.json(
        { error: "Authentication required", message: "Please log in to run diagnostics" },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      companyId,
      pull: {} as Record<string, unknown>,
      send: {} as Record<string, unknown>,
      dataFlow: {
        description:
          "PULL: 3rd party fetches from /api/third-party/data?code=X (reads third_party_data). " +
          "SEND: Gaali sends via WebSocket to 3rd party app (must be running on ws://127.0.0.1:9000/service).",
      },
    }

    // Pull diagnostics: third_party_data collection
    const thirdPartyCollection = db.collection("third_party_data")
    const thirdPartyCount = await thirdPartyCollection.countDocuments()
    const sampleDocs = await thirdPartyCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ code: 1, companyId: 1, createdAt: 1 })
      .toArray()

    const sampleCodes = sampleDocs.map((d: { code?: string }) => d.code).filter(Boolean)
    const companyDocs = companyId
      ? await thirdPartyCollection.countDocuments({ companyId })
      : 0

    ;(results.pull as Record<string, unknown>) = {
      third_party_data_total: thirdPartyCount,
      third_party_data_for_company: companyDocs,
      sample_codes: sampleCodes,
      pull_endpoints: [
        "GET /api/third-party/data?number=YOUR_ACT_NUMBER (spec-required)",
        "GET /api/third-party/data?code=YOUR_CODE",
        "GET /api/third-party/data/YOUR_CODE",
      ],
      public_access: "Yes - no auth required for pull",
    }

    // Send diagnostics: WebSocket config (from company settings)
    const companiesCollection = await getCompaniesCollection()
    const company = await companiesCollection.findOne(
      { companyId },
      { projection: { thirdPartyWsUrl: 1 } }
    )
    const wsUrl = (company as { thirdPartyWsUrl?: string } | null)?.thirdPartyWsUrl || null

    ;(results.send as Record<string, unknown>) = {
      websocket_url_configured: wsUrl || "Not set (using default ws://127.0.0.1:9000/service)",
      websocket_default: "ws://127.0.0.1:9000/service",
      requirement: "3rd party app must run a WebSocket server listening on that URL",
      env_override: process.env.NEXT_PUBLIC_THIRD_PARTY_WS_URL || "Not set",
    }

    // Truck sessions count (for context - data flows from sessions to third_party_data on save)
    try {
      if (companyId) {
        const sessionsCollection = await getCompanyCollection(companyId, "truck_sessions")
        const sessionsCount = await sessionsCollection.countDocuments()
        ;(results.pull as Record<string, unknown>).truck_sessions_for_company = sessionsCount
      }
    } catch {
      /* ignore */
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error("❌ Third-party diagnose error:", error)
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
