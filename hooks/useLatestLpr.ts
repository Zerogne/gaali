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

  // Generate deduplication key - use receivedAt to detect new data even if plate is same
  const getDedupKey = (data: LprLatest): string => {
    if (!data.plateNumber || !data.receivedAt) return "";
    // Use receivedAt to detect new data even if plate number is the same
    return `${data.plateNumber}|${data.receivedAt}`;
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
      
      // #region agent log - Debug API response
      const receivedTime = data.receivedAt ? new Date(data.receivedAt).getTime() : 0;
      const now = Date.now();
      const ageMinutes = receivedTime > 0 ? (now - receivedTime) / 1000 / 60 : -1;
      fetch('http://127.0.0.1:7243/ingest/02008482-c731-4920-9095-c7192b6bb626',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLatestLpr.ts:42',message:'API response received',data:{plateNumber:data.plateNumber,receivedAt:data.receivedAt,ageMinutes:ageMinutes.toFixed(2),key,previousKey:lastKeyRef.current,willUpdate:key !== lastKeyRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

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
        fetch('http://127.0.0.1:7243/ingest/02008482-c731-4920-9095-c7192b6bb626',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLatestLpr.ts:49',message:'State updated with new data',data:{plateNumber:data.plateNumber,receivedAt:data.receivedAt,ageMinutes:ageMinutes.toFixed(2),key},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7243/ingest/02008482-c731-4920-9095-c7192b6bb626',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLatestLpr.ts:71',message:'No update - same key',data:{plateNumber:data.plateNumber,receivedAt:data.receivedAt,ageMinutes:ageMinutes.toFixed(2),key},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
          
          // #region agent log - Debug localStorage load
          const storedTime = parsed.receivedAt ? new Date(parsed.receivedAt).getTime() : 0;
          const now = Date.now();
          const ageMinutes = storedTime > 0 ? (now - storedTime) / 1000 / 60 : -1;
          fetch('http://127.0.0.1:7243/ingest/02008482-c731-4920-9095-c7192b6bb626',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLatestLpr.ts:96',message:'Loaded from localStorage',data:{plateNumber:parsed.plateNumber,receivedAt:parsed.receivedAt,ageMinutes:ageMinutes.toFixed(2),key},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
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
