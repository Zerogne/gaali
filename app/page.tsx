"use client";

import { Sidebar } from "@/components/sidebar";
import { TruckTable } from "@/components/trucks/TruckTable";
import { fetchLogs } from "@/lib/fetchLogs";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TruckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push("/login");
          return;
        }
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  // Load logs (same pulling function as report page: fetchLogs(1, 10000), raw logs)
  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth check

    async function loadLogs() {
      try {
        setIsLoading(true);
        const result = await fetchLogs(1, 10000);
        setLogs(result.logs || []);
      } catch (error) {
        console.error("❌ Error loading logs:", error);
        if (error instanceof Error && error.message.includes("redirect")) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
    
    // Refresh logs every 3 seconds and when tab gains focus (to show latest drafts)
    const refreshInterval = setInterval(() => loadLogs(), 3000);
    const onFocus = () => loadLogs();
    window.addEventListener("focus", onFocus);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, [isCheckingAuth, router]);

  const handleSave = async (_log?: TruckLog) => {
    try {
      const result = await fetchLogs(1, 10000);
      setLogs(result.logs || []);
    } catch (error) {
      console.error("Error reloading logs:", error);
    }
  };

  const handleSend = async (_logId?: string) => {
    try {
      const result = await fetchLogs(1, 10000);
      setLogs(result.logs || []);
    } catch (error) {
      console.error("Error reloading logs:", error);
    }
  };


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
              onUpdate={async () => {
                  await new Promise((r) => setTimeout(r, 300));
                  try {
                    const result = await fetchLogs(1, 10000);
                    setLogs(result.logs || []);
                  } catch (error) {
                    console.error("Error reloading logs after delete:", error);
                    try {
                      const result = await fetchLogs(1, 10000);
                      setLogs(result.logs || []);
                    } catch (retryError) {
                      console.error("Retry also failed:", retryError);
                    }
                  }
              }}
            />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
