"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"

export interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
  createdAt?: string
}

// Default products that are always available
const DEFAULT_PRODUCTS: Omit<Product, "id" | "isCustom" | "createdAt">[] = [
  { value: "industrial", label: "Аж үйлдвэрийн тоног төхөөрөмж" },
  { value: "food", label: "Хүнсний бүтээгдэхүүн" },
  { value: "textiles", label: "Текстиль" },
  { value: "electronics", label: "Электроник" },
  { value: "construction", label: "Барилгын материал" },
  { value: "machinery", label: "Машин механизм" },
  { value: "chemicals", label: "Химийн бодис" },
  { value: "other", label: "Бусад" },
]

/**
 * Get all products for the active company (default + custom)
 */
export async function getProducts(): Promise<Product[]> {
  const companyId = await getActiveCompany()
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  // Get custom products from database
  const customProducts = await productsCollection.find({}).toArray()

  // Serialize and combine with default products
  const defaultProducts: Product[] = DEFAULT_PRODUCTS.map((p) => ({
    ...p,
    id: `default-${p.value}`,
    isCustom: false,
  }))

  const customProductsSerialized: Product[] = customProducts.map((p: any) => {
    const { _id, ...productData } = p
    return {
      ...productData,
      isCustom: true,
    }
  })

  // Combine: default products first, then custom products
  return [...defaultProducts, ...customProductsSerialized]
}

/**
 * Add a new custom product to the company's collection
 */
export async function addProduct(label: string): Promise<Product> {
  const companyId = await getActiveCompany()
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  // Generate value from label (lowercase, replace spaces with hyphens)
  const value = label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  // Check if product with this value already exists
  const existing = await productsCollection.findOne({ value })
  if (existing) {
    throw new Error("Product with this name already exists")
  }

  const product: Product = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    value,
    label,
    isCustom: true,
    createdAt: new Date().toISOString(),
  }

  await productsCollection.insertOne(product)

  return product
}

/**
 * Update a custom product's label
 */
export async function updateProduct(productId: string, label: string): Promise<Product> {
  const companyId = await getActiveCompany()
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  // Generate value from label (lowercase, replace spaces with hyphens)
  const value = label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  // Check if another product with this value already exists (excluding current product)
  const existing = await productsCollection.findOne({ 
    value,
    id: { $ne: productId }
  })
  if (existing) {
    throw new Error("Product with this name already exists")
  }

  const update = {
    label: label.trim(),
    value,
    updatedAt: new Date().toISOString(),
  }

  const result = await productsCollection.updateOne(
    { id: productId, isCustom: true },
    { $set: update }
  )

  if (result.matchedCount === 0) {
    throw new Error("Product not found or cannot be updated")
  }

  const updatedProduct = await productsCollection.findOne({ id: productId })
  if (!updatedProduct) {
    throw new Error("Failed to retrieve updated product")
  }

  const { _id, ...productData } = updatedProduct as any
  return {
    ...productData,
    isCustom: true,
  }
}

/**
 * Delete a custom product (cannot delete default products)
 */
export async function deleteProduct(productId: string): Promise<void> {
  const companyId = await getActiveCompany()
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  // Only allow deleting custom products
  const result = await productsCollection.deleteOne({ id: productId, isCustom: true })
  
  if (result.deletedCount === 0) {
    throw new Error("Product not found or cannot be deleted (default products cannot be deleted)")
  }
}

/**
 * Get all products (for use in components that don't have company context)
 */
export async function getAllProductsForCompany(companyId: string): Promise<Product[]> {
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  const customProducts = await productsCollection.find({}).toArray()

  const defaultProducts: Product[] = DEFAULT_PRODUCTS.map((p) => ({
    ...p,
    id: `default-${p.value}`,
    isCustom: false,
  }))

  const customProductsSerialized: Product[] = customProducts.map((p: any) => {
    const { _id, ...productData } = p
    return {
      ...productData,
      isCustom: true,
    }
  })

  return [...defaultProducts, ...customProductsSerialized]
}
