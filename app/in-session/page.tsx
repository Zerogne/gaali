"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CameraPanel } from "@/components/sessions/CameraPanel"
import { InSessionForm } from "@/components/sessions/InSessionForm"
import { useCameraPlateAutofill } from "@/hooks/useCameraPlateAutofill"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft } from "lucide-react"

export default function InSessionPage() {
  const router = useRouter()
  const cameraAutofill = useCameraPlateAutofill()
  const [currentPlate, setCurrentPlate] = useState<string>("")

  // Track if user manually edited the plate field
  const handlePlateChange = (value: string) => {
    setCurrentPlate(value)
  }

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
                <h1 className="text-lg font-semibold text-gray-900">ОРОХ бүртгэл</h1>
                <p className="text-xs text-gray-500">Тээврийн хэрэгсэл орох бүртгэл</p>
                  </div>
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                IN
              </Badge>
                  </div>
            <Button
              onClick={() => router.push("/out-session")}
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
                streamUrl={undefined}
                lastPlate={cameraAutofill.plate}
                lastPayload={cameraAutofill.plate ? { plate: cameraAutofill.plate, ts: cameraAutofill.lastSeenAt } : null}
                status={cameraAutofill.status}
                onRefresh={() => {
                  console.log("Refresh camera")
                }}
              />
            </div>

            {/* Right Column: Form (2/3 width on large screens) */}
            <div className="lg:col-span-2 h-full overflow-hidden">
              <InSessionForm
                autoFillPlate={null}
                onPlateChange={handlePlateChange}
              />
            </div>
                  </div>
          </div>
      </div>
    </div>
  )
}
