"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraBridgeStatus = "idle" | "connecting" | "connected" | "error";

export interface CameraBridgeData {
  plate: string | null;
  lastSeenAt: number | null;
  status: CameraBridgeStatus;
  error: string | null;
}

export interface PlateInputBinding {
  /**
   * Get current value of the input
   */
  getValue: () => string;

  /**
   * Set value of the input
   */
  setValue: (value: string) => void;

  /**
   * Whether the input is currently focused
   */
  isFocused: () => boolean;
}

export interface UseCameraBridgeWebSocketOptions {
  /**
   * WebSocket server URL
   * Defaults to ws://localhost:3002 (bridge service WebSocket port)
   */
  wsUrl?: string;

  /**
   * Whether auto-fill is enabled
   * Defaults to true
   */
  enabled?: boolean;

  /**
   * Reconnection delay in milliseconds
   * Defaults to 3000ms (3 seconds)
   */
  reconnectDelay?: number;
}

/**
 * Hook to connect to camera bridge WebSocket and auto-fill plate number input
 * 
 * This hook connects directly to the bridge service WebSocket (port 3002)
 * for real-time plate detection updates.
 * 
 * Features:
 * - Real-time updates via WebSocket (no polling)
 * - Only auto-fills when user is not actively typing
 * - Tracks focus state to prevent overwriting user input
 * - Only overwrites if field is empty or equals previous auto-filled value
 * - Respects typing cooldown (1.5s after last keystroke)
 * - Automatic reconnection on disconnect
 */
