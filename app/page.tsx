"use client";

import { Sidebar } from "@/components/sidebar";
import dynamic from "next/dynamic";
import { fetchLogs } from "@/lib/fetchLogs";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Plus } from "lucide-react";

const DASHBOARD_LOG_LIMIT = 200;
const REFRESH_INTERVAL_MS = 15000;

const TruckTable = dynamic(
  () => import("@/components/trucks/TruckTable").then((m) => ({ default: m.TruckTable })),
  { ssr: false, loading: () => <div className="p-4 text-gray-500 text-sm">Уншиж байна...</div> }
);

export default function DashboardPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TruckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      const result = await fetchLogs(1, DASHBOARD_LOG_LIMIT);
      setLogs(result.logs || []);
    } catch (error) {
      if (error instanceof Error && error.message.includes("redirect")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Auth check and load logs in parallel
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [authRes, logsResult] = await Promise.all([
          fetch("/api/user"),
          fetchLogs(1, DASHBOARD_LOG_LIMIT),
        ]);
        if (cancelled) return;
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        setIsCheckingAuth(false);
        setLogs(logsResult.logs || []);
      } catch (error) {
        if (!cancelled) router.push("/login");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [router]);

  // Refresh logs periodically and on focus
  useEffect(() => {
    if (isCheckingAuth) return;
    const refreshInterval = setInterval(loadLogs, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", loadLogs);
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("focus", loadLogs);
    };
  }, [isCheckingAuth, loadLogs]);

  const handleUpdate = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const result = await fetchLogs(1, DASHBOARD_LOG_LIMIT);
      setLogs(result.logs || []);
    } catch (error) {
      try {
        const result = await fetchLogs(1, DASHBOARD_LOG_LIMIT);
        setLogs(result.logs || []);
      } catch {
        // ignore retry
      }
    }
  }, []);

  const handleSend = useCallback(async (_logId?: string) => {
    try {
      await new Promise((r) => setTimeout(r, 300));
      const result = await fetchLogs(1, DASHBOARD_LOG_LIMIT);
      setLogs(result.logs || []);
      router.refresh();
    } catch {
      // ignore
    }
  }, [router]);


  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <main className="flex-1 flex flex-col">
          <div className="flex flex-col max-w-[1920px] w-full mx-auto p-1.5 lg:p-2">
            {/* Орох / Гарах Navigation Block - Single row layout to fill space */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {/* ОРОХ Card */}
              <Card className="border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-200">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10 bg-blue-500 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg shadow-sm bg-blue-100 text-blue-600 shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-gray-900 text-base font-bold mb-0 truncate">
                        Тээврийн хэрэгсэл орох
                      </CardTitle>
                      <p className="text-[10px] text-gray-500 truncate">
                        Тээврийн хэрэгсэл орох бүртгэл хийх
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/in-session")}
                    className="shadow-md hover:shadow-lg transition-all px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                    size="default"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    ОРОХ
                  </Button>
                </div>
              </Card>

              {/* ГАРАХ Card */}
              <Card className="border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 border-green-200">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10 bg-green-500 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg shadow-sm bg-green-100 text-green-600 shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-gray-900 text-base font-bold mb-0 truncate">
                        Тээврийн хэрэгсэл гарах
                      </CardTitle>
                      <p className="text-[10px] text-gray-500 truncate">
                        Тээврийн хэрэгсэл гарах бүртгэл хийх
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/out-session")}
                    className="shadow-md hover:shadow-lg transition-all px-5 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white shrink-0"
                    size="default"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    ГАРАХ
                  </Button>
                </div>
              </Card>
            </div>

            {/* History Table - More space for drafts */}
            <div className="flex-1 min-h-0 mb-2">
            <TruckTable
              logs={logs}
              onSend={handleSend}
              onUpdate={handleUpdate}
            />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
