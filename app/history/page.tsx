"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { HistoryTable } from "@/components/history-table"
import { getTruckLogs } from "@/lib/api"
import type { TruckLog } from "@/lib/types"

export default function HistoryPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<TruckLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/user")
        if (!response.ok) {
          router.push("/login")
          return
        }
        setIsCheckingAuth(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Load company-scoped logs on mount (only if authenticated)
  useEffect(() => {
    if (isCheckingAuth) return

    async function loadLogs() {
      try {
        setIsLoading(true)
        const companyLogs = await getTruckLogs()
        setLogs(companyLogs.logs)
      } catch (error) {
        console.error("Error loading logs:", error)
        if (error instanceof Error && error.message.includes("redirect")) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [isCheckingAuth, router])

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
            <p className="text-muted-foreground">View and search all scanned truck records</p>
          </div>
          <HistoryTable 
            logs={logs} 
            onUpdate={() => {
              // Reload logs after update
              getTruckLogs().then(({ logs }) => setLogs(logs)).catch(console.error)
            }}
          />
        </main>
      </div>
    </div>
  )
}
