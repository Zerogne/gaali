"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { FullHistoryTable } from "@/components/history/FullHistoryTable";
import { getTruckLogs } from "@/lib/api";
import type { TruckLog } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SessionsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TruckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Load all logs
  useEffect(() => {
    if (isCheckingAuth) return;

    async function loadAllLogs() {
      try {
        setIsLoading(true);
        // Load all logs by fetching multiple pages
        let allLogs: TruckLog[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const result = await getTruckLogs(page, 100);
          allLogs = [...allLogs, ...result.logs];
          hasMore = result.logs.length === 100 && page < 10; // Limit to 10 pages max (1000 logs)
          setTotalPages(result.totalPages);
          page++;
        }

        setLogs(allLogs);
      } catch (error) {
        console.error("Error loading logs:", error);
        if (error instanceof Error && error.message.includes("redirect")) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAllLogs();
  }, [isCheckingAuth, router]);

  const handleSend = async (logId: string) => {
    // Reload logs after sending
    const result = await getTruckLogs(1, 100);
    setLogs(result.logs);
  };

  const handleUpdate = async () => {
    // Reload logs after update
    let allLogs: TruckLog[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await getTruckLogs(page, 100);
      allLogs = [...allLogs, ...result.logs];
      hasMore = result.logs.length === 100 && page < 10;
      page++;
    }

    setLogs(allLogs);
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
            <FullHistoryTable
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
