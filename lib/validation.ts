/**
 * Zod validation schemas for all API inputs
 * Ensures type safety and prevents injection attacks
 */
import { z } from 'zod'

// Company login validation
export const loginCompanySchema = z.object({
  companyId: z
    .string()
    .min(1, 'Company ID is required')
    .max(100, 'Company ID is too long')
    .regex(/^[a-z0-9-]+$/, 'Company ID contains invalid characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(200, 'Password is too long'),
})

export type LoginCompanyInput = z.infer<typeof loginCompanySchema>

// Worker selection validation
export const selectWorkerSchema = z.object({
  workerId: z
    .string()
    .min(1, 'Worker ID is required')
    .max(100, 'Worker ID is too long')
    .regex(/^[a-z0-9-]+$/, 'Worker ID contains invalid characters'),
})

export type SelectWorkerInput = z.infer<typeof selectWorkerSchema>

// Legacy worker login (deprecated but still used)
export const loginWorkerSchema = z.object({
  companyId: z
    .string()
    .min(1, 'Company ID is required')
    .max(100, 'Company ID is too long')
    .regex(/^[a-z0-9-]+$/, 'Company ID contains invalid characters'),
  workerId: z
    .string()
    .min(1, 'Worker ID is required')
    .max(100, 'Worker ID is too long')
    .regex(/^[a-z0-9-]+$/, 'Worker ID contains invalid characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(200, 'Password is too long'),
})

export type LoginWorkerInput = z.infer<typeof loginWorkerSchema>

// Truck log validation
export const truckLogSchema = z.object({
  direction: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: 'Direction must be IN or OUT' }),
  }),
  plate: z
    .string()
    .min(1, 'Plate number is required')
    .max(20, 'Plate number is too long')
    .regex(/^[А-ЯЁA-Z0-9\s-]+$/i, 'Plate number contains invalid characters'),
  driverName: z
    .string()
    .min(1, 'Driver name is required')
    .max(200, 'Driver name is too long'),
  cargoType: z
    .string()
    .min(1, 'Cargo type is required')
    .max(100, 'Cargo type is too long'),
  weightKg: z
    .number()
    .positive('Weight must be positive')
    .max(1000000, 'Weight is too large'),
  comments: z.string().max(1000, 'Comments are too long').optional(),
  vehicleRegistrationNumber: z.string().max(50).optional(),
  vehicleRegistrationYear: z.string().max(4).optional(),
  origin: z.string().max(200).optional(),
  destination: z.string().max(200).optional(),
  senderOrganization: z.string().max(200).optional(),
  receiverOrganization: z.string().max(200).optional(),
})

export type TruckLogInput = z.infer<typeof truckLogSchema>

// Product validation
export const addProductSchema = z.object({
  label: z
    .string()
    .min(1, 'Product label is required')
    .max(200, 'Product label is too long')
    .trim(),
})

export type AddProductInput = z.infer<typeof addProductSchema>

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// Delete product validation
export const deleteProductSchema = z.object({
  id: z
    .string()
    .min(1, 'Product ID is required')
    .max(100, 'Product ID is too long'),
})

export type DeleteProductInput = z.infer<typeof deleteProductSchema>

