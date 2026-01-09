/**
 * Express WebSocket Proxy Server for Camera Streams
 * 
 * Run this as a separate server alongside Next.js:
 *   npx tsx camera-ws-proxy-server.ts
 * 
 * Or integrate into your existing Express server
 * 
 * Browser connects to: ws://localhost:3001/ws/camera?camera=1
 * Server connects to: ws://camera-ip:9080/h264
 */

import express from "express"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"
import { getCompany } from "./lib/companies/metadata"

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ 
  server,
  path: "/ws/camera",
})

// Store active camera connections
const cameraConnections = new Map<string, WebSocket>()

// Default camera config (fallback if database lookup fails)
const DEFAULT_CAMERA_CONFIG = {
  "1": { ip: "192.168.1.50", port: 9080, path: "/h264" },
  "2": { ip: "192.168.1.49", port: 9080, path: "/h264" },
}

/**
 * WebSocket connection handler
 * 
 * Query params:
 *   - camera: "1" or "2" (required)
 *   - companyId: Company ID for database lookup (optional, for multi-tenant)
 */
wss.on("connection", (clientWs: WebSocket, request) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`)
  const cameraId = url.searchParams.get("camera")
  const companyId = url.searchParams.get("companyId")

  if (!cameraId || (cameraId !== "1" && cameraId !== "2")) {
    console.error("❌ Invalid camera ID:", cameraId)
    clientWs.close(1008, "Invalid camera ID. Use ?camera=1 or ?camera=2")
    return
  }

  // Get camera config (from database or default)
  let cameraConfig = DEFAULT_CAMERA_CONFIG[cameraId as "1" | "2"]
  
  // Fetch from database if companyId provided
  if (companyId) {
    try {
      const company = await getCompany(companyId)
      const settings = company?.cameraSettings
      if (settings) {
        const ip = cameraId === "1" ? settings.camera1Ip : settings.camera2Ip
        const port = cameraId === "1" 
          ? (settings.camera1WebSocketPort || 9080)
          : (settings.camera2WebSocketPort || 9080)
        
        if (ip) {
          cameraConfig = {
            ip,
            port,
            path: "/h264", // Camera WebSocket path for H.264 stream
          }
          console.log(`📹 [Camera ${cameraId}] Using config from database:`, cameraConfig)
        } else {
          console.warn(`⚠️ [Camera ${cameraId}] Camera IP not found in database, using default`)
        }
      } else {
        console.warn(`⚠️ [Camera ${cameraId}] No camera settings in database, using default`)
      }
    } catch (error) {
      console.error(`❌ [Camera ${cameraId}] Error fetching camera config from database:`, error)
      console.log(`📹 [Camera ${cameraId}] Using default config:`, cameraConfig)
    }
  } else {
    console.log(`📹 [Camera ${cameraId}] No companyId provided, using default config:`, cameraConfig)
  }

  const cameraUrl = `ws://${cameraConfig.ip}:${cameraConfig.port}${cameraConfig.path}`
  console.log(`🔌 [Camera ${cameraId}] Client connected, proxying to ${cameraUrl}`)

  // Connect to camera WebSocket
  const cameraWs = new WebSocket(cameraUrl)
  const connectionId = `${cameraId}-${Date.now()}`

  // Set binary type to arraybuffer for proper binary handling
  clientWs.binaryType = "arraybuffer"
  cameraWs.binaryType = "arraybuffer"

  // Forward messages from camera to client
  cameraWs.on("message", (data: Buffer) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      // Forward binary data without modification
      clientWs.send(data)
    }
  })

  // Forward messages from client to camera (if bidirectional needed)
  clientWs.on("message", (data: Buffer) => {
    if (cameraWs.readyState === WebSocket.OPEN) {
      cameraWs.send(data)
    }
  })

  // Handle camera connection open
  cameraWs.on("open", () => {
    console.log(`✅ [Camera ${cameraId}] Connected to camera at ${cameraUrl}`)
    cameraConnections.set(connectionId, cameraWs)
  })

  // Handle camera connection errors
  cameraWs.on("error", (error) => {
    console.error(`❌ [Camera ${cameraId}] Camera WebSocket error:`, error)
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close(1011, "Camera connection error")
    }
  })

  // Handle camera connection close
  cameraWs.on("close", (code, reason) => {
    console.log(`🔌 [Camera ${cameraId}] Camera WebSocket closed:`, code, reason.toString())
    cameraConnections.delete(connectionId)
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close(code, reason)
    }
  })

  // Handle client disconnect
  clientWs.on("close", () => {
    console.log(`🔌 [Camera ${cameraId}] Client disconnected`)
    if (cameraWs.readyState === WebSocket.OPEN) {
      cameraWs.close()
    }
    cameraConnections.delete(connectionId)
  })

  // Handle client errors
  clientWs.on("error", (error) => {
    console.error(`❌ [Camera ${cameraId}] Client WebSocket error:`, error)
    if (cameraWs.readyState === WebSocket.OPEN) {
      cameraWs.close()
    }
  })
})

const PORT = process.env.WS_PROXY_PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 WebSocket proxy server running on ws://localhost:${PORT}/ws/camera`)
  console.log(`   Connect with: ws://localhost:${PORT}/ws/camera?camera=1`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down WebSocket proxy server...")
  wss.close(() => {
    server.close(() => {
      process.exit(0)
    })
  })
})
