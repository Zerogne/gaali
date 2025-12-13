"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function WebSocketTestPanel() {
  const [wsUrl, setWsUrl] = useState("ws://127.0.0.1:9000/service")
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [logs, setLogs] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const generateUniqueCode = () => {
    // Generate 8-digit numeric code
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000)
    // Combine timestamp and random to ensure uniqueness
    const combined = (timestamp + random).toString()
    // Take last 8 digits, pad with zeros if needed
    const code = combined.slice(-8).padStart(8, '0')
    return code
  }

  // Generate sample data for testing
  const generateSampleData = () => {
    const uniqueCode = generateUniqueCode()
    const randomNum = Math.floor(Math.random() * 10000)
    
    return {
      uniqueCode,
      LPC: `Тээвэрлэгч компани ${randomNum}`,
      PERMIT_NUMBER: `PERMIT-${randomNum}`,
      TRANSPORT_DOC_NUMBER: `DOC-${randomNum}`,
      DISPATCH_VEHICLE_NUMBER: `ABC${randomNum}`,
      CHANGE_VEHICLE_AT_BORDER: Math.random() > 0.5 ? "yes" : "no",
      FOREIGN_TRADE_AGREEMENT: `FTA-${randomNum}`,
      BORDER_VEHICLE_NUMBER: `XYZ${randomNum}`,
      DRN: `Жолооч ${randomNum}`,
      DRIVER_ID: `${randomNum}${randomNum}${randomNum}${randomNum}`,
      TRL: `TRL${randomNum}`,
      CONTAINER_NUMBERS: [`AABCD${randomNum}`, `BABCD${randomNum + 1}`],
      SLN: `SLN${randomNum}`,
      PKG: Math.floor(Math.random() * 5000) + 1000,
      NET: Math.floor(Math.random() * 20000) + 10000,
      WGT: Math.floor(Math.random() * 25000) + 15000,
      TRANSPORT_AGREEMENT: `TA-${randomNum}`,
    }
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setLogs((prev) => [...prev, logEntry])
    console.log(`[${type.toUpperCase()}]`, message)
  }

  const connect = () => {
    const url = wsUrl.trim()
    if (!url) {
      addLog("WebSocket URL оруулах шаардлагатай", "error")
      return
    }

    addLog(`Холбогдож байна: ${url}`, "info")
    setStatus("connecting")

    try {
      const websocket = new WebSocket(url)

      websocket.onopen = () => {
        addLog("✅ WebSocket холбогдлоо!", "success")
        setStatus("connected")
        setWs(websocket)
      }

      websocket.onmessage = (event) => {
        addLog("═══════════════════════════════════════════════════════", "success")
        addLog("📥 3-РД ТАЛЫН АПП-ААС МЭССЭЖ ИРЛЭЭ!", "success")
        addLog("═══════════════════════════════════════════════════════", "success")
        addLog(`📥 Хариу: ${event.data}`, "success")
        addLog("✅ 3-р талын апп таны өгөгдлийг хүлээн авсан", "success")
      }

      websocket.onerror = (error) => {
        addLog(`❌ WebSocket алдаа: ${error}`, "error")
        setStatus("disconnected")
      }

      websocket.onclose = (event) => {
        addLog(
          `⚠️ WebSocket хаагдлаа. Код: ${event.code}, Шалтгаан: ${event.reason || "Шалтгаан байхгүй"}`,
          "error"
        )
        setStatus("disconnected")
        setWs(null)
      }

      setWs(websocket)
    } catch (error: any) {
      addLog(`❌ WebSocket үүсгэхэд алдаа гарлаа: ${error.message}`, "error")
      setStatus("disconnected")
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      setWs(null)
    }
  }

  const [sampleData, setSampleData] = useState(generateSampleData())

  const testSend = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addLog("❌ WebSocket холбогдоогүй байна", "error")
      return
    }

    // Generate new sample data with different unique code each time
    const data = generateSampleData()
    setSampleData(data)
    const jsonData = JSON.stringify(data, null, 2)

    addLog("═══════════════════════════════════════════════════════", "info")
    addLog("📤 3-Р ТАЛЫН АПП РУУ ТЕСТ ӨГӨГДӨЛ ИЛГЭЭЖ БАЙНА", "info")
    addLog("═══════════════════════════════════════════════════════", "info")
    addLog(`🔑 Уникал код: ${data.uniqueCode}`, "info")
    addLog(`📦 Өгөгдлийн хэмжээ: ${jsonData.length} байт`, "info")
    addLog("📋 JSON өгөгдөл:", "info")
    addLog(jsonData, "info")

    try {
      ws.send(jsonData)
      addLog("═══════════════════════════════════════════════════════", "success")
      addLog("✅ ӨГӨГДӨЛ АМЖИЛТТАЙ ИЛГЭЭГДЛЭЭ!", "success")
      addLog("═══════════════════════════════════════════════════════", "success")
      addLog(`✅ Илгээсэн байт: ${jsonData.length}`, "success")
      addLog(`✅ Уникал код: ${data.uniqueCode}`, "success")
      addLog("💡 3-р талын апп-аас өгөгдөл хүлээн авсныг шалгана уу", "info")
    } catch (error: any) {
      addLog(`❌ Илгээхэд алдаа гарлаа: ${error.message}`, "error")
    }
  }

  const clearLog = () => {
    setLogs([])
  }

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-50 text-green-700 border-green-200">Холбогдсон</Badge>
      case "connecting":
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Холбогдож байна...</Badge>
      case "disconnected":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Холбогдоогүй</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">3-р талын апп холболт тест</h2>
          {getStatusBadge()}
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="ws-url" className="text-sm font-medium mb-2 block">
              WebSocket URL
            </Label>
            <Input
              id="ws-url"
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="ws://127.0.0.1:9000/service"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={connect} disabled={status === "connected" || status === "connecting"}>
              Холбох
            </Button>
            <Button onClick={disconnect} disabled={status !== "connected"} variant="outline">
              Холболт таслах
            </Button>
            <Button onClick={testSend} disabled={status !== "connected"}>
              3-р талын апп руу илгээх
            </Button>
            <Button onClick={clearLog} variant="outline">
              Лог цэвэрлэх
            </Button>
          </div>

          {/* Data Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Илгээх өгөгдөл (автоматаар үүсгэгдсэн):</h3>
            <p className="text-sm text-gray-600 mb-2">
              Дараагийн удаа илгээхэд шинэ уникал код үүсгэгдэнэ
            </p>
            <pre className="bg-gray-50 rounded-lg p-4 text-xs max-h-64 overflow-auto font-mono">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>

          {/* Connection Log */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Холболтын лог:</h3>
            <div
              ref={logRef}
              className="bg-gray-50 rounded-lg p-4 text-xs max-h-64 overflow-y-auto font-mono border"
            >
              {logs.length === 0 ? (
                <em className="text-gray-400">Лог хоосон байна...</em>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

