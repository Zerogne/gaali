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
import { Card } from "@/components/ui/card"
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
    <Card className="relative w-full h-full bg-black rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
      {/* Video Stream */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center p-4">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <p className="text-gray-400 text-xs">
                Camera {cameraId} may not be configured or accessible
              </p>
            </div>
          </div>
        )}

        {/* MJPEG Stream as Image */}
        <img
          ref={imgRef}
          alt={`Camera ${cameraId} stream`}
          className={`w-full h-full object-contain ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />
      </div>

      {/* Action Button */}
      {showActionButton && onActionClick && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            onClick={onActionClick}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg shadow-lg"
          >
            {direction === "IN" ? "Орох бүртгэл" : "Гарах бүртгэл"}
          </Button>
        </div>
      )}
    </Card>
  )
}
