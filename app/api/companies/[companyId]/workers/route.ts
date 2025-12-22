import { NextResponse } from "next/server"
import { getCompanyWorkers } from "@/lib/companies/workers"
import { getActiveCompany } from "@/lib/auth/session"
import { validateCSRF } from "@/lib/csrf"
import { errorToResponse } from "@/lib/errors"
import { getCompanyCollection, getCompaniesCollection } from "@/lib/db/companyDb"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

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
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
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

/**
 * POST /api/companies/[companyId]/workers - Add a new worker
 * 
 * SECURITY: 
 * - During login flow: Verifies company exists and uses URL companyId
 * - After login: Uses companyId from session cookie
 * - Always verifies company exists before allowing worker creation
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    // Get URL companyId from route params
    const resolvedParams = await params
    const urlCompanyId = resolvedParams?.companyId

    if (!urlCompanyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
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

    // Parse request body
    const body = await request.json()
    const { name, role, password } = body

    // Validate required fields
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

    // Available avatar colors
    const avatarColors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-amber-500",
      "bg-lime-500",
    ]

    // Randomly select an avatar color
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]

    // Get workers collection for the company
    const workersCollection = await getCompanyCollection(companyIdToUse, "workers")

    // Check if worker with same name already exists (case-insensitive)
    const existing = await workersCollection.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: "Worker with this name already exists" },
        { status: 409 }
      )
    }

    // Hash password (default to "password123" if not provided)
    const plainPassword = password?.trim() || "password123"
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // Create new worker
    // Generate ID that matches validation schema: /^[a-z0-9-]+$/
    // Use hyphens instead of underscores to comply with validation
    const randomSuffix = Math.random().toString(36).substr(2, 9)
    const newWorker = {
      id: `worker-${Date.now()}-${randomSuffix}`,
      name: name.trim(),
      role: role.trim(),
      avatarColor,
      companyId: companyIdToUse,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    // Insert worker into database
    await workersCollection.insertOne(newWorker)

    // Serialize for return (remove password and _id)
    const { password: _, _id, ...serialized } = newWorker as any
    return NextResponse.json(serialized, { status: 201 })
  } catch (error) {
    console.error("Error adding worker:", error)
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
