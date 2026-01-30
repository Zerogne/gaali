"use client";

import { Sidebar } from "@/components/sidebar";
import {
  InSessionForm,
  type InSessionFormHandle,
} from "@/components/sessions/InSessionForm";
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

function InSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const cameraAutofill = useLprPlateAutofill();
  const [currentPlate, setCurrentPlate] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | undefined>(undefined);
  const gaaliBridgeDownloadUrl =
    process.env.NEXT_PUBLIC_GAALI_BRIDGE_URL ?? "/Gaali%20Bridge.exe";
  const formRef = useRef<InSessionFormHandle>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const [editLog, setEditLog] = useState<TruckLog | null>(null);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const getCurrentDateTime = (): string => {
    // Always use Mongolia time (Asia/Ulaanbaatar) for datetime-local inputs
    // sv-SE locale gives "YYYY-MM-DD HH:mm" which we convert to "YYYY-MM-DDTHH:mm"
    const formatted = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Ulaanbaatar",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    return formatted.replace(" ", "T");
  };

  const [inTime, setInTime] = useState<string>(() => getCurrentDateTime());

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
          if (log && log.direction === "IN") {
            setEditLog(log);
          } else {
            toast({
              title: "Алдаа",
              description: "Бүртгэл олдсонгүй эсвэл буруу чиглэл",
              variant: "destructive",
            });
            router.push("/in-session");
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
  }, [editLogId, router]);

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

  // Track if user manually edited the plate field
  const handlePlateChange = (value: string) => {
    setCurrentPlate(value);
  };

  const handleNavigationClick = (path: string) => {
    // Store destination value for out-session auto-fill
    if (formRef.current && path === "/out-session") {
      const destination = formRef.current.getDestination();
      if (destination) {
        localStorage.setItem("inSessionDestination", destination);
      }
    }

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
        // Store destination value for out-session auto-fill
        if (pendingNavigation === "/out-session") {
          const destination = formRef.current.getDestination();
          if (destination) {
            localStorage.setItem("inSessionDestination", destination);
          }
        }
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
                  ОРОХ бүртгэл
                </h1>
                <div className="flex items-center gap-2 ml-4">
                  <Label
                    htmlFor="inTime"
                    className="text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    Орсон *
                  </Label>
                  <Input
                    id="inTime"
                    type="datetime-local"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    onFocus={(e) => {
                      const currentTime = getCurrentDateTime();
                      setInTime(currentTime);
                      e.target.value = currentTime;
                    }}
                    className="h-10 text-base w-auto min-w-[180px]"
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center w-full">
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Машины дугаар, жинг оруулахын тулд <span className="text-[#0073c4]">Gaali Bridge</span> программыг ажиллуулсан байх шаардлагатай.
                      </p>
                    </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = gaaliBridgeDownloadUrl;
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
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                >
                  IN
                </Badge>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - Fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full max-w-full mx-auto px-3 py-2">
            {isLoadingLog ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Уншиж байна...</p>
              </div>
            ) : (
              <InSessionForm
                ref={formRef}
                autoFillPlate={null}
                onPlateChange={handlePlateChange}
                onHasUnsavedDataChange={setHasUnsavedData}
                streamUrl={streamUrl}
                cameraAutofill={cameraAutofill}
                editLog={editLog}
                editLogId={editLogId}
                inTime={inTime}
                onInTimeChange={setInTime}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              Хадгалах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function InSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Уншиж байна...</p>
          </div>
        </div>
      }
    >
      <InSessionContent />
    </Suspense>
  );
}
