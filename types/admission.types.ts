import { Database } from './database.types'

export type Admission = Database['public']['Tables']['admissions']['Row']
export type AdmissionInsert = Database['public']['Tables']['admissions']['Insert']
export type AdmissionUpdate = Database['public']['Tables']['admissions']['Update']

export type Category = Database['public']['Tables']['categories']['Row']

export interface AdmissionWithCategory extends Admission {
  category: Category | null
}

export interface AdmissionFormData {
  seat_no: number
  category_id: string
  admission_date: string
  duration_months: number
  student_name: string
  email: string
  fees: number
  mobile_number: string
  payment_mode: 'cash' | 'online'
}

export interface AdmissionStats {
  totalAdmissions: number
  activeAdmissions: number
  expiringToday: number
  expiringInTwoDays: number
  totalRevenue: number
  occupancyRate: number
}
