"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, RefreshCw, AlertCircle } from "lucide-react"

interface CameraPanelProps {
  streamUrl?: string
  lastPlate?: string | null
  lastPayload?: any
  status?: "idle" | "polling" | "error"
  onRefresh?: () => void
}

export function CameraPanel({
  streamUrl,
  lastPlate,
  lastPayload,
  status = "idle",
  onRefresh,
}: CameraPanelProps) {
  const [selectedCamera, setSelectedCamera] = useState("Camera 1")

  const statusConfig = {
    idle: { label: "Idle", variant: "secondary" as const },
    polling: { label: "Polling", variant: "default" as const },
    error: { label: "Error", variant: "destructive" as const },
  }

  const currentStatus = statusConfig[status]

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[10px] font-semibold text-gray-900">Камерын харагдац</h3>
          <Badge 
            variant={currentStatus.variant} 
            className={`text-[9px] ${
              status === "polling" ? "animate-pulse" : ""
            }`}
          >
            {currentStatus.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="flex-1 text-[10px] border border-gray-300 rounded-md px-1.5 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-7"
          >
            <option>Camera 1</option>
            <option>Camera 2</option>
            <option>Camera 3</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-1.5"
          >
            <RefreshCw className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>

      {/* Camera Display - Flexible */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
          {streamUrl ? (
            streamUrl.endsWith(".mjpeg") || streamUrl.includes("mjpeg") ? (
              <img
                src={streamUrl}
                alt="Camera stream"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={streamUrl}
                autoPlay
                muted
                loop
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Camera className="h-8 w-8 mb-1 opacity-50" />
              <p className="text-[10px]">Камер холбогдоогүй байна</p>
            </div>
          )}
        </div>
      </div>

      {/* Plate Detection Info */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 shrink-0">
        <div className="space-y-1">
          <div>
            <p className="text-[9px] font-medium text-gray-500 mb-0.5">Танигдсан дугаар</p>
            <p className="text-xs font-mono font-semibold text-gray-900">
              {lastPlate || <span className="text-gray-400">—</span>}
            </p>
          </div>
          {lastPayload && (
            <div>
              <p className="text-[9px] font-medium text-gray-500 mb-0.5">JSON</p>
              <code className="block text-[9px] text-gray-600 font-mono bg-white p-1 rounded border border-gray-200 truncate">
                {JSON.stringify(lastPayload).slice(0, 40) + "..."}
              </code>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
