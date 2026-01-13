"use client";

import { Sidebar } from "@/components/sidebar";
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

  // Load logs for current page
  useEffect(() => {
    if (isCheckingAuth) return;

    async function loadLogs() {
      try {
        setIsLoading(true);
        // Load only the current page of logs (30 per page)
        const result = await getTruckLogs(currentPage, 30);
        setLogs(result.logs);
          setTotalPages(result.totalPages);
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
  }, [isCheckingAuth, router, currentPage]);

  const handleSend = async (logId: string) => {
    // Reload current page after sending
    const result = await getTruckLogs(currentPage, 30);
    setLogs(result.logs);
    setTotalPages(result.totalPages);
  };

  const handleUpdate = async () => {
    // Reload current page after update
    // Add a small delay to ensure server has processed the deletion
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const result = await getTruckLogs(currentPage, 30);
      setLogs(result.logs);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error reloading logs after delete:", error);
      // Even if there's an error, try to reload once more
      try {
        const result = await getTruckLogs(currentPage, 30);
        setLogs(result.logs);
        setTotalPages(result.totalPages);
      } catch (retryError) {
        console.error("Retry also failed:", retryError);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
