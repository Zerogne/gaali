"use client"

import { useState } from "react"
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
  const [isSaving, setIsSaving] = useState(false)
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
      const response = await fetch("/api/truck-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "IN",
          plateNumber: formState.plateNumber.trim().toUpperCase(),
          driverName: formState.driverName.trim(),
          product: formState.product.trim(),
          transporterCompany: formState.transporterCompany.trim(),
          grossWeightKg: formState.grossWeightKg,
          inTime: formState.inTime,
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

                  {/* Submit Button */}
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
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
