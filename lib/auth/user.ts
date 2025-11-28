"use server"

import { getSession } from "./session"
import { getCompanyWorker } from "@/lib/companies/workers"

export interface UserInfo {
  workerId: string
  companyId: string
  name: string
  role: string
  companyName: string
}

/**
 * Get current user information from session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }

  try {
    // Get worker info from company-scoped collection
    const worker = await getCompanyWorker(session.companyId, session.workerId)
    
    if (!worker) {
      return null
    }

    // Get company name
    const { getCompany } = await import("@/lib/companies/metadata")
    const company = await getCompany(session.companyId)

    return {
      workerId: session.workerId,
      companyId: session.companyId,
      name: worker.name,
      role: worker.role,
      companyName: company?.name || "Unknown Company",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

