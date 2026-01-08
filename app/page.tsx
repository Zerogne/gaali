"use client";

import { Sidebar } from "@/components/sidebar";
import { TruckTable } from "@/components/trucks/TruckTable";
import { RealtimeVideo } from "@/components/camera/RealtimeVideo";
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

  // Function to merge IN and OUT logs for the same plate into one combined log
  const mergeLogsByPlate = (logs: TruckLog[]): TruckLog[] => {
    const plateMap = new Map<string, { inLog?: TruckLog; outLog?: TruckLog }>();
    
    // Group logs by plate number
    logs.forEach((log) => {
      const plate = log.plate.toUpperCase();
      if (!plateMap.has(plate)) {
        plateMap.set(plate, {});
      }
      const entry = plateMap.get(plate)!;
      if (log.direction === "IN") {
        entry.inLog = log;
      } else if (log.direction === "OUT") {
        entry.outLog = log;
      }
    });
    
    // Merge logs: if both IN and OUT exist for same plate, combine them
    const mergedLogs: TruckLog[] = [];
    const processedPlates = new Set<string>();
    
    logs.forEach((log) => {
      const plate = log.plate.toUpperCase();
      
      // Skip if we've already processed this plate
      if (processedPlates.has(plate)) {
        return;
      }
      
      const entry = plateMap.get(plate)!;
      
      // If we have both IN and OUT logs for this plate, merge them
      if (entry.inLog && entry.outLog) {
        // Use IN log as base (it's the original), merge OUT data into it
        const mergedLog: TruckLog = {
          ...entry.inLog,
          // Add OUT-specific data
          netWeightKg: entry.outLog.netWeightKg,
          // Use the most recent sentToCustoms status (if either is sent, consider it sent)
          sentToCustoms: entry.inLog.sentToCustoms || entry.outLog.sentToCustoms,
          // Use the most recent data for other fields (prefer OUT if it exists)
          driverId: entry.outLog.driverId || entry.inLog.driverId,
          driverName: entry.outLog.driverName || entry.inLog.driverName,
          cargoType: entry.outLog.cargoType || entry.inLog.cargoType,
          weightKg: entry.outLog.weightKg || entry.inLog.weightKg,
          comments: entry.outLog.comments || entry.inLog.comments,
          origin: entry.outLog.origin || entry.inLog.origin,
          destination: entry.outLog.destination || entry.inLog.destination,
          senderOrganizationId: entry.outLog.senderOrganizationId || entry.inLog.senderOrganizationId,
          senderOrganization: entry.outLog.senderOrganization || entry.inLog.senderOrganization,
          receiverOrganizationId: entry.outLog.receiverOrganizationId || entry.inLog.receiverOrganizationId,
          receiverOrganization: entry.outLog.receiverOrganization || entry.inLog.receiverOrganization,
          transportCompanyId: entry.outLog.transportCompanyId || entry.inLog.transportCompanyId,
          sealNumber: entry.outLog.sealNumber || entry.inLog.sealNumber,
          hasTrailer: entry.outLog.hasTrailer !== undefined ? entry.outLog.hasTrailer : entry.inLog.hasTrailer,
          trailerPlate: entry.outLog.trailerPlate || entry.inLog.trailerPlate,
        };
        mergedLogs.push(mergedLog);
        processedPlates.add(plate);
      } else {
        // Only one log exists (IN or OUT), add it as is
        // Make sure we use the correct log (IN or OUT) from the entry
        const singleLog = entry.inLog || entry.outLog || log;
        mergedLogs.push(singleLog);
        processedPlates.add(plate);
      }
    });
    
    // Sort by creation date (newest first)
    return mergedLogs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Load company-scoped logs on mount (only if authenticated)
  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth check

    async function loadLogs() {
      try {
        setIsLoading(true);
        // Get the 50 most recent logs for the home page
        const result = await getTruckLogs(1, 50);
        // Merge IN and OUT logs for the same plate
        const mergedLogs = mergeLogsByPlate(result.logs);
        setLogs(mergedLogs);
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
    // Reload from server to ensure consistency (only 50 most recent)
    try {
      const result = await getTruckLogs(1, 50);
      // Merge IN and OUT logs for the same plate
      const mergedLogs = mergeLogsByPlate(result.logs);
      setLogs(mergedLogs);
    } catch (error) {
      console.error("Error reloading logs:", error);
    }
  };

  const handleSend = async (logId: string) => {
    // Reload from server to ensure consistency (only 50 most recent)
    try {
      const result = await getTruckLogs(1, 50);
      // Merge IN and OUT logs for the same plate
      const mergedLogs = mergeLogsByPlate(result.logs);
      setLogs(mergedLogs);
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
            {/* Real-time Video Streams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 lg:gap-2 flex-shrink-0 mb-1.5 items-stretch">
              <div className="h-full min-h-[450px]">
                <RealtimeVideo
                  cameraId="camera-1"
                  direction="IN"
                  onActionClick={(dir) => {
                    router.push("/in-session");
                  }}
                />
              </div>
              <div className="h-full min-h-[450px]">
                <RealtimeVideo
                  cameraId="camera-2"
                  direction="OUT"
                  onActionClick={(dir) => {
                    router.push("/out-session");
                  }}
                />
              </div>
            </div>

            {/* History Table - Increased height */}
            <div className="min-h-[700px] mb-2">
            <TruckTable
              logs={logs}
              onSend={handleSend}
              onUpdate={() => {
                  // Reload logs after update (only 50 most recent)
                  getTruckLogs(1, 50)
                  .then(({ logs }) => {
                    // Merge IN and OUT logs for the same plate
                    const mergedLogs = mergeLogsByPlate(logs);
                    setLogs(mergedLogs);
                  })
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
