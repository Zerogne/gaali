"use client"

import { useEffect, useState } from "react"
import { useScaleBridge } from "@/app/hooks/useScaleBridge"
import { Button } from "@/components/ui/button"

interface InSessionWeightConnectorProps {
  onWeightDetected: (weightKg: number) => void
}

export function InSessionWeightConnector(props: InSessionWeightConnectorProps) {
  const { onWeightDetected } = props

  // Get scale URL from environment or use a default
  const scaleUrl = process.env.NEXT_PUBLIC_SCALE_URL || ""

  const {
    status,
    lastRawResponse,
    lastJson,
    errorMessage,
    isRequestPending,
    requestScaleData,
  } = useScaleBridge()

  const [parseError, setParseError] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  // Parse weight from response
  useEffect(() => {
    if (!lastJson && !lastRawResponse) {
      return
    }

    let weight: number | null = null

    // Try to extract from lastJson (object)
    if (lastJson && typeof lastJson === "object" && lastJson !== null) {
      const obj = lastJson as Record<string, unknown>
      const keysToCheck = ["weight", "Weight", "wt", "kg", "value"]

      for (const key of keysToCheck) {
        if (key in obj) {
          const value = obj[key]
          if (typeof value === "number") {
            weight = value
            break
          } else if (typeof value === "string") {
            const parsed = parseFloat(value)
            if (!isNaN(parsed)) {
              weight = parsed
              break
            }
          }
        }
      }
    }

    // If not found in JSON, try parsing lastRawResponse as a plain number
    if (weight === null && lastRawResponse) {
      const trimmed = lastRawResponse.trim()
      const parsed = parseFloat(trimmed)
      if (!isNaN(parsed) && trimmed !== "") {
        weight = parsed
      }
    }

    // If weight found, call callback and clear errors
    if (weight !== null && weight > 0) {
      onWeightDetected(weight)
      setParseError(null)
      setLocalError(null)
    } else if (lastRawResponse || lastJson) {
      // Response exists but couldn't parse weight
      setParseError("Could not parse weight from scale response")
    }
  }, [lastJson, lastRawResponse, onWeightDetected])

  const handleReadWeight = () => {
    setLocalError(null)
    setParseError(null)

    if (!scaleUrl) {
      setLocalError("Scale URL is not configured")
      return
    }

    requestScaleData(scaleUrl)
  }

  const isButtonDisabled =
    status !== "connected" || isRequestPending || !scaleUrl

  return (
    <div className="space-y-2">
      <Button
        onClick={handleReadWeight}
        disabled={isButtonDisabled}
        className="px-2 py-1 h-7 rounded bg-blue-600 text-white text-xs disabled:opacity-50 hover:bg-blue-700"
      >
        Read weight from scale
      </Button>

      <div className="text-xs text-gray-600">
        Scale status: <span className="font-medium">{status}</span>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600">{errorMessage}</div>
      )}

      {localError && <div className="text-xs text-red-600">{localError}</div>}

      {parseError && <div className="text-xs text-red-600">{parseError}</div>}
    </div>
  )
}
