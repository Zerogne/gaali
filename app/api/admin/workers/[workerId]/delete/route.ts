import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompanyCollection } from "@/lib/db/companyDb"

/**
 * DELETE /api/admin/workers/[workerId]/delete - Delete a worker
 * Requires companyId in query params
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workerId: string }> | { workerId: string } }
) {
  try {
    await requireAdmin()

    // Handle both sync and async params (Next.js 13+ vs 15+)
    const resolvedParams = params instanceof Promise ? await params : params
    const workerId = resolvedParams.workerId
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company ID is required" },
        { status: 400 }
      )
    }

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: "Worker ID is required" },
        { status: 400 }
      )
    }

    const workersCollection = await getCompanyCollection(companyId, "workers")

    // Check if worker exists
    const worker = await workersCollection.findOne({ id: workerId })
    if (!worker) {
      return NextResponse.json(
        { success: false, error: "Worker not found" },
        { status: 404 }
      )
    }

    // Delete the worker
    const result = await workersCollection.deleteOne({ id: workerId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to delete worker" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Worker ${workerId} has been deleted`,
    })
  } catch (error) {
    console.error("Error deleting worker:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete worker",
      },
      { status: 500 }
    )
  }
}
