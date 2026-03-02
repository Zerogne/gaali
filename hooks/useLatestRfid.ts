"use client";

import { useEffect, useRef, useState } from "react";

export interface RfidLatest {
  siteId: string;
  rfid: string | null;
  raw?: string | null;
  ts?: string | null;
  deviceIp?: string | null;
  devicePort?: number | null;
  cameraIp?: string | null;
  receivedAt: string | null;
}

/**
 * Hook to poll the latest RFID event from the API
 * Deduplicates events and stores the latest in localStorage
 *
 * Requires a siteId (uses NEXT_PUBLIC_RFID_SITE_ID by default).
 */
export function useLatestRfid(pollInterval: number = 1000, siteId?: string) {
  const resolvedSiteId = siteId || process.env.NEXT_PUBLIC_RFID_SITE_ID || "";

  const [latest, setLatest] = useState<RfidLatest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = resolvedSiteId ? `rfid:last:${resolvedSiteId}` : `rfid:last`;

  const getDedupKey = (data: RfidLatest): string => {
    if (!data.rfid || !data.receivedAt) return "";
    return `${data.siteId}|${data.rfid}|${data.receivedAt}`;
  };

  const fetchLatest = async () => {
    if (!resolvedSiteId) {
      setError("RFID siteId is not configured (set NEXT_PUBLIC_RFID_SITE_ID)");
      return;
    }

    try {
      const url = `/api/rfid/latest?siteId=${encodeURIComponent(resolvedSiteId)}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: RfidLatest = await response.json();
      const key = getDedupKey(data);

      if (key && key !== lastKeyRef.current) {
        lastKeyRef.current = key;
        setLatest(data);
        setError(null);

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as RfidLatest;
          const key = getDedupKey(parsed);
          lastKeyRef.current = key;
          setLatest(parsed);
        }
      } catch {
        // ignore
      }
    }

    fetchLatest();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval, resolvedSiteId]);

  return { latest, error, siteId: resolvedSiteId };
}

