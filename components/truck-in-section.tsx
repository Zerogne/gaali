"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Save, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveTruckLog, sendTruckLogToCustoms } from "@/lib/api"
import type { Direction, TruckLog } from "@/lib/types"

interface TruckInSectionProps {
  onSave: (log: TruckLog) => void
}

export function TruckInSection({ onSave }: TruckInSectionProps) {
  const { toast } = useToast()
  const [savedLog, setSavedLog] = useState<TruckLog | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [driverName, setDriverName] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [comments, setComments] = useState("")

  const plateData = {
    plate: "Б1234АВ",
    confidence: 94.5,
    timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!plateData.plate) newErrors.plate = "License plate is required"
    if (!driverName.trim()) newErrors.driverName = "Driver name is required"
    if (!cargoType.trim()) newErrors.cargoType = "Cargo type is required"
    if (!grossWeight.trim()) newErrors.weight = "Gross weight is required"
    else if (isNaN(Number(grossWeight)) || Number(grossWeight) <= 0) newErrors.weight = "Weight must be a positive number"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      const log = await saveTruckLog({
        direction: "IN" as Direction,
        plate: plateData.plate,
        driverName: driverName.trim(),
        cargoType: cargoType.trim(),
        weightKg: Number(grossWeight),
        comments: comments.trim() || undefined,
      })
      setSavedLog(log)
      onSave(log)
      toast({ title: "Success", description: "Inbound truck saved to log" })
      setDriverName("")
      setCargoType("")
      setGrossWeight("")
      setComments("")
      setErrors({})
    } catch (error) {
      toast({ title: "Error", description: "Failed to save truck log", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!savedLog) return
    setIsSending(true)
    try {
      const result = await sendTruckLogToCustoms(savedLog.id)
      if (result.success) {
        const updatedLog = { ...savedLog, sentToCustoms: true }
        setSavedLog(updatedLog)
        onSave(updatedLog)
        toast({ title: "Success", description: "Data successfully sent to Mongolian Customs" })
      } else {
        toast({ title: "Error", description: result.error || "Failed to send to customs", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send to customs", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-border/50 bg-gradient-to-br from-card to-card/98">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold tracking-tight">Truck IN – Gate Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">Real-Time License Plate Recognition</h3>
          <div className="relative w-full h-52 bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl overflow-hidden border-2 border-border/60 shadow-inner">
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-14 w-14 text-muted-foreground/40" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/70 to-transparent text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-mono font-bold tracking-wider">{plateData.plate}</p>
                  <p className="text-xs text-gray-200 mt-1 font-medium">Confidence: <span className="text-white font-semibold">{plateData.confidence}%</span></p>
                </div>
                <p className="text-xs text-gray-200 font-medium">{plateData.timestamp}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="driver-name-in" className="text-sm font-medium">Driver Name</Label>
            <Input id="driver-name-in" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter driver name" aria-invalid={!!errors.driverName} className="transition-all focus:border-primary/60" />
            {errors.driverName && <p className="text-xs text-destructive font-medium mt-1">{errors.driverName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo-type-in" className="text-sm font-medium">Cargo Type</Label>
            <Select value={cargoType} onValueChange={setCargoType}>
              <SelectTrigger id="cargo-type-in" aria-invalid={!!errors.cargoType} className="transition-all focus:border-primary/60">
                <SelectValue placeholder="Select cargo type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Cargo</SelectItem>
                <SelectItem value="construction">Construction Materials</SelectItem>
                <SelectItem value="food">Food Products</SelectItem>
                <SelectItem value="machinery">Machinery</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.cargoType && <p className="text-xs text-destructive font-medium mt-1">{errors.cargoType}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gross-weight-in" className="text-sm font-medium">Gross Weight (kg)</Label>
            <Input id="gross-weight-in" type="number" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} placeholder="Enter gross weight" aria-invalid={!!errors.weight} className="transition-all focus:border-primary/60" />
            {errors.weight && <p className="text-xs text-destructive font-medium mt-1">{errors.weight}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments-in" className="text-sm font-medium">Comments (Optional)</Label>
            <Textarea id="comments-in" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Additional notes..." rows={3} className="transition-all focus:border-primary/60" />
          </div>
        </div>
        <div className="flex gap-3 pt-5 border-t border-border/50">
          <Button variant="outline" onClick={handleSave} disabled={isSaving || isSending} className="flex-1 font-medium shadow-sm hover:shadow transition-shadow">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button onClick={handleSend} disabled={!savedLog || isSending || savedLog.sentToCustoms} className="flex-1 font-medium shadow-md hover:shadow-lg transition-shadow">
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send to Customs"}
          </Button>
        </div>
        {savedLog && savedLog.sentToCustoms && (
          <p className="text-xs text-success text-center font-medium bg-success/10 py-2 rounded-lg">✓ Sent to Mongolian Customs</p>
        )}
      </CardContent>
    </Card>
  )
}
