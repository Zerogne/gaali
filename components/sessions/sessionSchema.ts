import { z } from "zod"

// Common fields shared between IN and OUT
const commonFields = {
  plateNumber: z.string().min(1, "Plate number is required").max(20),
  driverName: z.string().min(1, "Driver name is required").max(100),
  company: z.string().optional(),
  material: z.string().min(1, "Material/Cargo is required").max(100),
  grossWeightKg: z.number().min(0, "Gross weight must be >= 0").optional(),
  tareWeightKg: z.number().min(0, "Tare weight must be >= 0").optional(),
  netWeightKg: z.number().min(0).optional(), // Auto-calculated, read-only
  timestamp: z.string().optional(), // ISO string
}

// Optional fields (collapsed by default)
const optionalFields = {
  notes: z.string().max(500).optional(),
  ticketNumber: z.string().max(50).optional(),
  gate: z.string().max(50).optional(),
  lane: z.string().max(50).optional(),
  paymentReference: z.string().max(100).optional(),
}

// IN session schema
export const inSchema = z.object({
  status: z.literal("IN"),
  ...commonFields,
  ...optionalFields,
})

// OUT session schema
export const outSchema = z.object({
  status: z.literal("OUT"),
  ...commonFields,
  ...optionalFields,
  // OUT-specific: may require ticket reference
  inTicketNumber: z.string().max(50).optional(),
})

export type InFormValues = z.infer<typeof inSchema>
export type OutFormValues = z.infer<typeof outSchema>

// Default values
export const inDefaults: Partial<InFormValues> = {
  status: "IN",
  plateNumber: "",
  driverName: "",
  company: "",
  material: "",
  grossWeightKg: undefined,
  tareWeightKg: undefined,
  netWeightKg: undefined,
  timestamp: new Date().toISOString(),
  notes: "",
  ticketNumber: "",
  gate: "",
  lane: "",
  paymentReference: "",
}

export const outDefaults: Partial<OutFormValues> = {
  status: "OUT",
  plateNumber: "",
  driverName: "",
  company: "",
  material: "",
  grossWeightKg: undefined,
  tareWeightKg: undefined,
  netWeightKg: undefined,
  timestamp: new Date().toISOString(),
  notes: "",
  ticketNumber: "",
  gate: "",
  lane: "",
  paymentReference: "",
  inTicketNumber: "",
}
