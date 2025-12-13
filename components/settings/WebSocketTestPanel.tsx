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

  // Form data state
  const [formData, setFormData] = useState({
    package: "0.00",
    net: "0.00",
    wgt: "0.00",
    akt: "",
    lpc: "",
    drn: "",
    trl: "",
    sln: "",
    car: "",
    con: "",
    upc: "",
    vno: "",
    ct1: "",
    cmn: "",
    changeVehicleNumber: "no",
  })

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

  const generateUniqueCode = () => {
    const digits = "0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length))
    }
    return code
  }

  const calculateNetWeight = () => {
    const grossWeight = parseFloat(formData.wgt) || 0
    const packageWeight = parseFloat(formData.package) || 0

    if (grossWeight <= 0) {
      addLog("Бохир жин (WGT) оруулна уу", "error")
      return
    }

    const netWeight = grossWeight - packageWeight
    setFormData((prev) => ({
      ...prev,
      net: netWeight > 0 ? netWeight.toFixed(2) : "0.00",
    }))
    addLog(`✅ Цэвэр жин тооцооллоо: ${netWeight.toFixed(2)} (Бохир: ${grossWeight} - Баглаа: ${packageWeight})`, "success")
  }

  const getFormDataForSend = () => {
    return {
      uniqueCode: generateUniqueCode(),
      CAR: formData.car.trim() || "",
      CON: formData.con.trim() || "",
      DRN: formData.drn.trim() || "",
      LPC: formData.lpc.trim() || "",
      SLN: formData.sln.trim() || "",
      TRL: formData.trl.trim() || "",
      UPC: formData.upc.trim() || "",
      AKT: formData.akt.trim() || "",
      NET: parseFloat(formData.net) || 0,
      WGT: parseFloat(formData.wgt) || 0,
      VNO: formData.vno.trim() || "",
      CT1: formData.ct1.trim() || "",
      CMN: formData.cmn.trim() || "",
      PKG: parseFloat(formData.package) || 0,
      CHG_VNO: formData.changeVehicleNumber,
    }
  }

  const testSend = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addLog("❌ WebSocket холбогдоогүй байна", "error")
      return
    }

    const data = getFormDataForSend()
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

          {/* Form Fields */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Тээврийн мэдээлэл</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package">Баглаа боодол (Package):</Label>
                <div className="flex gap-2">
                  <Input
                    id="package"
                    type="number"
                    step="0.01"
                    value={formData.package}
                    onChange={(e) => setFormData((prev) => ({ ...prev, package: e.target.value }))}
                  />
                  <Button type="button" variant="outline" size="sm">
                    Сонгох
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="net">Цэвэр жин (Net Weight):</Label>
                <div className="flex gap-2">
                  <Input
                    id="net"
                    type="number"
                    step="0.01"
                    value={formData.net}
                    onChange={(e) => setFormData((prev) => ({ ...prev, net: e.target.value }))}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={calculateNetWeight}>
                    Тооцоолох
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="wgt">
                  Бохир жин (Gross Weight): <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="wgt"
                    type="number"
                    step="0.01"
                    value={formData.wgt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, wgt: e.target.value }))}
                    required
                  />
                  <Button type="button" variant="outline" size="sm">
                    КГ
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="akt">Пүүний акт (AKT):</Label>
                <Input
                  id="akt"
                  value={formData.akt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, akt: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="lpc">
                  Тээвэрлэгч байгууллагын нэр (LPC): <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lpc"
                  value={formData.lpc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lpc: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="drn">Жолоочийн нэр (DRN):</Label>
                <Input
                  id="drn"
                  value={formData.drn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, drn: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="trl">Чиргүүлийн дугаар (TRL):</Label>
                <Input
                  id="trl"
                  value={formData.trl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trl: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="sln">Гаалийн лац ломбын дугаар (SLN):</Label>
                <Input
                  id="sln"
                  value={formData.sln}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sln: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="car">CAR (Cargo/Product):</Label>
                <Input
                  id="car"
                  value={formData.car}
                  onChange={(e) => setFormData((prev) => ({ ...prev, car: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="con">CON (Contract):</Label>
                <Input
                  id="con"
                  value={formData.con}
                  onChange={(e) => setFormData((prev) => ({ ...prev, con: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="upc">UPC (Unloading Point Company):</Label>
                <Input
                  id="upc"
                  value={formData.upc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, upc: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="vno">VNO (Vehicle Number / Plate):</Label>
                <Input
                  id="vno"
                  value={formData.vno}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vno: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="ct1">CT1 (Custom Field 1):</Label>
                <Input
                  id="ct1"
                  value={formData.ct1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ct1: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="cmn">CMN (Comments/Notes):</Label>
                <Input
                  id="cmn"
                  value={formData.cmn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cmn: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Хил дээрх тээврийн хэрэгслийн дугаар солих эсэх?</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="changeVehicleNumber"
                    value="no"
                    checked={formData.changeVehicleNumber === "no"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, changeVehicleNumber: e.target.value }))}
                  />
                  Үгүй
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="changeVehicleNumber"
                    value="yes"
                    checked={formData.changeVehicleNumber === "yes"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, changeVehicleNumber: e.target.value }))}
                  />
                  Тийм
                </label>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Илгээх өгөгдөл:</h3>
            <pre className="bg-gray-50 rounded-lg p-4 text-xs max-h-64 overflow-auto font-mono">
              {JSON.stringify(getFormDataForSend(), null, 2)}
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

