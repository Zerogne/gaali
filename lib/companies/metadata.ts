"use server"

import { getCompaniesCollection } from "@/lib/db/companyDb"

export interface CompanyMetadata {
  companyId: string
  name: string
  description?: string
  logoUrl?: string
  logoInitials?: string
  createdAt: string | Date  // Can be Date from DB or ISO string after serialization
  updatedAt: string | Date
}

/**
 * Get all companies (from shared companies collection)
 * Serializes MongoDB documents to plain objects for Client Components
 */
export async function getAllCompanies(): Promise<CompanyMetadata[]> {
  const companiesCollection = await getCompaniesCollection()
  const companies = await companiesCollection
    .find({})
    .sort({ name: 1 })
    .toArray()

  // Serialize MongoDB documents to plain objects
  return companies.map((company: any) => {
    const { _id, ...companyData } = company
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
    }
  }) as CompanyMetadata[]
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
  const { _id, ...companyData } = company as any
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

