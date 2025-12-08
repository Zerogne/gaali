"use client"

import { useState } from "react"
import { useScaleBridge } from "@/app/hooks/useScaleBridge"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ScaleDebugPanel() {
  const defaultUrl =
    process.env.NEXT_PUBLIC_SCALE_URL || "https://jsonplaceholder.typicode.com/todos/1"
  const [scaleUrl, setScaleUrl] = useState<string>(defaultUrl)

  const {
    status,
    lastRawResponse,
    lastJson,
    errorMessage,
    isRequestPending,
    requestScaleData,
  } = useScaleBridge()

  const handleRequest = () => {
    if (status === "connected" && !isRequestPending) {
      requestScaleData(scaleUrl)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            Connected
          </Badge>
        )
      case "connecting":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Connecting
          </Badge>
        )
      case "idle":
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200">
            Idle
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            Error
          </Badge>
        )
      default:
        return null
    }
  }

  const renderResponse = () => {
    if (lastJson !== null && typeof lastJson === "object") {
      return JSON.stringify(lastJson, null, 2)
    }
    return lastRawResponse || "No response yet"
  }

  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm space-y-4">
      {/* Top row: Title and Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">ScaleServiceApp bridge</h3>
        {getStatusBadge()}
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label htmlFor="scale-url" className="text-sm font-medium text-gray-700 block">
          Scale API URL
        </label>
        <Input
          id="scale-url"
          type="text"
          value={scaleUrl}
          onChange={(e) => setScaleUrl(e.target.value)}
          placeholder="Enter scale API URL..."
          className="w-full"
        />
      </div>

      {/* Request Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleRequest}
          disabled={status !== "connected" || isRequestPending}
          className="flex-1"
        >
          Request data from scale
        </Button>
        {isRequestPending && (
          <span className="text-sm text-gray-600">Loading...</span>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {errorMessage}
        </div>
      )}

      {/* Response Area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">
          Response
        </label>
        <pre className="bg-gray-50 rounded-lg p-3 text-xs max-h-64 overflow-auto font-mono">
          {renderResponse()}
        </pre>
      </div>
    </div>
  )
}
