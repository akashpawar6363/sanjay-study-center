import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number')

export const admissionSchema = z.object({
  seat_no: z.number().min(1, 'Seat number is required'),
  category_id: z.string().uuid('Invalid category'),
  admission_date: z.string().min(1, 'Admission date is required'),
  duration_months: z.number().min(1, 'Duration must be at least 1 month').max(12, 'Duration cannot exceed 12 months'),
  student_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  fees: z.number().min(0, 'Fees must be a positive number'),
  mobile_number: phoneSchema,
  payment_mode: z.enum(['cash', 'online']),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  rate: z.number().min(0, 'Rate must be a positive number'),
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type AdmissionFormValues = z.infer<typeof admissionSchema>
export type CategoryFormValues = z.infer<typeof categorySchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
