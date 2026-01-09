/**
 * WebSocket Path Detection Script
 * Tests common WebSocket paths to find the correct endpoint
 * 
 * Usage: npx tsx scripts/detect-camera-websocket-path.ts <camera-ip> [port]
 */

import { WebSocket } from "ws"

const CAMERA_IP = process.argv[2] || "192.168.1.50"
const CAMERA_PORT = parseInt(process.argv[3] || "9080", 10)

const COMMON_PATHS = [
  "",           // Root
  "/h264",      // H.264 stream
  "/stream",    // Generic stream
  "/video",     // Video endpoint
  "/ws",        // WebSocket
  "/live",      // Live stream
  "/socket",    // Socket endpoint
  "/socket.io", // Socket.IO
  "/camera",    // Camera endpoint
  "/mjpeg",     // MJPEG
  "/rtsp",      // RTSP over WebSocket
]

interface TestResult {
  path: string
  url: string
  success: boolean
  error?: string
  firstBytes?: string
  messageType?: "binary" | "string"
  messageLength?: number
}

async function testWebSocketPath(path: string): Promise<TestResult> {
  const url = `ws://${CAMERA_IP}:${CAMERA_PORT}${path}`
  
  return new Promise((resolve) => {
    const ws = new WebSocket(url)
    let firstMessageReceived = false
    const timeout = setTimeout(() => {
      if (!firstMessageReceived) {
        ws.close()
        resolve({
          path,
          url,
          success: false,
          error: "Timeout - no message received within 5 seconds",
        })
      }
    }, 5000)

    ws.on("open", () => {
      console.log(`✅ Connected to ${url}`)
    })

    ws.on("message", (data: Buffer | string) => {
      if (!firstMessageReceived) {
        firstMessageReceived = true
        clearTimeout(timeout)
        
        const isBinary = Buffer.isBuffer(data)
        const buffer = isBinary ? data : Buffer.from(data as string)
        const firstBytes = buffer.slice(0, 16).toString("hex")
        const length = buffer.length

        // Detect format
        let format = "unknown"
        if (isBinary) {
          // MPEG-TS sync byte
          if (buffer[0] === 0x47) {
            format = "MPEG-TS (0x47 sync byte)"
          }
          // JPEG (FF D8 FF)
          else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
            format = "JPEG (FF D8 FF)"
          }
          // PNG (89 50 4E 47)
          else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
            format = "PNG (89 50 4E 47)"
          }
          // H.264 NAL unit (00 00 00 01 or 00 00 01)
          else if (
            (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x00 && buffer[3] === 0x01) ||
            (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01)
          ) {
            format = "H.264 NAL unit (00 00 00 01)"
          }
          // fMP4 (ftyp box)
          else if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
            format = "fMP4 (ftyp box)"
          }
        }

        resolve({
          path,
          url,
          success: true,
          firstBytes,
          messageType: isBinary ? "binary" : "string",
          messageLength: length,
          error: format,
        })

        ws.close()
      }
    })

    ws.on("error", (error: Error) => {
      clearTimeout(timeout)
      resolve({
        path,
        url,
        success: false,
        error: error.message,
      })
    })

    ws.on("close", (code, reason) => {
      if (!firstMessageReceived) {
        clearTimeout(timeout)
        resolve({
          path,
          url,
          success: false,
          error: `Closed with code ${code}: ${reason.toString()}`,
        })
      }
    })
  })
}

async function detectWebSocketPath() {
  console.log(`🔍 Testing WebSocket paths on ${CAMERA_IP}:${CAMERA_PORT}\n`)

  const results: TestResult[] = []

  for (const path of COMMON_PATHS) {
    process.stdout.write(`Testing ${path || "/"}... `)
    const result = await testWebSocketPath(path)
    results.push(result)

    if (result.success) {
      console.log(`✅ SUCCESS`)
      console.log(`   Format: ${result.error}`)
      console.log(`   Message type: ${result.messageType}`)
      console.log(`   Message length: ${result.messageLength} bytes`)
      console.log(`   First bytes (hex): ${result.firstBytes}`)
    } else {
      console.log(`❌ FAILED: ${result.error}`)
    }
    console.log()

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Summary
  console.log("\n📊 Summary:")
  const successful = results.filter((r) => r.success)
  if (successful.length > 0) {
    console.log(`✅ Found ${successful.length} working path(s):`)
    successful.forEach((r) => {
      console.log(`   - ${r.path || "/"} → ${r.url}`)
      console.log(`     Format: ${r.error}`)
    })
  } else {
    console.log(`❌ No working paths found. Camera may not support WebSocket on port ${CAMERA_PORT}`)
  }
}

detectWebSocketPath().catch(console.error)
