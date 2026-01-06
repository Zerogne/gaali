"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RealtimeVideoProps {
  cameraId: string;
  direction: "IN" | "OUT";
  onActionClick: (direction: "IN" | "OUT") => void;
}

export function RealtimeVideo({
  cameraId,
  direction,
  onActionClick,
}: RealtimeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Connect to video stream WebSocket
    const connectVideoStream = () => {
      try {
        // Get WebSocket URL from environment or use default
        const wsUrl =
          process.env.NEXT_PUBLIC_VIDEO_WS_URL ||
          `ws://localhost:3001/video/${cameraId}`;

        console.log(`Connecting to video stream for camera ${cameraId}...`);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`Video stream connected for camera ${cameraId}`);
          setIsConnected(true);
          setIsLoading(false);
          setError(null);
        };

        ws.onmessage = (event) => {
          // Handle video frame data
          if (event.data instanceof Blob) {
            // Binary video data (H.264 stream or similar)
            if (videoRef.current) {
              const url = URL.createObjectURL(event.data);
              if (videoRef.current.src !== url) {
                videoRef.current.src = url;
              }
            }
          } else {
            // Text/JSON data
            try {
              const message = JSON.parse(event.data);
              if (message.type === "frame" && videoRef.current) {
                // Base64 encoded JPEG frame
                videoRef.current.src = `data:image/jpeg;base64,${message.data}`;
              } else if (message.type === "stream_url" && videoRef.current) {
                // Direct stream URL (RTSP, HLS, etc.)
                videoRef.current.src = message.url;
              } else if (message.type === "connected") {
                console.log(`Connected to camera ${message.cameraId}`);
              }
            } catch (err) {
              // If not JSON, might be base64 string directly
              if (typeof event.data === "string" && videoRef.current) {
                videoRef.current.src = `data:image/jpeg;base64,${event.data}`;
              }
            }
          }
        };

        ws.onerror = (err) => {
          console.error(`Video stream error for camera ${cameraId}:`, err);
          setError("Холболтын алдаа");
          setIsLoading(false);
        };

        ws.onclose = () => {
          console.log(`Video stream closed for camera ${cameraId}`);
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectVideoStream, 3000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error(`Error connecting to video stream:`, err);
        setError("Холбогдох боломжгүй");
        setIsLoading(false);
      }
    };

    connectVideoStream();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [cameraId]);

  const handleActionClick = () => {
    onActionClick(direction);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Video Display Area */}
      <div className="flex-1 relative bg-black min-h-[400px] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
              <p className="text-white text-xs">Холбогдож байна...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        )}
        {isConnected && !isLoading && !error && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              Холбогдсон
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-2 border-t border-gray-200">
        <Button
          onClick={handleActionClick}
          className="w-full h-9 text-sm font-medium"
          variant={direction === "IN" ? "default" : "outline"}
        >
          {direction === "IN" ? "ОРОХ" : "ГАРАХ"}
        </Button>
      </div>
    </div>
  );
}

