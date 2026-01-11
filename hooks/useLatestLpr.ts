"use client";

import { useState, useEffect, useRef } from "react";

export interface LprLatest {
  plateNumber: string | null;
  recognizedAt: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  cameraIp: string | null;
  receivedAt: string | null;
}

/**
 * Hook to poll the latest LPR event from the API
 * Deduplicates events and stores the latest in localStorage
 * @param pollInterval - Polling interval in milliseconds (default: 1000)
 * @param camera - Optional camera number (1 or 2) to filter by specific camera IP
 */
export function useLatestLpr(pollInterval: number = 1000, camera?: 1 | 2) {
  const [latest, setLatest] = useState<LprLatest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate deduplication key - use receivedAt to detect new data even if plate is same
  const getDedupKey = (data: LprLatest): string => {
    if (!data.plateNumber || !data.receivedAt) return "";
    // Use receivedAt to detect new data even if plate number is the same
    return `${data.plateNumber}|${data.receivedAt}`;
  };

  // Fetch latest from API
  const fetchLatest = async () => {
    try {
      // Add camera parameter if specified
      const url = camera ? `/api/lpr/latest?camera=${camera}` : "/api/lpr/latest";
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: LprLatest = await response.json();
      const key = getDedupKey(data);

      // Update if key changed (new data received, even if same plate number)
      if (key && key !== lastKeyRef.current) {
        lastKeyRef.current = key;
        setLatest(data);
        setError(null);

        // #region agent log - Debug LPR data update
        console.log(`[DEBUG-LPR-LATEST] New data received:`, {
          plateNumber: data.plateNumber,
          receivedAt: data.receivedAt,
          recognizedAt: data.recognizedAt,
          cameraIp: data.cameraIp,
          key,
          previousKey: lastKeyRef.current,
        });
        // #endregion

        // Store in localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("lpr:last", JSON.stringify(data));
          } catch (e) {
            // localStorage might be disabled
          }
        }
      } else if (key) {
        // #region agent log - Debug no update (same data)
        console.log(`[DEBUG-LPR-LATEST] No update - same data:`, {
          plateNumber: data.plateNumber,
          receivedAt: data.receivedAt,
          key,
        });
        // #endregion
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("LPR polling error:", err);
    }
  };

  // Polling effect
  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lpr:last");
        if (stored) {
          const parsed = JSON.parse(stored) as LprLatest;
          const key = getDedupKey(parsed);
          lastKeyRef.current = key;
          setLatest(parsed);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    // Initial fetch
    fetchLatest();

    // Set up polling
    const poll = () => {
      fetchLatest();
      pollTimeoutRef.current = setTimeout(poll, pollInterval);
    };

    pollTimeoutRef.current = setTimeout(poll, pollInterval);

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [pollInterval, camera]);

  return { latest, error };
}
