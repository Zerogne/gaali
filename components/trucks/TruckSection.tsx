"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterableSelect } from "@/components/ui/filterable-select"
import { Camera, Clock, Zap, Loader2, Plus, ArrowRight, ArrowLeft } from "lucide-react"
import type { Direction, TruckLog } from "@/lib/types"
import { saveTruckLog, sendTruckLogToCustoms } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TransportCompany, Organization, Driver } from "@/lib/types"
import { DriverManager } from "@/components/drivers/DriverManager"

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  // Function to load all data
  const loadAllData = async () => {
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

  // Load all data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Listen for refresh events from other sections
  useEffect(() => {
    const handleRefresh = () => {
      loadAllData()
    }

    window.addEventListener("refreshDropdownData", handleRefresh)
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh)
    }
  }, [])

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
            
            // Find the most recent IN log for the same plate
            const inLog = logs
              .filter((log: TruckLog) => 
                log.direction === "IN" && 
                log.plate.trim().toUpperCase() === plate.trim().toUpperCase() &&
                log.weightKg &&
                log.weightKg > 0
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
              setNetWeight("")
            }
          }
        } catch (error) {
          console.error("Error calculating net weight:", error)
          setNetWeight("")
        }
      }
      
      calculateNetWeight()
    } else if (direction === "IN" || !weight || !plate || Number(weight) <= 0) {
      setNetWeight("")
    }
  }, [direction, weight, plate])

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
    if (!driverId) {
      newErrors.driverId = "Driver selection is required"
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

      const log = await saveTruckLog({
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
      })

      setSavedLogId(log.id)
      onSave(log)
      
      toast({
        title: "Success",
        description: `${direction === "IN" ? "Inbound" : "Outbound"} truck saved to log`,
      })

      // Don't close dialog or reset form - keep it open for sending
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
        
        // Reset form and close dialog after successful send
        setDriverId("")
        setDriverName("")
        setCargoType("")
        setWeight("")
        setNetWeight("")
        setComments("")
        setOrigin("")
        setDestination("")
        setSenderOrganizationId("")
        setReceiverOrganizationId("")
        setTransportCompanyId("")
        setSealNumber("")
        setHasTrailer(false)
        setTrailerPlate("")
        setPlate("Б1234АВ")
        setIsDialogOpen(false)
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

  const title = direction === "IN" ? "Тээврийн хэрэгсэл орох" : "Тээврийн хэрэгсэл гарах"
  const weightLabel = direction === "IN" ? "Бүрэн жин (кг)" : "Бүрэн жин (кг)"

  return (
    <>
      <Card className={`border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
        direction === "IN" 
          ? "bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-200" 
          : "bg-gradient-to-br from-green-50 via-white to-green-50/30 border-green-200"
      }`}>
        {/* Decorative background element */}
        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 ${
          direction === "IN" ? "bg-blue-500" : "bg-green-500"
        } rounded-full -mr-16 -mt-16`}></div>
        
        <CardHeader className="pb-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl shadow-sm ${
                direction === "IN" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-green-100 text-green-600"
              }`}>
                {direction === "IN" ? (
                  <ArrowRight className="w-6 h-6" />
                ) : (
                  <ArrowLeft className="w-6 h-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-gray-900 text-xl font-bold mb-1">
                  {title}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {direction === "IN" 
                    ? "Тээврийн хэрэгсэл орох бүртгэл хийх" 
                    : "Тээврийн хэрэгсэл гарах бүртгэл хийх"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                {direction === "IN" 
                  ? "Тээврийн хэрэгсэл орох үед бүртгэл хийх" 
                  : "Тээврийн хэрэгсэл гарах үед бүртгэл хийх"}
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className={`shadow-md hover:shadow-lg transition-all px-6 py-3 ${
                direction === "IN"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              size="default"
            >
              <Plus className="w-5 h-5 mr-2" />
              {direction === "IN" ? "ОРОХ" : "ГАРАХ"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[60vw] !w-[95vw] max-h-[90vh] p-0" style={{ width: '95vw', maxWidth: '95vw' }}>
          <DialogTitle className="sr-only">{direction === "IN" ? "ОРОХ бүртгэл" : "ГАРАХ бүртгэл"}</DialogTitle>
          <DialogDescription className="sr-only">
            {direction === "IN" ? "Орох тээврийн хэрэгслийн бүртгэл" : "Гарах тээврийн хэрэгслийн бүртгэл"}
          </DialogDescription>
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6 space-y-5">
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

          {/* 3. Weight input */}
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

          {/* Net weight input - only for OUT direction (auto-calculated) */}
          {direction === "OUT" && (
            <div>
              <Label htmlFor={`net-weight-${direction}`} className="text-sm font-medium text-gray-700">
                Цэвэр жин (кг) <span className="text-xs text-gray-500 font-normal">(автоматаар тооцоолно)</span>
              </Label>
              <Input
                id={`net-weight-${direction}`}
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

          {/* 4. Transport company dropdown + "Add New" */}
          <div>
            <Label htmlFor={`transport-company-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
              Тээврийн компани
            </Label>
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
            />
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
            />
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
              />
            </div>
            <div>
              <Label htmlFor={`receiver-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
                Хүлээн авагч байгууллага
              </Label>
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
              />
            </div>
          </div>

          {/* 8. Driver registration & selection */}
          <div>
            <Label htmlFor={`driver-${direction}`} className="text-sm font-medium text-gray-700 mb-2 block">
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
                    setDriverId(value)
                    const selectedDriver = drivers.find(d => d.id === value)
                    setDriverName(selectedDriver?.name || "")
                    handleFieldChange(() => {}, value)
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

          {/* 10. Chirguultei checkbox (show/hide trailer fields) */}
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
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

