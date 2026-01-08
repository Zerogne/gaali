"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export type ScaleStatus = "idle" | "connecting" | "connected" | "error"

export interface UseScaleBridgeResult {
  status: ScaleStatus
  lastRawResponse: string | null // raw text from ScaleServiceApp
  lastJson: unknown | null // parsed JSON if possible
  errorMessage: string | null
  isRequestPending: boolean // true after we send a URL until next message
  requestScaleData: (url: string) => void
}

const WS_ENDPOINT = "ws://127.0.0.1:9000/service"
const RECONNECT_DELAY = 3000 // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5

export function useScaleBridge(): UseScaleBridgeResult {
  const [status, setStatus] = useState<ScaleStatus>("idle")
  const [lastRawResponse, setLastRawResponse] = useState<string | null>(null)
  const [lastJson, setLastJson] = useState<unknown | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRequestPending, setIsRequestPending] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus("connecting")
    setErrorMessage(null)

    try {
      const ws = new WebSocket(WS_ENDPOINT)
      wsRef.current = ws

      ws.onopen = () => {
        if (!isMountedRef.current) return
        setStatus("connected")
        setErrorMessage(null)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return

        const rawData = typeof event.data === "string" ? event.data : String(event.data)
        setLastRawResponse(rawData)
        setIsRequestPending(false)

        // Try to parse as JSON
        try {
          const parsed = JSON.parse(rawData)
          setLastJson(parsed)
          
          // Handle weight data from scale bridge (automatic broadcasts)
          // Format: { type: 'weight', weight: number, unit: string, ... }
          if (parsed && typeof parsed === 'object' && parsed.type === 'weight') {
            // Weight data received automatically from scale bridge
            // This is different from requestScaleData which sends URLs
            // The scale bridge automatically broadcasts weight when received from TCP
          }
        } catch {
          // Not JSON, that's okay
          setLastJson(null)
        }
      }

      ws.onerror = (error) => {
        if (!isMountedRef.current) return
        // Only log in development and only for first few attempts to reduce console noise
        if (process.env.NODE_ENV === "development" && reconnectAttemptsRef.current <= 1) {
          console.warn("WebSocket connection error (expected if scale service is not running)")
        }
        setStatus("error")
        setErrorMessage("WebSocket connection error")
        setIsRequestPending(false)
      }

      ws.onclose = (event) => {
        if (!isMountedRef.current) return

        wsRef.current = null

        // Only attempt reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1
          setStatus("error")
          setErrorMessage(
            `Connection closed. Reconnecting... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect()
            }
          }, RECONNECT_DELAY)
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setStatus("error")
          setErrorMessage("Failed to connect after multiple attempts")
        } else {
          setStatus("idle")
        }
      }
    } catch (error) {
      if (!isMountedRef.current) return
      // Only log in development to reduce console noise
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to create WebSocket connection (expected if scale service is not running)")
      }
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to create WebSocket connection")
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  // Request scale data by sending URL
  // Note: With the new scale bridge (TCP server mode), weight data is automatically
  // broadcast when received from the scale device. This function is kept for backward
  // compatibility but may not be needed if using the automatic scale bridge.
  // The scale bridge can handle "request_weight" messages if needed.
  const requestScaleData = useCallback(
    (url: string) => {
      if (!url || typeof url !== "string") {
        setErrorMessage("Invalid URL provided")
        return
      }

      const ws = wsRef.current

      // If not connected, try to connect first
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setErrorMessage("WebSocket not connected. Attempting to connect...")
        connect()
        // Wait a bit for connection, then retry
        setTimeout(() => {
          const retryWs = wsRef.current
          if (retryWs && retryWs.readyState === WebSocket.OPEN) {
            retryWs.send(url)
            setIsRequestPending(true)
            setErrorMessage(null)
          } else {
            setErrorMessage("Failed to connect. Please try again.")
            setIsRequestPending(false)
          }
        }, 1000)
        return
      }

      try {
        // Send URL (for legacy scale service) or request message (for scale bridge)
        // Scale bridge can handle JSON messages like: { type: 'request_weight' }
        ws.send(url)
        setIsRequestPending(true)
        setErrorMessage(null)
      } catch (error) {
        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to send WebSocket message:", error)
        }
        setErrorMessage(error instanceof Error ? error.message : "Failed to send request")
        setIsRequestPending(false)
      }
    },
    [connect]
  )

  return {
    status,
    lastRawResponse,
    lastJson,
    errorMessage,
    isRequestPending,
    requestScaleData,
  }
}
