"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Worker } from "@/lib/auth/mockData"
import { handleWorkerSelect } from "@/lib/auth/authClient"

interface WorkerSelectorProps {
  companyName: string
  workers: Worker[]
  selectedWorkerId: string | null
  onSelect: (workerId: string) => void
  onBack: () => void
  isLoading?: boolean
}

export function WorkerSelector({
  companyName,
  workers,
  selectedWorkerId,
  onSelect,
  onBack,
  isLoading: isLoadingWorkers = false,
}: WorkerSelectorProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId)

  const handleWorkerClick = async (workerId: string) => {
    // Immediately select the worker visually
    onSelect(workerId)
    setError(null)

    // Auto-submit after selection
    setIsSelecting(true)

    try {
      // SECURITY: Only send workerId - server gets companyId from session
      // This prevents client-side manipulation of companyId
      const result = await handleWorkerSelect({
        workerId,
      })

      if (!result.success) {
        setError(result.error || "Failed to select worker")
        // Don't deselect on error - keep the visual selection
      }
      // If success, redirect happens in authServer
    } catch (err) {
      setError("An unexpected error occurred")
      // Don't deselect on error - keep the visual selection
    } finally {
      setIsSelecting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to company password
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Select Worker Account
        </h2>
        <p className="text-sm text-gray-600">
          Choose your worker profile to continue.
        </p>
      </div>

      <div className="space-y-4">
        {/* Worker Profiles */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Available Workers
          </Label>
          {isLoadingWorkers ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading workers...
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workers found for this company
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {workers.map((worker) => {
                const isSelected = selectedWorkerId === worker.id
                const isProcessing = isSelected && isSelecting
                return (
                  <Card
                    key={worker.id}
                    onClick={() => !isSelecting && handleWorkerClick(worker.id)}
                    className={`
                      p-4 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? "border-2 border-blue-600 bg-blue-50 shadow-md"
                        : "border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }
                      ${isSelecting ? "opacity-50 cursor-wait" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                          ${worker.avatarColor}
                        `}
                      >
                        {getInitials(worker.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {worker.name}
                        </p>
                        <p className="text-xs text-gray-600">{worker.role}</p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

