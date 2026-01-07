"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import type { Worker } from "@/lib/auth/mockData"
import { handleWorkerSelect } from "@/lib/auth/authClient"
import { useToast } from "@/hooks/use-toast"

interface WorkerSelectorProps {
  companyName: string
  companyId: string
  workers: Worker[]
  selectedWorkerId: string | null
  onSelect: (workerId: string) => void
  onBack: () => void
  onWorkerAdded?: () => void
  isLoading?: boolean
}

export function WorkerSelector({
  companyName,
  companyId,
  workers,
  selectedWorkerId,
  onSelect,
  onBack,
  onWorkerAdded,
  isLoading: isLoadingWorkers = false,
}: WorkerSelectorProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [workerData, setWorkerData] = useState({ name: "", role: "" })
  const { toast } = useToast()

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

  const handleAddWorker = async () => {
    if (!workerData.name.trim() || !workerData.role.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр болон албан тушаал оруулах шаардлагатай",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch(`/api/companies/${companyId}/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          name: workerData.name.trim(),
          role: workerData.role.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add worker")
      }

      toast({
        title: "Амжилттай",
        description: "Ажилтан амжилттай нэмэгдлээ",
      })

      setWorkerData({ name: "", role: "" })
      setIsDialogOpen(false)

      // Refresh workers list
      if (onWorkerAdded) {
        onWorkerAdded()
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Ажилтан нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
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
        Буцах
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Ажилтан сонгох
        </h2>
        
      </div>

      <div className="space-y-4">
        {/* Worker Profiles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-gray-700">
              Бүртгэлтэй ажилтан 
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Ажилтан нэмэх
            </Button>
          </div>
          {isLoadingWorkers ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Ажилтаны жагсаалтын татаж байна...
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Бүртгэлтэй ажилтан олдсонгүй
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

      {/* Add Worker Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ажилтан нэмэх</DialogTitle>
            <DialogDescription>
              Шинэ ажилтан нэмэх
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="worker-name" className="text-sm font-medium text-gray-700">
                Нэр
              </Label>
              <Input
                id="worker-name"
                type="text"
                value={workerData.name}
                onChange={(e) => setWorkerData({ ...workerData, name: e.target.value })}
                disabled={isAdding}
                className="mt-1"
                placeholder="Ажилтны нэр"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="worker-role" className="text-sm font-medium text-gray-700">
                Албан тушаал
              </Label>
              <Input
                id="worker-role"
                type="text"
                value={workerData.role}
                onChange={(e) => setWorkerData({ ...workerData, role: e.target.value })}
                disabled={isAdding}
                className="mt-1"
                placeholder="Жишээ: Gate Operator, Supervisor"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setWorkerData({ name: "", role: "" })
              }}
              disabled={isAdding}
            >
              Цуцлах
            </Button>
            <Button
              type="button"
              onClick={handleAddWorker}
              disabled={isAdding || !workerData.name.trim() || !workerData.role.trim()}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                "Нэмэх"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

