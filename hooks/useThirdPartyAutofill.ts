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
            if (connectionAttemptRef.current < 5) {
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
   * Sends form data to the 3rd party app via WebSocket
   * First saves data to a file-like storage, then sends the file URL
   * The 3rd party app will fetch the data from that URL
   */
  const sendFormData = useCallback(
    async (formData: Record<string, any>): Promise<SendFormDataResult> => {
      console.log("🚀 sendFormData called with:", formData)
      setIsSending(true)
      try {
        // Step 1: Transform formData to 3rd party app format
        // Format: Array with single object - exact format as specified
        const thirdPartyData = [
          {
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
            // Additional fields for sender/receiver company and driver ID
            senderCompany: formData.senderOrganization || formData.senderOrganizationName || "", // Илгээгч байгууллага
            receiverCompany: formData.receiverOrganization || formData.receiverOrganizationName || "", // Хүлээн авагч байгууллага
            driverId: formData.driverId || "", // Жолоочийн ID
          }
        ]

        console.log("💾 Step 1: Saving data to file-like storage...")
        console.log("📋 Data to save:", JSON.stringify(thirdPartyData, null, 2))

        // Step 2: Save data to file-like storage (database)
        const baseUrl = typeof window !== "undefined" 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_APP_URL || "https://gaali.vercel.app"
        
        const saveResponse = await fetch(`${baseUrl}/api/third-party/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uniqueCode: formData.uniqueCode,
            data: thirdPartyData,
          }),
        })

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to save data: ${saveResponse.statusText}`)
        }

        const saveResult = await saveResponse.json()
        const fileUrl = saveResult.url
        const uniqueCode = saveResult.code

        console.log("✅ Step 2: Data saved successfully")
        console.log("🔑 Unique Code:", uniqueCode)
        console.log("📁 File URL:", fileUrl)

        // Step 3: Connect WebSocket
        console.log("🔌 Step 3: Connecting WebSocket...")
        console.log("🔌 Current WebSocket state:", ws ? `readyState: ${ws.readyState} (OPEN=${WebSocket.OPEN})` : "null")
        
        let connectedWs: WebSocket
        try {
          connectedWs = await connectWebSocket()
          console.log("✅ WebSocket connection established")
          console.log("✅ Connected WebSocket readyState:", connectedWs.readyState)
        } catch (connectionError) {
          console.error("❌ Failed to connect WebSocket:", connectionError)
          const errorMessage = connectionError instanceof Error 
            ? connectionError.message 
            : "Failed to connect to 3rd party app. Please ensure the app is running."
          return {
            success: false,
            error: errorMessage,
          }
        }

        // Double-check the connection
        if (!connectedWs || connectedWs.readyState !== WebSocket.OPEN) {
          console.error("❌ WebSocket is not in OPEN state after connection. readyState:", connectedWs?.readyState)
          console.error("❌ WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3")
          return {
            success: false,
            error: `WebSocket is not connected. State: ${connectedWs?.readyState}. Please ensure the 3rd party app is running.`,
          }
        }

        // Step 4: Send full URL to 3rd party app
        // The 3rd party app expects a URL string (not just a code)
        // It will fetch data from that URL and can forward to another site
        const dataUrl = `${baseUrl}/api/third-party/data/${uniqueCode}`
        console.log("📤 Step 4: Sending URL to 3rd party app")
        console.log("📤 WebSocket readyState before send:", connectedWs.readyState)
        console.log("📤 WebSocket URL:", getWebSocketUrl())
        console.log("🔑 Unique Code:", uniqueCode)
        console.log("📁 Full URL to send:", dataUrl)
        console.log("💡 3rd party app will fetch data from this URL")
        console.log("💡 3rd party app can forward data to another site")

        // Verify connection is still open right before sending
        if (connectedWs.readyState !== WebSocket.OPEN) {
          console.error("❌ WebSocket closed before send! readyState:", connectedWs.readyState)
          return {
            success: false,
            error: "WebSocket connection closed before sending data. Please ensure the 3rd party app is running.",
          }
        }
        
        try {
          // Send the full URL (3rd party app expects URL string, will fetch and can forward)
          connectedWs.send(dataUrl)
          console.log("✅ URL sent via WebSocket.send() successfully")
          console.log("✅ URL:", dataUrl)
          
          // Verify connection is still open immediately after sending
          // If it closed, the send might have failed
          if (connectedWs.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket closed immediately after send! readyState:", connectedWs.readyState)
            return {
              success: false,
              error: "WebSocket connection closed immediately after sending. The 3rd party app may not be running.",
            }
          }
          
          // Log to help verify data was sent
          console.log("=".repeat(50))
          console.log("📤 URL SENT TO 3RD PARTY APP:")
          console.log(dataUrl)
          console.log("🔑 Unique Code:", uniqueCode)
          console.log("💡 3rd party app will fetch data from this URL")
          console.log("💡 3rd party app can forward data to another site")
          console.log("=".repeat(50))
          
          // Verify connection is still open after a short delay
          await new Promise(resolve => setTimeout(resolve, 100))
          if (connectedWs.readyState !== WebSocket.OPEN) {
            console.warn("⚠️ WebSocket closed shortly after send. readyState:", connectedWs.readyState)
            // This might be okay if the app closes after receiving, but log it
          }
        } catch (sendError) {
          console.error("❌ Error calling ws.send():", sendError)
          console.error("❌ Send error details:", {
            message: sendError instanceof Error ? sendError.message : String(sendError),
            readyState: connectedWs.readyState,
          })
          return {
            success: false,
            error: sendError instanceof Error ? sendError.message : "Failed to send data via WebSocket",
          }
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
              fileUrl: fileUrl,
              uniqueCode: uniqueCode,
              savedData: thirdPartyData,
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
        const dataBaseUrl = `${baseUrl}/api/third-party/data`
        return {
          success: true,
          fileUrl: fileUrl,
          uniqueCode: uniqueCode,
          baseUrl: dataBaseUrl, // Base URL to configure in 3rd party app
          dataUrl: dataUrl, // Full URL that was sent
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
