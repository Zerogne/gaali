import { NextResponse } from "next/server"
import { getActiveCompany } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { errorToResponse } from "@/lib/errors"

type TruckSessionDoc = {
  id: string
  direction: "IN" | "OUT"
  inSessionId?: string
  grossWeightKg?: number | string
  netWeightKg?: number | string
  updatedAt?: Date | string
}

function toNumberMaybe(value: unknown): number | null {
  if (typeof value === "number" && !isNaN(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return !isNaN(n) ? n : null
  }
  return null
}

async function scanAndFix(params: {
  companyId: string
  dryRun: boolean
  limit: number
}) {
  const { companyId, dryRun, limit } = params

  const sessions = await getCompanyCollection<TruckSessionDoc>(companyId, "truck_sessions")

  const cursor = sessions
    .find({
      direction: "OUT",
      inSessionId: { $exists: true, $nin: [null, ""] },
    })
    .sort({ createdAt: -1 } as any)
    .limit(limit)

  let scanned = 0
  let updated = 0
  let wouldUpdate = 0
  let skipped = 0

  const examples: Array<{
    outId: string
    inId: string
    outGross: number
    net: number
    expectedIn: number
    beforeIn: number | null
  }> = []

  // tolerance: 1kg, to avoid floating rounding noise
  const TOL = 1

  for await (const out of (cursor as any)) {
    scanned++

    const outGrossRaw = toNumberMaybe(out.grossWeightKg)
    const outNetRaw = toNumberMaybe(out.netWeightKg)
    const inId = typeof out.inSessionId === "string" ? out.inSessionId : null

    if (!outGrossRaw || !outNetRaw || !inId) {
      skipped++
      continue
    }

    const outGross = outGrossRaw
    const outNet = Math.abs(outNetRaw)
    const expectedIn = outGross + outNet

    const inDoc = await sessions.findOne({ id: inId, direction: "IN" })
    if (!inDoc) {
      skipped++
      continue
    }

    const beforeIn = toNumberMaybe(inDoc.grossWeightKg)

    // Only update if it's clearly wrong/inconsistent
    const needsUpdate =
      beforeIn === null ||
      Math.abs(beforeIn - expectedIn) > TOL ||
      beforeIn < outGross - TOL

    if (!needsUpdate) {
      continue
    }

    wouldUpdate++

    if (examples.length < 20) {
      examples.push({
        outId: out.id,
        inId,
        outGross,
        net: outNet,
        expectedIn,
        beforeIn,
      })
    }

    if (!dryRun) {
      await sessions.updateOne(
        { id: inId },
        { $set: { grossWeightKg: expectedIn, updatedAt: new Date() } as any }
      )
      updated++
    }
  }

  return {
    ok: true,
    companyId,
    dryRun,
    scannedOutSessions: scanned,
    wouldUpdateInSessions: wouldUpdate,
    updatedInSessions: updated,
    skipped,
    examples,
    message: dryRun
      ? "Dry run complete. Use POST without dryRun=1 to apply updates."
      : "Repair complete. PDFs will use corrected IN grossWeightKg.",
  }
}

/**
 * POST /api/truck-sessions/fix-old-weights
 *
 * Repairs old IN session grossWeightKg values when they are inconsistent with the linked OUT session.
 *
 * Logic (only when OUT has inSessionId + grossWeightKg + netWeightKg):
 *   expectedInGross = out.grossWeightKg + abs(out.netWeightKg)
 * If IN.grossWeightKg differs materially from expectedInGross, we update it.
 *
 * Query params:
 * - dryRun=1  -> no writes, just report what would change
 * - limit=500 -> max OUT sessions to scan (default 500)
 */
export async function GET(request: Request) {
  try {
    const companyId = await getActiveCompany()
    if (!companyId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Math.min(5000, Math.max(1, Number(url.searchParams.get("limit") || "500")))

    // GET is always dry-run (no writes)
    const result = await scanAndFix({ companyId, dryRun: true, limit })
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error fixing old weights (GET):", error)
    const errorResponse = errorToResponse(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const companyId = await getActiveCompany()
    if (!companyId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const dryRun = url.searchParams.get("dryRun") === "1"
    const limit = Math.min(5000, Math.max(1, Number(url.searchParams.get("limit") || "500")))
    const result = await scanAndFix({ companyId, dryRun, limit })
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error fixing old weights:", error)
    const errorResponse = errorToResponse(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

