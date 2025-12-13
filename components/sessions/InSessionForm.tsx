"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterableSelect } from "@/components/ui/filterable-select"
import { InSessionWeightConnector } from "@/components/scale/InSessionWeightConnector"
import { useToast } from "@/hooks/use-toast"
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill"
import { useCameraPlateAutofill } from "@/hooks/useCameraPlateAutofill"
import { Switch } from "@/components/ui/switch"
import { Camera, Plus } from "lucide-react"
import { DriverManager } from "@/components/drivers/DriverManager"
import type { TransportCompany, Organization, Driver } from "@/lib/types"
import type { Product } from "@/lib/products/products"

interface InSessionFormState {
  plateNumber: string
  driverId: string
  driverName: string
  productId: string
  transporterCompanyId: string
  origin: string
  destination: string
  senderOrganizationId: string
  receiverOrganizationId: string
  inTime: string
  grossWeightKg: number | null
  hasTrailer: boolean
  notes: string
}

interface InSessionFormProps {
  autoFillPlate?: string | null
  onPlateChange?: (plate: string) => void
}

export function InSessionForm({
  autoFillPlate,
  onPlateChange,
}: InSessionFormProps) {
  const { toast } = useToast();
  const {
    sendFormData,
    isSending: isSendingToThirdParty,
    isConnected,
  } = useThirdPartyAutofill();
  const [isSaving, setIsSaving] = useState(false);
  const [plateInputRef, setPlateInputRef] = useState<HTMLInputElement | null>(
    null
  );
  const cameraAutofill = useCameraPlateAutofill();

  // Data loading states
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)

  const [formState, setFormState] = useState<InSessionFormState>({
    plateNumber: "",
    driverId: "",
    driverName: "",
    productId: "",
    transporterCompanyId: "",
    origin: "",
    destination: "",
    senderOrganizationId: "",
    receiverOrganizationId: "",
    inTime: new Date().toISOString().slice(0, 16),
    grossWeightKg: null,
    hasTrailer: false,
    notes: "",
  })

  // Load all dropdown data
  const loadData = async () => {
    // Load products
    try {
      setIsLoadingProducts(true)
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoadingProducts(false)
    }

    // Load transport companies
    try {
      setIsLoadingCompanies(true)
      const response = await fetch("/api/transport-companies")
      if (response.ok) {
        const data = await response.json()
        setTransportCompanies(data)
      }
    } catch (error) {
      console.error("Error loading transport companies:", error)
    } finally {
      setIsLoadingCompanies(false)
    }

    // Load drivers
    try {
      setIsLoadingDrivers(true)
      const response = await fetch("/api/drivers")
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (error) {
      console.error("Error loading drivers:", error)
    } finally {
      setIsLoadingDrivers(false)
    }

    // Load organizations
    try {
      setIsLoadingOrganizations(true)
      const response = await fetch("/api/organizations")
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
      }
    } catch (error) {
      console.error("Error loading organizations:", error)
    } finally {
      setIsLoadingOrganizations(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle driver added/updated
  const handleDriverAdded = async () => {
    await loadData()
  }

  // Memoize options
  const productOptions = useMemo(() => 
    products
      .map((p) => ({ 
        value: p.id, 
        label: p.label || p.value || String(p.id) 
      }))
      .filter((opt) => opt.label != null && opt.label !== ""), 
    [products]
  )

  const transportCompanyOptions = useMemo(() => 
    transportCompanies
      .filter((c) => c.name != null && c.name !== "")
      .map((c) => ({ value: c.id, label: c.name })), 
    [transportCompanies]
  )

  const driverOptions = useMemo(() => 
    drivers
      .filter((d) => d.name != null && d.name !== "")
      .map((d) => ({ 
        value: d.id, 
        label: `${d.name}${d.phone ? ` (${d.phone})` : ""}` 
      })), 
    [drivers]
  )

  const organizationOptions = useMemo(() => 
    organizations
      .filter((o) => o.name != null && o.name !== "")
      .map((o) => ({ value: o.id, label: o.name })), 
    [organizations]
  )

  // Handle creating new items
  const handleCreateProduct = async (name: string) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: name }),
      })
      if (response.ok) {
        const newProduct = await response.json()
        setProducts((prev) => [...prev, newProduct])
        toast({
          title: "Амжилттай",
          description: "Бүтээгдэхүүн амжилттай нэмэгдлээ",
        })
        return newProduct.id
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({
          title: "Алдаа",
          description: errorData.error || "Бүтээгдэхүүн нэмэхэд алдаа гарлаа",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Алдаа",
        description: "Бүтээгдэхүүн нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
    return null
  }

  const handleCreateTransportCompany = async (name: string) => {
    try {
      const response = await fetch("/api/transport-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (response.ok) {
        const newCompany = await response.json()
        setTransportCompanies((prev) => [...prev, newCompany])
        return newCompany.id
      }
    } catch (error) {
      console.error("Error creating transport company:", error)
    }
    return null
  }

  const handleCreateOrganization = async (name: string) => {
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (response.ok) {
        const newOrg = await response.json()
        setOrganizations((prev) => [...prev, newOrg])
        return newOrg.id
      }
    } catch (error) {
      console.error("Error creating organization:", error)
    }
    return null
  }

  // Bind camera autofill to plate input
  useEffect(() => {
    if (plateInputRef) {
      cameraAutofill.bindToInput({
        getValue: () => formState.plateNumber,
        setValue: (value: string) => {
          setFormState((prev) => ({ ...prev, plateNumber: value }))
        },
        isFocused: () => document.activeElement === plateInputRef,
      })
    }
  }, [plateInputRef, cameraAutofill, formState.plateNumber])

  // Auto-fill plate from camera
  useEffect(() => {
    if (autoFillPlate && !formState.plateNumber) {
      setFormState((prev) => ({ ...prev, plateNumber: autoFillPlate }))
      onPlateChange?.(autoFillPlate)
    }
  }, [autoFillPlate, formState.plateNumber, onPlateChange]);

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
        driverId: formState.driverId || undefined,
        driverName: formState.driverName.trim() || undefined,
        productId: formState.productId || undefined,
        transporterCompanyId: formState.transporterCompanyId || undefined,
        origin: formState.origin.trim() || undefined,
        destination: formState.destination.trim() || undefined,
        senderOrganizationId: formState.senderOrganizationId || undefined,
        receiverOrganizationId: formState.receiverOrganizationId || undefined,
        grossWeightKg: formState.grossWeightKg,
        inTime: formState.inTime ? formState.inTime : undefined,
        hasTrailer: formState.hasTrailer || undefined,
        notes: formState.notes.trim() || undefined,
      }

      const response = await fetch("/api/truck-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save session")
      }

      toast({
        title: "Амжилттай",
        description: "ОРОХ бүртгэл амжилттай хадгалагдлаа",
      })

      // Reset form
      setFormState({
        plateNumber: "",
        driverId: "",
        driverName: "",
        productId: "",
        transporterCompanyId: "",
        origin: "",
        destination: "",
        senderOrganizationId: "",
        receiverOrganizationId: "",
        inTime: new Date().toISOString().slice(0, 16),
        grossWeightKg: null,
        hasTrailer: false,
        notes: "",
      })
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
    <div className="h-full flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="h-full flex flex-col overflow-hidden">
        {/* Form Header - Fixed */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Бүртгэлийн мэдээлэл</h2>
            <p className="text-[10px] text-gray-500">Шаардлагатай талбаруудыг бөглөнө үү</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormState({
                  plateNumber: "",
                  driverId: "",
                  driverName: "",
                  productId: "",
                  transporterCompanyId: "",
                  origin: "",
                  destination: "",
                  senderOrganizationId: "",
                  receiverOrganizationId: "",
                  inTime: new Date().toISOString().slice(0, 16),
                  grossWeightKg: null,
                  hasTrailer: false,
                  notes: "",
                })
              }}
              className="h-7 px-2 text-[10px]"
            >
              Цэвэрлэх
            </Button>
            <Button
              type="submit"
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 h-7 px-3 text-[10px]"
            >
              {isSaving ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>
        </div>

        {/* Form Content - No Scroll, Grid Layout */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 h-full">
            {/* Left Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* Plate Number */}
              <Card className="p-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="plateNumber" className="text-xs font-semibold text-gray-900">
                    Улсын дугаар *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cameraAutofill.isEnabled}
                      onCheckedChange={cameraAutofill.toggleEnabled}
                    />
                    <span className="text-xs text-gray-600">Камера</span>
                  </div>
                </div>
                <Input
                  ref={setPlateInputRef}
                  id="plateNumber"
                  value={formState.plateNumber}
                  onChange={(e) => {
                    cameraAutofill.trackTyping()
                    setFormState((prev) => ({ ...prev, plateNumber: e.target.value }))
                    onPlateChange?.(e.target.value)
                  }}
                  onFocus={() => cameraAutofill.trackTyping()}
                  className="h-10 text-sm font-mono font-semibold"
                  placeholder="ABC1234"
                  required
                />
                {cameraAutofill.status === "polling" && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                    <Camera className="h-3 w-3 animate-pulse" />
                    <span>Камера холбогдож байна...</span>
                  </div>
                )}
                {cameraAutofill.plate && cameraAutofill.lastSeenAt && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Сүүлд: <span className="font-mono font-semibold text-blue-600">{cameraAutofill.plate}</span>
                  </p>
                )}
              </Card>

              {/* Basic Info */}
              <Card className="p-3 flex-1 min-h-0 flex flex-col overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Үндсэн мэдээлэл</h3>
                <div className="flex-1 min-h-0 flex flex-col gap-2">
                  <div>
                    <Label htmlFor="transporterCompanyId" className="text-xs font-medium text-gray-700 mb-1 block">
                      Тээврийн компани *
                    </Label>
                    <FilterableSelect
                      options={transportCompanyOptions}
                      value={formState.transporterCompanyId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({ ...prev, transporterCompanyId: value }))
                      }}
                      disabled={isLoadingCompanies}
                      placeholder={isLoadingCompanies ? "Уншиж байна..." : "Тээврийн компани сонгох"}
                      searchPlaceholder="Тээврийн компани хайх..."
                      onCreateNew={handleCreateTransportCompany}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="origin" className="text-xs font-medium text-gray-700 mb-1 block">
                        Хаанаас
                      </Label>
                      <Input
                        id="origin"
                        value={formState.origin}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, origin: e.target.value }))
                        }
                        className="h-9 text-sm"
                        placeholder="Гарах газар"
                      />
                    </div>
                    <div>
                      <Label htmlFor="destination" className="text-xs font-medium text-gray-700 mb-1 block">
                        Хаашаа
                      </Label>
                      <Input
                        id="destination"
                        value={formState.destination}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, destination: e.target.value }))
                        }
                        className="h-9 text-sm"
                        placeholder="Очих газар"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="productId" className="text-xs font-medium text-gray-700 mb-1 block">
                      Бүтээгдэхүүн *
                    </Label>
                    <FilterableSelect
                      options={productOptions}
                      value={formState.productId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({ ...prev, productId: value }))
                      }}
                      disabled={isLoadingProducts}
                      placeholder={isLoadingProducts ? "Уншиж байна..." : "Бүтээгдэхүүн сонгох"}
                      searchPlaceholder="Бүтээгдэхүүн хайх..."
                      onCreateNew={handleCreateProduct}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderOrganizationId" className="text-xs font-medium text-gray-700 mb-1 block">
                      Илгээч байгууллага
                    </Label>
                    <FilterableSelect
                      options={organizationOptions}
                      value={formState.senderOrganizationId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({ ...prev, senderOrganizationId: value }))
                      }}
                      disabled={isLoadingOrganizations}
                      placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Илгээч байгууллага сонгох"}
                      searchPlaceholder="Илгээч байгууллага хайх..."
                      onCreateNew={handleCreateOrganization}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiverOrganizationId" className="text-xs font-medium text-gray-700 mb-1 block">
                      Хүлээн авагч байгууллага
                    </Label>
                    <FilterableSelect
                      options={organizationOptions}
                      value={formState.receiverOrganizationId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({ ...prev, receiverOrganizationId: value }))
                      }}
                      disabled={isLoadingOrganizations}
                      placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Хүлээн авагч байгууллага сонгох"}
                      searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                      onCreateNew={handleCreateOrganization}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="driverId" className="text-xs font-medium text-gray-700">
                        Жолооч *
                      </Label>
                      <div className="flex items-center gap-1">
                        <DriverManager
                          drivers={drivers}
                          onDriverAdded={handleDriverAdded}
                          onDriverUpdated={handleDriverAdded}
                        />
                      </div>
                    </div>
                    <FilterableSelect
                      options={driverOptions}
                      value={formState.driverId}
                      onValueChange={(value) => {
                        const selectedDriver = drivers.find((d) => d.id === value)
                        setFormState((prev) => ({ 
                          ...prev, 
                          driverId: value,
                          driverName: selectedDriver?.name || ""
                        }))
                      }}
                      disabled={isLoadingDrivers}
                      placeholder={isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"}
                      searchPlaceholder="Жолооч хайх..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasTrailer"
                      checked={formState.hasTrailer}
                      onCheckedChange={(checked) => {
                        setFormState((prev) => ({ ...prev, hasTrailer: checked === true }))
                      }}
                    />
                    <Label htmlFor="hasTrailer" className="text-xs font-medium text-gray-700 cursor-pointer">
                      Чиргүүлтэй
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="inTime" className="text-xs font-medium text-gray-700 mb-1 block">
                      Орох цаг *
                    </Label>
                    <Input
                      id="inTime"
                      type="datetime-local"
                      value={formState.inTime}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, inTime: e.target.value }))
                      }
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* Weight Section */}
              <Card className="p-3 border-2 border-green-200 bg-green-50/30 flex-1 min-h-0 flex flex-col">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Жингийн мэдээлэл</h3>
                <div className="flex-1 min-h-0 flex flex-col gap-2">
                  <InSessionWeightConnector onWeightDetected={handleWeightDetected} />
                  <div>
                    <Label htmlFor="grossWeightKg" className="text-xs font-medium text-gray-700 mb-1 block">
                      Бүрэн жин (кг) *
                    </Label>
                    <Input
                      id="grossWeightKg"
                      type="number"
                      value={formState.grossWeightKg ?? ""}
                      readOnly
                      className="bg-white font-semibold text-sm cursor-not-allowed h-9"
                      placeholder="Жин автоматаар оруулах"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-3 flex-1 min-h-0 flex flex-col">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Нэмэлт мэдээлэл</h3>
                <Textarea
                  id="notes"
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="text-sm flex-1 min-h-0 resize-none"
                  placeholder="Нэмэлт мэдээлэл..."
                />
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
