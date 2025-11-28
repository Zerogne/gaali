"use client"

import { loginWorker } from "./authServer"
import type { LoginResult } from "./authServer"
import { useRouter } from "next/navigation"

export interface LoginParams {
  companyId: string
  workerId: string
  password: string
}

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

