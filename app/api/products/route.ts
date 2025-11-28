import { NextResponse } from "next/server"
import { getProducts, addProduct } from "@/lib/products/products"

/**
 * GET /api/products - Get all products for the active company
 */
export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error getting products:", error)
    return NextResponse.json(
      { error: "Failed to get products" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products - Add a new custom product
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { label } = body

    if (!label || typeof label !== "string" || !label.trim()) {
      return NextResponse.json(
        { error: "Product label is required" },
        { status: 400 }
      )
    }

    const product = await addProduct(label.trim())
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error adding product:", error)
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    )
  }
}

