"use client"

import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ReactNode } from "react"

interface ErrorBoundaryClientProps {
  children: ReactNode
}

export function ErrorBoundaryClient({ children }: ErrorBoundaryClientProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
