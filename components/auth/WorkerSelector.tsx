"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Worker } from "@/lib/auth/mockData"
import { handleLogin } from "@/lib/auth/authClient"

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
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId)

  const handleWorkerSelect = (workerId: string) => {
    onSelect(workerId)
    setError(null) // Clear error when selecting new worker
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedWorkerId || !password.trim()) {
      return
    }

    setError(null)
    setIsLoggingIn(true)

    try {
      // Find companyId from the selected worker
      const companyId = selectedWorker?.companyId
      if (!companyId) {
        setError("Invalid worker selection")
        setIsLoggingIn(false)
        return
      }

      const result = await handleLogin({
        companyId,
        workerId: selectedWorkerId,
        password: password.trim(),
      })

      if (!result.success) {
        setError(result.error || "Login failed")
        setPassword("") // Clear password on error
      }
      // If success, redirect happens in authServer
    } catch (err) {
      setError("An unexpected error occurred")
      setPassword("")
    } finally {
      setIsLoggingIn(false)
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
        Back to company selection
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Login to {companyName}
        </h2>
        <p className="text-sm text-gray-600">
          Select your profile and enter your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Worker Profiles */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Select Worker Profile
          </Label>
          {isLoadingWorkers ? (
            <div className="text-center py-8 text-gray-500">
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
              return (
                <Card
                  key={worker.id}
                  onClick={() => handleWorkerSelect(worker.id)}
                  className={`
                    p-4 cursor-pointer transition-all duration-200
                    ${isSelected
                      ? "border-2 border-blue-600 bg-blue-50 shadow-md"
                      : "border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }
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
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
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
                </Card>
              )
            })}
            </div>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null) // Clear error when typing
              }}
              disabled={isLoggingIn}
              className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              disabled={!selectedWorkerId || !password.trim() || isLoggingIn}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

