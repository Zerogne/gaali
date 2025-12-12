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
import type { TruckSession } from "@/lib/truckSessions"

interface OutSessionFormState {
  plateNumber: string
  outTime: string
  outWeightKg: number | null
  netWeightKg: number | null
  notes: string
  inSessionId?: string // will link to IN record later
}

export default function OutSessionPage() {
  const [formState, setFormState] = useState<OutSessionFormState>({
    plateNumber: "",
    outTime: new Date().toISOString().slice(0, 16), // Default to current date/time
    outWeightKg: null,
    netWeightKg: null,
    notes: "",
    inSessionId: undefined,
  })

  const { toast } = useToast()
  const router = useRouter()
  const { sendFormData, isSending: isSendingToThirdParty, isConnected, getSentDataHistory } = useThirdPartyAutofill()
  const [isSaving, setIsSaving] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [inSession, setInSession] = useState<TruckSession | null>(null)
  const [isLoadingInSession, setIsLoadingInSession] = useState(false)
  const [inSessionError, setInSessionError] = useState<string | null>(null)
  const [lastSavedUniqueCode, setLastSavedUniqueCode] = useState<string | null>(null)

  // Find matching IN session when plate number changes
  useEffect(() => {
    const findInSession = async () => {
      if (!formState.plateNumber.trim()) {
        setInSession(null)
        setInSessionError(null)
        setFormState((prev) => ({ ...prev, inSessionId: undefined, netWeightKg: null }))
        return
      }

      setIsLoadingInSession(true)
      setInSessionError(null)

      try {
        const response = await fetch(`/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(formState.plateNumber.trim())}`)
        
        if (response.status === 404) {
          setInSession(null)
          setInSessionError("Энэ улсын дугаартай ОРОХ бүртгэл олдсонгүй")
          setFormState((prev) => ({ ...prev, inSessionId: undefined, netWeightKg: null }))
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch IN session")
        }

        const result = await response.json()
        const inSessionData = result.session as TruckSession

        if (inSessionData) {
          console.log("✅ IN session found:", {
            plateNumber: inSessionData.plateNumber,
            grossWeightKg: inSessionData.grossWeightKg,
            id: inSessionData.id,
          })
          
          setInSession(inSessionData)
          setFormState((prev) => ({
            ...prev,
            inSessionId: inSessionData.id,
          }))
          
          // Recalculate net weight if out weight is already set
          if (formState.outWeightKg && inSessionData.grossWeightKg) {
            const outWeight = Number(formState.outWeightKg)
            const inWeight = Number(inSessionData.grossWeightKg)
            const netWeight = outWeight - inWeight
            console.log("📊 Recalculating net weight after finding IN session:", {
              outWeight,
              inWeight,
              netWeight,
            })
            const calculatedNetWeight = Math.round(netWeight * 100) / 100
            setFormState((prev) => ({
              ...prev,
              netWeightKg: calculatedNetWeight, // Allow any value for debugging
            }))
            console.log("✅ Net weight set after finding IN session:", calculatedNetWeight)
          } else {
            console.warn("⚠️ Cannot calculate net weight - missing data:", {
              hasOutWeight: !!formState.outWeightKg,
              hasGrossWeight: !!inSessionData.grossWeightKg,
              grossWeightKg: inSessionData.grossWeightKg,
            })
          }
        } else {
          setInSession(null)
          setInSessionError("Энэ улсын дугаартай ОРОХ бүртгэл олдсонгүй")
          setFormState((prev) => ({ ...prev, inSessionId: undefined, netWeightKg: null }))
        }
      } catch (error) {
        console.error("Error finding IN session:", error)
        setInSessionError("ОРОХ бүртгэл хайхад алдаа гарлаа")
        setInSession(null)
      } finally {
        setIsLoadingInSession(false)
      }
    }

    // Debounce the search
    const timeoutId = setTimeout(findInSession, 500)
    return () => clearTimeout(timeoutId)
  }, [formState.plateNumber])

  // Calculate net weight when outWeightKg or inSession changes
  useEffect(() => {
    console.log("🔄 Net weight calculation triggered", {
      outWeightKg: formState.outWeightKg,
      inSessionGrossWeight: inSession?.grossWeightKg,
      inSession: inSession ? "exists" : "null",
      inSessionPlateNumber: inSession?.plateNumber,
      currentPlateNumber: formState.plateNumber,
      currentNetWeight: formState.netWeightKg,
    })
    
    // Don't clear if we already have a calculated value and all conditions are still met
    if (formState.netWeightKg !== null && formState.outWeightKg && inSession?.grossWeightKg) {
      const plateNumbersMatch = inSession && formState.plateNumber.trim().toUpperCase() === inSession.plateNumber.trim().toUpperCase()
      if (plateNumbersMatch) {
        console.log("✅ Net weight already calculated, keeping value:", formState.netWeightKg)
        return // Don't recalculate if value already exists and conditions are met
      }
    }
    
    // Check if plate numbers match
    const plateNumbersMatch = inSession && formState.plateNumber.trim().toUpperCase() === inSession.plateNumber.trim().toUpperCase()
    
    if (!plateNumbersMatch && inSession) {
      console.warn("⚠️ Plate numbers don't match:", {
        formPlate: formState.plateNumber.trim().toUpperCase(),
        inSessionPlate: inSession.plateNumber.trim().toUpperCase(),
      })
    }
    
    if (formState.outWeightKg && inSession?.grossWeightKg && plateNumbersMatch) {
      const outWeight = Number(formState.outWeightKg)
      const inWeight = Number(inSession.grossWeightKg)
      
      // Validate numbers
      if (isNaN(outWeight) || isNaN(inWeight)) {
        console.error("❌ Invalid weight values:", { outWeight, inWeight })
        // Only clear if we don't have a valid calculated value
        if (formState.netWeightKg === null) {
          setFormState((prev) => ({ ...prev, netWeightKg: null }))
        }
        return
      }
      
      const netWeight = outWeight - inWeight
      
      console.log("📊 Calculating net weight:", {
        outWeight,
        inWeight,
        netWeight,
        calculated: Math.round(netWeight * 100) / 100,
      })
      
      const calculatedNetWeight = Math.round(netWeight * 100) / 100
      
      setFormState((prev) => ({
        ...prev,
        netWeightKg: calculatedNetWeight, // Allow any value (even 0 or negative) for debugging
      }))
      
      console.log("✅ Net weight set:", calculatedNetWeight)
    } else {
      // Only clear if we're missing critical data, not if we just have a calculated value
      const reason = !formState.outWeightKg 
        ? "missing out weight" 
        : !inSession?.grossWeightKg 
          ? "missing IN session gross weight" 
          : !plateNumbersMatch 
            ? "plate numbers don't match"
            : "unknown"
      console.log("⚠️ Cannot calculate net weight -", reason)
      
      // Only clear if we don't have a valid calculated value already
      if (!formState.outWeightKg || !inSession) {
        setFormState((prev) => ({ ...prev, netWeightKg: null }))
      }
    }
  }, [formState.outWeightKg, formState.plateNumber, inSession])

  const handleWeightDetected = (weightKg: number) => {
    console.log("⚖️ Weight detected:", weightKg)
    setFormState((prev) => {
      const newState = {
        ...prev,
        outWeightKg: weightKg,
      }
      
      // Immediately calculate net weight if IN session is available
      if (inSession?.grossWeightKg) {
        const outWeight = Number(weightKg)
        const inWeight = Number(inSession.grossWeightKg)
        const netWeight = outWeight - inWeight
        
        console.log("📊 Immediate net weight calculation:", {
          outWeight,
          inWeight,
          netWeight,
        })
        
        const calculatedNetWeight = Math.round(netWeight * 100) / 100
        newState.netWeightKg = calculatedNetWeight // Allow any value for debugging
        console.log("✅ Net weight set immediately:", calculatedNetWeight)
      }
      
      return newState
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.outWeightKg) {
      toast({
        title: "Алдаа",
        description: "Гарах жин оруулах шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!inSession) {
      toast({
        title: "Алдаа",
        description: "ОРОХ бүртгэл олох шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!formState.netWeightKg) {
      toast({
        title: "Алдаа",
        description: "Цэвэр жин тооцоолох шаардлагатай",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const requestData = {
        direction: "OUT",
        plateNumber: formState.plateNumber.trim().toUpperCase(),
        grossWeightKg: formState.outWeightKg, // OUT weight is stored as grossWeightKg
        netWeightKg: formState.netWeightKg ? formState.netWeightKg : undefined,
        inSessionId: formState.inSessionId ? formState.inSessionId : undefined,
        outTime: formState.outTime ? formState.outTime : undefined,
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
      const savedSession = result.session
      
      // Store the unique code from saved session
      if (savedSession?.uniqueCode) {
        setLastSavedUniqueCode(savedSession.uniqueCode)
      }
      
      toast({
        title: "Амжилттай",
        description: savedSession?.uniqueCode 
          ? `ГАРАХ бүртгэл амжилттай хадгалагдлаа. Код: ${savedSession.uniqueCode}`
          : "ГАРАХ бүртгэл амжилттай хадгалагдлаа",
        duration: 5000,
      })

      // Reset form
      setFormState({
        plateNumber: "",
        outTime: new Date().toISOString().slice(0, 16),
        outWeightKg: null,
        netWeightKg: null,
        notes: "",
        inSessionId: undefined,
      })
      setInSession(null)
      setInSessionError(null)

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
    console.log("🎯 handleSendToThirdParty called (OUT session)")
    console.log("🎯 Form state:", formState)
    console.log("🎯 In session:", inSession)
    console.log("🎯 Connection status:", isConnected)
    console.log("🎯 Last saved unique code:", lastSavedUniqueCode)
    
    // Validate form before sending
    if (!formState.plateNumber || !formState.outWeightKg || !formState.netWeightKg || !inSession) {
      console.warn("⚠️ Validation failed - missing required fields")
      toast({
        title: "Алдаа",
        description: "Бүх шаардлагатай талбаруудыг бөглөнө үү",
        variant: "destructive",
      })
      return
    }

    // If form hasn't been saved yet, save it first to get unique code
    let uniqueCode = lastSavedUniqueCode
    if (!uniqueCode) {
      toast({
        title: "Анхаар",
        description: "Эхлээд бүртгэлийг хадгалаад дараа нь илгээнэ үү",
        variant: "destructive",
      })
      return
    }

    // Prepare form data in the format expected by 3rd party app (CAR, CON, DRN, etc.)
    // Format based on the 3rd party app's expected structure
    const formDataToSend = {
      uniqueCode, // Unrepeatable code for pulling data
      CAR: inSession.product || "", // Cargo/Product (from IN session)
      CON: "", // Contract (empty if not available)
      DRN: inSession.driverName || "", // Driver name (from IN session)
      LPC: inSession.transporterCompany || "", // Loading point company (from IN session)
      SLN: "", // Seal number (empty if not available)
      TRL: "", // Trailer (empty if not available)
      UPC: "", // Unloading point company (empty if not available)
      AKT: "", // Act number (empty if not available)
      NET: formState.netWeightKg || 0, // Net weight
      WGT: formState.outWeightKg || 0, // Gross weight (out weight)
      VNO: formState.plateNumber.trim().toUpperCase() || "", // Vehicle number (plate)
      CT1: "", // Custom field 1
      CMN: formState.notes.trim() || "", // Comments/Notes
      inSessionUniqueCode: inSession.uniqueCode || "", // Include IN session's unique code too
    }

    console.log("🎯 Prepared form data to send:", formDataToSend)
    console.log("🎯 Calling sendFormData...")
    
    const result = await sendFormData(formDataToSend)
    
    console.log("🎯 sendFormData result:", result)

    if (result.success) {
      // Log to console for debugging
      console.log("✅ Successfully sent form data:", formDataToSend)
      console.log("📋 Check browser console (F12) to see the sent data")
      
      toast({
        title: "Амжилттай",
        description: isConnected 
          ? "Форм өгөгдөл 3-р талын апп руу илгээгдлээ. Автоматаар бөглөгдөнө. (F12 дарж console-оос шалгана уу)"
          : "Форм өгөгдөл илгээх оролдлого хийгдлээ",
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
                  Тээврийн хэрэгсэл гарах бүртгэл
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Тээврийн хэрэгсэл гарах үед бүртгэл хийх
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
                    {isLoadingInSession && (
                      <p className="mt-1 text-xs text-gray-500">ОРОХ бүртгэл хайж байна...</p>
                    )}
                    {inSession && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <p className="text-green-700 font-medium">
                          ОРОХ бүртгэл олдлоо: {inSession.grossWeightKg?.toLocaleString()} кг (
                          {new Date(inSession.createdAt).toLocaleString("mn-MN")})
                        </p>
                      </div>
                    )}
                    {inSessionError && (
                      <p className="mt-1 text-xs text-red-600">{inSessionError}</p>
                    )}
                  </div>

                  {/* Out Time */}
                  <div>
                    <Label htmlFor="outTime" className="text-sm font-medium text-gray-700">
                      Гарах цаг *
                    </Label>
                    <Input
                      id="outTime"
                      type="datetime-local"
                      value={formState.outTime}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, outTime: e.target.value }))
                      }
                      className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Out Weight with Scale Connector */}
                  <div>
                    <Label htmlFor="outWeightKg" className="text-sm font-medium text-gray-700">
                      Гарах жин (кг) *
                    </Label>
                    <div className="mt-2 space-y-2">
                      <InSessionWeightConnector onWeightDetected={handleWeightDetected} />
                      <Input
                        id="outWeightKg"
                        type="number"
                        value={formState.outWeightKg ?? ""}
                        onChange={(e) => {
                          const weightValue = e.target.value ? parseFloat(e.target.value) : null
                          console.log("📝 Out weight changed manually:", weightValue)
                          setFormState((prev) => {
                            const newState = {
                              ...prev,
                              outWeightKg: weightValue,
                            }
                            
                            // Immediately calculate net weight if IN session is available
                            if (weightValue && inSession?.grossWeightKg) {
                              const outWeight = Number(weightValue)
                              const inWeight = Number(inSession.grossWeightKg)
                              const netWeight = outWeight - inWeight
                              const calculatedNetWeight = Math.round(netWeight * 100) / 100
                              
                              console.log("📊 Manual calculation:", {
                                outWeight,
                                inWeight,
                                netWeight: calculatedNetWeight,
                              })
                              
                              newState.netWeightKg = calculatedNetWeight
                            } else {
                              newState.netWeightKg = null
                            }
                            
                            return newState
                          })
                        }}
                        className="border rounded px-2 py-1 bg-white border-gray-300 text-gray-700"
                        placeholder="Жин (кг) оруулах"
                        required
                      />
                    </div>
                  </div>

                  {/* Net Weight (Auto-calculated) */}
                  <div>
                    <Label htmlFor="netWeightKg" className="text-sm font-medium text-gray-700">
                      Цэвэр жин (кг){" "}
                      <span className="text-xs text-gray-500 font-normal">
                        (автоматаар тооцоолно)
                      </span>
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="netWeightKg"
                        type="number"
                        value={formState.netWeightKg ?? ""}
                        readOnly
                        className="flex-1 bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                        placeholder={
                          !inSession
                            ? "ОРОХ бүртгэл олох хэрэгтэй"
                            : !formState.outWeightKg
                              ? "Гарах жин оруулах хэрэгтэй"
                              : "Цэвэр жин автоматаар тооцоологдоно"
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (inSession?.grossWeightKg && formState.outWeightKg) {
                            const outWeight = Number(formState.outWeightKg)
                            const inWeight = Number(inSession.grossWeightKg)
                            const netWeight = outWeight - inWeight
                            const calculatedNetWeight = Math.round(netWeight * 100) / 100
                            
                            console.log("🔘 Manual calculate button clicked:", {
                              outWeight,
                              inWeight,
                              netWeight: calculatedNetWeight,
                            })
                            
                            setFormState((prev) => ({
                              ...prev,
                              netWeightKg: calculatedNetWeight,
                            }))
                          } else {
                            toast({
                              title: "Алдаа",
                              description: !inSession 
                                ? "ОРОХ бүртгэл олох шаардлагатай" 
                                : !formState.outWeightKg 
                                  ? "Гарах жин оруулах шаардлагатай"
                                  : "IN session-д жин байхгүй байна",
                              variant: "destructive",
                            })
                          }
                        }}
                        disabled={!inSession || !formState.outWeightKg}
                        className="whitespace-nowrap px-4"
                      >
                        Тооцоолох
                      </Button>
                    </div>
                    {formState.netWeightKg && (
                      <p className="mt-1 text-xs text-gray-500">
                        Тооцоолол: {formState.outWeightKg} кг - {inSession?.grossWeightKg} кг ={" "}
                        {formState.netWeightKg} кг
                      </p>
                    )}
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
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      disabled={!inSession || !formState.netWeightKg || isSaving}
                    >
                      {isSaving ? "Хадгалж байна..." : "Бүртгэл хадгалах"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSendToThirdParty}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      disabled={isSendingToThirdParty || isSaving || !inSession || !formState.netWeightKg}
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
                          outTime: new Date().toISOString().slice(0, 16),
                          outWeightKg: null,
                          netWeightKg: null,
                          notes: "",
                          inSessionId: undefined,
                        })
                        setInSession(null)
                        setInSessionError(null)
                        setLastSavedUniqueCode(null)
                      }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Цэвэрлэх
                    </Button>
                  </div>
                  {/* Unique Code Display */}
                  {lastSavedUniqueCode && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        🔑 Уникал код (Unrepeatable Code):
                      </p>
                      <p className="text-lg font-mono font-bold text-blue-700 mb-2">
                        {lastSavedUniqueCode}
                      </p>
                      <p className="text-xs text-blue-600">
                        Энэ кодыг ашиглан өгөгдлийг бусад сайтаас татаж авах боломжтой. 
                        API: <code className="bg-blue-100 px-1 rounded">/api/truck-sessions/by-code/{lastSavedUniqueCode}</code>
                      </p>
                    </div>
                  )}
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
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                        <p className="font-semibold mb-2 text-gray-700">Илгээсэн өгөгдлийн түүх:</p>
                        {getSentDataHistory().length === 0 ? (
                          <p className="text-gray-500 italic">Одоогоор илгээсэн өгөгдөл байхгүй</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {getSentDataHistory().map((entry: any, index: number) => (
                              <div key={index} className="p-2 bg-white border border-gray-200 rounded">
                                <p className="text-gray-600 font-medium mb-1">
                                  {new Date(entry.timestamp).toLocaleString("mn-MN")}
                                </p>
                                <pre className="text-xs overflow-x-auto text-gray-700">
                                  {JSON.stringify(entry.data, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-gray-500 text-xs">
                          💡 F12 дарж browser console-оос илгээсэн өгөгдлийг харах боломжтой
                        </p>
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
