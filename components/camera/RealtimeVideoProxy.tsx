"use client"

/**
 * RealtimeVideoProxy Component
 * 
 * Connects to WebSocket proxy server (ws://your-domain/ws/camera)
 * which then proxies to the camera WebSocket (ws://camera-ip:9080/h264)
 * 
 * Auto-detects stream format and uses appropriate player:
 * - MPEG-TS → JSMpeg
 * - JPEG/PNG frames → <img> with Blob URLs
 * - H.264 → jmuxer or MediaSource API
 * 
 * Why use a proxy?
 * 1. Same-origin WebSocket (avoids mixed content issues)
 * 2. Browser cannot directly connect to LAN IPs in production
 * 3. Server-side authentication and error handling
 */

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface RealtimeVideoProxyProps {
  cameraId: "1" | "2"
  direction?: "IN" | "OUT"
  showActionButton?: boolean
  onActionClick?: () => void
}

type StreamFormat = "mpeg-ts" | "jpeg" | "png" | "h264" | "unknown"

export function RealtimeVideoProxy({
  cameraId,
  direction,
  showActionButton = true,
  onActionClick,
}: RealtimeVideoProxyProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const playerRef = useRef<any>(null) // JSMpeg player instance
  const formatRef = useRef<StreamFormat>("unknown")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streamFormat, setStreamFormat] = useState<StreamFormat>("unknown")
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const connectVideoStream = async () => {
      if (!isMountedRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        // Get WebSocket proxy URL
        // In production, this should be your domain's WebSocket proxy
        // Format: wss://your-domain.com/ws/camera?camera=1&companyId=xxx
        // IMPORTANT: Set NEXT_PUBLIC_WS_PROXY_URL in Vercel environment variables
        const wsProxyBaseUrl = process.env.NEXT_PUBLIC_WS_PROXY_URL
        
        if (!wsProxyBaseUrl) {
          console.error(`❌ [Camera ${cameraId}] NEXT_PUBLIC_WS_PROXY_URL not set!`)
          console.error(`   Set this environment variable in Vercel to your WebSocket proxy server URL`)
          console.error(`   Example: wss://your-proxy-server.com/ws/camera`)
          console.error(`   💡 Tip: Use Cloudflare Tunnel (free) - see BYPASS-MIXED-CONTENT-FREE.md`)
          setError("WebSocket proxy URL not configured. Set NEXT_PUBLIC_WS_PROXY_URL in Vercel. See BYPASS-MIXED-CONTENT-FREE.md for free tunnel options.")
          setIsLoading(false)
          return
        }
        
        // Get company ID for multi-tenant support (optional)
        // You can fetch this from your auth/session if needed
        const companyId = null // TODO: Get from session/auth if needed
        
        const wsProxyUrl = companyId
          ? `${wsProxyBaseUrl}?camera=${cameraId}&companyId=${companyId}`
          : `${wsProxyBaseUrl}?camera=${cameraId}`

        console.log(`🔌 [Camera ${cameraId}] Connecting to WebSocket proxy: ${wsProxyUrl}`)

        const ws = new WebSocket(wsProxyUrl)
        ws.binaryType = "arraybuffer" // Critical for binary data

        let firstMessageReceived = false
        let formatDetected = false

        ws.onopen = () => {
          if (!isMountedRef.current) {
            ws.close()
            return
          }
          console.log(`✅ [Camera ${cameraId}] WebSocket proxy connected`)
          setIsConnected(true)
          setIsLoading(false)
        }

        ws.onmessage = (event: MessageEvent) => {
          if (!isMountedRef.current) return

          const data = event.data

          // Detect format on first message
          if (!formatDetected && data instanceof ArrayBuffer) {
            const buffer = new Uint8Array(data)
            const format = detectStreamFormat(buffer)
            formatRef.current = format
            setStreamFormat(format)
            formatDetected = true

            console.log(`📹 [Camera ${cameraId}] Stream format detected: ${format}`)
            console.log(`   First bytes (hex): ${Array.from(buffer.slice(0, 16))
              .map(b => b.toString(16).padStart(2, "0"))
              .join(" ")}`)

            // Initialize appropriate player based on format
            initializePlayer(format, buffer)
          }

          // Handle subsequent messages based on format
          if (formatDetected) {
            handleStreamData(data, formatRef.current)
          }

          firstMessageReceived = true
        }

        ws.onerror = (err) => {
          if (!isMountedRef.current) return
          console.error(`❌ [Camera ${cameraId}] WebSocket error:`, err)
          setError("Failed to connect to video stream")
          setIsLoading(false)
        }

        ws.onclose = (event) => {
          if (!isMountedRef.current) return
          console.log(`🔌 [Camera ${cameraId}] WebSocket closed:`, event.code, event.reason)
          setIsConnected(false)
          
          // Cleanup player
          cleanupPlayer()

          // Reconnect if not intentional close
          if (event.code !== 1000 && isMountedRef.current) {
            console.log(`🔄 [Camera ${cameraId}] Reconnecting in 3 seconds...`)
            setTimeout(() => {
              if (isMountedRef.current) {
                connectVideoStream()
              }
            }, 3000)
          }
        }

        wsRef.current = ws
      } catch (err) {
        if (!isMountedRef.current) return
        console.error(`❌ [Camera ${cameraId}] Connection error:`, err)
        setError("Failed to connect to video stream")
        setIsLoading(false)
      }
    }

    connectVideoStream()

    return () => {
      isMountedRef.current = false
      cleanupPlayer()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [cameraId])

  /**
   * Detect stream format from first bytes
   */
  function detectStreamFormat(buffer: Uint8Array): StreamFormat {
    // MPEG-TS sync byte (0x47)
    if (buffer[0] === 0x47) {
      return "mpeg-ts"
    }

    // JPEG (FF D8 FF)
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "jpeg"
    }

    // PNG (89 50 4E 47)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return "png"
    }

    // H.264 NAL unit (00 00 00 01 or 00 00 01)
    if (
      (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x00 && buffer[3] === 0x01) ||
      (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01)
    ) {
      return "h264"
    }

    return "unknown"
  }

  /**
   * Initialize player based on detected format
   */
  function initializePlayer(format: StreamFormat, firstChunk: Uint8Array) {
    cleanupPlayer() // Clean up any existing player

    switch (format) {
      case "mpeg-ts":
        initializeJSMpeg()
        break
      case "jpeg":
      case "png":
        // Image player is handled in handleStreamData
        break
      case "h264":
        console.warn("⚠️ H.264 detected. JSMpeg cannot play raw H.264.")
        console.warn("   Consider using jmuxer or MediaSource API instead.")
        // TODO: Initialize jmuxer or MediaSource
        break
      default:
        console.warn("⚠️ Unknown stream format, attempting JSMpeg...")
        initializeJSMpeg()
    }
  }

  /**
   * Initialize JSMpeg player for MPEG-TS streams
   */
  function initializeJSMpeg() {
    if (!canvasRef.current) return

    // Dynamically import JSMpeg (optional - only if MPEG-TS format detected)
    // JSMpeg is not installed by default, so we handle the error gracefully
    import("jsmpeg")
      .then((JSMpeg) => {
        if (!canvasRef.current || !isMountedRef.current) return

        // Create JSMpeg player
        // Note: JSMpeg expects a WebSocket URL, but we'll feed it data manually
        // For now, we'll use a custom approach
        console.log(`📺 [Camera ${cameraId}] JSMpeg player initialized`)
        
        // TODO: Implement JSMpeg with custom data source
        // JSMpeg requires a WebSocket or fetch source
        // For proxy setup, we may need to use JSMpeg's custom source API
        // For now, log that JSMpeg is available but not fully implemented
        console.warn(`⚠️ [Camera ${cameraId}] JSMpeg loaded but player not fully implemented yet`)
      })
      .catch((err) => {
        // JSMpeg not installed - this is okay if stream format is not MPEG-TS
        console.warn(`⚠️ [Camera ${cameraId}] JSMpeg not available:`, err.message)
        console.warn(`   Install with: npm install jsmpeg`)
        console.warn(`   Or use alternative player for MPEG-TS streams`)
        // Don't set error - component can still work with other formats
      })
  }

  /**
   * Handle incoming stream data based on format
   */
  function handleStreamData(data: ArrayBuffer, format: StreamFormat) {
    switch (format) {
      case "jpeg":
      case "png":
        // Create Blob URL and update image
        if (imgRef.current) {
          const blob = new Blob([data], { type: format === "jpeg" ? "image/jpeg" : "image/png" })
          const url = URL.createObjectURL(blob)
          imgRef.current.src = url
          // Revoke previous URL to prevent memory leaks
          if (imgRef.current.dataset.blobUrl) {
            URL.revokeObjectURL(imgRef.current.dataset.blobUrl)
          }
          imgRef.current.dataset.blobUrl = url
        }
        break

      case "mpeg-ts":
        // Feed data to JSMpeg player
        if (playerRef.current) {
          // JSMpeg player would handle this
          // playerRef.current.write(data)
        }
        break

      case "h264":
        // Feed to jmuxer or MediaSource
        // TODO: Implement H.264 player
        break

      default:
        console.warn("⚠️ Unknown format, cannot handle data")
    }
  }

  /**
   * Cleanup player resources
   */
  function cleanupPlayer() {
    if (playerRef.current) {
      // JSMpeg cleanup
      if (typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy()
      }
      playerRef.current = null
    }

    if (imgRef.current?.dataset.blobUrl) {
      URL.revokeObjectURL(imgRef.current.dataset.blobUrl)
      delete imgRef.current.dataset.blobUrl
    }
  }

  return (
    <Card className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to camera...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white z-10">
          <div className="text-center p-4">
            <p className="text-red-200">{error}</p>
            <p className="text-sm mt-2">Format: {streamFormat}</p>
          </div>
        </div>
      )}

      {/* Video player (for H.264/MPEG-TS) */}
      {streamFormat !== "jpeg" && streamFormat !== "png" && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Canvas for JSMpeg (MPEG-TS) */}
      {streamFormat === "mpeg-ts" && (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
      )}

      {/* Image for JPEG/PNG frames */}
      {(streamFormat === "jpeg" || streamFormat === "png") && (
        <img
          ref={imgRef}
          className="w-full h-full object-contain"
          alt="Camera stream"
        />
      )}

      {/* Status overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"} | {streamFormat}
      </div>

      {/* Action button */}
      {showActionButton && onActionClick && (
        <button
          onClick={onActionClick}
          className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {direction === "IN" ? "IN" : "OUT"}
        </button>
      )}
    </Card>
  )
}
