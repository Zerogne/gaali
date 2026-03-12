import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/client"
import { getActiveCompany } from "@/lib/auth/session"
import { getCompanyCollection } from "@/lib/db/companyDb"

/**
 * POST /api/third-party/save
 * Saves third-party data to a file-like storage (database)
 * Returns the URL where the data can be fetched
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📥 Received third-party data to save:", body)

    // Get company ID
    let companyId: string
    try {
      companyId = await getActiveCompany()
      if (!companyId) {
        return NextResponse.json(
          { error: "No active company found. Please log in." },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error("❌ Error getting active company:", error)
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      )
    }

    // Extract unique code - required for update. Never generate new code on save (avoids duplicate blocks when resending)
    const uniqueCode = body.uniqueCode || body.code
    if (!uniqueCode || typeof uniqueCode !== "string" || uniqueCode.trim() === "") {
      return NextResponse.json(
        { error: "uniqueCode or code is required", message: "Cannot save without an existing act number" },
        { status: 400 }
      )
    }
    const data = body.data || body

    // Get database
    const db = await getDatabase()
    const collection = db.collection("third_party_data")

    // Normalize data to array payload format
    const normalizedData = Array.isArray(data) ? data : [data]
    const firstPayload = normalizedData[0] && typeof normalizedData[0] === "object"
      ? { ...(normalizedData[0] as Record<string, any>) }
      : null

    // Never lose existing contract on resend/update.
    // Resolve from incoming payload first, then company metadata, then previous saved payload.
    let resolvedContract =
      String(firstPayload?.CON || firstPayload?.con || "").trim()

    if (!resolvedContract && firstPayload) {
      const transportCompanyId = String(firstPayload.transportCompanyId || body.transportCompanyId || "").trim()
      const senderOrganizationId = String(firstPayload.senderOrganizationId || body.senderOrganizationId || "").trim()
      const receiverOrganizationId = String(firstPayload.receiverOrganizationId || body.receiverOrganizationId || "").trim()
      const transportCompanyName = String(
        firstPayload.transporterCompany ||
          firstPayload.transportCompanyName ||
          body.transporterCompany ||
          body.transportCompanyName ||
          ""
      ).trim()
      const senderOrganizationName = String(
        firstPayload.senderOrganization ||
          firstPayload.senderOrganizationName ||
          body.senderOrganization ||
          body.senderOrganizationName ||
          ""
      ).trim()
      const receiverOrganizationName = String(
        firstPayload.receiverOrganization ||
          firstPayload.receiverOrganizationName ||
          body.receiverOrganization ||
          body.receiverOrganizationName ||
          ""
      ).trim()

      // 1) transport company contract
      if (transportCompanyId) {
        try {
          const transportCompanies = await getCompanyCollection<any>(companyId, "transportCompanies")
          const tc = await transportCompanies.findOne({ id: transportCompanyId })
          resolvedContract = String(tc?.contract || "").trim()
        } catch (err) {
          console.warn("[ThirdParty Save] Failed to resolve transport company contract:", err)
        }
      }

      // 1b) transport company contract by company name (for old logs without IDs)
      if (!resolvedContract && transportCompanyName && transportCompanyName !== "—") {
        try {
          const transportCompanies = await getCompanyCollection<any>(companyId, "transportCompanies")
          const tc = await transportCompanies.findOne({ name: transportCompanyName })
          resolvedContract = String(tc?.contract || "").trim()
        } catch (err) {
          console.warn("[ThirdParty Save] Failed to resolve transport company contract by name:", err)
        }
      }

      // 2) sender org contract
      if (!resolvedContract && senderOrganizationId) {
        try {
          const orgs = await getCompanyCollection<any>(companyId, "organizations")
          const sender = await orgs.findOne({ id: senderOrganizationId })
          resolvedContract = String(sender?.contract || "").trim()
        } catch (err) {
          console.warn("[ThirdParty Save] Failed to resolve sender organization contract:", err)
        }
      }

      // 2b) sender org contract by name (for old logs without IDs)
      if (!resolvedContract && senderOrganizationName) {
        try {
          const orgs = await getCompanyCollection<any>(companyId, "organizations")
          const sender = await orgs.findOne({ name: senderOrganizationName })
          resolvedContract = String(sender?.contract || "").trim()
        } catch (err) {
          console.warn("[ThirdParty Save] Failed to resolve sender organization contract by name:", err)
        }
      }

      // 3) receiver org contract
      if (!resolvedContract && receiverOrganizationId) {
        try {
          const orgs = await getCompanyCollection<any>(companyId, "organizations")
          const receiver = await orgs.findOne({ id: receiverOrganizationId })
          resolvedContract = String(receiver?.contract || "").trim()
        } catch (err) {
          console.warn("[ThirdParty Save] Failed to resolve receiver organization contract:", err)
        }
      }

      // 3b) receiver org contract by name (for old logs without IDs)
      if (!resolvedContract && receiverOrganizationName) {
        try {
          const orgs = await getCompanyCollection<any>(companyId, "organizations")
          const receiver = await orgs.findOne({ name: receiverOrganizationName })
          resolvedContract = String(receiver?.contract || "").trim()
        } catch (err) {
          console.warn("[ThirdParty Save] Failed to resolve receiver organization contract by name:", err)
        }
      }
    }

    // 4) Preserve previous saved contract if incoming payload has none
    if (!resolvedContract) {
      const previousDoc = await collection.findOne({ code: uniqueCode, companyId })
      if (
        previousDoc &&
        Array.isArray((previousDoc as any).data) &&
        (previousDoc as any).data.length > 0
      ) {
        const prev = (previousDoc as any).data[0] || {}
        resolvedContract = String(prev.CON || prev.con || "").trim()
      }
    }

    if (firstPayload && resolvedContract) {
      firstPayload.CON = resolvedContract
      firstPayload.con = resolvedContract // compatibility
      normalizedData[0] = firstPayload
    }

    const now = new Date()
    const updateDoc = {
      data: normalizedData,
      updatedAt: now,
    }

    // Save to database (upsert), preserving create/access counters on updates
    await collection.updateOne(
      { code: uniqueCode, companyId: companyId },
      {
        $set: updateDoc,
        $setOnInsert: {
          code: uniqueCode,
          companyId: companyId,
          createdAt: now,
          accessedAt: now,
          accessCount: 0,
        },
      },
      { upsert: true }
    )

    console.log("✅ Third-party data saved with code:", uniqueCode, "| CON:", resolvedContract || "(empty)")

    // Build the URL where this data can be fetched
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== "undefined" ? window.location.origin : "https://gaali.vercel.app")
    const fileUrl = `${baseUrl}/api/third-party/data/${uniqueCode}`

    return NextResponse.json({
      success: true,
      code: uniqueCode,
      contract: resolvedContract || "",
      url: fileUrl,
      message: "Data saved successfully",
    })
  } catch (error) {
    console.error("❌ Error saving third-party data:", error)
    return NextResponse.json(
      {
        error: "Failed to save data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

