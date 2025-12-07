import { NextResponse } from "next/server"
import { deleteProduct, updateProduct } from "@/lib/products/products"
import { validateCSRF, csrfErrorResponse } from "@/lib/csrf"
import { deleteProductSchema, addProductSchema } from "@/lib/validation"
import { errorToResponse } from "@/lib/errors"

/**
 * PUT /api/products/[id] - Update a custom product
 * Includes CSRF protection and input validation
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CSRF protection
    if (!validateCSRF(request)) {
      return csrfErrorResponse()
    }

    const { id } = await params
    const body = await request.json()

    // Validate input with Zod
    const validation = addProductSchema.safeParse({ label: body.label })
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.issues.map(i => i.message).join(", ")
        },
        { status: 400 }
      )
    }

    const product = await updateProduct(id, validation.data.label)
    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    
    // Handle duplicate product error
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { statusCode })
  }
}

/**
 * DELETE /api/products/[id] - Delete a custom product
 * Includes CSRF protection and input validation
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CSRF protection
    if (!validateCSRF(request)) {
      return csrfErrorResponse()
    }

    const { id } = await params

    // Validate input
    const validation = deleteProductSchema.safeParse({ id })
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.issues.map(i => i.message).join(", ")
        },
        { status: 400 }
      )
    }

    await deleteProduct(validation.data.id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

