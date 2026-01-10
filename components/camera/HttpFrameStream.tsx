"use client"

/**
 * HttpFrameStream Component
 * 
 * Polls /api/camera/frame endpoint for latest video frames
 * Works without WebSocket or Cloudflare - uses HTTP polling like license plates
 * 
 * Electron app POSTs frames to /api/camera/frame
 * Browser polls GET /api/camera/frame to get latest frame
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
}

export function HttpFrameStream({
  cameraId,
  direction,
  showActionButton = true,
  onActionClick,
}: HttpFrameStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    isMountedRef.current = true

    // Poll for latest frame every 100ms (10 fps)
    const pollFrame = async () => {
      if (!isMountedRef.current) return

      try {
        const response = await fetch(`/api/camera/frame?camera=${cameraId}&_t=${Date.now()}`)
        
        if (!response.ok) {
          if (response.status === 404 && isLoading) {
            // No frame yet, keep waiting
            return
          }
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        
        if (data.ok && data.frameBase64 && imgRef.current) {
          // Update image with latest frame
          imgRef.current.src = `data:image/jpeg;base64,${data.frameBase64}`
          
          if (isLoading) {
            setIsLoading(false)
            setError(null)
          }
        }
      } catch (err) {
        if (isMountedRef.current && isLoading) {
          // Only show error if we haven't loaded yet
          console.error(`❌ [Camera ${cameraId}] Poll error:`, err)
        }
      }
    }

    // Start polling
    pollFrame() // Poll immediately
    pollIntervalRef.current = setInterval(pollFrame, 100) // Then every 100ms

    return () => {
      isMountedRef.current = false
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      if (imgRef.current) {
        imgRef.current.src = ""
      }
    }
  }, [cameraId, isLoading])

  const router = useRouter()

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Video Display Area */}
      <div className="flex-1 relative bg-black min-h-[400px] h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
              <p className="text-white text-xs">Холбогдож байна...</p>
              <p className="text-white text-xs mt-1">Waiting for frames from Electron app</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        {/* Video frame */}
        <img
          ref={imgRef}
          alt={`Camera ${cameraId} stream`}
          className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ display: error ? 'none' : 'block' }}
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
