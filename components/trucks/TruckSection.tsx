"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, CheckCircle2, Clock, Zap, Loader2 } from "lucide-react"
import type { Direction, TruckLog } from "@/lib/types"
import { saveTruckLog, sendTruckLogToCustoms } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

  // Form state
  const [plate, setPlate] = useState("Б1234АВ")
  const [driverName, setDriverName] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [weight, setWeight] = useState("")
  const [comments, setComments] = useState("")

  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState("")
  const [vehicleRegistrationYear, setVehicleRegistrationYear] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [senderOrganization, setSenderOrganization] = useState("")
  const [receiverOrganization, setReceiverOrganization] = useState("")

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
    if (!validate()) {
      return
    }

    setIsSaving(true)
    try {
      const log = await saveTruckLog({
        direction,
        plate: plate.trim(),
        driverName: driverName.trim(),
        cargoType: cargoType.trim(),
        weightKg: Number(weight),
        comments: comments.trim() || undefined,
        vehicleRegistrationNumber: vehicleRegistrationNumber.trim() || undefined,
        vehicleRegistrationYear: vehicleRegistrationYear.trim() || undefined,
        origin: origin.trim() || undefined,
        destination: destination.trim() || undefined,
        senderOrganization: senderOrganization.trim() || undefined,
        receiverOrganization: receiverOrganization.trim() || undefined,
      })

      setSavedLogId(log.id)
      onSave(log)
      
      toast({
        title: "Success",
        description: `${direction === "IN" ? "Inbound" : "Outbound"} truck saved to log`,
      })

      // Reset form (but keep plate and savedLogId for sending)
      setDriverName("")
      setCargoType("")
      setWeight("")
      setComments("")
      setVehicleRegistrationNumber("")
      setVehicleRegistrationYear("")
      setOrigin("")
      setDestination("")
      setSenderOrganization("")
      setReceiverOrganization("")
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

  const title = direction === "IN" ? "Truck IN – Gate Entry" : "Truck OUT – Gate Exit"
  const weightLabel = direction === "IN" ? "Gross Weight (kg)" : "Net Weight (kg)"

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
            Recognized
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* License Plate Recognition */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            Real-Time License Plate Recognition
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
                  <p className="text-xs font-medium text-gray-500 mb-1">Detected Plate</p>
                  <p className="text-xl font-mono font-bold text-blue-600 tracking-wider">{plate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 mb-1">Confidence</p>
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
                <span className="text-xs font-medium">Captured</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{timestamp}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Processing Time</p>
              <p className="text-sm font-semibold text-gray-900">0.82s</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`plate-${direction}`} className="text-sm font-medium text-gray-700">
              Plate Number
            </Label>
            <Input
              id={`plate-${direction}`}
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter plate number"
            />
            {errors.plate && (
              <p className="mt-1 text-xs text-red-600">{errors.plate}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`reg-number-${direction}`} className="text-sm font-medium text-gray-700">
                Тээврийн хэрэгслийн улсын дугаар
              </Label>
              <Input
                id={`reg-number-${direction}`}
                value={vehicleRegistrationNumber}
                onChange={(e) => handleFieldChange(setVehicleRegistrationNumber, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Улсын дугаар"
              />
            </div>
            <div>
              <Label htmlFor={`reg-year-${direction}`} className="text-sm font-medium text-gray-700">
                Тээврийн хэрэгслийн жил
              </Label>
              <Input
                id={`reg-year-${direction}`}
                type="number"
                value={vehicleRegistrationYear}
                onChange={(e) => handleFieldChange(setVehicleRegistrationYear, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Жил"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`driver-${direction}`} className="text-sm font-medium text-gray-700">
              Driver Name
            </Label>
            <Input
              id={`driver-${direction}`}
              value={driverName}
              onChange={(e) => handleFieldChange(setDriverName, e.target.value)}
              className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter driver name"
            />
            {errors.driverName && (
              <p className="mt-1 text-xs text-red-600">{errors.driverName}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`cargo-${direction}`} className="text-sm font-medium text-gray-700">
              Бүтээгдэхүүн (Cargo)
            </Label>
            <Select value={cargoType} onValueChange={(value) => handleFieldChange(setCargoType, value)}>
              <SelectTrigger className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Бүтээгдэхүүн сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial">Аж үйлдвэрийн тоног төхөөрөмж</SelectItem>
                <SelectItem value="food">Хүнсний бүтээгдэхүүн</SelectItem>
                <SelectItem value="textiles">Текстиль</SelectItem>
                <SelectItem value="electronics">Электроник</SelectItem>
                <SelectItem value="construction">Барилгын материал</SelectItem>
                <SelectItem value="machinery">Машин механизм</SelectItem>
                <SelectItem value="chemicals">Химийн бодис</SelectItem>
                <SelectItem value="other">Бусад</SelectItem>
              </SelectContent>
            </Select>
            {errors.cargoType && (
              <p className="mt-1 text-xs text-red-600">{errors.cargoType}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`origin-${direction}`} className="text-sm font-medium text-gray-700">
                Хаанаас (Origin)
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
                Хаашаа (Destination)
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`sender-${direction}`} className="text-sm font-medium text-gray-700">
                Илгээч байгууллага (Sender Organization)
              </Label>
              <Input
                id={`sender-${direction}`}
                value={senderOrganization}
                onChange={(e) => handleFieldChange(setSenderOrganization, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Илгээч байгууллага"
              />
            </div>
            <div>
              <Label htmlFor={`receiver-${direction}`} className="text-sm font-medium text-gray-700">
                Хүлээн авагч байгууллага (Receiver Organization)
              </Label>
              <Input
                id={`receiver-${direction}`}
                value={receiverOrganization}
                onChange={(e) => handleFieldChange(setReceiverOrganization, e.target.value)}
                className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Хүлээн авагч байгууллага"
              />
            </div>
          </div>

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
              placeholder="Enter weight in kg"
            />
            {errors.weight && (
              <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`comments-${direction}`} className="text-sm font-medium text-gray-700">
              Нэмэлт (Additional Notes)
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
                Saving...
              </>
            ) : (
              "Save"
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
                Sending...
              </>
            ) : (
              "Send to Customs"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

