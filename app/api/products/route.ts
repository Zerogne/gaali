import { NextResponse } from "next/server"
import { getProducts, addProduct } from "@/lib/products/products"
import { validateCSRF, csrfErrorResponse } from "@/lib/csrf"
import { addProductSchema } from "@/lib/validation"
import { errorToResponse } from "@/lib/errors"

/**
 * GET /api/products - Get all products for the active company
 */
export async function GET(request: Request) {
  try {
    // CSRF protection for GET is optional, but good practice
    const products = await getProducts()
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    const errorResponse = errorToResponse(error)
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * POST /api/products - Add a new custom product
 * Includes CSRF protection and input validation
 */
export async function POST(request: Request) {
  try {
    // CSRF protection
    if (!validateCSRF(request)) {
      return csrfErrorResponse()
    }

    const body = await request.json()
    
    // Validate input with Zod
    const validation = addProductSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.issues.map(i => i.message).join(", ")
        },
        { status: 400 }
      )
    }

    const product = await addProduct(validation.data.label)
    return NextResponse.json(product, { status: 201 })
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
    
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

