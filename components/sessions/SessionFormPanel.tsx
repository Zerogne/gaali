"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  inSchema,
  outSchema,
  inDefaults,
  outDefaults,
  type InFormValues,
  type OutFormValues,
} from "./sessionSchema"

interface SessionFormPanelProps {
  onPlateChange?: (plate: string) => void
  plateTouched?: boolean
  autoFillPlate?: string | null
}

export function SessionFormPanel({
  onPlateChange,
  plateTouched = false,
  autoFillPlate,
}: SessionFormPanelProps) {
  const [sessionType, setSessionType] = useState<"IN" | "OUT">("IN")
  const [showOptional, setShowOptional] = useState(false)

  // Use appropriate schema and defaults based on session type
  const schema = sessionType === "IN" ? inSchema : outSchema
  const defaults =
    sessionType === "IN"
      ? { ...inDefaults }
      : { ...outDefaults }

  const form = useForm<InFormValues | OutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  // Watch weight fields for auto-calculation
  const grossWeight = watch("grossWeightKg")
  const tareWeight = watch("tareWeightKg")
  const plateNumber = watch("plateNumber")

  // Auto-calculate net weight
  useEffect(() => {
    const gross = grossWeight ?? 0
    const tare = tareWeight ?? 0
    const net = Math.max(0, gross - tare)
    setValue("netWeightKg", net > 0 ? net : undefined, { shouldValidate: false })
  }, [grossWeight, tareWeight, setValue])

  // Auto-fill plate when camera detects it (unless user touched it)
  useEffect(() => {
    if (autoFillPlate && !plateTouched) {
      // Only auto-fill if field is empty or matches previous auto-filled value
      if (!plateNumber || plateNumber.trim() === "") {
        setValue("plateNumber", autoFillPlate)
        onPlateChange?.(autoFillPlate)
      }
    }
  }, [autoFillPlate, plateTouched, plateNumber, setValue, onPlateChange])

  // Reset form when switching session type
  useEffect(() => {
    const newDefaults = sessionType === "IN" ? inDefaults : outDefaults
    const resetValues: any = {}
    Object.keys(newDefaults).forEach((key) => {
      resetValues[key] = newDefaults[key as keyof typeof newDefaults]
    })
    // Reset form with new defaults
    form.reset(resetValues as InFormValues | OutFormValues)
  }, [sessionType, form])

  const onSubmit = (data: InFormValues | OutFormValues) => {
    console.log("Session data:", data)
    // TODO: Submit to API
  }

  const onReset = () => {
    const resetDefaults = sessionType === "IN" ? inDefaults : outDefaults
    const resetValues: any = {}
    Object.keys(resetDefaults).forEach((key) => {
      resetValues[key] = resetDefaults[key as keyof typeof resetDefaults]
    })
    form.reset(resetValues as InFormValues | OutFormValues)
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 shrink-0">
        <h2 className="text-sm font-semibold">Session</h2>
        <div className="flex items-center gap-2">
          <Tabs value={sessionType} onValueChange={(v) => setSessionType(v as "IN" | "OUT")}>
            <TabsList className="h-7">
              <TabsTrigger value="IN" className="text-xs px-3">IN</TabsTrigger>
              <TabsTrigger value="OUT" className="text-xs px-3">OUT</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-7 px-3 text-xs"
          >
            Reset
          </Button>
          <Button
            type="submit"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            className="h-7 px-3 text-xs"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Form content - must fit in remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full">
          <div className="p-3 h-full overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {/* Plate Number */}
              <div className="col-span-2">
                <Label htmlFor="plateNumber" className="text-xs font-medium">
                  Plate Number *
                </Label>
                <Input
                  id="plateNumber"
                  {...register("plateNumber", {
                    onChange: (e) => {
                      onPlateChange?.(e.target.value)
                    },
                  })}
                  className="h-9 text-sm mt-1"
                  placeholder="ABC1234"
                />
                {errors.plateNumber && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.plateNumber.message}
                  </p>
                )}
              </div>

              {/* Driver Name */}
              <div className="col-span-2">
                <Label htmlFor="driverName" className="text-xs font-medium">
                  Driver Name *
                </Label>
                <Input
                  id="driverName"
                  {...register("driverName")}
                  className="h-9 text-sm mt-1"
                  placeholder="John Doe"
                />
                {errors.driverName && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.driverName.message}
                  </p>
                )}
              </div>

              {/* Company */}
              <div className="col-span-2">
                <Label htmlFor="company" className="text-xs font-medium">
                  Company
                </Label>
                <Input
                  id="company"
                  {...register("company")}
                  className="h-9 text-sm mt-1"
                  placeholder="Transport Co."
                />
              </div>

              {/* Material */}
              <div className="col-span-2">
                <Label htmlFor="material" className="text-xs font-medium">
                  Material / Cargo *
                </Label>
                <Input
                  id="material"
                  {...register("material")}
                  className="h-9 text-sm mt-1"
                  placeholder="Gravel"
                />
                {errors.material && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.material.message}
                  </p>
                )}
              </div>

              {/* Gross Weight */}
              <div>
                <Label htmlFor="grossWeightKg" className="text-xs font-medium">
                  Gross Weight (kg)
                </Label>
                <Input
                  id="grossWeightKg"
                  type="number"
                  step="0.01"
                  {...register("grossWeightKg", { valueAsNumber: true })}
                  className="h-9 text-sm mt-1"
                  placeholder="0.00"
                />
                {errors.grossWeightKg && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.grossWeightKg.message}
                  </p>
                )}
              </div>

              {/* Tare Weight */}
              <div>
                <Label htmlFor="tareWeightKg" className="text-xs font-medium">
                  Tare Weight (kg)
                </Label>
                <Input
                  id="tareWeightKg"
                  type="number"
                  step="0.01"
                  {...register("tareWeightKg", { valueAsNumber: true })}
                  className="h-9 text-sm mt-1"
                  placeholder="0.00"
                />
                {errors.tareWeightKg && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.tareWeightKg.message}
                  </p>
                )}
              </div>

              {/* Net Weight (read-only, auto-calculated) */}
              <div className="col-span-2">
                <Label htmlFor="netWeightKg" className="text-xs font-medium">
                  Net Weight (kg) <span className="text-gray-500">(auto)</span>
                </Label>
                <Input
                  id="netWeightKg"
                  type="number"
                  readOnly
                  value={watch("netWeightKg") ?? ""}
                  className="h-9 text-sm mt-1 bg-gray-50 cursor-not-allowed"
                  placeholder="0.00"
                />
              </div>

              {/* Timestamp */}
              <div className="col-span-2">
                <Label htmlFor="timestamp" className="text-xs font-medium">
                  Timestamp
                </Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  {...register("timestamp")}
                  className="h-9 text-sm mt-1"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Optional Fields Collapsible */}
              <div className="col-span-2">
                <Collapsible open={showOptional} onOpenChange={setShowOptional}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between h-8 text-xs"
                    >
                      <span>More Options</span>
                      {showOptional ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    <div>
                      <Label htmlFor="ticketNumber" className="text-xs font-medium">
                        Ticket Number
                      </Label>
                      <Input
                        id="ticketNumber"
                        {...register("ticketNumber")}
                        className="h-9 text-sm mt-1"
                        placeholder="TKT-12345"
                      />
                    </div>

                    {sessionType === "OUT" && (
                      <div>
                        <Label htmlFor="inTicketNumber" className="text-xs font-medium">
                          IN Ticket Reference
                        </Label>
                        <Input
                          id="inTicketNumber"
                          {...register("inTicketNumber")}
                          className="h-9 text-sm mt-1"
                          placeholder="Reference to IN ticket"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="gate" className="text-xs font-medium">
                          Gate
                        </Label>
                        <Input
                          id="gate"
                          {...register("gate")}
                          className="h-9 text-sm mt-1"
                          placeholder="Gate 1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lane" className="text-xs font-medium">
                          Lane
                        </Label>
                        <Input
                          id="lane"
                          {...register("lane")}
                          className="h-9 text-sm mt-1"
                          placeholder="Lane A"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="paymentReference" className="text-xs font-medium">
                        Payment Reference
                      </Label>
                      <Input
                        id="paymentReference"
                        {...register("paymentReference")}
                        className="h-9 text-sm mt-1"
                        placeholder="PAY-12345"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-xs font-medium">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        {...register("notes")}
                        className="text-sm mt-1 min-h-[60px]"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
