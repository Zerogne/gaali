"use client"

import { logout } from "./authServer"

export async function handleLogout() {
  try {
    await logout()
    // If we reach here, redirect happened
  } catch (error) {
    // Handle redirect errors (Next.js redirect throws)
    if (error && typeof error === "object" && "digest" in error) {
      // This is a Next.js redirect, which means success
      // Trigger client-side redirect as fallback
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return
    }
    
    // If there's an actual error, still try to redirect
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
}

