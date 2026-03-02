"use client";

import { Sidebar } from "@/components/sidebar";
import dynamic from "next/dynamic";
import { fetchLogs } from "@/lib/fetchLogs";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SESSIONS_LOG_LIMIT = 200;

const TruckTable = dynamic(
  () => import("@/components/trucks/TruckTable").then((m) => ({ default: m.TruckTable })),
  { ssr: false, loading: () => <div className="p-4 text-gray-500 text-sm">Уншиж байна...</div> }
);

export default function SessionsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TruckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      const result = await fetchLogs(1, SESSIONS_LOG_LIMIT);
      setLogs(result.logs || []);
    } catch (error) {
      if (error instanceof Error && error.message.includes("redirect")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Auth and logs in parallel
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [authRes, logsResult] = await Promise.all([
          fetch("/api/user"),
          fetchLogs(1, SESSIONS_LOG_LIMIT),
        ]);
        if (cancelled) return;
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        setIsCheckingAuth(false);
        setLogs(logsResult.logs || []);
      } catch {
        if (!cancelled) router.push("/login");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [router]);

  const handleSend = useCallback(async () => {
    try {
      const result = await fetchLogs(1, SESSIONS_LOG_LIMIT);
      setLogs(result.logs || []);
    } catch {
      // ignore
    }
  }, []);

  const handleUpdate = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const result = await fetchLogs(1, SESSIONS_LOG_LIMIT);
      setLogs(result.logs || []);
    } catch {
      try {
        const result = await fetchLogs(1, SESSIONS_LOG_LIMIT);
        setLogs(result.logs || []);
      } catch {
        // ignore
      }
    }
  }, []);

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1920px] mx-auto p-6 lg:p-8">
            <TruckTable
              logs={logs}
              onSend={handleSend}
              onUpdate={handleUpdate}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
