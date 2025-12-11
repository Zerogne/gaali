"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { InSessionWeightConnector } from "@/components/scale/InSessionWeightConnector"
import { Sidebar } from "@/components/layout/Sidebar"
import { AlertBanner } from "@/components/layout/AlertBanner"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill"
import { Send, Eye, EyeOff } from "lucide-react"

interface InSessionFormState {
  plateNumber: string
  driverName: string
  product: string
  transporterCompany: string
  inTime: string // ISO string or hh:mm
  grossWeightKg: number | null
  notes: string
}

export default function InSessionPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { sendFormData, isSending: isSendingToThirdParty, isConnected, getSentDataHistory } = useThirdPartyAutofill()
  const [isSaving, setIsSaving] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [sentDataHistory, setSentDataHistory] = useState<Array<{ timestamp: string; data: any }>>([])

  // Load sent data history from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = localStorage.getItem("thirdPartyAutofillHistory")
      if (history) {
        try {
          setSentDataHistory(JSON.parse(history))
        } catch (e) {
          console.error("Failed to parse sent data history:", e)
        }
      }
    }
  }, [])
  const [formState, setFormState] = useState<InSessionFormState>({
    plateNumber: "",
    driverName: "",
    product: "",
    transporterCompany: "",
    inTime: new Date().toISOString().slice(0, 16), // Default to current date/time
    grossWeightKg: null,
    notes: "",
  })

  const handleWeightDetected = (weightKg: number) => {
    setFormState((prev) => ({
      ...prev,
      grossWeightKg: weightKg,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.grossWeightKg) {
      toast({
        title: "Алдаа",
        description: "Бүрэн жин оруулах шаардлагатай",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const requestData = {
        direction: "IN",
        plateNumber: formState.plateNumber.trim().toUpperCase(),
        driverName: formState.driverName.trim() || undefined,
        product: formState.product.trim() || undefined,
        transporterCompany: formState.transporterCompany.trim() || undefined,
        grossWeightKg: formState.grossWeightKg,
        inTime: formState.inTime ? formState.inTime : undefined,
        notes: formState.notes.trim() || undefined,
      }
      
      console.log("💾 Saving session with data:", requestData)
      
      const response = await fetch("/api/truck-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Show detailed validation errors if available
        let errorMessage = errorData.error || "Failed to save session"
        
        // If there are validation errors, format them nicely
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ')
          errorMessage = `Validation error: ${validationErrors}`
        }
        
        console.error("Save error details:", errorData)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      toast({
        title: "Амжилттай",
        description: "ОРОХ бүртгэл амжилттай хадгалагдлаа",
      })

      // Reset form
      setFormState({
        plateNumber: "",
        driverName: "",
        product: "",
        transporterCompany: "",
        inTime: new Date().toISOString().slice(0, 16),
        grossWeightKg: null,
        notes: "",
      })

      // Optionally redirect to history page
      // router.push("/history")
    } catch (error) {
      console.error("Error saving session:", error)
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Бүртгэл хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendToThirdParty = async () => {
    console.log("🎯 handleSendToThirdParty called")
    console.log("🎯 Form state:", formState)
    console.log("🎯 Connection status:", isConnected)
    
    // Validate form before sending
    if (!formState.plateNumber || !formState.driverName || !formState.product || !formState.transporterCompany || !formState.grossWeightKg) {
      console.warn("⚠️ Validation failed - missing required fields")
      toast({
        title: "Алдаа",
        description: "Бүх шаардлагатай талбаруудыг бөглөнө үү",
        variant: "destructive",
      })
      return
    }

    // Prepare form data to send to 3rd party app
    const formDataToSend = {
      direction: "IN",
      plateNumber: formState.plateNumber.trim().toUpperCase(),
      driverName: formState.driverName.trim(),
      product: formState.product.trim(),
      transporterCompany: formState.transporterCompany.trim(),
      grossWeightKg: formState.grossWeightKg,
      inTime: formState.inTime,
      notes: formState.notes.trim() || undefined,
    }

    console.log("🎯 Prepared form data to send:", formDataToSend)
    console.log("🎯 Calling sendFormData...")
    
    const result = await sendFormData(formDataToSend)
    
    console.log("🎯 sendFormData result:", result)

    if (result.success) {
      // Log to console for debugging
      console.log("✅ Successfully sent form data:", formDataToSend)
      console.log("📋 Check browser console (F12) to see the sent data")
      console.log("📋 Check your 3rd party app to verify it received the data")
      
      // Refresh history in debug panel
      const updatedHistory = JSON.parse(localStorage.getItem("thirdPartyAutofillHistory") || "[]")
      setSentDataHistory(updatedHistory)
      
      toast({
        title: "✅ Амжилттай илгээгдлээ",
        description: "Форм өгөгдөл 3-р талын апп руу илгээгдлээ. 3-р талын апп дээрх форм нээхэд энэ өгөгдөл автоматаар бөглөгдөнө. Илгээсэн өгөгдөл харах: Debug товч дарна уу",
        duration: 8000,
      })
    } else {
      // Show more detailed error message
      const errorMsg = result.error || "3-р талын апп руу илгээхэд алдаа гарлаа"
      toast({
        title: "Холболтын алдаа",
        description: errorMsg.includes("Unable to connect") || errorMsg.includes("unable to connect")
          ? "3-р талын апптай холбогдох боломжгүй байна. Апп ажиллаж байгаа эсэхийг шалгана уу."
          : errorMsg,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AlertBanner />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Тээврийн хэрэгсэл орох бүртгэл
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Тээврийн хэрэгсэл орох үед бүртгэл хийх
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Plate Number */}
                  <div>
                    <Label htmlFor="plateNumber" className="text-sm font-medium text-gray-700">
                      Улсын дугаар *
                    </Label>
                    <Input
                      id="plateNumber"
                      value={formState.plateNumber}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, plateNumber: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Улсын дугаар оруулах"
                      required
                    />
                  </div>

                  {/* Driver Name */}
                  <div>
                    <Label htmlFor="driverName" className="text-sm font-medium text-gray-700">
                      Жолооч *
                    </Label>
                    <Input
                      id="driverName"
                      value={formState.driverName}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, driverName: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Жолоочийн нэр оруулах"
                      required
                    />
                  </div>

                  {/* Product */}
                  <div>
                    <Label htmlFor="product" className="text-sm font-medium text-gray-700">
                      Бүтээгдэхүүн *
                    </Label>
                    <Input
                      id="product"
                      value={formState.product}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, product: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Бүтээгдэхүүн оруулах"
                      required
                    />
                  </div>

                  {/* Transporter Company */}
                  <div>
                    <Label htmlFor="transporterCompany" className="text-sm font-medium text-gray-700">
                      Тээврийн компани *
                    </Label>
                    <Input
                      id="transporterCompany"
                      value={formState.transporterCompany}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, transporterCompany: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Тээврийн компани оруулах"
                      required
                    />
                  </div>

                  {/* In Time */}
                  <div>
                    <Label htmlFor="inTime" className="text-sm font-medium text-gray-700">
                      Орох цаг *
                    </Label>
                    <Input
                      id="inTime"
                      type="datetime-local"
                      value={formState.inTime}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, inTime: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Gross Weight with Scale Connector */}
                  <div>
                    <Label htmlFor="grossWeightKg" className="text-sm font-medium text-gray-700">
                      Бүрэн жин (кг) *
                    </Label>
                    <div className="mt-2 space-y-2">
                      <InSessionWeightConnector onWeightDetected={handleWeightDetected} />
                      <Input
                        id="grossWeightKg"
                        type="number"
                        value={formState.grossWeightKg ?? ""}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            grossWeightKg: e.target.value ? parseFloat(e.target.value) : null,
                          }))
                        }
                        readOnly
                        className="border rounded px-2 py-1 bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                        placeholder="Жин (кг) автоматаар оруулах"
                        required
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      Нэмэлт мэдээлэл
                    </Label>
                    <Textarea
                      id="notes"
                      value={formState.notes}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Нэмэлт мэдээлэл оруулах"
                      rows={3}
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      disabled={isSaving}
                    >
                      {isSaving ? "Хадгалж байна..." : "Бүртгэл хадгалах"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSendToThirdParty}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      disabled={isSendingToThirdParty || isSaving}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSendingToThirdParty ? "Илгээж байна..." : "3-р талын апп руу илгээх"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormState({
                          plateNumber: "",
                          driverName: "",
                          product: "",
                          transporterCompany: "",
                          inTime: new Date().toISOString().slice(0, 16),
                          grossWeightKg: null,
                          notes: "",
                        })
                      }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Цэвэрлэх
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {isConnected ? (
                      <p className="text-xs text-green-600 font-medium">
                        ✓ 3-р талын апптай холбогдсон
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-yellow-600 font-medium">
                          ⚠️ 3-р талын апптай холбогдоогүй байна
                        </p>
                        <p className="text-xs text-gray-500">
                          Апп ажиллаж байгаа эсэхийг шалгана уу (ws://127.0.0.1:9000/service)
                        </p>
                      </div>
                    )}
                    
                    {/* Debug Panel Toggle */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDebugPanel(!showDebugPanel)}
                      className="text-xs h-7"
                    >
                      {showDebugPanel ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Debug нуух
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Илгээсэн өгөгдөл харах (Debug)
                        </>
                      )}
                    </Button>
                    
                    {/* Debug Panel */}
                    {showDebugPanel && (
                      <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="mb-3">
                          <h4 className="font-semibold text-sm text-gray-800 mb-1">
                            📤 Илгээсэн өгөгдлийн түүх
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            Эдгээр өгөгдлүүд 3-р талын апп руу илгээгдсэн. Апп дээрх форм нээхэд автоматаар бөглөгдөнө.
                          </p>
                        </div>
                        {sentDataHistory.length === 0 ? (
                          <div className="p-3 bg-white border border-gray-200 rounded text-center">
                            <p className="text-gray-500 italic text-sm">Одоогоор илгээсэн өгөгдөл байхгүй</p>
                            <p className="text-xs text-gray-400 mt-1">
                              "3-р талын апп руу илгээх" товч дарснаар энд харагдана
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {sentDataHistory.map((entry: any, index: number) => (
                              <div key={index} className="p-3 bg-white border border-gray-200 rounded shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    {new Date(entry.timestamp).toLocaleString("mn-MN", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                  </p>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    ✓ Илгээгдсэн
                                  </span>
                                </div>
                                <pre className="text-xs overflow-x-auto text-gray-700 bg-gray-50 p-2 rounded border">
                                  {JSON.stringify(entry.data, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <p className="text-yellow-800 font-medium mb-1">💡 Хэрхэн ажилладаг вэ?</p>
                          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                            <li>Та эндээс "3-р талын апп руу илгээх" товч дарна</li>
                            <li>Өгөгдөл WebSocket-аар 3-р талын апп руу илгээгднэ</li>
                            <li>3-р талын апп өгөгдлийг хадгална (autofill)</li>
                            <li>3-р талын апп дээрх форм нээхэд автоматаар бөглөгдөнө</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
