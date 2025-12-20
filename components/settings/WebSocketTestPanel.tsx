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
  
  // Store sequential number per day (resets when date changes)
  // Use refs to avoid re-renders and ensure sequential number only increments on send
  const sequentialNumberRef = useRef(1)
  const lastDateRef = useRef(new Date().toISOString().slice(0, 10))

  // Generate customs act number (AKT) in format: {customsCode}{date}{sequentialNumber}
  // Format: 311001202401180001
  // - 311001: Customs office code (6 digits)
  // - 20240118: Date YYYYMMDD (8 digits)
  // - 000001: Sequential number for that day (6 digits)
  // increment: if true, increments the sequential number for next call
  const generateActNumber = (increment: boolean = false): string => {
    const customsCode = "311001" // Example customs office code
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "") // YYYYMMDD
    
    // Check if date changed, reset sequential number if so
    const currentDate = now.toISOString().slice(0, 10)
    if (currentDate !== lastDateRef.current) {
      lastDateRef.current = currentDate
      sequentialNumberRef.current = 1
    }
    
    const seqNum = sequentialNumberRef.current.toString().padStart(6, '0')
    const actNumber = `${customsCode}${dateStr}${seqNum}`
    
    // Only increment when actually sending (not for preview)
    if (increment) {
      sequentialNumberRef.current += 1
    }
    
    return actNumber
  }

  // Generate sample data for testing - matches exact requirements
  const generateSampleData = (incrementActNumber: boolean = false) => {
    const randomNum = Math.floor(Math.random() * 10000)
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    
    // Generate act number (only increment when actually sending)
    const aktNumber = generateActNumber(incrementActNumber)
    
    // Generate all required fields according to specification
    const data = [
      {
        CAR: "Цайны зам", // Тээвэрлэгч байгууллагын нэр
        CON: `${year}/${month}-${randomNum}`, // Гэрээний дугаар
        DRN: `Б.ЭНХБАТ ЕТ74102419 ${96650888 + randomNum}`, // Жолоочийн нэр
        LPC: "ПАТРИКЕЙН ХХК", // Ачих газар код (гаалиас асуух)
        PRM: `PRM${String(1000 + randomNum).padStart(6, '0')}`, // Улс хоорондын тээвэр гүйцэтгэх зөвшөөрлийн дугаар
        SLN: `ZW${String(341369 + randomNum).padStart(7, '0')}-ZW${String(341381 + randomNum).padStart(7, '0')}`, // Гаалийн лац, ломбын дугаар
        TRL: `${1330 + randomNum}СЧ`, // Чиргүүлийн дугаар
        UPC: "Erlian", // Хүлээн авах газар код (гаалиас асуух)
        AKT: aktNumber, // Актын дугаар (формат: 311001202401180001)
        NET: Math.floor(Math.random() * 20000) + 10000, // Цэвэр жин
        WGT: Math.floor(Math.random() * 25000) + 15000, // Бохир жин
        VNO: `${3826 + randomNum}ДГН`, // Тээврийн хэрэгслийн дугаар
        CT1: `CTN${String(1000 + randomNum).padStart(7, '0')}`, // Чингэлэг 1
        CT2: `CTN${String(2000 + randomNum).padStart(7, '0')}`, // Чингэлэг 2
        CT3: `CTN${String(3000 + randomNum).padStart(7, '0')}`, // Чингэлэг 3
        CT4: `CTN${String(4000 + randomNum).padStart(7, '0')}`, // Чингэлэг 4
        TID: `TID${String(5000000 + randomNum).padStart(10, '0')}`, // Тээврийн хэрэгслийн RFID дугаар (TID)
        CMN: `CMN${String(6000 + randomNum).padStart(8, '0')}`, // Convoy manifest number
      }
    ]
    
    return { aktNumber, data }
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

  // Initialize sample data (preview only, doesn't increment counter)
  const [sampleData, setSampleData] = useState(() => {
    const { aktNumber, data } = generateSampleData(false)
    return { aktNumber, data }
  })

  const testSend = async () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addLog("❌ WebSocket холбогдоогүй байна", "error")
      return
    }

    try {
      // Step 1: Generate new sample data with new act number each time (increment counter)
      const { aktNumber, data } = generateSampleData(true)
      setSampleData({ aktNumber, data })
      
      const jsonData = JSON.stringify(data, null, 2)

      addLog("═══════════════════════════════════════════════════════", "info")
      addLog("📤 3-Р ТАЛЫН АПП РУУ ТЕСТ ӨГӨГДӨЛ ИЛГЭЭЖ БАЙНА", "info")
      addLog("═══════════════════════════════════════════════════════", "info")
      addLog(`🔑 Пүүний актын дугаар (AKT): ${aktNumber}`, "info")
      addLog(`📦 Өгөгдлийн хэмжээ: ${jsonData.length} байт`, "info")
      addLog("📋 JSON өгөгдөл:", "info")
      addLog(jsonData, "info")

      // Step 2: Save data to file-like storage
      addLog("💾 Өгөгдөл файлд хадгалж байна...", "info")
      const appBaseUrl = typeof window !== "undefined" 
        ? window.location.origin 
        : "https://gaali.vercel.app"
      
      const saveResponse = await fetch(`${appBaseUrl}/api/third-party/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueCode: aktNumber, // Use AKT as unique code
          data: data,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Файл хадгалахад алдаа гарлаа: ${saveResponse.statusText}`)
      }

      const saveResult = await saveResponse.json()
      const fileUrl = saveResult.url
      const uniqueCode = saveResult.code
      const dataBaseUrl = `${appBaseUrl}/api/third-party/data`

      addLog("✅ Өгөгдөл файлд амжилттай хадгалагдлаа", "success")
      addLog(`🔑 Уникал код: ${uniqueCode}`, "info")
      addLog(`📁 Файлын URL: ${fileUrl}`, "info")
      addLog(`📁 Base URL (3-р талын апп-д тохируулах): ${dataBaseUrl}`, "info")

      // Step 3: Send full URL via WebSocket (3rd party app expects URL string)
      // The 3rd party app will fetch data from this URL and can forward to another site
      const dataUrl = `${dataBaseUrl}/${uniqueCode}`
      addLog("📤 URL-г WebSocket-оор илгээж байна...", "info")
      addLog(`🔑 Уникал код: ${uniqueCode}`, "info")
      addLog(`📁 Бүтэн URL: ${dataUrl}`, "info")
      addLog(`💡 3-р талын апп энэ URL-аас өгөгдөл татна`, "info")
      addLog(`💡 3-р талын апп өгөгдлийг өөр сайт руу дамжуулна`, "info")

      ws.send(dataUrl)
      
      addLog("═══════════════════════════════════════════════════════", "success")
      addLog("✅ URL АМЖИЛТТАЙ ИЛГЭЭГДЛЭЭ!", "success")
      addLog("═══════════════════════════════════════════════════════", "success")
      addLog(`✅ Илгээсэн URL: ${dataUrl}`, "success")
      addLog(`✅ Пүүний актын дугаар: ${aktNumber}`, "success")
      addLog(`🔑 Уникал код: ${uniqueCode}`, "info")
      addLog(`💡 3-р талын апп энэ URL-аас өгөгдөл татна`, "info")
      addLog(`💡 3-р талын апп өгөгдлийг өөр сайт руу дамжуулна`, "info")
    } catch (error: any) {
      addLog(`❌ Алдаа гарлаа: ${error.message}`, "error")
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
              Дараагийн удаа илгээхэд шинэ пүүний актын дугаар үүсгэгдэнэ. Актын дугаар нь өдөр бүр дарааллаар нэмэгддэг.
            </p>
            <div className="mb-2">
              <span className="text-sm font-medium">🔑 Пүүний актын дугаар (AKT): </span>
              <span className="text-sm font-mono bg-blue-50 px-2 py-1 rounded">{sampleData.aktNumber}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Формат: [Гаалийн код 6 орон][Огноо YYYYMMDD 8 орон][Дарааллын дугаар 6 орон]
            </p>
            <pre className="bg-gray-50 rounded-lg p-4 text-xs max-h-64 overflow-auto font-mono">
              {JSON.stringify(sampleData.data, null, 2)}
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

