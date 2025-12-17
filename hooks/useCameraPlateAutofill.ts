"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "idle" | "polling" | "error";

export interface CameraPlateData {
  plate: string | null;
  lastSeenAt: number | null;
  status: CameraStatus;
  error: string | null;
  rawPayload: any | null;
}

export interface UseCameraPlateAutofillOptions {
  /**
   * Polling interval in milliseconds
   * Defaults to CAMERA_POLL_MS env var or 500ms
   */
  pollInterval?: number;

  /**
   * Whether auto-fill is enabled
   * Defaults to true
   */
  enabled?: boolean;
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

/**
 * Hook to poll camera API and auto-fill plate number input
 *
 * Features:
 * - Only auto-fills when user is not actively typing
 * - Tracks focus state to prevent overwriting user input
 * - Only overwrites if field is empty or equals previous auto-filled value
 * - Respects typing cooldown (1.5s after last keystroke)
 */
export function useCameraPlateAutofill(
  options: UseCameraPlateAutofillOptions = {}
) {
  const { pollInterval, enabled = true } = options;

  const [data, setData] = useState<CameraPlateData>({
    plate: null,
    lastSeenAt: null,
    status: "idle",
    error: null,
    rawPayload: null,
  });

  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === "undefined") return enabled;
    const stored = localStorage.getItem("cameraAutofillEnabled");
    return stored !== null ? stored === "true" : enabled;
  });

  const lastAutoFilledPlate = useRef<string | null>(null);
  const lastTypedAt = useRef<number>(0);
  const inputBindingRef = useRef<PlateInputBinding | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Get poll interval from env or use provided/default
  // Increased default interval to prevent overload
  const getPollInterval = useCallback(() => {
    if (pollInterval) return pollInterval;
    // Default to 2 seconds instead of 500ms to reduce server load
    return 2000;
  }, [pollInterval]);

  const consecutiveErrorsRef = useRef(0);
  const lastErrorTimeRef = useRef<number>(0);

  /**
   * Fetch camera events from API
   */
  const fetchCameraEvent = useCallback(async () => {
    if (!isEnabled || isPollingRef.current) return;

    // Stop polling if too many consecutive errors (prevent overload)
    if (consecutiveErrorsRef.current >= 3) {
      const timeSinceLastError = Date.now() - lastErrorTimeRef.current;
      
      // For configuration errors (count >= 10), wait much longer (5 minutes)
      if (consecutiveErrorsRef.current >= 10) {
        if (timeSinceLastError < 300000) { // 5 minutes
          return;
        }
      } else {
        // Wait 30 seconds before retrying after 3 consecutive errors
        if (timeSinceLastError < 30000) {
          return;
        }
      }
      
      // Reset error count after waiting period (but only if not a config error)
      if (consecutiveErrorsRef.current < 10) {
        consecutiveErrorsRef.current = 0;
      }
    }

    isPollingRef.current = true;
    setData((prev) => ({ ...prev, status: "polling", error: null }));

    try {
      const response = await fetch("/api/camera/events", {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });

      let result: any;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is not JSON, handle it gracefully
        throw new Error(`Invalid response from server: ${response.status}`);
      }

      // Handle both successful API responses and error responses
      if (!response.ok) {
        // Server returned an error response
        consecutiveErrorsRef.current++;
        lastErrorTimeRef.current = Date.now();
        const errorMsg = result?.error || `Server error: ${response.status}`;
        
        // If camera is not configured, stop polling aggressively
        if (errorMsg.includes("not configured") || errorMsg.includes("CAMERA_BASE_URL")) {
          consecutiveErrorsRef.current = 10; // Set high to prevent retries
        }
        
        setData((prev) => ({
          ...prev,
          status: "error",
          error: errorMsg,
          rawPayload: result?.raw || null,
        }));
        return;
      }

      if (result.ok && result.plate) {
        consecutiveErrorsRef.current = 0; // Reset error count on success
        setData({
          plate: result.plate,
          lastSeenAt: result.ts,
          status: "polling",
          error: null,
          rawPayload: result.raw || null,
        });
      } else {
        // API returned ok: false or no plate
        consecutiveErrorsRef.current++;
        lastErrorTimeRef.current = Date.now();
        setData((prev) => ({
          ...prev,
          status: result.ok ? "polling" : "error",
          error: result.error || "No plate detected",
          rawPayload: result.raw || null,
        }));
      }
    } catch (error) {
      consecutiveErrorsRef.current++;
      lastErrorTimeRef.current = Date.now();

      // Handle different error types
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          errorMessage = "Request timeout";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Camera not configured or connection error";
        } else {
          errorMessage = error.message;
        }
      }

      // Only log errors if not too many consecutive ones and error is meaningful
      // Suppress repeated "Failed to fetch" errors which are likely configuration issues
      if (consecutiveErrorsRef.current < 3 && errorMessage !== "Camera not configured or connection error") {
        console.error("Camera polling error:", error);
      } else if (consecutiveErrorsRef.current === 1 && errorMessage === "Camera not configured or connection error") {
        // Only log once for configuration errors
        console.warn("Camera not configured. Set CAMERA_BASE_URL in environment variables to enable camera autofill.");
      }

      setData((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
    } finally {
      isPollingRef.current = false;
    }
  }, [isEnabled]);

  /**
   * Auto-fill plate into input if conditions are met
   */
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

  /**
   * Start polling loop
   */
  useEffect(() => {
    if (!isEnabled) {
      setData((prev) => ({ ...prev, status: "idle" }));
      return;
    }

    // Initial fetch
    fetchCameraEvent();

    // Set up polling interval
    const poll = () => {
      if (isEnabled && !isPollingRef.current) {
        fetchCameraEvent();
      }
      pollTimeoutRef.current = setTimeout(poll, getPollInterval());
    };

    pollTimeoutRef.current = setTimeout(poll, getPollInterval());

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [isEnabled, fetchCameraEvent, getPollInterval]);

  /**
   * Attempt auto-fill when plate data changes
   */
  useEffect(() => {
    if (data.plate) {
      attemptAutofill();
    }
  }, [data.plate, attemptAutofill]);

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
        localStorage.setItem("cameraAutofillEnabled", String(newValue));
      }
    },
    [isEnabled]
  );

  return {
    ...data,
    isEnabled,
    toggleEnabled,
    bindToInput,
    trackTyping,
    refresh: fetchCameraEvent,
  };
}
