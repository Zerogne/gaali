"use client";

import { useState, useEffect, useRef } from "react";

export interface RfidStatus {
  connected: boolean;
  siteId: string | null;
  latestRfid: string | null;
  lastReceivedAt: string | null;
  totalRecords: number;
  recentActivity: number;
}

export interface UseRfidStatusOptions {
  /**
   * Site ID to check (optional - if not provided, returns latest for current company)
   */
  siteId?: string;

  /**
   * Polling interval in milliseconds (default: 1000, same as weight for responsive autofill)
   */
  pollInterval?: number;

  /**
   * Whether to enable polling
   */
  enabled?: boolean;
}

/**
 * Hook to check RFID status and get latest RFID for autofill (same pattern as useWeightStatus).
 * Polls /api/rfid/status filtered by current company; no NEXT_PUBLIC_RFID_SITE_ID required.
 */
export function useRfidStatus(options: UseRfidStatusOptions = {}) {
  const {
    siteId,
    pollInterval = 1000,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<RfidStatus>({
    connected: false,
    siteId: siteId || null,
    latestRfid: null,
    lastReceivedAt: null,
    totalRecords: 0,
    recentActivity: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const checkStatus = async () => {
    if (!enabled || typeof window === "undefined") return;

    try {
      const url = siteId
        ? `/api/rfid/status?siteId=${encodeURIComponent(siteId)}`
        : `/api/rfid/status`;

      const response = await fetch(url, {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (isMountedRef.current) {
        setStatus({
          connected: data.connected || false,
          siteId: data.siteId || siteId || null,
          latestRfid: data.latestRfid?.rfid ?? null,
          lastReceivedAt: data.latestRfid?.receivedAt ?? null,
          totalRecords: data.totalRecords ?? 0,
          recentActivity: data.recentActivity?.count ?? 0,
        });
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      checkStatus();
    }

    const poll = () => {
      if (enabled && isMountedRef.current) {
        checkStatus();
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      }
    };

    pollTimeoutRef.current = setTimeout(poll, pollInterval);

    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [enabled, pollInterval, siteId]);

  return { status, error, refresh: checkStatus };
}
