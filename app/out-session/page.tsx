"use client";

import { Sidebar } from "@/components/layout/Sidebar";
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
import { useToast } from "@/hooks/use-toast";
import { useLprPlateAutofill } from "@/hooks/useLprPlateAutofill";
import { getTruckLog } from "@/lib/api";
import type { TruckLog } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
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

  // Fetch camera stream URL from config
  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        const response = await fetch("/api/camera/config");
        if (response.ok) {
          const config = await response.json();
          // Use NEXT_PUBLIC env var if set, otherwise use config streamUrl
          setStreamUrl(
            process.env.NEXT_PUBLIC_CAMERA_STREAM_URL ||
              config.streamUrl ||
              undefined
          );
        }
      } catch (error) {
        console.error("Failed to fetch camera stream URL:", error);
        // Fallback to env var if API fails
        setStreamUrl(process.env.NEXT_PUBLIC_CAMERA_STREAM_URL);
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
          if (log && log.direction === "OUT") {
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-5 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    ГАРАХ бүртгэл
                  </h1>
                  <p className="text-xs text-gray-500">
                    Тээврийн хэрэгсэл гарах бүртгэл
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs"
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
