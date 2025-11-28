"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { AlertBanner } from "@/components/layout/AlertBanner"
import { SummaryCards } from "@/components/layout/SummaryCards"
import { TruckSection } from "@/components/trucks/TruckSection"
import { TruckTable } from "@/components/trucks/TruckTable"
import { getTruckLogs } from "@/lib/api"
import type { TruckLog } from "@/lib/types"

export default function DashboardPage() {
  const [logs, setLogs] = useState<TruckLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load company-scoped logs on mount
  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true)
        const companyLogs = await getTruckLogs()
        setLogs(companyLogs)
      } catch (error) {
        console.error("Error loading logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [])

  const handleSave = async (log: TruckLog) => {
    // Add to local state immediately for optimistic UI
    setLogs((prev) => [log, ...prev])
    
    // Reload from server to ensure consistency
    try {
      const companyLogs = await getTruckLogs()
      setLogs(companyLogs)
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
      const companyLogs = await getTruckLogs()
      setLogs(companyLogs)
    } catch (error) {
      console.error("Error reloading logs:", error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <AlertBanner />
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
            <TruckTable logs={logs} onSend={handleSend} />
          </div>
        </main>
      </div>
    </div>
  )
}
