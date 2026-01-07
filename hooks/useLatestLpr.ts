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
 */
export function useLatestLpr(pollInterval: number = 1000) {
  const [latest, setLatest] = useState<LprLatest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate deduplication key
  const getDedupKey = (data: LprLatest): string => {
    if (!data.plateNumber || !data.recognizedAt) return "";
    const image = data.imagePath || "";
    return `${data.plateNumber}|${data.recognizedAt}|${image}`;
  };

  // Fetch latest from API
  const fetchLatest = async () => {
    try {
      const response = await fetch("/api/lpr/latest", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: LprLatest = await response.json();
      const key = getDedupKey(data);

      // Only update if the key changed
      if (key && key !== lastKeyRef.current) {
        lastKeyRef.current = key;
        setLatest(data);
        setError(null);

        // Store in localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("lpr:last", JSON.stringify(data));
          } catch (e) {
            // localStorage might be disabled
          }
        }
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
  }, [pollInterval]);

  return { latest, error };
}
