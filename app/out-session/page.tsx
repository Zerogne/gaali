"use client";

import { Sidebar } from "@/components/sidebar";
import {
  OutSessionForm,
  type OutSessionFormHandle,
} from "@/components/sessions/OutSessionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLprPlateAutofill } from "@/hooks/useLprPlateAutofill";
import { getTruckLog } from "@/lib/api";
import type { TruckLog } from "@/lib/types";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function OutSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const cameraAutofill = useLprPlateAutofill();
  const [currentPlate, setCurrentPlate] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | undefined>(undefined);
  const [autoFillOrigin, setAutoFillOrigin] = useState<string | null>(null);
  const formRef = useRef<OutSessionFormHandle>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const [editLog, setEditLog] = useState<TruckLog | null>(null);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [outTime, setOutTime] = useState<string>(new Date().toISOString().slice(0, 16));

  // Helper function to get current datetime in datetime-local format
  const getCurrentDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch camera stream URL from config
  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        const response = await fetch("/api/camera/config");
        if (response.ok) {
          const config = await response.json();
          console.log("Camera config received:", config);
          // Don't use MJPEG - use WebSocket instead (RealtimeVideo component)
          // streamUrl is null to prevent MJPEG loading errors
          // Video will come from direct camera WebSocket connection
          const url = config.streamUrl || undefined; // Will be null, which is correct
          console.log("Setting streamUrl to:", url, "(null = use WebSocket)");
          setStreamUrl(url);
        } else {
          console.warn("Camera config API returned non-OK status:", response.status);
          // Don't use fallback MJPEG - use WebSocket instead
          setStreamUrl(undefined);
        }
      } catch (error) {
        console.error("Failed to fetch camera stream URL:", error);
        // Don't use fallback MJPEG - use WebSocket instead
        setStreamUrl(undefined);
      }
    };
    fetchStreamUrl();
  }, []);

  // Check for edit parameter
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setEditLogId(editId);
    }
  }, [searchParams]);

  // Fetch log data when editing
  useEffect(() => {
    if (editLogId) {
      setIsLoadingLog(true);
      getTruckLog(editLogId)
        .then((log) => {
          // Allow editing if:
          // 1. Log has direction "OUT", OR
          // 2. Log has netWeightKg (indicating it has OUT data, even if direction is "IN")
          if (log && (log.direction === "OUT" || log.netWeightKg !== undefined)) {
            setEditLog(log);
          } else {
            toast({
              title: "Алдаа",
              description: "Бүртгэл олдсонгүй эсвэл буруу чиглэл",
              variant: "destructive",
            });
            router.push("/out-session");
          }
        })
        .catch((error) => {
          console.error("Error loading log:", error);
          toast({
            title: "Алдаа",
            description: "Бүртгэл ачаалахад алдаа гарлаа",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingLog(false);
        });
    }
  }, [editLogId, router, toast]);

  // Load destination from in-session for auto-fill
  useEffect(() => {
    const storedDestination = localStorage.getItem("inSessionDestination");
    if (storedDestination && !editLogId) {
      setAutoFillOrigin(storedDestination);
      // Clear it after use so it doesn't persist
      localStorage.removeItem("inSessionDestination");
    }
  }, [editLogId]);

  // Track if user manually edited the plate field
  const handlePlateChange = (value: string) => {
    setCurrentPlate(value);
  };

  const handleNavigationClick = (path: string) => {
    if (hasUnsavedData && formRef.current?.hasUnsavedData()) {
      setPendingNavigation(path);
      setShowSaveDialog(true);
    } else {
      router.push(path);
    }
  };

  const handleSaveAndNavigate = async () => {
    if (formRef.current) {
      const success = await formRef.current.triggerSave();
      if (success) {
        setShowSaveDialog(false);
        if (pendingNavigation) {
          router.push(pendingNavigation);
          setPendingNavigation(null);
        }
      }
    }
  };

  const handleCancelAndNavigate = () => {
    setShowSaveDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation - Fixed */}
        <nav className="bg-white border-b border-gray-200 shrink-0 z-50">
          <div className="max-w-full mx-auto px-6 py-3">
            <div className="flex items-center gap-4 flex-1">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-5 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  ГАРАХ бүртгэл
                </h1>
                <div className="flex items-center gap-2 ml-4">
                  <Label htmlFor="outTime" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Гарсан *
                  </Label>
                  <Input
                    id="outTime"
                    type="datetime-local"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    onFocus={(e) => {
                      const currentTime = getCurrentDateTime();
                      setOutTime(currentTime);
                      e.target.value = currentTime;
                    }}
                    className="h-10 text-base w-auto min-w-[180px]"
                    required
                  />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/gaali-bridge.exe';
                    link.download = 'gaali-bridge.exe';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Gaali Bridge татах
                </Button>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                >
                  OUT
                </Badge>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - Fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full w-full">
            {isLoadingLog ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Уншиж байна...</p>
              </div>
            ) : (
              <OutSessionForm
                ref={formRef}
                autoFillPlate={null}
                autoFillOrigin={autoFillOrigin}
                onPlateChange={handlePlateChange}
                onHasUnsavedDataChange={setHasUnsavedData}
                streamUrl={streamUrl}
                cameraAutofill={cameraAutofill}
                editLog={editLog}
                editLogId={editLogId}
                outTime={outTime}
                onOutTimeChange={setOutTime}
              />
            )}
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Хадгалаагүй өөрчлөлтүүд</AlertDialogTitle>
            <AlertDialogDescription>
              Та зарим өгөгдөл оруулсан байна. Уучлаарай, урьдчилан хадгалж байх
              уу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAndNavigate}>
              Болих
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveAndNavigate}
              className="bg-green-600 hover:bg-green-700"
            >
              Хадгалаж гааль руу илгээх
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function OutSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Уншиж байна...</p>
        </div>
      </div>
    }>
      <OutSessionContent />
    </Suspense>
  );
}
