import { NextResponse } from "next/server"
import { getCompanyWorkers } from "@/lib/companies/workers"
import { getActiveCompany } from "@/lib/auth/session"
import { validateCSRF, csrfErrorResponse } from "@/lib/csrf"
import { errorToResponse } from "@/lib/errors"

/**
 * API route to get workers for the authenticated company
 * SECURITY: companyId comes from session, not URL params
 * GET /api/companies/[companyId]/workers
 * 
 * Note: The companyId in URL is kept for backward compatibility but is ignored.
 * The actual companyId is retrieved from the authenticated session.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    // CSRF protection
    if (!validateCSRF(request)) {
      return csrfErrorResponse()
    }

    // Get companyId from session (not from URL params)
    const sessionCompanyId = await getActiveCompany()

    // Get URL companyId for logging (but don't use it)
    const { companyId: urlCompanyId } = await params
    
    // Verify URL companyId matches session (security check)
    if (urlCompanyId && urlCompanyId !== sessionCompanyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const workers = await getCompanyWorkers(sessionCompanyId)
    return NextResponse.json(workers, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

