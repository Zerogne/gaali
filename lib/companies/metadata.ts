"use server"

import { getCompaniesCollection } from "@/lib/db/companyDb"

export interface CompanyMetadata {
  companyId: string
  name: string
  description?: string
  logoUrl?: string
  logoInitials?: string
  password?: string  // Company password for authentication
  createdAt: string | Date  // Can be Date from DB or ISO string after serialization
  updatedAt: string | Date
}

/**
 * Get all companies (from shared companies collection)
 * Serializes MongoDB documents to plain objects for Client Components
 */
export async function getAllCompanies(): Promise<CompanyMetadata[]> {
  try {
    console.log("📥 getAllCompanies: Getting companies collection...")
    const companiesCollection = await getCompaniesCollection()
    console.log("📥 getAllCompanies: Finding companies...")
    const companies = await companiesCollection
      .find({})
      .sort({ name: 1 })
      .toArray()
    
    console.log(`📥 getAllCompanies: Found ${companies.length} companies`)

    // Serialize MongoDB documents to plain objects
    // Note: password is NOT included in serialized output for security
    const serialized = companies.map((company: any) => {
      try {
        const { _id, password, ...companyData } = company
        return {
          companyId: companyData.companyId,
          name: companyData.name,
          description: companyData.description,
          logoUrl: companyData.logoUrl,
          logoInitials: companyData.logoInitials,
          createdAt: companyData.createdAt instanceof Date 
            ? companyData.createdAt.toISOString() 
            : (typeof companyData.createdAt === 'string' 
                ? companyData.createdAt 
                : (companyData.createdAt ? new Date(companyData.createdAt).toISOString() : new Date().toISOString())),
          updatedAt: companyData.updatedAt instanceof Date 
            ? companyData.updatedAt.toISOString() 
            : (typeof companyData.updatedAt === 'string' 
                ? companyData.updatedAt 
                : (companyData.updatedAt ? new Date(companyData.updatedAt).toISOString() : new Date().toISOString())),
        }
      } catch (error) {
        console.error("❌ Error serializing company:", company, error)
        throw error
      }
    }) as CompanyMetadata[]
    
    console.log("✅ getAllCompanies: Successfully serialized companies")
    return serialized
  } catch (error) {
    console.error("❌ Error in getAllCompanies:", error)
    throw error
  }
}

/**
 * Get a single company by ID
 * Serializes MongoDB document to plain object for Client Components
 */
export async function getCompany(companyId: string): Promise<CompanyMetadata | null> {
  const companiesCollection = await getCompaniesCollection()
  const company = await companiesCollection.findOne({ companyId })
  
  if (!company) return null

  // Serialize MongoDB document to plain object
  // Note: password is NOT included in serialized output for security
  const { _id, password, ...companyData } = company as any
  return {
    companyId: companyData.companyId,
    name: companyData.name,
    description: companyData.description,
    logoUrl: companyData.logoUrl,
    logoInitials: companyData.logoInitials,
    createdAt: companyData.createdAt instanceof Date 
      ? companyData.createdAt.toISOString() 
      : (typeof companyData.createdAt === 'string' 
          ? companyData.createdAt 
          : new Date(companyData.createdAt).toISOString()),
    updatedAt: companyData.updatedAt instanceof Date 
      ? companyData.updatedAt.toISOString() 
      : (typeof companyData.updatedAt === 'string' 
          ? companyData.updatedAt 
          : new Date(companyData.updatedAt).toISOString()),
  } as CompanyMetadata
}

/**
 * Create or update company metadata
 */
export async function upsertCompany(company: Omit<CompanyMetadata, "createdAt" | "updatedAt">) {
  const companiesCollection = await getCompaniesCollection()
  
  await companiesCollection.updateOne(
    { companyId: company.companyId },
    {
      $set: {
        ...company,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
}
