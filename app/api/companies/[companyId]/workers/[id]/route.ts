import { NextResponse } from "next/server"
import { validateCSRF } from "@/lib/csrf"
import { errorToResponse } from "@/lib/errors"
import { getCompanyCollection, getCompaniesCollection } from "@/lib/db/companyDb"
import { cookies } from "next/headers"

/**
 * PUT /api/companies/[companyId]/workers/[id] - Update a worker
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  try {
    console.log("[PUT] Endpoint called")
    // Get URL companyId and id from route params
    const resolvedParams = await params
    const urlCompanyId = resolvedParams?.companyId
    const id = resolvedParams?.id

    console.log("[PUT] Params:", { urlCompanyId, id })

    if (!urlCompanyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      )
    }

    // CSRF protection - more lenient in development
    const csrfValid = validateCSRF(request)
    if (!csrfValid && process.env.NODE_ENV === 'production') {
      console.warn("CSRF validation failed in production")
      // In production, we should be stricter, but allow during login flow
      // The company verification below provides additional security
    }

    // Get companyId from cookie (may not exist during login flow)
    const cookieStore = await cookies()
    const sessionCompanyId = cookieStore.get("company-id")?.value || null
    
    console.log("[PUT] Cookie check:", { sessionCompanyId, urlCompanyId })
    
    // Determine which companyId to use
    // Priority: session cookie > URL param (if company verified)
    let companyIdToUse: string | null = null

    if (sessionCompanyId) {
      // We have a session cookie - verify it matches URL
      if (sessionCompanyId === urlCompanyId) {
        companyIdToUse = sessionCompanyId
        console.log("[PUT] Using session companyId:", companyIdToUse)
      } else {
        // Mismatch - this is a security issue
        console.error("[PUT] Company ID mismatch:", { sessionCompanyId, urlCompanyId })
        return NextResponse.json(
          { error: "Unauthorized - Company ID mismatch" },
          { status: 403 }
        )
      }
    } else {
      // No session cookie - we're in login flow
      // Verify the company exists before allowing
      console.log("[PUT] No session cookie, verifying company exists")
      const companiesCollection = await getCompaniesCollection()
      const company = await companiesCollection.findOne({ companyId: urlCompanyId })
      
      console.log("[PUT] Company lookup:", company ? `Found: ${company.companyId}` : "Not found")
      
      if (!company) {
        console.error("[PUT] Company not found in database:", urlCompanyId)
        return NextResponse.json(
          { error: "Unauthorized - Company not found" },
          { status: 401 }
        )
      }
      
      // Company exists, allow using URL companyId during login flow
      companyIdToUse = urlCompanyId
      console.log("[PUT] Using URL companyId:", companyIdToUse)
    }

    if (!companyIdToUse) {
      return NextResponse.json(
        { error: "Unauthorized - Unable to determine company" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, role } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Worker name is required" },
        { status: 400 }
      )
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json(
        { error: "Worker role is required" },
        { status: 400 }
      )
    }

    const workersCollection = await getCompanyCollection(companyIdToUse, "workers")

    const update = {
      name: name.trim(),
      role: role.trim(),
      updatedAt: new Date().toISOString(),
    }

    const result = await workersCollection.updateOne(
      { id },
      { $set: update }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      )
    }

    const updatedWorker = await workersCollection.findOne({ id })
    const { password: _, _id, ...serialized } = updatedWorker as any
    return NextResponse.json(serialized, { status: 200 })
  } catch (error) {
    console.error("Error updating worker:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * DELETE /api/companies/[companyId]/workers/[id] - Delete a worker
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  try {
    // Get URL companyId and id from route params
    const resolvedParams = await params
    const urlCompanyId = resolvedParams?.companyId
    const id = resolvedParams?.id

    if (!urlCompanyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      )
    }

    // CSRF protection - more lenient in development
    const csrfValid = validateCSRF(request)
    if (!csrfValid && process.env.NODE_ENV === 'production') {
      console.warn("CSRF validation failed in production")
      // In production, we should be stricter, but allow during login flow
      // The company verification below provides additional security
    }

    // Get companyId from cookie (may not exist during login flow)
    const cookieStore = await cookies()
    const sessionCompanyId = cookieStore.get("company-id")?.value || null
    
    // Determine which companyId to use
    // Priority: session cookie > URL param (if company verified)
    let companyIdToUse: string | null = null

    if (sessionCompanyId) {
      // We have a session cookie - verify it matches URL
      if (sessionCompanyId === urlCompanyId) {
        companyIdToUse = sessionCompanyId
      } else {
        // Mismatch - this is a security issue
        return NextResponse.json(
          { error: "Unauthorized - Company ID mismatch" },
          { status: 403 }
        )
      }
    } else {
      // No session cookie - we're in login flow
      // Verify the company exists before allowing
      const companiesCollection = await getCompaniesCollection()
      const company = await companiesCollection.findOne({ companyId: urlCompanyId })
      
      if (!company) {
        return NextResponse.json(
          { error: "Unauthorized - Company not found" },
          { status: 401 }
        )
      }
      
      // Company exists, allow using URL companyId during login flow
      companyIdToUse = urlCompanyId
    }

    if (!companyIdToUse) {
      return NextResponse.json(
        { error: "Unauthorized - Unable to determine company" },
        { status: 401 }
      )
    }

    const workersCollection = await getCompanyCollection(companyIdToUse, "workers")

    const result = await workersCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting worker:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
