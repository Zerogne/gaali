"use server"

import { getCompanyCollection } from "@/lib/db/companyDb"
import { getActiveCompany } from "@/lib/auth/session"
import type { Product } from "./products"

/**
 * Migrate default products to database for a company
 * This should be run once per company to initialize default products
 */
export async function migrateDefaultProductsToDatabase(): Promise<void> {
  const companyId = await getActiveCompany()
  const productsCollection = await getCompanyCollection<Product>(companyId, "products")

  const defaultProducts = [
    { value: "industrial", label: "Аж үйлдвэрийн тоног төхөөрөмж" },
    { value: "food", label: "Хүнсний бүтээгдэхүүн" },
    { value: "textiles", label: "Текстиль" },
    { value: "electronics", label: "Электроник" },
    { value: "construction", label: "Барилгын материал" },
    { value: "machinery", label: "Машин механизм" },
    { value: "chemicals", label: "Химийн бодис" },
    { value: "other", label: "Бусад" },
  ]

  console.log(`🔄 Migrating default products to database for company: ${companyId}`)

  for (const product of defaultProducts) {
    // Check if product already exists
    const existing = await productsCollection.findOne({ value: product.value })
    
    if (!existing) {
      const productDoc: Product = {
        id: `default-${product.value}`,
        value: product.value,
        label: product.label,
        isCustom: false,
        createdAt: new Date().toISOString(),
      }
      
      await productsCollection.insertOne(productDoc)
      console.log(`✅ Migrated product: ${product.label}`)
    } else {
      console.log(`⏭️  Product already exists: ${product.label}`)
    }
  }

  console.log(`✅ Migration complete for company: ${companyId}`)
}

/**
 * Migrate default products for all companies (admin function)
 */
export async function migrateDefaultProductsForAllCompanies(): Promise<void> {
  const { getDatabase } = await import("@/lib/db/client")
  const db = await getDatabase()
  
  // Get all company collections
  const collections = await db.listCollections().toArray()
  const companyCollections = collections.filter(c => c.name.startsWith("company_"))
  
  // Extract unique company IDs
  const companyIds = new Set<string>()
  for (const collection of companyCollections) {
    const match = collection.name.match(/^company_(.+?)_/)
    if (match) {
      companyIds.add(match[1])
    }
  }

  console.log(`🔄 Found ${companyIds.size} companies to migrate`)

  for (const companyId of companyIds) {
    try {
      const productsCollection = await getCompanyCollection<Product>(companyId, "products")
      
      const defaultProducts = [
        { value: "industrial", label: "Аж үйлдвэрийн тоног төхөөрөмж" },
        { value: "food", label: "Хүнсний бүтээгдэхүүн" },
        { value: "textiles", label: "Текстиль" },
        { value: "electronics", label: "Электроник" },
        { value: "construction", label: "Барилгын материал" },
        { value: "machinery", label: "Машин механизм" },
        { value: "chemicals", label: "Химийн бодис" },
        { value: "other", label: "Бусад" },
      ]

      for (const product of defaultProducts) {
        const existing = await productsCollection.findOne({ value: product.value })
        
        if (!existing) {
          const productDoc: Product = {
            id: `default-${product.value}`,
            value: product.value,
            label: product.label,
            isCustom: false,
            createdAt: new Date().toISOString(),
          }
          
          await productsCollection.insertOne(productDoc)
        }
      }
      
      console.log(`✅ Migrated products for company: ${companyId}`)
    } catch (error) {
      console.error(`❌ Error migrating products for company ${companyId}:`, error)
    }
  }

  console.log(`✅ Migration complete for all companies`)
}
