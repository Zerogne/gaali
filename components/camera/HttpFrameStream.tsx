"use client"

/**
 * HttpFrameStream Component
 * 
 * Polls /api/camera/latest endpoint for frame pointer (Vercel Blob URL)
 * Uses Vercel Blob + KV instead of in-memory storage
 * 
 * Flow:
 * - Electron app POSTs binary JPEG → /api/camera/upload → Blob + KV
 * - Browser polls GET /api/camera/latest → Gets Blob URL pointer
 * - <img> displays Blob URL with cache-busting query param
 */

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface HttpFrameStreamProps {
  cameraId: "1" | "2"
  direction?: "IN" | "OUT"
  showActionButton?: boolean
  onActionClick?: () => void
  pollInterval?: number // Default: 200ms
}

export function HttpFrameStream({
  cameraId,
  direction,
  showActionButton = true,
  onActionClick,
  pollInterval = 200, // 200ms = ~5 FPS display (configurable: 150-250ms)
}: HttpFrameStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStale, setIsStale] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    isMountedRef.current = true

    // Clamp poll interval to 150-250ms
    const clampedInterval = Math.max(150, Math.min(250, pollInterval))

    // Poll for latest frame pointer
    const pollFrame = async () => {
      if (!isMountedRef.current) return

      try {
        const response = await fetch(`/api/camera/latest?camera=${cameraId}&_t=${Date.now()}`, {
          cache: 'no-store', // Ensure no caching
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        
        if (!data.ok) {
          throw new Error(data.error || 'Unknown error')
        }

        // Check if frame exists
        if (!data.url) {
          // No frame available yet
          if (isLoading) {
            // Keep waiting, don't show error
            return
          }
          // Frame disappeared (camera offline)
          setIsStale(true)
          setError(null) // Clear previous errors
          return
        }

        // Update stale state
        setIsStale(data.stale || false)

        // Update image if URL changed or if stale (force refresh)
        const cacheBustUrl = `${data.url}?t=${data.ts}`
        if (lastUrlRef.current !== cacheBustUrl && imgRef.current) {
          imgRef.current.src = cacheBustUrl
          lastUrlRef.current = cacheBustUrl

          if (isLoading) {
            setIsLoading(false)
            setError(null)
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          
          if (isLoading) {
            // Only log errors after initial load
            console.error(`❌ [Camera ${cameraId}] Poll error:`, errorMessage)
            setError(errorMessage)
          } else {
            // After initial load, don't show errors (might be transient)
            // Just mark as stale
            setIsStale(true)
          }
        }
      }
    }

    // Start polling
    pollFrame() // Poll immediately
    pollIntervalRef.current = setInterval(pollFrame, clampedInterval)

    return () => {
      isMountedRef.current = false
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      if (imgRef.current) {
        imgRef.current.src = ""
      }
    }
  }, [cameraId, pollInterval, isLoading])

  const router = useRouter()

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Video Display Area */}
      <div className="flex-1 relative bg-black min-h-[400px] h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
              <p className="text-white text-xs">Холбогдож байна...</p>
              <p className="text-white text-xs mt-1">Waiting for frames from Electron app</p>
            </div>
          </div>
        )}
        
        {error && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stale/Offline overlay */}
        {isStale && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70">
            <div className="text-center">
              <p className="text-white text-sm font-medium">Camera Offline</p>
              <p className="text-white text-xs mt-1 opacity-75">No recent frames</p>
            </div>
          </div>
        )}

        {/* Video frame - Blob URL with cache-busting */}
        <img
          ref={imgRef}
          alt={`Camera ${cameraId} stream`}
          className={`w-full h-full object-contain transition-opacity ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${isStale ? 'opacity-50' : ''}`}
          style={{ display: error && isLoading ? 'none' : 'block' }}
          onError={(e) => {
            // Handle image load errors (e.g., Blob URL expired)
            console.warn(`[Camera ${cameraId}] Image load error, will retry on next poll`);
            if (isMountedRef.current) {
              setIsStale(true);
            }
          }}
        />
      </div>

      {/* Action Button - Only show if enabled */}
      {showActionButton && (
        <div className="p-2 border-t border-gray-200">
          <Button
            onClick={onActionClick}
            className={`w-full h-9 text-sm font-medium ${
              direction === "OUT" 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : ""
            }`}
            variant={direction === "IN" ? "default" : undefined}
          >
            {direction === "IN" ? "ОРОХ" : "ГАРАХ"}
          </Button>
        </div>
      )}
    </div>
  )
}
