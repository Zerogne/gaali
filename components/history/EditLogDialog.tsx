"use client"

import { useState, useEffect } from "react"
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
import { ProductManager } from "@/components/products/ProductManager"
import { TransportCompanyManager } from "@/components/transport/TransportCompanyManager"
import { DriverManager } from "@/components/drivers/DriverManager"
import { OrganizationManager } from "@/components/organizations/OrganizationManager"
import type { TruckLog, TransportCompany, Organization, Driver, TransportType } from "@/lib/types"

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
  const [senderOrganizations, setSenderOrganizations] = useState<Organization[]>([])
  const [receiverOrganizations, setReceiverOrganizations] = useState<Organization[]>([])
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form state (matching TruckSection structure)
  const [plate, setPlate] = useState("")
  const [driverId, setDriverId] = useState<string>("")
  const [driverName, setDriverName] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [weight, setWeight] = useState("")
  const [comments, setComments] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [senderOrganizationId, setSenderOrganizationId] = useState<string>("")
  const [receiverOrganizationId, setReceiverOrganizationId] = useState<string>("")
  const [transportCompanyId, setTransportCompanyId] = useState<string>("")
  const [transportType, setTransportType] = useState<TransportType | "">("")
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

      // Load sender organizations
      try {
        setIsLoadingOrganizations(true)
        const senderResponse = await fetch("/api/organizations?type=sender")
        if (senderResponse.ok) {
          const senderData = await senderResponse.json()
          setSenderOrganizations(senderData)
        }
      } catch (error) {
        console.error("Error loading sender organizations:", error)
      }

      // Load receiver organizations
      try {
        const receiverResponse = await fetch("/api/organizations?type=receiver")
        if (receiverResponse.ok) {
          const receiverData = await receiverResponse.json()
          setReceiverOrganizations(receiverData)
        }
      } catch (error) {
        console.error("Error loading receiver organizations:", error)
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

  const handleSenderOrganizationAdded = () => {
    async function reloadSenderOrganizations() {
      try {
        const response = await fetch("/api/organizations?type=sender")
        if (response.ok) {
          const data = await response.json()
          setSenderOrganizations(data)
        }
      } catch (error) {
        console.error("Error reloading sender organizations:", error)
      }
    }
    reloadSenderOrganizations()
  }

  const handleReceiverOrganizationAdded = () => {
    async function reloadReceiverOrganizations() {
      try {
        const response = await fetch("/api/organizations?type=receiver")
        if (response.ok) {
          const data = await response.json()
          setReceiverOrganizations(data)
        }
      } catch (error) {
        console.error("Error reloading receiver organizations:", error)
      }
    }
    reloadReceiverOrganizations()
  }

  // Initialize form data when log changes
  useEffect(() => {
    if (log) {
      setPlate(log.plate || "")
      setDriverId(log.driverId || "")
      setDriverName(log.driverName || "")
      setCargoType(log.cargoType || "")
      setWeight(log.weightKg?.toString() || "")
      setComments(log.comments || "")
      setOrigin(log.origin || "")
      setDestination(log.destination || "")
      setSenderOrganizationId(log.senderOrganizationId || "")
      setReceiverOrganizationId(log.receiverOrganizationId || "")
      setTransportCompanyId(log.transportCompanyId || "")
      setTransportType(log.transportType || "")
      setSealNumber(log.sealNumber || "")
      setHasTrailer(log.hasTrailer || false)
      setTrailerPlate(log.trailerPlate || "")
      setDirection(log.direction)
      setErrors({})
    }
  }, [log])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!plate.trim()) {
      newErrors.plate = "Улсын дугаар заавал оруулна."
    }
    if (!driverId && !driverName.trim()) {
      newErrors.driverName = "Жолоочийн нэр эсвэл жолооч сонгох заавал оруулна."
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!log) return

    if (!validate()) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/logs/${log.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direction,
          plate: plate.trim(),
          driverId: driverId || undefined,
          driverName: driverName.trim(),
          cargoType: cargoType.trim(),
          weightKg: Number(weight),
          comments: comments.trim() || undefined,
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          senderOrganizationId: senderOrganizationId || undefined,
          receiverOrganizationId: receiverOrganizationId || undefined,
          transportCompanyId: transportCompanyId || undefined,
          transportType: transportType || undefined,
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
  const weightLabel = direction === "IN" ? "Бүрэн жин (кг)" : "Цэвэр жин (кг)"
  
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Edit Truck Log</DialogTitle>
        <DialogDescription className="sr-only">
          Update the truck log information below.
        </DialogDescription>
        {isSentToCustoms ? (
          <div className="p-6">
            <p className="text-sm text-gray-600">
              Энэ бүртгэл гаалид илгээгдсэн тул засварлах боломжгүй.
            </p>
          </div>
        ) : (
          <Card className="border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-gray-900 text-lg font-semibold">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </div>
                  Засах: {title}
                </CardTitle>
                <Badge className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Танигдсан
                </Badge>
              </div>
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

                  {/* 3. Жин input */}
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

                  {/* Direction */}
                  <div>
                    <Label htmlFor="edit-direction" className="text-sm font-medium text-gray-700">
                      Чиглэл
                    </Label>
                    <Select
                      value={direction}
                      onValueChange={(value: "IN" | "OUT") => setDirection(value)}
                    >
                      <SelectTrigger id="edit-direction" className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Чиглэл сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">ОРОХ</SelectItem>
                        <SelectItem value="OUT">ГАРАХ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 4. Тээврийн компани dropdown + "Add New" */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="edit-transport-company" className="text-sm font-medium text-gray-700">
                        Тээврийн компани
                      </Label>
                      <TransportCompanyManager companies={transportCompanies} onCompanyAdded={handleCompanyAdded} />
                    </div>
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
                      className="mt-1"
                    />
                  </div>

                  {/* 5. Хаанаас & Хаашаа */}
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

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="edit-cargo" className="text-sm font-medium text-gray-700">
                        Бүтээгдэхүүн (Cargo)
                      </Label>
                      <ProductManager products={products} onProductAdded={handleProductAdded} />
                    </div>
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
                      className="mt-1"
                    />
                    {errors.cargoType && (
                      <p className="mt-1 text-xs text-red-600">{errors.cargoType}</p>
                    )}
                  </div>

                  {/* 7. Илгээч/Хүлээн авагч dropdowns + add/edit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="edit-sender" className="text-sm font-medium text-gray-700">
                          Илгээч байгууллага
                        </Label>
                        <OrganizationManager
                          organizations={senderOrganizations}
                          type="sender"
                          onOrganizationAdded={handleSenderOrganizationAdded}
                          onOrganizationUpdated={handleSenderOrganizationAdded}
                        />
                      </div>
                      <FilterableSelect
                        options={senderOrganizations.map((org) => ({
                          value: org.id,
                          label: org.name,
                        }))}
                        value={senderOrganizationId}
                        onValueChange={(value) => setSenderOrganizationId(value)}
                        disabled={isLoadingOrganizations}
                        placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Илгээч байгууллага сонгох"}
                        searchPlaceholder="Илгээч байгууллага хайх..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="edit-receiver" className="text-sm font-medium text-gray-700">
                          Хүлээн авагч байгууллага
                        </Label>
                        <OrganizationManager
                          organizations={receiverOrganizations}
                          type="receiver"
                          onOrganizationAdded={handleReceiverOrganizationAdded}
                          onOrganizationUpdated={handleReceiverOrganizationAdded}
                        />
                      </div>
                      <FilterableSelect
                        options={receiverOrganizations.map((org) => ({
                          value: org.id,
                          label: org.name,
                        }))}
                        value={receiverOrganizationId}
                        onValueChange={(value) => setReceiverOrganizationId(value)}
                        disabled={isLoadingOrganizations}
                        placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Хүлээн авагч байгууллага сонгох"}
                        searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* 8. Жолооч registration & selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="edit-driver" className="text-sm font-medium text-gray-700">
                        Жолооч
                      </Label>
                      <DriverManager drivers={drivers} onDriverAdded={handleDriverAdded} onDriverUpdated={handleDriverAdded} />
                    </div>
                    <FilterableSelect
                      options={drivers.map((driver) => ({
                        value: driver.id,
                        label: `${driver.name}${driver.licenseNumber ? ` (${driver.licenseNumber})` : ""}`,
                      }))}
                      value={driverId}
                      onValueChange={(value) => {
                        const selectedDriver = drivers.find(d => d.id === value)
                        setDriverId(value)
                        setDriverName(selectedDriver?.name || "")
                      }}
                      disabled={isLoadingDrivers}
                      placeholder={isLoadingDrivers ? "Уншиж байна..." : driverName || "Жолооч сонгох"}
                      searchPlaceholder="Жолооч хайх..."
                      className="mt-1"
                    />
                    {!driverId && (
                      <Input
                        id="edit-driver-manual"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Эсвэл жолоочийн нэрийг гараар оруулах"
                      />
                    )}
                    {errors.driverName && (
                      <p className="mt-1 text-xs text-red-600">{errors.driverName}</p>
                    )}
                  </div>

                  {/* 9. Тамганы дугаар input */}
                  <div>
                    <Label htmlFor="edit-seal" className="text-sm font-medium text-gray-700">
                      Тамганы дугаар
                    </Label>
                    <Input
                      id="edit-seal"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Тамганы дугаар оруулах"
                    />
                  </div>

                  {/* 10. Тээврийн төрөл dropdown */}
                  <div>
                    <Label htmlFor="edit-transport-type" className="text-sm font-medium text-gray-700">
                      Тээврийн төрөл
                    </Label>
                    <Select
                      value={transportType}
                      onValueChange={(value) => setTransportType(value as TransportType)}
                    >
                      <SelectTrigger id="edit-transport-type" className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Тээврийн төрөл сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Ачааны машин</SelectItem>
                        <SelectItem value="container">Контейнер</SelectItem>
                        <SelectItem value="tanker">Тусгай зориулалтын машин</SelectItem>
                        <SelectItem value="flatbed">Хавтгай тавцант машин</SelectItem>
                        <SelectItem value="refrigerated">Хөргүүртэй машин</SelectItem>
                        <SelectItem value="other">Бусад</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 11. Чиргүүлтэй checkbox (show/hide trailer fields) */}
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
                        placeholder="Чиргүүлийн улсын дугаар оруулах"
                      />
                    </div>
                  )}

                  {/* 12. Нэмэлт textarea */}
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

                  <div>
                    <Label htmlFor="edit-comments" className="text-sm font-medium text-gray-700">
                      Нэмэлт (Additional Notes)
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}

