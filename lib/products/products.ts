"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import { migrateDefaultProductsToDatabase } from "./migrate"

export interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
  createdAt?: string
}

/**
 * Get all products for the active company (from database only)
 * Default products are now stored in the database
 */
export async function getProducts(): Promise<Product[]> {
  const companyId = await getActiveCompany()
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  // Get all products from database (default + custom)
  const allProducts = await productsCollection.find({}).sort({ isCustom: 1, label: 1 }).toArray()

  // If no products exist, migrate defaults
  if (allProducts.length === 0) {
    console.log("📦 No products found, migrating default products...")
    await migrateDefaultProductsToDatabase()
    // Fetch again after migration
    const migratedProducts = await productsCollection.find({}).sort({ isCustom: 1, label: 1 }).toArray()
    return migratedProducts.map((p: any) => {
      const { _id, ...productData } = p
      return productData
    })
  }

  // Serialize MongoDB documents to plain objects
  return allProducts.map((p: any) => {
    const { _id, ...productData } = p
    return productData
  })
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
 * Get all products for a specific company (from database only)
 */
export async function getAllProductsForCompany(companyId: string): Promise<Product[]> {
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  // Get all products from database
  const allProducts = await productsCollection.find({}).sort({ isCustom: 1, label: 1 }).toArray()

  // Serialize MongoDB documents to plain objects
  return allProducts.map((p: any) => {
    const { _id, ...productData } = p
    return productData
  })
}
