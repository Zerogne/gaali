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
  fileUrl?: string
  uniqueCode?: string
  baseUrl?: string
  dataUrl?: string
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
        // Only log in development
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_THIRD_PARTY_LOGS === "true") {
          console.log("⚠️ Existing WebSocket is not open, closing it. State:", ws.readyState)
        }
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
      // Only log connection attempts in development or if explicitly enabled
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_THIRD_PARTY_LOGS === "true") {
        console.log("🔌 Attempting to connect to WebSocket:", wsUrl)
        console.log("🔌 Connection attempt #:", connectionAttemptRef.current)
      }

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
            // Only log error details in development, and only once per connection attempt
            if (process.env.NODE_ENV === "development" && connectionAttemptRef.current <= 1) {
              console.warn("WebSocket connection error (this is expected if 3rd party app is not running)")
            }
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
            // Only log in development for initial connection failures
            if (process.env.NODE_ENV === "development" && connectionAttemptRef.current <= 1) {
              console.warn("WebSocket connection closed before opening (3rd party app may not be running)")
            }
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
            // Only auto-reconnect if explicitly enabled via env var
            // Otherwise, only reconnect when sendFormData is called
            if (process.env.NEXT_PUBLIC_THIRD_PARTY_AUTO_RECONNECT === "true" && connectionAttemptRef.current < 5) {
              if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
              }
              reconnectTimeout = setTimeout(() => {
                // Silently attempt reconnection
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
   * Sends form data to the 3rd party app via WebSocket (ws://127.0.0.1:9000/service)
   * Sends JSON directly - no API save. Connector receives data and forwards to government.
   */
  const sendFormData = useCallback(
    async (formData: Record<string, any>): Promise<SendFormDataResult> => {
      console.log("🚀 sendFormData called with:", formData)
      setIsSending(true)
      try {
        // Step 1: Transform formData to 3rd party app format
        // Format: Array with single object - supports both old and new API formats
        const thirdPartyData = [
          {
            // Core fields (always present)
            AKT: formData.aktNumber || formData.uniqueCode || "", // Актын дугаар (уникаль код)
            CAR: formData.product || formData.cargoType || formData.productName || "", // Тээвэрлэгч байгууллагын нэр / Бүтээгдэхүүн
            CMN: formData.convoyManifestNumber || formData.cmn || "", // Convoy manifest number
            CON: formData.contractNumber || "", // Гэрээний дугаар
            CT1: formData.container1 || "", // Чингэлэг 1
            DRN: formData.driverName || "", // Жолоочийн нэр
            LPC: formData.transporterCompany || formData.origin || formData.transportCompanyName || formData.senderOrganization || formData.senderOrganizationName || "", // Ачих газар код (with sender company)
            NET: formData.netWeightKg || formData.netWeight || 0, // Цэвэр жин
            SLN: formData.sealNumber || "", // Гаалийн лац, ломбын дугаар
            TRL: formData.trailerNumber || formData.trailerPlate || "", // Чиргүүлийн дугаар
            UPC: formData.destination || formData.receiverOrganization || formData.receiverOrganizationName || "", // Хүлээн авах газар код (with receiver company)
            VNO: formData.plateNumber || formData.plate || "", // Тээврийн хэрэгслийн дугаар
            WGT: formData.grossWeightKg || formData.weightKg || formData.weight || 0, // Бохир жин
            
            // New fields (added in updated API format)
            PRM: formData.premium || formData.prm || "", // Premium/Permit number
            CT2: formData.container2 || "", // Чингэлэг 2
            CT3: formData.container3 || "", // Чингэлэг 3
            CT4: formData.container4 || "", // Чингэлэг 4
            TID: formData.transactionId || formData.tid || "", // Transaction ID
            
            // Additional fields for sender/receiver company and driver ID
            senderCompany: formData.senderOrganization || formData.senderOrganizationName || "", // Илгээгч байгууллага
            receiverCompany: formData.receiverOrganization || formData.receiverOrganizationName || "", // Хүлээн авагч байгууллага
            driverId: formData.driverId || "", // Жолоочийн ID
          }
        ]

        const dataToSend = JSON.stringify(thirdPartyData)
        const uniqueCode = formData.aktNumber || formData.uniqueCode || ""

        console.log("🔌 Connecting to WebSocket...")
        let connectedWs: WebSocket
        try {
          connectedWs = await connectWebSocket()
        } catch (connectionError) {
          console.error("❌ Failed to connect WebSocket:", connectionError)
          return {
            success: false,
            error: connectionError instanceof Error ? connectionError.message : "Failed to connect. Ensure the connector is running at ws://127.0.0.1:9000/service",
          }
        }

        if (!connectedWs || connectedWs.readyState !== WebSocket.OPEN) {
          return {
            success: false,
            error: "WebSocket not connected. Ensure the connector is running at ws://127.0.0.1:9000/service",
          }
        }

        try {
          connectedWs.send(dataToSend)
          console.log("✅ Data sent via WebSocket to 3rd party app")
        } catch (sendError) {
          console.error("❌ Error calling ws.send():", sendError)
          return {
            success: false,
            error: sendError instanceof Error ? sendError.message : "Failed to send data via WebSocket",
          }
        }

        if (typeof window !== "undefined") {
          try {
            const sentDataHistory = JSON.parse(
              localStorage.getItem("thirdPartyAutofillHistory") || "[]"
            )
            sentDataHistory.unshift({
              timestamp: new Date().toISOString(),
              data: formData,
              uniqueCode: uniqueCode,
              savedData: thirdPartyData,
            })
            localStorage.setItem(
              "thirdPartyAutofillHistory",
              JSON.stringify(sentDataHistory.slice(0, 5))
            )
          } catch (e) {
            console.warn("Failed to save sent data history:", e)
          }
        }

        console.log("✅ Successfully sent form data to 3rd party app via WebSocket")
        return {
          success: true,
          uniqueCode: uniqueCode,
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
    connectWebSocket().catch(() => {
      // Silently handle connection failures - UI will show connection status
      // No need to log errors as this is expected when 3rd party app is not running
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

  /**
   * Check if WebSocket is currently connected (matching test-websocket.html logic)
   */
  const isWebSocketOpen = useCallback((): boolean => {
    return ws !== null && ws.readyState === WebSocket.OPEN
  }, [])

  /**
   * Get the WebSocket instance (for direct state checking like test-websocket.html)
   */
  const getWebSocket = useCallback((): WebSocket | null => {
    return ws
  }, [])

  return {
    isConnected,
    isSending,
    sendFormData,
    connectWebSocket,
    getSentDataHistory,
    clearSentDataHistory,
    isWebSocketOpen,
    getWebSocket,
  }
}
