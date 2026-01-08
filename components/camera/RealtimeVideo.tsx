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
  const objectUrlRef = useRef<string | null>(null); // Track object URLs to prevent memory leaks
  const isMountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    isMountedRef.current = true;
    
    // Connect to video stream WebSocket directly from camera
    const connectVideoStream = async () => {
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      try {
        // Get camera configuration from API (includes WebSocket URL)
        let wsUrl: string | null = null;
        
        try {
          const configResponse = await fetch('/api/camera/video');
          if (!isMountedRef.current) return; // Check again after async operation
          
          if (configResponse.ok) {
            const config = await configResponse.json();
            // Get WebSocket URL for this camera
            if (cameraId === 'camera-1' && config.camera1?.webSocketUrl) {
              wsUrl = config.camera1.webSocketUrl;
              console.log(`📹 Using camera 1 WebSocket: ${wsUrl}`);
            } else if (cameraId === 'camera-2' && config.camera2?.webSocketUrl) {
              wsUrl = config.camera2.webSocketUrl;
              console.log(`📹 Using camera 2 WebSocket: ${wsUrl}`);
            }
          }
        } catch (error) {
          if (!isMountedRef.current) return;
          console.warn('Failed to get camera config, using fallback:', error);
        }

        // Fallback: Use environment variable or default localhost (for Electron bridge)
        if (!wsUrl) {
          wsUrl = process.env.NEXT_PUBLIC_VIDEO_WS_URL || `ws://localhost:3004/video/${cameraId}`;
          console.log(`📹 Using fallback WebSocket: ${wsUrl}`);
        }

        if (!isMountedRef.current) return; // Check before creating WebSocket

        console.log(`Connecting to video stream for camera ${cameraId} at ${wsUrl}...`);
        
        // Create WebSocket connection
        // Note: WebSocket API doesn't support custom headers for authentication
        // If camera requires auth, it might be in the URL or handled after connection
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMountedRef.current) {
            ws.close();
            return;
          }
          console.log(`Video stream connected for camera ${cameraId}`);
          setIsConnected(true);
          setIsLoading(false);
          setError(null);
        };

        ws.onmessage = (event) => {
          // DEBUG: Log every message received
          console.log(`📨 [${cameraId}] Message received:`, {
            isBlob: event.data instanceof Blob,
            isString: typeof event.data === 'string',
            length: event.data?.length || 0,
            preview: typeof event.data === 'string' ? event.data.substring(0, 100) : 'blob'
          });

          // Handle video frame data
          if (event.data instanceof Blob) {
            // Binary video data (H.264 stream or similar)
            console.log(`📨 [${cameraId}] Received Blob data`);
            if (videoRef.current && isMountedRef.current) {
              // Revoke previous object URL to prevent memory leaks
              if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
              }
              const url = URL.createObjectURL(event.data);
              objectUrlRef.current = url;
              if (videoRef.current.src !== url) {
                videoRef.current.src = url;
                console.log(`✅ [${cameraId}] Set video src from Blob`);
              }
            }
          } else {
            // Text/JSON data
            try {
              const message = JSON.parse(event.data);
              console.log(`📨 [${cameraId}] Parsed message:`, {
                type: message.type,
                hasData: !!message.data,
                dataLength: message.data?.length || 0
              });

              if (message.type === "frame" && videoRef.current) {
                // Base64 encoded JPEG frame
                console.log(`✅ [${cameraId}] Setting video src from frame data`);
                videoRef.current.src = `data:image/jpeg;base64,${message.data}`;
                console.log(`✅ [${cameraId}] Video src set, length: ${videoRef.current.src.length}`);
              } else if (message.type === "stream_url" && videoRef.current) {
                // Direct stream URL (RTSP, HLS, etc.)
                console.log(`✅ [${cameraId}] Setting video src from stream URL: ${message.url}`);
                videoRef.current.src = message.url;
              } else if (message.type === "connected") {
                console.log(`✅ [${cameraId}] Connected to camera ${message.cameraId}`);
              } else {
                console.log(`ℹ️ [${cameraId}] Unknown message type: ${message.type}`);
              }
            } catch (err) {
              // If not JSON, might be base64 string directly
              console.log(`📨 [${cameraId}] Not JSON, trying as base64 string`);
              if (typeof event.data === "string" && videoRef.current) {
                videoRef.current.src = `data:image/jpeg;base64,${event.data}`;
                console.log(`✅ [${cameraId}] Set video src from base64 string`);
              } else {
                console.warn(`⚠️ [${cameraId}] Could not parse message:`, err);
              }
            }
          }
        };

        ws.onerror = (err) => {
          if (!isMountedRef.current) return;
          console.error(`Video stream error for camera ${cameraId}:`, err);
          setError("Видео серверт холбогдох боломжгүй. Сервер ажиллаж байгаа эсэхийг шалгана уу.");
          setIsLoading(false);
        };

        ws.onclose = (event) => {
          if (!isMountedRef.current) return;
          console.log(`Video stream closed for camera ${cameraId}`, event);
          setIsConnected(false);
          
          // Only attempt to reconnect if it wasn't a normal closure and component is still mounted
          if (event.code !== 1000 && isMountedRef.current) {
            console.log(`Attempting to reconnect in 3 seconds...`);
            setTimeout(() => {
              if (isMountedRef.current && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
                connectVideoStream();
              }
            }, 3000);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error(`Error connecting to video stream:`, err);
        setError("Холбогдох боломжгүй");
        setIsLoading(false);
      }
    };

    connectVideoStream();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      // Revoke object URL to prevent memory leaks
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [cameraId]);

  const handleActionClick = () => {
    onActionClick(direction);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Video Display Area */}
      <div className="flex-1 relative bg-black min-h-[400px] h-full flex items-center justify-center">
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
          className={`w-full h-9 text-sm font-medium ${
            direction === "OUT" 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : ""
          }`}
          variant={direction === "IN" ? "default" : undefined}
        >
          {direction === "IN" ? "ОРОХ" : "ГАРАХ"}
        </Button>
      </div>
    </div>
  );
}

