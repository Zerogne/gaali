"use client"

import { useState, useCallback, useRef, useEffect } from "react"

/**
 * WebSocket connection state
 */
let ws: WebSocket | null = null
let reconnectTimeout: NodeJS.Timeout | null = null
let isConnecting = false
const RECONNECT_DELAY = 2000 // 2 seconds
const CONNECTION_TIMEOUT = 5000 // 5 seconds timeout for connection
// WebSocket URL - can be configured via NEXT_PUBLIC_THIRD_PARTY_WS_URL environment variable
// Default: ws://127.0.0.1:9000/service
const getWebSocketUrl = () => {
  if (typeof window !== "undefined") {
    // Check for runtime configuration
    const runtimeUrl = (window as any).__THIRD_PARTY_WS_URL__
    if (runtimeUrl) return runtimeUrl
  }
  // Use environment variable (NEXT_PUBLIC_ prefix makes it available on client)
  return process.env.NEXT_PUBLIC_THIRD_PARTY_WS_URL || "ws://127.0.0.1:9000/service"
}

interface SendFormDataResult {
  success: boolean
  error?: string
}

/**
 * React hook for sending form data to 3rd party app via WebSocket
 * The 3rd party app will save the data as autofill
 */
export function useThirdPartyAutofill() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const connectionAttemptRef = useRef(0)

  /**
   * Connects to the WebSocket server
   */
  const connectWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (isConnecting) {
        reject(new Error("Connection already in progress"))
        return
      }

      // Check if we have an existing open connection
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("✅ Reusing existing WebSocket connection")
        setIsConnected(true)
        resolve(ws)
        return
      }
      
      // If connection exists but is not open, close it first
      if (ws && ws.readyState !== WebSocket.OPEN) {
        console.log("⚠️ Existing WebSocket is not open, closing it. State:", ws.readyState)
        try {
          ws.close()
        } catch (e) {
          // Ignore
        }
        ws = null
      }

      // Clean up any existing connection
      if (ws) {
        try {
          ws.close()
        } catch (e) {
          // Ignore errors when closing
        }
        ws = null
      }

      isConnecting = true
      connectionAttemptRef.current++

      const wsUrl = getWebSocketUrl()
      console.log("🔌 Attempting to connect to WebSocket:", wsUrl)
      console.log("🔌 Connection attempt #:", connectionAttemptRef.current)

      let connectionTimeout: NodeJS.Timeout | null = null
      let hasResolved = false

      try {
        ws = new WebSocket(wsUrl)

        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true
            isConnecting = false
            setIsConnected(false)
            if (ws) {
              try {
                ws.close()
              } catch (e) {
                // Ignore
              }
              ws = null
            }
            reject(
              new Error(
                `Unable to connect to customs service. Please ensure the 3rd party app is running at ${wsUrl}`
              )
            )
          }
        }, CONNECTION_TIMEOUT)

        ws.onopen = () => {
          console.log("🎉 WebSocket.onopen event fired!")
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
          }
          if (!hasResolved) {
            hasResolved = true
            isConnecting = false
            setIsConnected(true)
            connectionAttemptRef.current = 0
            console.log("✅ Connected to 3rd party app successfully at:", wsUrl)
            console.log("✅ WebSocket readyState:", ws?.readyState)
            resolve(ws!)
          }
        }

        ws.onerror = (error) => {
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
          }
          if (!hasResolved) {
            hasResolved = true
            isConnecting = false
            setIsConnected(false)
            console.error("WebSocket error:", error)
            const wsUrl = getWebSocketUrl()
            reject(
              new Error(
                `Unable to connect to customs service at ${wsUrl}. Please check if the 3rd party app is running.`
              )
            )
          }
        }

        ws.onclose = (event) => {
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
          }
          
          // If connection was never established and we haven't rejected yet
          if (!hasResolved) {
            hasResolved = true
            isConnecting = false
            setIsConnected(false)
            const wsUrl = getWebSocketUrl()
            reject(
              new Error(
                `Unable to connect to customs service at ${wsUrl}. Please ensure the 3rd party app is running.`
              )
            )
          } else {
            // Connection was established but then closed - try to reconnect
            isConnecting = false
            setIsConnected(false)
            if (connectionAttemptRef.current < 5) {
              if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
              }
              reconnectTimeout = setTimeout(() => {
                console.log("Attempting to reconnect...")
                connectWebSocket().catch(() => {
                  // Reconnection failed, will retry on next attempt
                })
              }, RECONNECT_DELAY)
            }
          }
        }

        ws.onmessage = (event) => {
          // Handle responses from the 3rd party app if needed
          console.log("📥 Received message from 3rd party app!")
          console.log("📥 Raw message data:", event.data)
          console.log("📥 Message type:", typeof event.data)
          try {
            const response = JSON.parse(event.data)
            console.log("📥 Parsed JSON response:", response)
            // If the app sends a confirmation, we can handle it here
            if (response.status === "saved" || response.success) {
              console.log("✅ Data confirmed saved in autofill by 3rd party app")
            }
          } catch (e) {
            // Response might not be JSON, that's okay
            console.log("📥 Response is not JSON (that's okay):", event.data)
            console.log("📥 Parse error:", e)
          }
        }
      } catch (error) {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
        }
        if (!hasResolved) {
          hasResolved = true
          isConnecting = false
          setIsConnected(false)
          const wsUrl = getWebSocketUrl()
          reject(
            new Error(
              `Failed to create WebSocket connection to ${wsUrl}. Please check if the 3rd party app is running.`
            )
          )
        }
      }
    })
  }, [])

  /**
   * Sends form data to the 3rd party app via WebSocket
   * The app will save this data as autofill
   */
  const sendFormData = useCallback(
    async (formData: Record<string, any>): Promise<SendFormDataResult> => {
      console.log("🚀 sendFormData called with:", formData)
      setIsSending(true)
      try {
        console.log("🔌 Attempting to connect WebSocket...")
        console.log("🔌 Current WebSocket state:", ws ? `readyState: ${ws.readyState} (OPEN=${WebSocket.OPEN})` : "null")
        
        // Ensure WebSocket is connected
        const connectedWs = await connectWebSocket()
        console.log("✅ WebSocket connection established")
        console.log("✅ Connected WebSocket readyState:", connectedWs.readyState)

        // Double-check the connection
        if (!connectedWs || connectedWs.readyState !== WebSocket.OPEN) {
          console.error("❌ WebSocket is not in OPEN state after connection. readyState:", connectedWs?.readyState)
          console.error("❌ WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3")
          return {
            success: false,
            error: `WebSocket is not connected. State: ${connectedWs?.readyState}`,
          }
        }

        // Convert form data to JSON string
        const jsonData = JSON.stringify(formData, null, 2)

        // Log the data being sent for debugging
        console.log("📤 Sending form data to 3rd party app:", formData)
        console.log("📤 JSON data:", jsonData)
        console.log("📤 WebSocket readyState before send:", connectedWs.readyState)
        console.log("📤 WebSocket URL:", getWebSocketUrl())

        // Send the form data to the 3rd party app
        // The app will save it as autofill
        try {
          // Verify connection is still open right before sending
          if (connectedWs.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket closed before send! readyState:", connectedWs.readyState)
            return {
              success: false,
              error: "WebSocket connection closed before sending data",
            }
          }
          
          // Send the data
          connectedWs.send(jsonData)
          console.log("✅ Data sent via WebSocket.send() successfully")
          console.log("✅ Message length:", jsonData.length, "bytes")
          console.log("✅ Full JSON being sent:", jsonData)
          
          // Log to help verify data was sent
          console.log("=".repeat(50))
          console.log("📤 DATA SENT TO 3RD PARTY APP:")
          console.log(JSON.stringify(formData, null, 2))
          console.log("=".repeat(50))
          
          // Verify connection is still open after sending
          setTimeout(() => {
            if (connectedWs.readyState === WebSocket.OPEN) {
              console.log("✅ WebSocket still open after send")
            } else {
              console.warn("⚠️ WebSocket closed after send. readyState:", connectedWs.readyState)
            }
          }, 100)
        } catch (sendError) {
          console.error("❌ Error calling ws.send():", sendError)
          console.error("❌ Send error details:", {
            message: sendError instanceof Error ? sendError.message : String(sendError),
            readyState: connectedWs.readyState,
          })
          throw sendError
        }

        // Store sent data in localStorage for debugging (last 5 entries)
        if (typeof window !== "undefined") {
          try {
            const sentDataHistory = JSON.parse(
              localStorage.getItem("thirdPartyAutofillHistory") || "[]"
            )
            sentDataHistory.unshift({
              timestamp: new Date().toISOString(),
              data: formData,
            })
            // Keep only last 5 entries
            const trimmedHistory = sentDataHistory.slice(0, 5)
            localStorage.setItem(
              "thirdPartyAutofillHistory",
              JSON.stringify(trimmedHistory)
            )
          } catch (e) {
            console.warn("Failed to save sent data history:", e)
          }
        }

        console.log("✅ Successfully sent form data to 3rd party app")
        return {
          success: true,
        }
      } catch (error) {
        console.error("❌ Error sending form data to 3rd party app:", error)
        console.error("❌ Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to send form data",
        }
      } finally {
        setIsSending(false)
        console.log("🏁 sendFormData completed")
      }
    },
    [connectWebSocket]
  )

  // Try to connect on mount
  useEffect(() => {
    // Attempt initial connection
    connectWebSocket().catch((error) => {
      console.log("Initial connection attempt failed:", error.message)
      // Don't show error on initial connection attempt, just log it
    })

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (ws) {
        try {
          ws.close()
        } catch (e) {
          // Ignore errors
        }
        ws = null
      }
    }
  }, [connectWebSocket])

  /**
   * Get the history of sent data (for debugging)
   */
  const getSentDataHistory = useCallback(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(
        localStorage.getItem("thirdPartyAutofillHistory") || "[]"
      )
    } catch (e) {
      return []
    }
  }, [])

  /**
   * Clear the history of sent data
   */
  const clearSentDataHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("thirdPartyAutofillHistory")
    }
  }, [])

  return {
    isConnected,
    isSending,
    sendFormData,
    connectWebSocket,
    getSentDataHistory,
    clearSentDataHistory,
  }
}
