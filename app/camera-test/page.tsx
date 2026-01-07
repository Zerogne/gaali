"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Clock,
  Zap,
  Timer,
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface CameraConfig {
  configured: boolean;
  baseUrl: string;
  eventPath: string;
  hasAuth: boolean;
  pollMs: number;
  fullUrl: string | null;
}

interface CameraEvent {
  ok: boolean;
  plate: string | null;
  raw: any;
  ts: number;
  error?: string;
}

export default function CameraTestPage() {
  const [config, setConfig] = useState<CameraConfig | null>(null);
  const [event, setEvent] = useState<CameraEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPlate, setLastPlate] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [plateInput, setPlateInput] = useState("");

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/camera/config");
      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    }
  };

  const testEvent = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/camera/events");
      const data = await response.json();
      const endTime = Date.now();

      setEvent(data);
      setProcessingTime((endTime - startTime) / 1000);

      if (data.ok && data.plate) {
        setLastPlate(data.plate);
        setCapturedAt(new Date(data.ts));
        // Extract confidence from raw payload if available
        if (data.raw?.confidence) {
          setConfidence(data.raw.confidence);
        } else if (data.raw?.result?.confidence) {
          setConfidence(data.raw.result.confidence);
        } else {
          // Mock confidence for demo
          setConfidence(95 + Math.random() * 5);
        }
        // Auto-fill plate input
        setPlateInput(data.plate);
      } else {
        setError(data.error || "Failed to fetch event");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch event");
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (!isPolling || !config) return;

    // Initial fetch
    testEvent();

    // Set up polling interval
    const interval = setInterval(() => {
      testEvent();
    }, config.pollMs);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolling, config?.pollMs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Камерын тохиргоо ба туршилт
          </h1>
          <p className="text-gray-600">
            Улсын дугаарыг бодит цагт таних системийн тохиргоо
          </p>
        </div>

        {/* Main Recognition Card */}
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Улсын дугаарыг бодит цагт таних
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Truck Image */}
            <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner border-2 border-gray-200">
              <img
                src="/truck-front-view-license-plate.jpg"
                alt="Truck camera view"
                className="w-full h-auto object-contain max-h-96 mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>

            {/* Recognition Data */}
            {lastPlate ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Танигдсан дугаар
                    </Label>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg px-4 py-3 shadow-sm">
                      <span className="text-3xl font-mono font-bold text-blue-700 tracking-wider">
                        {lastPlate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <span className="text-xs text-gray-500 block">
                        Авагдсан
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {capturedAt?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Найдвартай байдал
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <Zap className="h-6 w-6 text-green-600" />
                      <div>
                        <span className="text-2xl font-bold text-green-700">
                          {confidence ? `${confidence.toFixed(1)}%` : "—"}
                        </span>
                        <span className="text-xs text-green-600 block mt-1">
                          Маш өндөр
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Timer className="h-5 w-5 text-gray-600" />
                    <div>
                      <span className="text-xs text-gray-500 block">
                        Боловсруулах хугацаа
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {processingTime ? `${processingTime.toFixed(2)}s` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 font-medium">
                  Камераас дугаар таних хүлээж байна...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  "Шалгах" товч дарж эхлүүлнэ үү
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Plate Input Field */}
            <div>
              <Label
                htmlFor="plateInput"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Улсын дугаар
              </Label>
              <Input
                id="plateInput"
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                className="h-12 text-lg font-mono font-semibold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Улсын дугаар оруулах"
              />
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Камерын тохиргоо
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={testEvent}
                  disabled={isLoading}
                  variant="default"
                  size="sm"
                  className="shadow-sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  {isLoading ? "Шалгаж байна..." : "Шалгах"}
                </Button>
                <Button
                  onClick={() => setIsPolling(!isPolling)}
                  variant={isPolling ? "destructive" : "outline"}
                  size="sm"
                  className="shadow-sm"
                >
                  {isPolling ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Зогсоох
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Автомат шалгалт
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">
                      Алдаа гарлаа
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {config && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Статус
                    </span>
                    <Badge
                      variant={config.configured ? "default" : "destructive"}
                      className="shadow-sm"
                    >
                      {config.configured ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Тохируулсан
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Тохируулаагүй
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600 block mb-2">
                    Base URL
                  </span>
                  <code className="bg-white px-3 py-1.5 rounded text-xs font-mono border border-gray-300 block truncate">
                    {config.baseUrl}
                  </code>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600 block mb-2">
                    Event Path
                  </span>
                  <code className="bg-white px-3 py-1.5 rounded text-xs font-mono border border-gray-300 block truncate">
                    {config.eventPath}
                  </code>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600 block mb-2">
                    Poll Interval
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {config.pollMs}ms
                  </span>
                </div>
              </div>
            )}

            {event && event.raw && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <code className="text-xs font-semibold text-gray-700">
                    Raw Response
                  </code>
                  <Badge variant="secondary" className="text-xs">
                    JSON
                  </Badge>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64 border border-gray-700">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(event.raw, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
