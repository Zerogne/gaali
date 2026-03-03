"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RealtimeVideoProps {
  cameraId: string;
  direction: "IN" | "OUT";
  onActionClick?: (direction: "IN" | "OUT") => void; // Optional for session pages
  showActionButton?: boolean; // Optional, defaults to true
}

export function RealtimeVideo({
  cameraId,
  direction,
  onActionClick,
  showActionButton = true, // Default to true for dashboard
}: RealtimeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const objectUrlRef = useRef<string | null>(null); // Track object URLs to prevent memory leaks
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const streamFormatRef = useRef<'h264' | 'mjpeg' | 'unknown'>('unknown');
  const bufferQueueRef = useRef<Uint8Array[]>([]);
  const isMountedRef = useRef(true);
  const router = useRouter();
  
  // Diagnostic tracking
  const statsRef = useRef({
    connectionAttempts: 0,
    messagesReceived: 0,
    framesReceived: 0,
    errors: 0,
    reconnectAttempts: 0,
    lastMessageTime: null as number | null,
    connectionStartTime: null as number | null,
  });

  useEffect(() => {
    isMountedRef.current = true;
    
    // Connect to video stream WebSocket directly from camera
    const connectVideoStream = async () => {
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      try {
        // Diagnostic: Track connection attempt
        statsRef.current.connectionAttempts++;
        statsRef.current.connectionStartTime = Date.now();
        
        console.log(`🔌 [${cameraId}] Connection attempt #${statsRef.current.connectionAttempts}`, {
          timestamp: new Date().toISOString(),
          direction,
        });
        
        // Get camera configuration from API (includes WebSocket URL)
        let wsUrl: string | null = null;
        
        try {
          console.log(`📡 [${cameraId}] Fetching camera configuration from /api/camera/video...`);
          const configStartTime = Date.now();
          const configResponse = await fetch('/api/camera/video');
          const configFetchTime = Date.now() - configStartTime;
          
          if (!isMountedRef.current) return; // Check again after async operation
          
          console.log(`📡 [${cameraId}] Config fetch completed in ${configFetchTime}ms`, {
            status: configResponse.status,
            ok: configResponse.ok,
          });
          
          if (configResponse.ok) {
            const config = await configResponse.json();
            console.log(`📡 [${cameraId}] Camera config received:`, {
              fullConfig: config, // Log full config for debugging
              camera1Configured: !!config.camera1?.webSocketUrl,
              camera2Configured: !!config.camera2?.webSocketUrl,
              camera1Url: config.camera1?.webSocketUrl || 'not set',
              camera2Url: config.camera2?.webSocketUrl || 'not set',
              camera1Ip: config.camera1?.ip || 'not set',
              camera2Ip: config.camera2?.ip || 'not set',
              camera1WebSocketPort: config.camera1?.webSocketPort || 'not set',
              camera2WebSocketPort: config.camera2?.webSocketPort || 'not set',
            });
            
            // Get WebSocket URL for this camera
            if (cameraId === 'camera-1' && config.camera1) {
              if (config.camera1.webSocketUrl) {
                wsUrl = config.camera1.webSocketUrl;
                console.log(`✅ [${cameraId}] Using camera 1 WebSocket: ${wsUrl}`, {
                  ip: config.camera1.ip,
                  port: config.camera1.webSocketPort,
                });
              } else {
                console.warn(`⚠️ [${cameraId}] Camera 1 WebSocket URL is null/undefined`, {
                  ip: config.camera1.ip || 'missing',
                  webSocketPort: config.camera1.webSocketPort || 'missing',
                  webSocketUrl: config.camera1.webSocketUrl,
                  configured: config.camera1.configured,
                  reason: !config.camera1.ip ? 'Camera IP not set in database' : 
                          !config.camera1.webSocketPort ? 'WebSocket port not set' : 
                          'Unknown reason',
                });
              }
            } else if (cameraId === 'camera-2' && config.camera2) {
              if (config.camera2.webSocketUrl) {
                wsUrl = config.camera2.webSocketUrl;
                console.log(`✅ [${cameraId}] Using camera 2 WebSocket: ${wsUrl}`, {
                  ip: config.camera2.ip,
                  port: config.camera2.webSocketPort,
                });
              } else {
                console.warn(`⚠️ [${cameraId}] Camera 2 WebSocket URL is null/undefined`, {
                  ip: config.camera2.ip || 'missing',
                  webSocketPort: config.camera2.webSocketPort || 'missing',
                  webSocketUrl: config.camera2.webSocketUrl,
                  configured: config.camera2.configured,
                  reason: !config.camera2.ip ? 'Camera IP not set in database' : 
                          !config.camera2.webSocketPort ? 'WebSocket port not set' : 
                          'Unknown reason',
                });
              }
            } else {
              console.warn(`⚠️ [${cameraId}] Camera config not found in response`, {
                cameraId,
                configKeys: Object.keys(config),
                camera1Exists: !!config.camera1,
                camera2Exists: !!config.camera2,
              });
            }
          } else {
            console.error(`❌ [${cameraId}] Config API returned error:`, {
              status: configResponse.status,
              statusText: configResponse.statusText,
            });
          }
        } catch (error) {
          if (!isMountedRef.current) return;
          statsRef.current.errors++;
          console.error(`❌ [${cameraId}] Failed to get camera config:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        }

        // Fallback: Use environment variable if camera WebSocket not configured
        if (!wsUrl) {
          wsUrl = process.env.NEXT_PUBLIC_VIDEO_WS_URL || null;
          if (wsUrl) {
            console.log(`📹 Using fallback WebSocket from environment: ${wsUrl}`);
          } else {
            console.warn(`⚠️ No WebSocket URL configured for camera ${cameraId}. Please configure camera WebSocket in company settings.`);
            setError("Camera WebSocket не настроен. Пожалуйста, настройте WebSocket камеры в настройках компании.");
            setIsLoading(false);
            return;
          }
        }

        if (!isMountedRef.current) return; // Check before creating WebSocket

        if (!wsUrl) {
          console.error(`❌ [${cameraId}] No WebSocket URL available, cannot connect`);
          statsRef.current.errors++;
          setError("WebSocket URL not found");
          setIsLoading(false);
          return;
        }

        const connectionStartTime = Date.now();
        console.log(`🔌 [${cameraId}] Creating WebSocket connection...`, {
          url: wsUrl,
          protocol: wsUrl.startsWith('wss://') ? 'WSS (Secure)' : 'WS (Plain)',
          timestamp: new Date().toISOString(),
        });
        
        // Create WebSocket connection
        // Note: WebSocket API doesn't support custom headers for authentication
        // If camera requires auth, it might be in the URL or handled after connection
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          const connectionTime = Date.now() - connectionStartTime;
          if (!isMountedRef.current) {
            console.warn(`⚠️ [${cameraId}] WebSocket opened but component unmounted, closing...`);
            ws.close();
            return;
          }
          
          console.log(`✅ [${cameraId}] WebSocket connected successfully!`, {
            connectionTime: `${connectionTime}ms`,
            readyState: ws.readyState,
            protocol: ws.protocol || 'default',
            url: wsUrl,
            timestamp: new Date().toISOString(),
          });
          
          setIsConnected(true);
          setIsLoading(false);
          setError(null);
          statsRef.current.reconnectAttempts = 0; // Reset on successful connection
        };

        ws.onmessage = async (event) => {
          // Diagnostic: Track messages
          statsRef.current.messagesReceived++;
          statsRef.current.lastMessageTime = Date.now();
          
          // Log message details (throttled for performance)
          if (statsRef.current.messagesReceived % 30 === 0 || statsRef.current.messagesReceived <= 5) {
            console.log(`📨 [${cameraId}] Message #${statsRef.current.messagesReceived} received:`, {
              isBlob: event.data instanceof Blob,
              isString: typeof event.data === 'string',
              length: event.data?.length || 0,
              preview: typeof event.data === 'string' ? event.data.substring(0, 100) : 'blob',
              timeSinceLastMessage: statsRef.current.lastMessageTime && statsRef.current.messagesReceived > 1
                ? `${Date.now() - (statsRef.current.lastMessageTime - (event.data?.length || 0))}ms`
                : 'first message',
            });
          }

          // Handle video frame data with proper encoding/decoding
          if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
            // Binary video data - detect format and decode
            const buffer = event.data instanceof Blob 
              ? await new Promise<ArrayBuffer>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve(reader.result as ArrayBuffer);
                };
                reader.readAsArrayBuffer(event.data);
              })
              : event.data;
            
            const uint8Array = new Uint8Array(buffer);
            
            // Detect stream format by magic bytes
            let detectedFormat = streamFormatRef.current;
            if (streamFormatRef.current === 'unknown' && uint8Array.length >= 4) {
              // H.264 NAL unit start code: 0x00 0x00 0x00 0x01 or 0x00 0x00 0x01
              if ((uint8Array[0] === 0x00 && uint8Array[1] === 0x00 && uint8Array[2] === 0x00 && uint8Array[3] === 0x01) ||
                  (uint8Array[0] === 0x00 && uint8Array[1] === 0x00 && uint8Array[2] === 0x01)) {
                detectedFormat = 'h264';
                streamFormatRef.current = 'h264';
                console.log(`🎬 [${cameraId}] Detected H.264 stream format`);
              }
              // JPEG magic bytes: 0xFF 0xD8 0xFF
              else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
                detectedFormat = 'mjpeg';
                streamFormatRef.current = 'mjpeg';
                console.log(`🎬 [${cameraId}] Detected MJPEG stream format`);
              }
            } else {
              detectedFormat = streamFormatRef.current;
            }
            
            statsRef.current.framesReceived++;
            if (statsRef.current.framesReceived % 30 === 0 || statsRef.current.framesReceived <= 5) {
              console.log(`🎬 [${cameraId}] Frame #${statsRef.current.framesReceived} received (${detectedFormat})`, {
                size: `${(buffer.byteLength / 1024).toFixed(2)}KB`,
                format: detectedFormat,
              });
            }
            
            if (videoRef.current && isMountedRef.current) {
              if (detectedFormat === 'mjpeg') {
                // MJPEG: Create blob URL from JPEG frame
                const blob = new Blob([buffer], { type: 'image/jpeg' });
                if (objectUrlRef.current) {
                  URL.revokeObjectURL(objectUrlRef.current);
                }
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                if (videoRef.current.src !== url) {
                  videoRef.current.src = url;
                }
              } else if (detectedFormat === 'h264') {
                // H.264: For now, try to display as blob (browser may not support raw H.264)
                // In production, you'd need MediaSource API or a decoder library
                const blob = new Blob([buffer], { type: 'video/mp4; codecs="avc1.42E01E"' });
                if (objectUrlRef.current) {
                  URL.revokeObjectURL(objectUrlRef.current);
                }
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                // Note: Raw H.264 may not play directly - consider using MediaSource API
                if (videoRef.current.src !== url) {
                  videoRef.current.src = url;
                }
              } else {
                // Unknown format: try as generic blob
                const blob = new Blob([buffer]);
                if (objectUrlRef.current) {
                  URL.revokeObjectURL(objectUrlRef.current);
                }
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                if (videoRef.current.src !== url) {
                  videoRef.current.src = url;
                }
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
                statsRef.current.framesReceived++;
                if (statsRef.current.framesReceived % 30 === 0 || statsRef.current.framesReceived <= 5) {
                  console.log(`🎬 [${cameraId}] Frame #${statsRef.current.framesReceived} received (base64)`, {
                    dataLength: message.data?.length || 0,
                    estimatedSize: message.data ? `${(message.data.length * 0.75 / 1024).toFixed(2)}KB` : 'unknown',
                  });
                }
                videoRef.current.src = `data:image/jpeg;base64,${message.data}`;
                if (statsRef.current.framesReceived <= 5) {
                  console.log(`✅ [${cameraId}] Video src updated from base64 frame #${statsRef.current.framesReceived}`);
                }
              } else if (message.type === "stream_url" && videoRef.current) {
                // Direct stream URL (RTSP, HLS, etc.)
                console.log(`🔗 [${cameraId}] Received stream URL:`, {
                  url: message.url,
                  type: message.type,
                });
                videoRef.current.src = message.url;
              } else if (message.type === "connected") {
                console.log(`✅ [${cameraId}] Connection confirmed by camera:`, {
                  cameraId: message.cameraId,
                  timestamp: new Date().toISOString(),
                });
              } else {
                console.log(`ℹ️ [${cameraId}] Unknown message type:`, {
                  type: message.type,
                  keys: Object.keys(message),
                });
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
          statsRef.current.errors++;
          console.error(`❌ [${cameraId}] WebSocket error:`, {
            error: err,
            readyState: ws.readyState,
            url: wsUrl,
            timestamp: new Date().toISOString(),
            stats: {
              connectionAttempts: statsRef.current.connectionAttempts,
              messagesReceived: statsRef.current.messagesReceived,
              framesReceived: statsRef.current.framesReceived,
              errors: statsRef.current.errors,
            },
          });
          setError("Видео серверт холбогдох боломжгүй. Сервер ажиллаж байгаа эсэхийг шалгана уу.");
          setIsLoading(false);
        };

        ws.onclose = (event) => {
          if (!isMountedRef.current) return;
          
          const connectionDuration = statsRef.current.connectionStartTime
            ? `${((Date.now() - statsRef.current.connectionStartTime) / 1000).toFixed(1)}s`
            : 'unknown';
          
          console.log(`🔌 [${cameraId}] WebSocket closed:`, {
            code: event.code,
            reason: event.reason || 'no reason provided',
            wasClean: event.wasClean,
            connectionDuration,
            timestamp: new Date().toISOString(),
            stats: {
              messagesReceived: statsRef.current.messagesReceived,
              framesReceived: statsRef.current.framesReceived,
              errors: statsRef.current.errors,
            },
          });
          
          setIsConnected(false);
          
          // Only attempt to reconnect if it wasn't a normal closure and component is still mounted
          if (event.code !== 1000 && isMountedRef.current) {
            statsRef.current.reconnectAttempts++;
            const reconnectDelay = Math.min(3000 * statsRef.current.reconnectAttempts, 30000); // Max 30s
            console.log(`🔄 [${cameraId}] Attempting to reconnect (attempt #${statsRef.current.reconnectAttempts}) in ${reconnectDelay}ms...`);
            setTimeout(() => {
              if (isMountedRef.current && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
                connectVideoStream();
              }
            }, reconnectDelay);
          } else if (event.code === 1000) {
            console.log(`✅ [${cameraId}] WebSocket closed normally (code 1000)`);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        if (!isMountedRef.current) return;
        statsRef.current.errors++;
        console.error(`❌ [${cameraId}] Exception during connection setup:`, {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
          stats: {
            connectionAttempts: statsRef.current.connectionAttempts,
            errors: statsRef.current.errors,
          },
        });
        setError("Холбогдох боломжгүй");
        setIsLoading(false);
      }
    };

    connectVideoStream();

    // Cleanup on unmount
    return () => {
      console.log(`🧹 [${cameraId}] Cleaning up WebSocket connection...`, {
        finalStats: {
          connectionAttempts: statsRef.current.connectionAttempts,
          messagesReceived: statsRef.current.messagesReceived,
          framesReceived: statsRef.current.framesReceived,
          errors: statsRef.current.errors,
          reconnectAttempts: statsRef.current.reconnectAttempts,
        },
      });
      
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
      // Cleanup MediaSource
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        try {
          mediaSourceRef.current.endOfStream();
        } catch (e) {
          // Ignore errors during cleanup
        }
        mediaSourceRef.current = null;
      }
      if (sourceBufferRef.current) {
        sourceBufferRef.current = null;
      }
      bufferQueueRef.current = [];
      streamFormatRef.current = 'unknown';
    };
  }, [cameraId]);

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(direction);
    }
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

      {/* Action Button - Only show if enabled */}
      {showActionButton && (
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
      )}
    </div>
  );
}

