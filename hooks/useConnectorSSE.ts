"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectorSSEStatus = "idle" | "connecting" | "connected" | "error";

export interface ConnectorSSEData {
  plate: string | null;
  lastSeenAt: number | null;
  status: ConnectorSSEStatus;
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

export interface UseConnectorSSEOptions {
  /**
   * Connector URL (defaults to http://localhost:3000/events)
   */
  connectorUrl?: string;

  /**
   * Whether auto-fill is enabled
   * Defaults to true
   */
  enabled?: boolean;
}

/**
 * Hook to connect to connector SSE endpoint and auto-fill plate number input
 * 
 * This hook connects to the Windows connector app via Server-Sent Events (SSE)
 * which provides real-time plate updates from the camera.
 * 
 * Features:
 * - Real-time plate updates via SSE
 * - Only auto-fills when user is not actively typing
 * - Tracks focus state to prevent overwriting user input
 * - Only overwrites if field is empty or equals previous auto-filled value
 * - Respects typing cooldown (1.5s after last keystroke)
 * - Auto-reconnects on connection loss
 */
export function useConnectorSSE(
  options: UseConnectorSSEOptions = {}
) {
  const { 
    connectorUrl = "http://localhost:3000/events",
    enabled = true 
  } = options;

  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === "undefined") return enabled;
    const stored = localStorage.getItem("connectorSSEEnabled");
    return stored !== null ? stored === "true" : enabled;
  });

  const [data, setData] = useState<ConnectorSSEData>({
    plate: null,
    lastSeenAt: null,
    status: "idle",
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastAutoFilledPlate = useRef<string | null>(null);
  const lastTypedAt = useRef<number>(0);
  const inputBindingRef = useRef<PlateInputBinding | null>(null);
  const lastPlateRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!isEnabled) {
      setData((prev) => ({ ...prev, status: "idle" }));
      return;
    }

    // Don't connect if already connected
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (typeof window === "undefined") return;

    setData((prev) => ({ ...prev, status: "connecting", error: null }));

    try {
      const eventSource = new EventSource(connectorUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (!isMountedRef.current) return;
        console.log("[Connector SSE] ✅ Connection opened");
        setData((prev) => ({
          ...prev,
          status: "connected",
          error: null,
        }));
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        if (!isMountedRef.current) return;

        try {
          const message = JSON.parse(event.data);
          
          if (message.plate && typeof message.plate === "string") {
            const plateNumber = message.plate.trim().toUpperCase();
            const timestamp = message.timestamp 
              ? new Date(message.timestamp).getTime()
              : Date.now();

            // Only update if plate number changed
            if (plateNumber !== lastPlateRef.current) {
              lastPlateRef.current = plateNumber;
              setData((prev) => ({
                ...prev,
                plate: plateNumber,
                lastSeenAt: timestamp,
                status: "connected",
                error: null,
              }));
            } else {
              // Update timestamp but keep same plate
              setData((prev) => ({
                ...prev,
                lastSeenAt: timestamp,
                status: "connected",
              }));
            }
          }
        } catch (parseError) {
          console.error("[Connector SSE] Failed to parse message:", parseError);
        }
      };

      eventSource.onerror = (error) => {
        if (!isMountedRef.current) return;

        // Only log errors if connector URL is not localhost (expected to fail if connector not running)
        // Suppress console errors for localhost connection failures - this is expected behavior
        const isLocalhost = connectorUrl.includes("localhost") || connectorUrl.includes("127.0.0.1");
        if (!isLocalhost || reconnectAttemptsRef.current === 0) {
          // Only log first attempt or if not localhost
          console.debug("[Connector SSE] Connection attempt:", connectorUrl);
        }
        
        // EventSource will automatically try to reconnect, but we can handle it explicitly
        if (eventSource.readyState === EventSource.CLOSED) {
          setData((prev) => ({
            ...prev,
            status: "error",
            error: isLocalhost 
              ? null // Don't show error for localhost - connector may not be running
              : "Connection closed. Will attempt to reconnect...",
          }));

          // Attempt manual reconnect if auto-reconnect didn't work
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current && isEnabled) {
                connect();
              }
            }, RECONNECT_DELAY);
          } else {
            // After max attempts, silently fail (connector not available)
            setData((prev) => ({
              ...prev,
              status: "error",
              error: isLocalhost ? null : "Failed to connect after multiple attempts.",
            }));
          }
        } else {
          // Connecting state
          setData((prev) => ({
            ...prev,
            status: "connecting",
          }));
        }
      };
    } catch (error) {
      // Suppress errors for localhost - connector may not be running (expected)
      const isLocalhost = connectorUrl.includes("localhost") || connectorUrl.includes("127.0.0.1");
      if (!isLocalhost) {
        console.error("[Connector SSE] Failed to create EventSource:", error);
      }
      setData((prev) => ({
        ...prev,
        status: "error",
        error: isLocalhost 
          ? null // Don't show error for localhost
          : (error instanceof Error ? error.message : "Failed to connect to connector"),
      }));
    }
  }, [connectorUrl, isEnabled]);

  // Auto-fill plate into input if conditions are met
  const attemptAutofill = useCallback(() => {
    if (!inputBindingRef.current || !data.plate || !isEnabled) return;

    const binding = inputBindingRef.current;
    const currentValue = binding.getValue();
    const isFocused = binding.isFocused();
    const timeSinceLastType = Date.now() - lastTypedAt.current;
    const typingCooldown = 1500; // 1.5 seconds

    // Don't overwrite if:
    // 1. User is currently focused on the input
    // 2. User typed recently (within cooldown)
    // 3. Current value is different from last auto-filled AND not empty
    if (isFocused || timeSinceLastType < typingCooldown) {
      return;
    }

    // Only auto-fill if:
    // 1. Field is empty, OR
    // 2. Field equals the last auto-filled value (allows updates)
    const shouldAutofill =
      !currentValue ||
      currentValue === lastAutoFilledPlate.current ||
      currentValue.trim() === "";

    if (shouldAutofill && data.plate !== currentValue) {
      binding.setValue(data.plate);
      lastAutoFilledPlate.current = data.plate;
    }
  }, [data.plate, isEnabled]);

  // Attempt auto-fill when plate data changes
  useEffect(() => {
    if (data.plate && isEnabled) {
      attemptAutofill();
    }
  }, [data.plate, isEnabled, attemptAutofill]);

  // Connect/disconnect based on enabled state
  useEffect(() => {
    isMountedRef.current = true;

    if (isEnabled) {
      connect();
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setData((prev) => ({ ...prev, status: "idle" }));
    }

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isEnabled, connect]);

  /**
   * Bind to an input element
   */
  const bindToInput = useCallback((binding: PlateInputBinding) => {
    inputBindingRef.current = binding;
  }, []);

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
        localStorage.setItem("connectorSSEEnabled", String(newValue));
      }
    },
    [isEnabled]
  );

  /**
   * Refresh - reconnect to get latest data
   */
  const refresh = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    lastPlateRef.current = null;
    connect();
  }, [connect]);

  return {
    ...data,
    isEnabled,
    toggleEnabled,
    bindToInput,
    trackTyping,
    refresh,
  };
}

