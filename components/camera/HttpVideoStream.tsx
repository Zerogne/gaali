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
      // Add timestamp to prevent caching
      const urlWithCacheBust = `${proxyUrl}&_t=${Date.now()}`
      imgRef.current.src = urlWithCacheBust
      
      let loadTimeout: NodeJS.Timeout | null = null
      let hasLoaded = false
      
      imgRef.current.onload = () => {
        if (!isMountedRef.current) return
        if (loadTimeout) {
          clearTimeout(loadTimeout)
          loadTimeout = null
        }
        if (!hasLoaded) {
          console.log(`✅ [Camera ${cameraId}] Video stream loaded successfully`, {
            naturalWidth: imgRef.current?.naturalWidth,
            naturalHeight: imgRef.current?.naturalHeight,
            complete: imgRef.current?.complete,
          })
          hasLoaded = true
        }
        setIsLoading(false)
        setError(null)
      }

      imgRef.current.onerror = (err) => {
        if (!isMountedRef.current) return
        if (loadTimeout) {
          clearTimeout(loadTimeout)
          loadTimeout = null
        }
        console.error(`❌ [Camera ${cameraId}] Failed to load video stream:`, {
          error: err,
          src: imgRef.current?.src,
          proxyUrl,
        })
        // Check if it's a 502 error (proxy failed) vs other error
        fetch(proxyUrl)
          .then(res => {
            if (res.status === 502) {
              setError("Camera only supports RTSP. Requires separate server with FFmpeg.")
            } else {
              setError("Failed to load camera stream. Check camera configuration.")
            }
          })
          .catch(() => {
            setError("Failed to load camera stream. Check camera configuration.")
          })
        setIsLoading(false)
      }

      // Set timeout to show error if stream doesn't load within 15 seconds
      loadTimeout = setTimeout(() => {
        if (isMountedRef.current && !hasLoaded) {
          console.warn(`⚠️ [Camera ${cameraId}] Stream loading timeout after 15 seconds`)
          console.warn(`   This usually means:`)
          console.warn(`   1. Camera doesn't support MJPEG over HTTPS (port 443)`)
          console.warn(`   2. Camera only supports RTSP (port 8557) - requires FFmpeg conversion`)
          console.warn(`   3. Camera IP/credentials are incorrect`)
          console.warn(`   Solution: Check browser Network tab for proxy response, or use RTSP with separate server`)
          setError("Stream timeout. Camera may only support RTSP (requires separate server with FFmpeg). Check console for details.")
          setIsLoading(false)
        }
      }, 15000)
    }

    return () => {
      isMountedRef.current = false
      // Clean up timeout
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
      // Clean up image source
      if (imgRef.current) {
        imgRef.current.src = ""
        imgRef.current.onload = null
        imgRef.current.onerror = null
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
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center text-red-400 p-4 max-w-md">
              <p className="text-sm font-semibold mb-2">{error}</p>
              <p className="text-xs text-gray-400 mt-2">
                Camera likely only supports RTSP (port 8557). RTSP requires FFmpeg conversion which isn't available on Vercel.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Solution: Deploy separate server with FFmpeg or check camera documentation for MJPEG support.
              </p>
            </div>
          </div>
        )}
        {/* Always render image - MJPEG streams continuously update */}
        <img
          ref={imgRef}
          alt={`Camera ${cameraId} stream`}
          className={`w-full h-full object-contain ${isLoading ? 'opacity-50' : 'opacity-100'}`}
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