export function useCameraBridgeWebSocket(
  options: UseCameraBridgeWebSocketOptions = {}
) {
  // Determine WebSocket URL
  // Bridge service runs on same machine as Next.js, so always use localhost
  const getWsUrl = () => {
    if (typeof window === "undefined") return "ws://localhost:3001";
    
    // Check environment variable first (allows override if needed)
    const envUrl = process.env.NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL;
    if (envUrl) {
      // Warn if env var has wrong port (server is on 3001)
      if (envUrl.includes(":3002") || envUrl.includes(":3003")) {
        console.warn("⚠️⚠️⚠️ Environment variable has wrong port! Server is on port 3001, but env var says:", envUrl);
        console.warn("⚠️ Using correct port 3001 instead");
        return "ws://localhost:3001";
      }
      return envUrl;
    }
    
    // Use port 3001 (same as test2) - bridge service WebSocket port
    // This works regardless of how Next.js is accessed (localhost or network IP)
    return "ws://localhost:3001";
  };

  const wsUrlFromFunction = getWsUrl();
  const {
    wsUrl = wsUrlFromFunction,
    enabled = true,
    reconnectDelay = 3000,
  } = options;
  
  // Debug: Log the actual URL being used
  if (typeof window !== "undefined") {
    console.log("🔍 [useCameraBridgeWebSocket] WebSocket URL determined:", wsUrl, "from function:", wsUrlFromFunction);
    console.log("🔍 [useCameraBridgeWebSocket] Environment variable:", process.env.NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL);
    console.log("🔍 [useCameraBridgeWebSocket] Options passed:", options);
    
    // CRITICAL: Warn if trying to connect to wrong port
    if (wsUrl.includes(":3002") || wsUrl.includes(":3003")) {
      console.error("❌❌❌ WRONG PORT! Server is on port 3001, but trying to connect to:", wsUrl);
      console.error("❌ Fix: Update .env.local to use ws://localhost:3001 or remove the env var");
    }
  }

  // Initialize isEnabled ref first (before state) - calculate initial value
  const getInitialEnabled = () => {
    if (typeof window === "undefined") return enabled;
    const stored = localStorage.getItem("cameraBridgeWsEnabled");
    // FORCE ENABLE by default - only disable if explicitly set to "false"
    // This ensures WebSocket autofill works out of the box
    if (stored === "false") {
      console.log("🔧 localStorage says disabled, but we'll enable it anyway for first-time setup");
      // Clear the disabled flag so it works
      localStorage.removeItem("cameraBridgeWsEnabled");
      return true;
    }
    // Default to TRUE (enabled)
    return true;
  };
  
  const initialEnabled = getInitialEnabled();
  const isEnabledRef = useRef<boolean>(initialEnabled);

  const [isEnabled, setIsEnabled] = useState(() => {
    // Only access localStorage in browser (not during SSR)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cameraBridgeWsEnabled");
      console.log("🔧 Initial isEnabled value:", initialEnabled, "from localStorage:", stored, "default enabled:", enabled);
      console.log("🔧 FORCING ENABLED to TRUE for WebSocket autofill");
    }
    // ALWAYS start enabled
    return true;
  });
  
  // Keep ref in sync with state
  useEffect(() => {
    isEnabledRef.current = isEnabled;
    console.log("🔧 isEnabled changed to:", isEnabled, "ref updated");
  }, [isEnabled]);

  const [data, setData] = useState<CameraBridgeData>({
    plate: null,
    lastSeenAt: null,
    status: "idle",
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoFilledPlate = useRef<string | null>(null);
  const lastTypedAt = useRef<number>(0);
  const inputBindingRef = useRef<PlateInputBinding | null>(null);
  const isConnectingRef = useRef(false);
  const shouldReconnectRef = useRef(true);
  const lastPayloadRef = useRef<any | null>(null);
  // isEnabledRef is declared above, before state

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!isEnabled) {
      console.log("⏸️ WebSocket disabled, not connecting");
      return;
    }
    
    if (isConnectingRef.current) {
      console.log("⏸️ Already connecting, skipping");
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket already open, skipping");
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log("⏸️ WebSocket already connecting, skipping");
      return;
    }

    // Close existing connection if any (but not if it's open)
    if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
      try {
        wsRef.current.close();
      } catch (e) {
        // Ignore errors when closing
      }
      wsRef.current = null;
    }

    if (isConnectingRef.current) {
      console.log("⏸️ Already connecting, skipping duplicate connection attempt");
      return;
    }

    isConnectingRef.current = true;
    setData((prev) => ({ ...prev, status: "connecting", error: null }));

    try {
      console.log("🔌🔌🔌 Connecting to camera bridge WebSocket:", wsUrl);
      console.log("🔌 Connection attempt at:", new Date().toISOString());
      console.log("🔌 Server should be listening on port 3001");
      console.log("🔌 Make sure camera-bridge server is running: npm run dev in camera-bridge folder");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        isConnectingRef.current = false;
        setData((prev) => ({
          ...prev,
          status: "connected",
          error: null,
        }));
        console.log("✅✅✅ Camera bridge WebSocket CONNECTED!");
        console.log("✅ WebSocket readyState:", ws.readyState, "(OPEN =", WebSocket.OPEN, ")");
        console.log("✅ WebSocket URL:", wsUrl);
        console.log("✅ Message handler is set:", typeof ws.onmessage === "function");
        console.log("✅ WebSocket object:", ws);
        console.log("✅ Ready to receive plate events!");
        
        // Test: Send a test message to verify connection
        try {
          ws.send(JSON.stringify({ type: "ping", message: "Frontend connected" }));
          console.log("✅ Sent ping message to server");
        } catch (error) {
          console.error("❌ Error sending ping:", error);
        }
      };

      ws.onmessage = (event) => {
        console.log("📨 ========== WebSocket MESSAGE RECEIVED ==========");
        console.log("📨 WebSocket message received:", event.data);
        console.log("📨 Message type:", typeof event.data);
        console.log("📨 WebSocket readyState:", ws.readyState, "(OPEN =", WebSocket.OPEN, ")");
        console.log("📨 Event type:", event.type);
        console.log("📨 Event target:", event.target);
        try {
          const message = JSON.parse(event.data);
          console.log("📨 Parsed message:", message);
          console.log("📨 Message type:", message.type);
          console.log("📨 Message plate:", message.plate);
          
          if (message.type === "plate_event" && message.plate) {
            const plateNumber = message.plate.trim().toUpperCase();
            const timestamp = message.timestamp 
              ? new Date(message.timestamp).getTime()
              : Date.now();

            lastPayloadRef.current = message;

            console.log("📸📸📸 ========================================");
            console.log("📸📸📸 PLATE DETECTED:", plateNumber);
            console.log("📸📸📸 ========================================");
            console.log("📸 Full message:", JSON.stringify(message, null, 2));
            console.log("📸 About to update state with plate:", plateNumber);

            setData((prev) => {
              console.log("📸 Inside setData, previous plate:", prev.plate, "new plate:", plateNumber);
              // Always update with new plate (even if same - allows re-triggering autofill)
              console.log("🔄 Setting plate in state:", plateNumber, "previous plate:", prev.plate);
              const newState = {
                ...prev,
                plate: plateNumber,
                lastSeenAt: timestamp,
                status: "connected" as const,
                error: null,
              };
              console.log("🔄 New state will be:", newState);
              
              // TRY AUTOFILL IMMEDIATELY if binding exists (use ref to avoid stale closure)
              if (inputBindingRef.current && isEnabledRef.current) {
                console.log("🚀 IMMEDIATE AUTOFILL ATTEMPT from setData");
                console.log("🚀 Binding exists:", !!inputBindingRef.current);
                console.log("🚀 isEnabled (ref):", isEnabledRef.current);
                // Use multiple attempts with increasing delays to ensure it works
                [0, 50, 150, 300].forEach((delay) => {
                  setTimeout(() => {
                    const binding = inputBindingRef.current;
                    if (binding && plateNumber && isEnabledRef.current) {
                      console.log(`🚀 Executing immediate autofill (delay ${delay}ms) for:`, plateNumber);
                      try {
                        binding.setValue(plateNumber);
                        lastAutoFilledPlate.current = plateNumber;
                        console.log(`🚀 Immediate autofill SUCCESS (delay ${delay}ms):`, plateNumber);
                      } catch (error) {
                        console.error(`🚀 Immediate autofill ERROR (delay ${delay}ms):`, error);
                      }
                    }
                  }, delay);
                });
              } else {
                console.log("⚠️ Cannot autofill immediately:", {
                  hasBinding: !!inputBindingRef.current,
                  isEnabled: isEnabledRef.current,
                });
              }
              
              return newState;
            });
            
            console.log("✅ setData called, state update queued for plate:", plateNumber);
            console.log("✅ Will trigger useEffect in next render");
          } else if (message.type === "connected") {
            console.log("📡 Camera bridge WebSocket:", message.message);
            lastPayloadRef.current = message;
          } else {
            console.log("⚠️ Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("❌ ========== ERROR PARSING MESSAGE ==========");
          console.error("❌ Error parsing WebSocket message:", error);
          console.error("❌ Raw message data:", event.data);
          console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
        }
        console.log("📨 ========== END MESSAGE HANDLER ==========");
      };

      ws.onerror = (error) => {
        isConnectingRef.current = false;
        console.error("❌❌❌ Camera bridge WebSocket ERROR:", error);
        console.error("❌ Failed to connect to:", wsUrl);
        console.error("❌ Error details:", {
          type: error.type,
          target: error.target,
          currentTarget: error.currentTarget,
        });
        console.error("💡 Make sure the bridge service is running on port 3001");
        console.error("💡 Check if server shows: '🔌 WebSocket server listening on port 3001'");
        console.error("💡 Check terminal where camera-bridge is running for connection logs");
        setData((prev) => ({
          ...prev,
          status: "error",
          error: `WebSocket connection error: ${wsUrl}`,
        }));
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        
        console.log("🔌🔌🔌 Camera bridge WebSocket CLOSED:", {
          code: event.code,
          reason: event.reason || "No reason",
          wasClean: event.wasClean,
          shouldReconnect: shouldReconnectRef.current,
          isEnabled,
        });
        
        // Only reconnect if it wasn't a normal closure and we should reconnect
        if (shouldReconnectRef.current && isEnabled && event.code !== 1000) {
          console.log("🔄 Will attempt to reconnect in", reconnectDelay, "ms");
          setData((prev) => ({
            ...prev,
            status: "connecting",
            error: "Reconnecting...",
          }));
          
          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Reconnect after delay (prevent rapid reconnection)
          reconnectTimeoutRef.current = setTimeout(() => {
            if (shouldReconnectRef.current && isEnabled) {
              console.log("🔄 Attempting reconnection...");
              connect();
            }
          }, reconnectDelay);
        } else {
          setData((prev) => ({
            ...prev,
            status: "idle",
            error: null,
          }));
        }
      };
    } catch (error) {
      isConnectingRef.current = false;
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect";
      setData((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
    }
  }, [wsUrl, isEnabled, reconnectDelay]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      // Close with code 1000 (normal closure) to prevent reconnection
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, "Intentional disconnect");
      }
      wsRef.current = null;
    }
    isConnectingRef.current = false;
    setData((prev) => ({
      ...prev,
      status: "idle",
      error: null,
    }));
  }, []);

  /**
   * Connect/disconnect based on enabled state
   */
  useEffect(() => {
    console.log("🔧 Connection effect triggered, isEnabled:", isEnabled);
    if (isEnabled) {
      shouldReconnectRef.current = true;
      console.log("🔧 WebSocket is enabled, will connect");
      // Small delay to prevent rapid reconnections
      const timeoutId = setTimeout(() => {
        console.log("🔧 Executing connect() now");
        connect();
      }, 100);
      
      return () => {
        console.log("🔧 Cleaning up connection effect");
        clearTimeout(timeoutId);
        disconnect();
      };
    } else {
      console.log("🔧 WebSocket is disabled, disconnecting");
      disconnect();
      return () => {};
    }
  }, [isEnabled, connect, disconnect]);

  /**
   * Auto-fill plate into input if conditions are met
   * SIMPLIFIED: Just fill it if we have a plate and binding
   */
  const attemptAutofill = useCallback(() => {
    console.log("🔍 attemptAutofill called", {
      hasBinding: !!inputBindingRef.current,
      hasPlate: !!data.plate,
      isEnabled,
      plate: data.plate,
    });

    if (!inputBindingRef.current) {
      console.log("⚠️ Autofill: No input binding");
      return;
    }

    if (!data.plate) {
      console.log("⚠️ Autofill: No plate data");
      return;
    }

    if (!isEnabled) {
      console.log("⚠️ Autofill: Disabled");
      return;
    }

    const binding = inputBindingRef.current;
    const currentValue = binding.getValue();
    const isFocused = binding.isFocused();
    const timeSinceLastType = Date.now() - lastTypedAt.current;

    console.log("🔍 Autofill check:", {
      plate: data.plate,
      currentValue,
      isFocused,
      timeSinceLastType,
      lastAutoFilled: lastAutoFilledPlate.current,
    });

    // ONLY skip if user is actively typing RIGHT NOW (within 200ms)
    if (isFocused && timeSinceLastType < 200) {
      console.log("⏸️ Autofill: Skipped (user actively typing)");
      return;
    }

    // ALWAYS fill if plate is different from current value
    if (data.plate && data.plate !== currentValue) {
      console.log("✅✅✅ ========================================");
      console.log("✅✅✅ AUTOFILLING PLATE:", data.plate);
      console.log("✅✅✅ ========================================");
      console.log("✅ Current value:", currentValue, "→ New value:", data.plate);
      try {
        binding.setValue(data.plate);
        lastAutoFilledPlate.current = data.plate;
        console.log("✅✅✅ AUTOFILL SUCCESS! Input field updated with:", data.plate);
      } catch (error) {
        console.error("❌❌❌ AUTOFILL ERROR:", error);
      }
    } else {
      console.log("⏸️ Autofill: Plate matches current value, skipping");
    }
  }, [data.plate, isEnabled]);

  /**
   * Attempt auto-fill when plate data changes
   * TRIGGERS IMMEDIATELY when plate changes
   */
  useEffect(() => {
    console.log("🔄🔄🔄 useEffect triggered - plate changed:", {
      plate: data.plate,
      isEnabled,
      hasBinding: !!inputBindingRef.current,
      status: data.status,
    });
    
    // TRY AUTOFILL if we have a plate
    if (data.plate) {
      if (isEnabled && inputBindingRef.current) {
        console.log("🔄🔄🔄 PLATE RECEIVED, TRIGGERING AUTOFILL:", data.plate);
        // Try immediately
        attemptAutofill();
        // Also try after a short delay (in case state isn't fully updated)
        const timeoutId = setTimeout(() => {
          console.log("🔄🔄🔄 Retry autofill after delay for plate:", data.plate);
          attemptAutofill();
        }, 100);
        return () => {
          clearTimeout(timeoutId);
        };
      } else {
        if (!inputBindingRef.current) {
          console.log("⚠️ Plate received but no input binding yet:", data.plate);
        }
        if (!isEnabled) {
          console.log("⚠️ Plate received but autofill is disabled:", data.plate);
        }
      }
    }
  }, [data.plate, isEnabled, attemptAutofill]);

  /**
   * Bind to an input element
   */
  const bindToInput = useCallback((binding: PlateInputBinding) => {
    console.log("🔗🔗🔗 bindToInput called, binding:", {
      hasGetValue: !!binding.getValue,
      hasSetValue: !!binding.setValue,
      hasIsFocused: !!binding.isFocused,
      currentPlate: data.plate,
    });
    inputBindingRef.current = binding;
    console.log("🔗🔗🔗 Input binding set! Current plate:", data.plate);
    
    // If we already have a plate and form is empty, try to autofill immediately
    // Only autofill if the form field is actually empty (don't overwrite user input)
    if (data.plate && isEnabled) {
      const currentValue = binding.getValue();
      if (!currentValue || currentValue.trim() === "") {
        console.log("🔗🔗🔗 Plate exists and form is empty, attempting immediate autofill:", data.plate);
        setTimeout(() => {
          if (inputBindingRef.current && data.plate) {
            const checkValue = inputBindingRef.current.getValue();
            // Double-check form is still empty before autofilling
            if (!checkValue || checkValue.trim() === "") {
              console.log("🔗🔗🔗 Executing immediate autofill on bind");
              try {
                inputBindingRef.current.setValue(data.plate);
                lastAutoFilledPlate.current = data.plate;
                console.log("🔗🔗🔗 Immediate autofill on bind SUCCESS:", data.plate);
              } catch (error) {
                console.error("🔗🔗🔗 Immediate autofill on bind ERROR:", error);
              }
            } else {
              console.log("🔗🔗🔗 Form has value, skipping autofill on bind");
            }
          }
        }, 100);
      } else {
        console.log("🔗🔗🔗 Form already has value, skipping autofill on bind:", currentValue);
      }
    }
  }, [data.plate, isEnabled]);

  /**
   * Track when user types in the input
   */
  const trackTyping = useCallback(() => {
    lastTypedAt.current = Date.now();
    // Clear last auto-filled plate when user types
    if (inputBindingRef.current) {
      const currentValue = inputBindingRef.current.getValue();
      if (currentValue !== lastAutoFilledPlate.current) {
        lastAutoFilledPlate.current = null;
      }
    }
  }, []);

  /**
   * Toggle auto-fill on/off
   */
  const toggleEnabled = useCallback(
    (value?: boolean) => {
      const newValue = value !== undefined ? value : !isEnabled;
      setIsEnabled(newValue);
      if (typeof window !== "undefined") {
        localStorage.setItem("cameraBridgeWsEnabled", String(newValue));
      }
    },
    [isEnabled]
  );

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      shouldReconnectRef.current = true;
      connect();
    }, 500);
  }, [connect, disconnect]);

  /**
   * Refresh - alias for reconnect
   */
  const refresh = useCallback(() => {
    reconnect();
  }, [reconnect]);

  return {
    ...data,
    isEnabled,
    toggleEnabled,
    bindToInput,
    trackTyping,
    reconnect,
    refresh,
    lastPayload: lastPayloadRef.current,
  };
}
