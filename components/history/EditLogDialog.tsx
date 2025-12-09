"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterableSelect } from "@/components/ui/filterable-select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera, CheckCircle2, Clock, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DriverManager } from "@/components/drivers/DriverManager"
import type { TruckLog, TransportCompany, Organization, Driver } from "@/lib/types"

interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
}

interface EditLogDialogProps {
  log: TruckLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditLogDialog({
  log,
  open,
  onOpenChange,
  onSuccess,
}: EditLogDialogProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form state (matching TruckSection structure)
  const [plate, setPlate] = useState("")
  const [driverId, setDriverId] = useState<string>("")
  const [driverName, setDriverName] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [weight, setWeight] = useState("")
  const [netWeight, setNetWeight] = useState("") // Цэвэр жин (net weight) - only for OUT
  const [comments, setComments] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [senderOrganizationId, setSenderOrganizationId] = useState<string>("")
  const [receiverOrganizationId, setReceiverOrganizationId] = useState<string>("")
  const [transportCompanyId, setTransportCompanyId] = useState<string>("")
  const [sealNumber, setSealNumber] = useState("")
  const [hasTrailer, setHasTrailer] = useState(false)
  const [trailerPlate, setTrailerPlate] = useState("")
  const [direction, setDirection] = useState<"IN" | "OUT">("IN")

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
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

      // Load organizations (shared pool)
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

    loadData()
  }, [])

  const handleProductAdded = () => {
    async function reloadProducts() {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error reloading products:", error)
      }
    }
    reloadProducts()
  }

  const handleCompanyAdded = () => {
    async function reloadCompanies() {
      try {
        const response = await fetch("/api/transport-companies")
        if (response.ok) {
          const data = await response.json()
          setTransportCompanies(data)
        }
      } catch (error) {
        console.error("Error reloading companies:", error)
      }
    }
    reloadCompanies()
  }

  const handleDriverAdded = () => {
    async function reloadDrivers() {
      try {
        const response = await fetch("/api/drivers")
        if (response.ok) {
          const data = await response.json()
          setDrivers(data)
        }
      } catch (error) {
        console.error("Error reloading drivers:", error)
      }
    }
    reloadDrivers()
  }

  const handleOrganizationAdded = () => {
    async function reloadOrganizations() {
      try {
        const response = await fetch("/api/organizations")
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data)
        }
      } catch (error) {
        console.error("Error reloading organizations:", error)
      }
    }
    reloadOrganizations()
  }

  // Handle creating a new organization (shared for both sender and receiver)
  const handleCreateOrganization = async (name: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          // Organization already exists, try to find it
          const existingResponse = await fetch("/api/organizations")
          if (existingResponse.ok) {
            const orgs = await existingResponse.json()
            const existing = orgs.find((org: Organization) => 
              org.name.toLowerCase() === name.trim().toLowerCase()
            )
            if (existing) {
              handleOrganizationAdded()
              return existing.id
            }
          }
        }
        toast({
          title: "Алдаа",
          description: errorData.error || "Байгууллага нэмэхэд алдаа гарлаа",
          variant: "destructive",
        })
        return null
      }

      const newOrg = await response.json()
      handleOrganizationAdded()
      toast({
        title: "Амжилттай",
        description: `"${newOrg.name}" байгууллага нэмэгдлээ`,
      })
      return newOrg.id
    } catch (error) {
      console.error("Error creating organization:", error)
      toast({
        title: "Алдаа",
        description: "Байгууллага нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
      return null
    }
  }

  // Initialize form data when log changes
  useEffect(() => {
    if (log) {
      setPlate(log.plate || "")
      setDriverId(log.driverId || "")
      setDriverName(log.driverName || "")
      setCargoType(log.cargoType || "")
      setWeight(log.weightKg?.toString() || "")
      setNetWeight(log.netWeightKg?.toString() || "")
      setComments(log.comments || "")
      setOrigin(log.origin || "")
      setDestination(log.destination || "")
      setSenderOrganizationId(log.senderOrganizationId || "")
      setReceiverOrganizationId(log.receiverOrganizationId || "")
      setTransportCompanyId(log.transportCompanyId || "")
      setSealNumber(log.sealNumber || "")
      setHasTrailer(log.hasTrailer || false)
      setTrailerPlate(log.trailerPlate || "")
      setDirection(log.direction)
      setErrors({})
    }
  }, [log])

  // Auto-calculate net weight for OUT direction
  useEffect(() => {
    if (direction === "OUT" && weight && plate && Number(weight) > 0) {
      async function calculateNetWeight() {
        try {
          // Fetch logs to find the IN log for this plate
          const response = await fetch("/api/logs?page=1&limit=100")
          if (response.ok) {
            const data = await response.json()
            const logs = data.logs || []
            
            // Find the most recent IN log for the same plate (excluding current log if editing)
            const inLog = logs
              .filter((logItem: TruckLog) => 
                logItem.direction === "IN" && 
                logItem.plate.trim().toUpperCase() === plate.trim().toUpperCase() &&
                logItem.weightKg &&
                logItem.weightKg > 0 &&
                (!log || logItem.id !== log.id) // Exclude current log if editing
              )
              .sort((a: TruckLog, b: TruckLog) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0]

            if (inLog && inLog.weightKg) {
              const outWeight = Number(weight)
              const inWeight = inLog.weightKg
              const calculatedNetWeight = outWeight - inWeight
              
              if (calculatedNetWeight > 0) {
                setNetWeight(Math.round(calculatedNetWeight).toString())
              } else {
                setNetWeight("")
              }
            } else {
              // If no IN log found, keep existing netWeight if it exists, otherwise clear it
              if (!log?.netWeightKg) {
                setNetWeight("")
              }
            }
          }
        } catch (error) {
          console.error("Error calculating net weight:", error)
          // Keep existing netWeight if it exists
          if (!log?.netWeightKg) {
            setNetWeight("")
          }
        }
      }
      
      calculateNetWeight()
    } else if (direction === "IN" || !weight || !plate || Number(weight) <= 0) {
      setNetWeight("")
    }
  }, [direction, weight, plate, log])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!plate.trim()) {
      newErrors.plate = "Улсын дугаар заавал оруулна."
    }
    if (!driverId) {
      newErrors.driverId = "Жолооч сонгох заавал оруулна."
    }
    if (!cargoType.trim()) {
      newErrors.cargoType = "Бүтээгдэхүүний төрөл заавал оруулна."
    }
    if (!weight.trim()) {
      newErrors.weight = "Жин заавал оруулна."
    } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = "Жин эерэг тоо байх ёстой."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Memoize organization options to prevent infinite re-renders (must be before conditional return)
  const organizationOptions = useMemo(() => 
    organizations.map((org) => ({
      value: org.id,
      label: org.name,
    })), 
    [organizations]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!log) return

    if (!validate()) {
      return
    }

    setIsSaving(true)
    try {
      // Get driver name from selected driver
      const selectedDriver = drivers.find(d => d.id === driverId)
      if (!selectedDriver) {
        toast({
          title: "Error",
          description: "Please select a driver",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/logs/${log.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direction,
          plate: plate.trim(),
          driverId: driverId,
          driverName: selectedDriver.name,
          cargoType: cargoType.trim(),
          weightKg: Number(weight),
          netWeightKg: direction === "OUT" && netWeight ? Number(netWeight) : undefined,
          comments: comments.trim() || undefined,
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          senderOrganizationId: senderOrganizationId || undefined,
          receiverOrganizationId: receiverOrganizationId || undefined,
          transportCompanyId: transportCompanyId || undefined,
          sealNumber: sealNumber.trim() || undefined,
          hasTrailer: hasTrailer || undefined,
          trailerPlate: hasTrailer ? (trailerPlate.trim() || undefined) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update log")
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн хэрэгслийн бүртгэлийг амжилттай шинэчиллээ.",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Бүртгэлийг шинэчлэх амжилтгүй боллоо",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!log) return null

  const isSentToCustoms = log.sentToCustoms
  const title = direction === "IN" ? "Тээврийн хэрэгсэл ОРОХ – Хаалгаар орох" : "Тээврийн хэрэгсэл ГАРАХ – Хаалгаар гарах"
  const weightLabel = direction === "IN" ? "Бүрэн жин (кг)" : "Бүрэн жин (кг)"
  
  // Mock plate recognition data
  const confidence = 98.5
  const timestamp = new Date(log.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !w-screen !h-screen !max-h-screen !top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !rounded-none p-0" style={{ width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh' }}>
        <DialogTitle className="sr-only">Edit Truck Log</DialogTitle>
        <DialogDescription className="sr-only">
          Update the truck log information below.
        </DialogDescription>
        <div className="p-6 h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-gray-900 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
                {isSentToCustoms ? "Дахин засах: " : "Засах: "}{title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {isSentToCustoms && (
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-2.5 py-1">
                    Гаалинд илгээсэн
                  </Badge>
                )}
                <Badge className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Танигдсан
                </Badge>
              </div>
            </div>
            {isSentToCustoms && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Анхаар:</strong> Энэ бүртгэл гаалинд илгээгдсэн байна. Засварласны дараа дахин илгээх шаардлагатай.
                </p>
              </div>
            )}
          </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* License Plate Recognition */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Улсын дугаарыг бодит цагт таних
                  </h3>
                  
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative border-2 border-gray-200 mb-4">
                    <img 
                      src="/truck-front-view-license-plate.jpg" 
                      alt="Truck camera feed" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Танигдсан дугаар</p>
                          <p className="text-xl font-mono font-bold text-blue-600 tracking-wider">{plate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500 mb-1">Найдвартай байдал</p>
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-green-600" />
                            <p className="text-lg font-bold text-green-600">{confidence}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Авагдсан</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{timestamp}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-1">Боловсруулах хугацаа</p>
                      <p className="text-sm font-semibold text-gray-900">0.82s</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* 1. Улсын дугаар input */}
                  <div>
                    <Label htmlFor="edit-plate" className="text-sm font-medium text-gray-700">
                      Улсын дугаар
                    </Label>
                    <Input
                      id="edit-plate"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Улсын дугаар оруулах"
                    />
                    {errors.plate && (
                      <p className="mt-1 text-xs text-red-600">{errors.plate}</p>
                    )}
                  </div>

                  {/* 2. Weight input */}
                  <div>
                    <Label htmlFor="edit-weight" className="text-sm font-medium text-gray-700">
                      {weightLabel}
                    </Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Жин (кг) оруулах"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
                    )}
                  </div>

                  {/* Net weight input - only for OUT direction (auto-calculated) */}
                  {direction === "OUT" && (
                    <div>
                      <Label htmlFor="edit-net-weight" className="text-sm font-medium text-gray-700">
                        Цэвэр жин (кг) <span className="text-xs text-gray-500 font-normal">(автоматаар тооцоолно)</span>
                      </Label>
                      <Input
                        id="edit-net-weight"
                        type="number"
                        value={netWeight}
                        readOnly
                        className="mt-1 bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
                        placeholder="Цэвэр жин автоматаар тооцоологдоно"
                      />
                      {errors.netWeight && (
                        <p className="mt-1 text-xs text-red-600">{errors.netWeight}</p>
                      )}
                    </div>
                  )}

                  {/* 3. Transport company dropdown */}
                  <div>
                    <Label htmlFor="edit-transport-company" className="text-sm font-medium text-gray-700 mb-2 block">
                      Тээврийн компани
                    </Label>
                    <FilterableSelect
                      options={transportCompanies.map((company) => ({
                        value: company.id,
                        label: company.name,
                      }))}
                      value={transportCompanyId}
                      onValueChange={(value) => setTransportCompanyId(value)}
                      disabled={isLoadingCompanies}
                      placeholder={isLoadingCompanies ? "Уншиж байна..." : "Тээврийн компани сонгох"}
                      searchPlaceholder="Тээврийн компани хайх..."
                    />
                  </div>

                  {/* 4. Route fields (Haanaas & Haashaa) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-origin" className="text-sm font-medium text-gray-700">
                        Хаанаас
                      </Label>
                      <Input
                        id="edit-origin"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Гарах газар"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-destination" className="text-sm font-medium text-gray-700">
                        Хаашаа
                      </Label>
                      <Input
                        id="edit-destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Очих газар"
                      />
                    </div>
                  </div>

                  {/* 5. Product type dropdown */}
                  <div>
                    <Label htmlFor="edit-cargo" className="text-sm font-medium text-gray-700 mb-2 block">
                      Бүтээгдэхүүн
                    </Label>
                    <FilterableSelect
                      options={products.map((product: Product) => ({
                        value: product.value,
                        label: product.label,
                      }))}
                      value={cargoType}
                      onValueChange={setCargoType}
                      disabled={isLoadingProducts}
                      placeholder={isLoadingProducts ? "Уншиж байна..." : "Бүтээгдэхүүн сонгох"}
                      searchPlaceholder="Бүтээгдэхүүн хайх..."
                    />
                    {errors.cargoType && (
                      <p className="mt-1 text-xs text-red-600">{errors.cargoType}</p>
                    )}
                  </div>

                  {/* 6. Sender/Receiver dropdowns */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-sender" className="text-sm font-medium text-gray-700 mb-2 block">
                        Илгээч байгууллага
                      </Label>
                      <FilterableSelect
                        options={organizationOptions}
                        value={senderOrganizationId}
                        onValueChange={(value) => setSenderOrganizationId(value)}
                        disabled={isLoadingOrganizations}
                        placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Илгээч байгууллага сонгох"}
                        searchPlaceholder="Илгээч байгууллага хайх..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-receiver" className="text-sm font-medium text-gray-700 mb-2 block">
                        Хүлээн авагч байгууллага
                      </Label>
                      <FilterableSelect
                        options={organizationOptions}
                        value={receiverOrganizationId}
                        onValueChange={(value) => setReceiverOrganizationId(value)}
                        disabled={isLoadingOrganizations}
                        placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Хүлээн авагч байгууллага сонгох"}
                        searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                      />
                    </div>
                  </div>

                  {/* 7. Driver registration & selection */}
                  <div>
                    <Label htmlFor="edit-driver" className="text-sm font-medium text-gray-700 mb-2 block">
                      Жолооч
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <FilterableSelect
                          options={drivers.map((driver) => ({
                            value: driver.id,
                            label: `${driver.name}${driver.phone ? ` (${driver.phone})` : ""}`,
                          }))}
                          value={driverId}
                          onValueChange={(value) => {
                            const selectedDriver = drivers.find(d => d.id === value)
                            setDriverId(value)
                            setDriverName(selectedDriver?.name || "")
                          }}
                          disabled={isLoadingDrivers}
                          placeholder={isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"}
                          searchPlaceholder="Жолооч хайх..."
                        />
                      </div>
                      <DriverManager 
                        drivers={drivers} 
                        onDriverAdded={handleDriverAdded} 
                        onDriverUpdated={handleDriverAdded} 
                      />
                    </div>
                    {errors.driverId && (
                      <p className="mt-1 text-xs text-red-600">{errors.driverId}</p>
                    )}
                  </div>

                  {/* 8. Seal number input - only show for OUT direction */}
                  {direction === "OUT" && (
                    <div>
                      <Label htmlFor="edit-seal" className="text-sm font-medium text-gray-700">
                        Лацны дугаар
                      </Label>
                      <Input
                        id="edit-seal"
                        value={sealNumber}
                        onChange={(e) => setSealNumber(e.target.value)}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Лацны дугаар оруулах"
                      />
                    </div>
                  )}

                  {/* 9. Chirguultei checkbox (show/hide trailer fields) */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-has-trailer"
                      checked={hasTrailer}
                      onCheckedChange={(checked) => {
                        setHasTrailer(checked === true)
                        if (!checked) {
                          setTrailerPlate("")
                        }
                      }}
                    />
                    <Label
                      htmlFor="edit-has-trailer"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Чиргүүлтэй
                    </Label>
                  </div>

                  {/* Trailer fields (shown when hasTrailer is true) */}
                  {hasTrailer && (
                    <div>
                      <Label htmlFor="edit-trailer-plate" className="text-sm font-medium text-gray-700">
                        Чиргүүлийн улсын дугаар
                      </Label>
                      <Input
                        id="edit-trailer-plate"
                        value={trailerPlate}
                        onChange={(e) => setTrailerPlate(e.target.value)}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Чиргүүлийн улсын дугаар"
                      />
                    </div>
                  )}

                  {/* 10. Additional notes textarea */}
                  <div>
                    <Label htmlFor="edit-comments" className="text-sm font-medium text-gray-700">
                      Нэмэлт
                    </Label>
                    <Textarea
                      id="edit-comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Нэмэлт мэдээлэл..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSaving}
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Цуцлах
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Хадгалж байна...
                      </>
                    ) : (
                      "Өөрчлөлт хадгалах"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
