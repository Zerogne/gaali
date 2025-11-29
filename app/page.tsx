"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { AlertBanner } from "@/components/layout/AlertBanner"
import { SummaryCards } from "@/components/layout/SummaryCards"
import { TruckSection } from "@/components/trucks/TruckSection"
import { TruckTable } from "@/components/trucks/TruckTable"
import { getTruckLogs } from "@/lib/api"
import type { TruckLog } from "@/lib/types"

export default function DashboardPage() {
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
          // Not authenticated, redirect to login
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
    if (isCheckingAuth) return // Wait for auth check

    async function loadLogs() {
      try {
        setIsLoading(true)
        // Get first page of logs (pagination support)
        const result = await getTruckLogs(1, 50)
        setLogs(result.logs)
      } catch (error) {
        console.error("Error loading logs:", error)
        // If error loading logs, might be auth issue, redirect to login
        if (error instanceof Error && error.message.includes("redirect")) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [isCheckingAuth, router])

  const handleSave = async (log: TruckLog) => {
    // Add to local state immediately for optimistic UI
    setLogs((prev) => [log, ...prev])
    
    // Reload from server to ensure consistency
    try {
      const result = await getTruckLogs(1, 50)
      setLogs(result.logs)
    } catch (error) {
      console.error("Error reloading logs:", error)
    }
  }

  const handleSend = async (logId: string) => {
    // Update local state immediately for optimistic UI
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId ? { ...log, sentToCustoms: true } : log
      )
    )
    
    // Reload from server to ensure consistency
    try {
      const result = await getTruckLogs(1, 50)
      setLogs(result.logs)
    } catch (error) {
      console.error("Error reloading logs:", error)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1920px] mx-auto p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600">Monitor truck weighing operations and license plate recognition in real-time</p>
            </div>
            
            {/* Summary Cards */}
            

            {/* Truck IN and OUT Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <TruckSection direction="IN" onSave={handleSave} onSend={handleSend} />
              <TruckSection direction="OUT" onSave={handleSave} onSend={handleSend} />
            </div>

            {/* History Table */}
            <TruckTable 
              logs={logs} 
              onSend={handleSend}
              onUpdate={() => {
                // Reload logs after update
                getTruckLogs(1, 50).then(({ logs }) => setLogs(logs)).catch(console.error)
              }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
