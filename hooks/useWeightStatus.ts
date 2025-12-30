"use client";

import { useState, useEffect, useRef } from "react";

export interface WeightStatus {
  connected: boolean;
  siteId: string | null;
  latestWeight: number | null;
  unit: string | null;
  lastReceivedAt: string | null;
  totalRecords: number;
  recentActivity: number;
}

export interface UseWeightStatusOptions {
  /**
   * Site ID to check (optional - if not provided, checks all sites)
   */
  siteId?: string;

  /**
   * Polling interval in milliseconds (default: 10000 = 10 seconds)
   */
  pollInterval?: number;

  /**
   * Whether to enable polling
   */
  enabled?: boolean;
}

/**
 * Hook to check weight device connection status
 * Polls the /api/weight/status endpoint to see if weight app is connected
 */
export function useWeightStatus(
  options: UseWeightStatusOptions = {}
) {
  const { 
    siteId,
    pollInterval = 10000, // 10 seconds
    enabled = true 
  } = options;

  const [status, setStatus] = useState<WeightStatus>({
    connected: false,
    siteId: siteId || null,
    latestWeight: null,
    unit: null,
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
        ? `/api/weight/status?siteId=${encodeURIComponent(siteId)}`
        : `/api/weight/status`;
      
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (isMountedRef.current) {
        setStatus({
          connected: data.connected || false,
          siteId: data.siteId || siteId || null,
          latestWeight: data.latestWeight?.weight || null,
          unit: data.latestWeight?.unit || null,
          lastReceivedAt: data.latestWeight?.receivedAt || null,
          totalRecords: data.totalRecords || 0,
          recentActivity: data.recentActivity?.count || 0,
        });
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("[Weight Status] Error checking status:", errorMessage);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Initial check
    if (enabled) {
      checkStatus();
    }

    // Set up polling
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

