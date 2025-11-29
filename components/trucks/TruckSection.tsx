"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterableSelect } from "@/components/ui/filterable-select"
import { Camera, CheckCircle2, Clock, Zap, Loader2 } from "lucide-react"
import type { Direction, TruckLog } from "@/lib/types"
import { saveTruckLog, sendTruckLogToCustoms } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ProductManager } from "@/components/products/ProductManager"
import { TransportCompanyManager } from "@/components/transport/TransportCompanyManager"
import { DriverManager } from "@/components/drivers/DriverManager"
import { OrganizationManager } from "@/components/organizations/OrganizationManager"
import { Checkbox } from "@/components/ui/checkbox"
import type { TransportCompany, Organization, Driver, TransportType } from "@/lib/types"

interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
}

interface TruckSectionProps {
  direction: Direction
  onSave: (log: TruckLog) => void
  onSend: (logId: string) => void
}

export function TruckSection({ direction, onSave, onSend }: TruckSectionProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [savedLogId, setSavedLogId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)
  const [senderOrganizations, setSenderOrganizations] = useState<Organization[]>([])
  const [receiverOrganizations, setReceiverOrganizations] = useState<Organization[]>([])
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)

  // Form state
  const [plate, setPlate] = useState("Б1234АВ")
  const [driverId, setDriverId] = useState<string>("")
  const [driverName, setDriverName] = useState("") // Fallback for manual entry
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

  // Mock plate recognition data
  const confidence = 98.5
  const timestamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!plate.trim()) {
      newErrors.plate = "Plate number is required"
    }
    if (!driverName.trim()) {
      newErrors.driverName = "Driver name is required"
    }
    if (!cargoType.trim()) {
      newErrors.cargoType = "Cargo type is required"
    }
    if (!weight.trim()) {
      newErrors.weight = "Weight is required"
    } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = "Weight must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    // Early return if already saving (double-click protection)
    if (isSaving) {
      return
    }

    if (!validate()) {
      return
    }

    setIsSaving(true)
    try {
      // Get driver name from selected driver or use manual entry
      const selectedDriver = driverId ? drivers.find(d => d.id === driverId) : null
      const finalDriverName = selectedDriver?.name || driverName.trim()

      const log = await saveTruckLog({
        direction,
        plate: plate.trim(),
        driverId: driverId || undefined,
        driverName: finalDriverName,
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
      })

      setSavedLogId(log.id)
      onSave(log)
      
      toast({
        title: "Success",
        description: `${direction === "IN" ? "Inbound" : "Outbound"} truck saved to log`,
      })

      // Reset form (but keep plate and savedLogId for sending)
      setDriverId("")
      setDriverName("")
      setCargoType("")
      setWeight("")
      setComments("")
      setOrigin("")
      setDestination("")
      setSenderOrganizationId("")
      setReceiverOrganizationId("")
      setTransportCompanyId("")
      setTransportType("")
      setSealNumber("")
      setHasTrailer(false)
      setTrailerPlate("")
      setErrors({})
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save truck log",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset savedLogId when form fields change (user is entering new data)
  const handleFieldChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    if (savedLogId) {
      setSavedLogId(null)
    }
  }

  const handleSend = async () => {
    // Early return if already sending (double-click protection)
    if (isSending) {
      return
    }

    if (!savedLogId) {
      toast({
        title: "Error",
        description: "Please save the truck log first",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const result = await sendTruckLogToCustoms(savedLogId)
      
      if (result.success) {
        onSend(savedLogId)
        toast({
          title: "Success",
          description: "Data successfully sent to Mongolian Customs",
        })
        setSavedLogId(null) // Reset after successful send
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send to customs",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send to customs",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const title = direction === "IN" ? "Тээврийн хэрэгсэл ОРОХ – Хаалгаар орох" : "Тээврийн хэрэгсэл ГАРАХ – Хаалгаар гарах"
  const weightLabel = direction === "IN" ? "Бүрэн жин (кг)" : "Цэвэр жин (кг)"

  return (
    <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-gray-900 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-blue-50">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            {title}
          </CardTitle>
          <Badge className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Танигдсан
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
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
          <div>
            <Label htmlFor={`plate-${direction}`} className="text-sm font-medium text-gray-700">
              Улсын дугаар
            </Label>
            <Input
              id={`plate-${direction}`}
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Улсын дугаар оруулах"
            />
            {errors.plate && (
              <p className="mt-1 text-xs text-red-600">{errors.plate}</p>
            )}
          </div>

          {/* 3. IN weight input (manual for now) */}
          <div>
            <Label htmlFor={`weight-${direction}`} className="text-sm font-medium text-gray-700">
              {weightLabel}
            </Label>
            <Input
              id={`weight-${direction}`}
              type="number"
              value={weight}
              onChange={(e) => handleFieldChange(setWeight, e.target.value)}
              className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Жин (кг) оруулах"
            />
            {errors.weight && (
              <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
            )}
          </div>

          {/* 4. Transport company dropdown + "Add New" */}
          <div>
            <Label htmlFor={`transport-company-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
              Тээврийн компани
            </Label>
            <div className="flex gap-2 items-center">
              <FilterableSelect
                options={transportCompanies.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                value={transportCompanyId}
                onValueChange={(value) => {
                  handleFieldChange(setTransportCompanyId, value)
                  setTransportCompanyId(value)
                }}
                disabled={isLoadingCompanies}
                placeholder={isLoadingCompanies ? "Уншиж байна..." : "Тээврийн компани сонгох"}
                searchPlaceholder="Тээврийн компани хайх..."
                className="flex-1"
              />
              <TransportCompanyManager companies={transportCompanies} onCompanyAdded={handleCompanyAdded} />
            </div>
          </div>

          {/* 5. Route fields (Haanaas & Haashaa) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`origin-${direction}`} className="text-sm font-medium text-gray-700">
                Хаанаас
              </Label>
              <Input
                id={`origin-${direction}`}
                value={origin}
                onChange={(e) => handleFieldChange(setOrigin, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Гарах газар"
              />
            </div>
            <div>
              <Label htmlFor={`destination-${direction}`} className="text-sm font-medium text-gray-700">
                Хаашаа
              </Label>
              <Input
                id={`destination-${direction}`}
                value={destination}
                onChange={(e) => handleFieldChange(setDestination, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Очих газар"
              />
            </div>
          </div>

          {/* 6. Product type dropdown + "Add New" */}
          <div>
            <Label htmlFor={`cargo-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
              Бүтээгдэхүүн
            </Label>
            <div className="flex gap-2 items-center">
              <FilterableSelect
                options={products.map((product: Product) => ({
                  value: product.value,
                  label: product.label,
                }))}
                value={cargoType}
                onValueChange={(value) => handleFieldChange(setCargoType, value)}
                disabled={isLoadingProducts}
                placeholder={isLoadingProducts ? "Уншиж байна..." : "Бүтээгдэхүүн сонгох"}
                searchPlaceholder="Бүтээгдэхүүн хайх..."
                className="flex-1"
              />
              <ProductManager products={products} onProductAdded={handleProductAdded} />
            </div>
            {errors.cargoType && (
              <p className="mt-1 text-xs text-red-600">{errors.cargoType}</p>
            )}
          </div>

          {/* 7. Sender/Receiver dropdowns + add/edit */}
          <div className="space-y-4">
            <div>
              <Label htmlFor={`sender-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
                Илгээч байгууллага
              </Label>
              <div className="flex gap-2 items-center">
                <FilterableSelect
                  options={senderOrganizations.map((org) => ({
                    value: org.id,
                    label: org.name,
                  }))}
                  value={senderOrganizationId}
                  onValueChange={(value) => {
                    handleFieldChange(setSenderOrganizationId, value)
                    setSenderOrganizationId(value)
                  }}
                  disabled={isLoadingOrganizations}
                  placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Илгээч байгууллага сонгох"}
                  searchPlaceholder="Илгээч байгууллага хайх..."
                  className="flex-1"
                />
                <OrganizationManager
                  organizations={senderOrganizations}
                  type="sender"
                  onOrganizationAdded={handleSenderOrganizationAdded}
                  onOrganizationUpdated={handleSenderOrganizationAdded}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`receiver-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
                Хүлээн авагч байгууллага
              </Label>
              <div className="flex gap-2 items-center">
                <FilterableSelect
                  options={receiverOrganizations.map((org) => ({
                    value: org.id,
                    label: org.name,
                  }))}
                  value={receiverOrganizationId}
                  onValueChange={(value) => {
                    handleFieldChange(setReceiverOrganizationId, value)
                    setReceiverOrganizationId(value)
                  }}
                  disabled={isLoadingOrganizations}
                  placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Хүлээн авагч байгууллага сонгох"}
                  searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                  className="flex-1"
                />
                <OrganizationManager
                  organizations={receiverOrganizations}
                  type="receiver"
                  onOrganizationAdded={handleReceiverOrganizationAdded}
                  onOrganizationUpdated={handleReceiverOrganizationAdded}
                />
              </div>
            </div>
          </div>

          {/* 8. Driver registration & selection */}
          <div>
            <Label htmlFor={`driver-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
              Жолооч
            </Label>
            <div className="flex gap-2 items-center">
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
                  handleFieldChange(() => {}, value)
                }}
                disabled={isLoadingDrivers}
                placeholder={isLoadingDrivers ? "Уншиж байна..." : driverName || "Жолооч сонгох"}
                searchPlaceholder="Жолооч хайх..."
                className="flex-1"
              />
              <DriverManager drivers={drivers} onDriverAdded={handleDriverAdded} onDriverUpdated={handleDriverAdded} />
            </div>
            {!driverId && (
              <Input
                id={`driver-manual-${direction}`}
                value={driverName}
                onChange={(e) => handleFieldChange(setDriverName, e.target.value)}
                className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Эсвэл жолоочийн нэрийг гараар оруулах"
              />
            )}
            {errors.driverName && (
              <p className="mt-1 text-xs text-red-600">{errors.driverName}</p>
            )}
          </div>

          {/* 9. Seal number input - only show for OUT direction */}
          {direction === "OUT" && (
            <div>
              <Label htmlFor={`seal-${direction}`} className="text-sm font-medium text-gray-700">
                Лацны дугаар
              </Label>
              <Input
                id={`seal-${direction}`}
                value={sealNumber}
                onChange={(e) => handleFieldChange(setSealNumber, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Лацны дугаар оруулах"
              />
            </div>
          )}

          {/* 10. Transport type dropdown */}
          <div>
            <Label htmlFor={`transport-type-${direction}`} className="text-sm font-medium text-gray-700">
              Тээврийн төрөл
            </Label>
            <Select
              value={transportType}
              onValueChange={(value) => {
                const transportTypeValue = value as TransportType
                setTransportType(transportTypeValue)
                if (savedLogId) {
                  setSavedLogId(null)
                }
              }}
            >
              <SelectTrigger className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Тээврийн төрөл сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="tanker">Tanker</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="refrigerated">Refrigerated</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 11. Chirguultei checkbox (show/hide trailer fields) */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`has-trailer-${direction}`}
              checked={hasTrailer}
              onCheckedChange={(checked) => {
                setHasTrailer(checked === true)
                if (!checked) {
                  setTrailerPlate("")
                }
              }}
            />
            <Label
              htmlFor={`has-trailer-${direction}`}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Чиргүүлтэй
            </Label>
          </div>

          {/* Trailer fields (shown when hasTrailer is true) */}
          {hasTrailer && (
            <div>
              <Label htmlFor={`trailer-plate-${direction}`} className="text-sm font-medium text-gray-700">
                Чиргүүлийн улсын дугаар
              </Label>
              <Input
                id={`trailer-plate-${direction}`}
                value={trailerPlate}
                onChange={(e) => handleFieldChange(setTrailerPlate, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Чиргүүлийн улсын дугаар"
              />
            </div>
          )}

          {/* 12. Additional notes textarea */}
          <div>
            <Label htmlFor={`comments-${direction}`} className="text-sm font-medium text-gray-700">
              Нэмэлт
            </Label>
            <Textarea
              id={`comments-${direction}`}
              value={comments}
              onChange={(e) => handleFieldChange(setComments, e.target.value)}
              className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Нэмэлт мэдээлэл..."
              rows={3}
            />
          </div>

          

        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              "Хадгалах"
            )}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!savedLogId || isSending}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Илгээж байна...
              </>
            ) : (
              "Гаалид илгээх"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

