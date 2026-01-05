"use client";

import { Sidebar } from "@/components/sidebar";
import { TruckSection } from "@/components/trucks/TruckSection";
import { TruckTable } from "@/components/trucks/TruckTable";
import { getTruckLogs } from "@/lib/api";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  // Load company-scoped logs on mount (only if authenticated)
  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth check

    async function loadLogs() {
      try {
        setIsLoading(true);
        // Get the 50 most recent logs for the home page
        const result = await getTruckLogs(1, 50);
        setLogs(result.logs);
      } catch (error) {
        console.error("Error loading logs:", error);
        // If error loading logs, might be auth issue, redirect to login
        if (error instanceof Error && error.message.includes("redirect")) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, [isCheckingAuth, router]);

  const handleSave = async (log: TruckLog) => {
    // Add to local state immediately for optimistic UI (keep only 50 most recent)
    setLogs((prev) => [log, ...prev].slice(0, 50));

    // Reload from server to ensure consistency (only 50 most recent)
    try {
      const result = await getTruckLogs(1, 50);
      setLogs(result.logs);
    } catch (error) {
      console.error("Error reloading logs:", error);
    }
  };

  const handleSend = async (logId: string) => {
    // Update local state immediately for optimistic UI
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId ? { ...log, sentToCustoms: true } : log
      )
    );

    // Reload from server to ensure consistency (only 50 most recent)
    try {
      const result = await getTruckLogs(1, 50);
      setLogs(result.logs);
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col max-w-[1920px] w-full mx-auto p-2 lg:p-3">
            {/* Truck IN and OUT Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 flex-shrink-0 mb-2">
              <TruckSection
                direction="IN"
                onSave={handleSave}
                onSend={handleSend}
              />
              <TruckSection
                direction="OUT"
                onSave={handleSave}
                onSend={handleSend}
              />
            </div>

            {/* History Table - Takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden">
            <TruckTable
              logs={logs}
              onSend={handleSend}
              onUpdate={() => {
                  // Reload logs after update (only 50 most recent)
                  getTruckLogs(1, 50)
                  .then(({ logs }) => setLogs(logs))
                  .catch(console.error);
              }}
            />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
