"use client"

import { loginCompany, selectWorker, loginWorker } from "./authServer"
import type { LoginResult } from "./authServer"

export interface CompanyLoginParams {
  companyId: string
  password: string
}

export interface WorkerSelectParams {
  workerId: string
  // companyId removed - server gets it from session
}

export interface LoginParams {
  companyId: string
  workerId: string
  password: string
}

/**
 * Handle company login (Step 2 of new flow)
 */
export async function handleCompanyLogin(
  params: CompanyLoginParams
): Promise<LoginResult> {
  try {
    const result = await loginCompany(params.companyId, params.password)
    return result
  } catch (error) {
    // Handle actual errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "Login failed",
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Handle worker selection (Step 3 of new flow)
 * SECURITY: Only sends workerId - companyId comes from server session
 */
export async function handleWorkerSelect(
  params: WorkerSelectParams
): Promise<LoginResult> {
  try {
    // Only send workerId - server gets companyId from session
    const result = await selectWorker(params.workerId)
    
    // If redirect is returned, handle it client-side
    if (result.redirect) {
      // Use window.location for client-side redirect
      if (typeof window !== "undefined") {
        window.location.href = result.redirect
      }
      return { success: true }
    }
    
    return result
  } catch (error) {
    // Handle redirect errors (Next.js redirect throws)
    if (error && typeof error === "object" && "digest" in error) {
      // This is a Next.js redirect, which means success
      // Trigger client-side redirect
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
      return { success: true }
    }

    // Handle actual errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "Failed to select worker",
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Legacy: Handle full login (company + worker + password)
 * @deprecated Use handleCompanyLogin + handleWorkerSelect instead
 */
export async function handleLogin(
  params: LoginParams
): Promise<LoginResult> {
  try {
    const result = await loginWorker(params.companyId, params.workerId, params.password)
    
    // If redirect is returned, handle it client-side
    if (result.redirect) {
      // Use window.location for client-side redirect
      if (typeof window !== "undefined") {
        window.location.href = result.redirect
      }
      return { success: true }
    }
    
    return result
  } catch (error) {
    // Handle redirect errors (Next.js redirect throws)
    if (error && typeof error === "object" && "digest" in error) {
      // This is a Next.js redirect, which means success
      // Trigger client-side redirect
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
      return { success: true }
    }

    // Handle actual errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "Login failed",
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

