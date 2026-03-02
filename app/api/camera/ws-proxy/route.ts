/**
 * WebSocket Proxy for Camera Stream
 * 
 * Browser connects to: wss://your-domain/api/camera/ws-proxy?camera=1
 * Server connects to: ws://camera-ip:9080/<path>
 * 
 * This proxy is necessary because:
 * 1. Browsers cannot directly connect to LAN IPs in production (mixed content, CORS)
 * 2. Allows same-origin WebSocket connections (wss://your-domain/...)
 * 3. Handles authentication and error handling server-side
 */

import { NextRequest } from "next/server"
import { WebSocketServer, WebSocket } from "ws"
import { getActiveCompany } from "@/lib/auth/session"
import { getCompany } from "@/lib/companies/metadata"

// Store WebSocket server instance
let wss: WebSocketServer | null = null

/**
 * GET /api/camera/ws-proxy - Upgrade to WebSocket connection
 * Query params:
 *   - camera: "1" or "2" (which camera to connect to)
 */
export async function GET(request: NextRequest) {
  // This endpoint should be handled by WebSocket upgrade
  // In Next.js, we need to use a different approach
  // For now, return instructions
  return new Response(
    JSON.stringify({
      error: "This endpoint requires WebSocket upgrade. Use the WebSocket client component instead.",
      info: "Use a WebSocket client component for camera video.",
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * Note: Next.js App Router doesn't natively support WebSocket upgrades.
 * For production, you have two options:
 * 
 * 1. Use a separate Express server for WebSocket proxy (recommended)
 * 2. Use Next.js API routes with a WebSocket library that supports Next.js
 * 
 * See: app/api/camera/ws-proxy-server.ts for Express implementation
 */
