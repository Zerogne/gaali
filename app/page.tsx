"use client";

import { Sidebar } from "@/components/sidebar";
import { TruckTable } from "@/components/trucks/TruckTable";
import { fetchLogs } from "@/lib/fetchLogs";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
            {/* Орох / Гарах - Just buttons */}
            <div className="flex gap-2 mb-2">
              <Button
                onClick={() => router.push("/in-session")}
                className="flex-1 min-w-[140px] px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                size="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                ОРОХ
              </Button>
              <Button
                onClick={() => router.push("/out-session")}
                className="flex-1 min-w-[140px] px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white"
                size="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                ГАРАХ
              </Button>
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
