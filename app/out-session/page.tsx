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
  const [isSaving, setIsSaving] = useState(false)
  const [inSession, setInSession] = useState<TruckSession | null>(null)
  const [isLoadingInSession, setIsLoadingInSession] = useState(false)
  const [inSessionError, setInSessionError] = useState<string | null>(null)

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
          setInSession(inSessionData)
          setFormState((prev) => ({
            ...prev,
            inSessionId: inSessionData.id,
          }))
          // Recalculate net weight if out weight is already set
          if (formState.outWeightKg && inSessionData.grossWeightKg) {
            const netWeight = formState.outWeightKg - inSessionData.grossWeightKg
            setFormState((prev) => ({
              ...prev,
              netWeightKg: netWeight > 0 ? netWeight : null,
            }))
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
    if (formState.outWeightKg && inSession?.grossWeightKg) {
      const netWeight = formState.outWeightKg - inSession.grossWeightKg
      setFormState((prev) => ({
        ...prev,
        netWeightKg: netWeight > 0 ? netWeight : null,
      }))
    } else {
      setFormState((prev) => ({ ...prev, netWeightKg: null }))
    }
  }, [formState.outWeightKg, inSession])

  const handleWeightDetected = (weightKg: number) => {
    setFormState((prev) => ({
      ...prev,
      outWeightKg: weightKg,
    }))
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
      const response = await fetch("/api/truck-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "OUT",
          plateNumber: formState.plateNumber.trim().toUpperCase(),
          grossWeightKg: formState.outWeightKg, // OUT weight is stored as grossWeightKg
          netWeightKg: formState.netWeightKg,
          inSessionId: formState.inSessionId,
          outTime: formState.outTime,
          notes: formState.notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save session")
      }

      const result = await response.json()
      
      toast({
        title: "Амжилттай",
        description: "ГАРАХ бүртгэл амжилттай хадгалагдлаа",
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
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            outWeightKg: e.target.value ? parseFloat(e.target.value) : null,
                          }))
                        }
                        readOnly
                        className="border rounded px-2 py-1 bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                        placeholder="Жин (кг) автоматаар оруулах"
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
                    <Input
                      id="netWeightKg"
                      type="number"
                      value={formState.netWeightKg ?? ""}
                      readOnly
                      className="mt-2 bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                      placeholder={
                        !inSession
                          ? "ОРОХ бүртгэл олох хэрэгтэй"
                          : !formState.outWeightKg
                            ? "Гарах жин оруулах хэрэгтэй"
                            : "Цэвэр жин автоматаар тооцоологдоно"
                      }
                    />
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

                  {/* Submit Button */}
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
                      }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Цэвэрлэх
                    </Button>
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
