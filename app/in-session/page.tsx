"use client";

import { CameraPanel } from "@/components/sessions/CameraPanel";
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
import { useCameraPlateAutofill } from "@/hooks/useCameraPlateAutofill";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function InSessionPage() {
  const router = useRouter();
  const cameraAutofill = useCameraPlateAutofill();
  const [currentPlate, setCurrentPlate] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | undefined>(undefined);
  const formRef = useRef<InSessionFormHandle>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [hasUnsavedData, setHasUnsavedData] = useState(false);

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
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
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
                  ОРОХ бүртгэл
                </h1>
                <p className="text-xs text-gray-500">
                  Тээврийн хэрэгсэл орох бүртгэл
                </p>
              </div>
              <Badge
                variant="outline"
                className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs"
              >
                IN
              </Badge>
            </div>
            <Button
              onClick={() => handleNavigationClick("/out-session")}
              variant="outline"
              size="sm"
              className="gap-2 h-8 text-xs"
            >
              ГАРАХ бүртгэл
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content - Fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-full mx-auto px-3 py-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
            {/* Left Column: Camera (1/3 width on large screens) */}
            <div className="lg:col-span-1 h-full overflow-hidden">
              <CameraPanel
                streamUrl={streamUrl}
                lastPlate={cameraAutofill.plate}
                lastPayload={cameraAutofill.rawPayload}
                status={cameraAutofill.status}
                onRefresh={() => {
                  cameraAutofill.refresh();
                }}
              />
            </div>

            {/* Right Column: Form (2/3 width on large screens) */}
            <div className="lg:col-span-2 h-full overflow-hidden">
              <InSessionForm
                ref={formRef}
                autoFillPlate={null}
                onPlateChange={handlePlateChange}
                onHasUnsavedDataChange={setHasUnsavedData}
              />
            </div>
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
