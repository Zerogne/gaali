"use client"

/**
 * HttpVideoStream Component
 * 
 * Simple HTTP-based video streaming using existing /api/camera/proxy endpoint
 * Works in production on Vercel - no WebSocket or separate server needed!
 * 
 * Uses MJPEG streaming which is supported by most IP cameras
 */

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface HttpVideoStreamProps {
  cameraId: "1" | "2"
  direction?: "IN" | "OUT"
  showActionButton?: boolean
  onActionClick?: () => void
}

export function HttpVideoStream({
  cameraId,
  direction,
  showActionButton = true,
  onActionClick,
}: HttpVideoStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Build proxy URL - uses existing Next.js API route
    const proxyUrl = `/api/camera/proxy?camera=${cameraId}`
    
    console.log(`📹 [Camera ${cameraId}] Loading video stream from: ${proxyUrl}`)

    if (imgRef.current) {
      // Set image source to proxy endpoint
      // The proxy streams MJPEG which can be displayed as an <img>
      imgRef.current.src = proxyUrl
      
      imgRef.current.onload = () => {
        if (!isMountedRef.current) return
        console.log(`✅ [Camera ${cameraId}] Video stream loaded`)
        setIsLoading(false)
        setError(null)
      }

      imgRef.current.onerror = (err) => {
        if (!isMountedRef.current) return
        console.error(`❌ [Camera ${cameraId}] Failed to load video stream:`, err)
        setError("Failed to load camera stream. Check camera configuration.")
        setIsLoading(false)
      }
    }

    return () => {
      isMountedRef.current = false
      // Clean up image source
      if (imgRef.current) {
        imgRef.current.src = ""
      }
    }
  }, [cameraId])

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
        {!isLoading && !error && (
          <img
            ref={imgRef}
            alt={`Camera ${cameraId} stream`}
            className="w-full h-full object-contain"
          />
        )}
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
