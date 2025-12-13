"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useState } from "react";

interface CameraPanelProps {
  streamUrl?: string;
  lastPlate?: string | null;
  lastPayload?: any;
  status?: "idle" | "polling" | "error";
  onRefresh?: () => void;
}

export function CameraPanel({
  streamUrl,
  lastPlate,
  lastPayload,
  status = "idle",
  onRefresh,
}: CameraPanelProps) {
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusConfig = {
    idle: { label: "Idle", variant: "secondary" as const },
    polling: { label: "Polling", variant: "default" as const },
    error: { label: "Error", variant: "destructive" as const },
  };

  const currentStatus = statusConfig[status];

  const handleCopyJson = () => {
    if (lastPayload) {
      navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold text-gray-900">
            Камерын харагдац
          </h3>
          <Badge
            variant={currentStatus.variant}
            className={`text-[9px] ${
              status === "polling" ? "animate-pulse" : ""
            }`}
          >
            {currentStatus.label}
          </Badge>
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
      <div className="p-2 border-t border-gray-200 bg-gray-50 shrink-0 max-h-[40%] flex flex-col overflow-hidden">
        <div className="space-y-1.5 overflow-y-auto">
          <div>
            <p className="text-[9px] font-medium text-gray-500 mb-0.5">
              Танигдсан дугаар
            </p>
            <p className="text-xs font-mono font-semibold text-gray-900">
              {lastPlate || <span className="text-gray-400">—</span>}
            </p>
          </div>
          {lastPayload && (
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[9px] font-medium text-gray-500">
                  Camera JSON Data
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyJson}
                    className="h-4 w-4 p-0 hover:bg-gray-200"
                    title="Copy JSON"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                    className="h-4 w-4 p-0 hover:bg-gray-200"
                    title={isJsonExpanded ? "Collapse" : "Expand"}
                  >
                    {isJsonExpanded ? (
                      <ChevronUp className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <pre
                  className={`text-[8px] text-gray-700 font-mono p-1.5 overflow-auto ${
                    isJsonExpanded ? "max-h-32" : "max-h-6"
                  }`}
                >
                  {isJsonExpanded
                    ? JSON.stringify(lastPayload, null, 2)
                    : JSON.stringify(lastPayload).slice(0, 50) + "..."}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
