"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestLpr } from "./useLatestLpr";

export type LprAutofillStatus = "idle" | "polling" | "connected" | "error";

export interface LprPlateAutofillData {
  plate: string | null;
  lastSeenAt: number | null;
  status: LprAutofillStatus;
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

export interface UseLprPlateAutofillOptions {
  /**
   * Polling interval in milliseconds
   * Defaults to 1000ms (1 second)
   */
  pollInterval?: number;

  /**
   * Whether auto-fill is enabled
   * Defaults to true
   */
  enabled?: boolean;
}

/**
 * Hook to poll LPR API and auto-fill plate number input
 * 
 * This hook uses the bridge service data stored in MongoDB,
 * which is the preferred method for camera integration.
 * 
 * Features:
 * - Only auto-fills when user is not actively typing
 * - Tracks focus state to prevent overwriting user input
 * - Only overwrites if field is empty or equals previous auto-filled value
 * - Respects typing cooldown (1.5s after last keystroke)
 */
export function useLprPlateAutofill(
  options: UseLprPlateAutofillOptions = {}
) {
  const { pollInterval = 1000, enabled = true } = options;

  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === "undefined") return enabled;
    const stored = localStorage.getItem("lprAutofillEnabled");
    return stored !== null ? stored === "true" : enabled;
  });

  const { latest, error: lprError } = useLatestLpr(
    isEnabled ? pollInterval : 0 // Don't poll if disabled
  );

  const [data, setData] = useState<LprPlateAutofillData>({
    plate: null,
    lastSeenAt: null,
    status: "idle",
    error: null,
  });

  const lastAutoFilledPlate = useRef<string | null>(null);
  const lastTypedAt = useRef<number>(0);
  const inputBindingRef = useRef<PlateInputBinding | null>(null);
  const lastPlateRef = useRef<string | null>(null);

  // Update data when latest LPR data changes
  useEffect(() => {
    if (!isEnabled) {
      setData((prev) => ({ ...prev, status: "idle" }));
      return;
    }

    if (lprError) {
      setData({
        plate: null,
        lastSeenAt: null,
        status: "error",
        error: lprError,
      });
      return;
    }

    if (latest?.plateNumber) {
      const plateNumber = latest.plateNumber.trim().toUpperCase();
      const receivedAt = latest.receivedAt
        ? new Date(latest.receivedAt).getTime()
        : Date.now();

      // #region agent log - Debug LPR data received
      console.log(`[DEBUG-LPR] Received plate data:`, {
        plateNumber,
        recognizedAt: latest.recognizedAt,
        cameraIp: latest.cameraIp,
        receivedAt: latest.receivedAt,
        previousPlate: lastPlateRef.current,
        isNew: plateNumber !== lastPlateRef.current,
      });
      // #endregion

      // Only update if plate number changed
      if (plateNumber !== lastPlateRef.current) {
        lastPlateRef.current = plateNumber;
        setData({
          plate: plateNumber,
          lastSeenAt: receivedAt,
          status: "connected",
          error: null,
        });
        // #region agent log - Debug plate update
        console.log(`[DEBUG-LPR] Plate updated to: ${plateNumber}`);
        // #endregion
      } else {
        // Update timestamp but keep same plate
        setData((prev) => ({
          ...prev,
          lastSeenAt: receivedAt,
          status: "connected",
        }));
      }
    } else {
      // No plate data yet, but polling is active
      setData((prev) => ({
        ...prev,
        status: prev.status === "idle" ? "polling" : prev.status,
      }));
    }
  }, [latest, lprError, isEnabled]);

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
      // #region agent log - Debug autofill action
      console.log(`[DEBUG-LPR] Auto-filling plate:`, {
        plate: data.plate,
        currentValue,
        lastAutoFilled: lastAutoFilledPlate.current,
        isFocused,
        timeSinceLastType,
      });
      // #endregion
      
      binding.setValue(data.plate);
      lastAutoFilledPlate.current = data.plate;
      
      // #region agent log - Debug autofill complete
      console.log(`[DEBUG-LPR] Auto-fill complete: ${data.plate}`);
      // #endregion
    } else {
      // #region agent log - Debug why not autofilling
      console.log(`[DEBUG-LPR] NOT auto-filling:`, {
        shouldAutofill,
        plate: data.plate,
        currentValue,
        isFocused,
        timeSinceLastType,
        reason: !shouldAutofill ? 'condition failed' : data.plate === currentValue ? 'already same value' : 'unknown',
      });
      // #endregion
    }
  }, [data.plate, isEnabled]);

  /**
   * Attempt auto-fill when plate data changes
   */
  useEffect(() => {
    if (data.plate && isEnabled) {
      attemptAutofill();
    }
  }, [data.plate, isEnabled, attemptAutofill]);

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
        localStorage.setItem("lprAutofillEnabled", String(newValue));
      }
    },
    [isEnabled]
  );

  /**
   * Refresh - trigger a new fetch
   */
  const refresh = useCallback(() => {
    // The useLatestLpr hook will handle the refresh on next poll
    // We can force an update by clearing the last plate ref
    lastPlateRef.current = null;
  }, []);

  return {
    ...data,
    isEnabled,
    toggleEnabled,
    bindToInput,
    trackTyping,
    refresh,
    rawPayload: latest, // Include full LPR data for debugging
  };
}
