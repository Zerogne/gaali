"use client";

import { Sidebar } from "@/components/sidebar";
import { TruckTable } from "@/components/trucks/TruckTable";
import { fetchLogs } from "@/lib/fetchLogs";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SessionsPage() {
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

  // Load logs (same as dashboard)
  useEffect(() => {
    if (isCheckingAuth) return;

    async function loadLogs() {
      try {
        setIsLoading(true);
        const result = await fetchLogs(1, 10000);
        setLogs(result.logs || []);
      } catch (error) {
        console.error("Error loading logs:", error);
        if (error instanceof Error && error.message.includes("redirect")) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, [isCheckingAuth, router]);

  const handleSend = async (_logId: string) => {
    const result = await fetchLogs(1, 10000);
    setLogs(result.logs || []);
  };

  const handleUpdate = async () => {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const result = await fetchLogs(1, 10000);
      setLogs(result.logs || []);
    } catch (error) {
      console.error("Error reloading logs after delete:", error);
      try {
        const result = await fetchLogs(1, 10000);
        setLogs(result.logs || []);
      } catch {
        // ignore retry failure
      }
    }
  };

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
