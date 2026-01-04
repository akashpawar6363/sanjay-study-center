export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'coordinator'
          profile_photo_url: string | null
          digital_signature_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'coordinator'
          profile_photo_url?: string | null
          digital_signature_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'coordinator'
          profile_photo_url?: string | null
          digital_signature_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          rate: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rate: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rate?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admissions: {
        Row: {
          id: string
          seat_no: number
          category_id: string | null
          receipt_no: string
          admission_date: string
          duration_months: number
          renewal_date: string
          student_name: string
          email: string
          fees: number
          mobile_number: string
          payment_mode: 'cash' | 'online'
          digital_signature_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          status: 'active' | 'expired' | 'renewed'
        }
        Insert: {
          id?: string
          seat_no: number
          category_id?: string | null
          receipt_no: string
          admission_date: string
          duration_months: number
          renewal_date: string
          student_name: string
          email: string
          fees: number
          mobile_number: string
          payment_mode: 'cash' | 'online'
          digital_signature_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'expired' | 'renewed'
        }
        Update: {
          id?: string
          seat_no?: number
          category_id?: string | null
          receipt_no?: string
          admission_date?: string
          duration_months?: number
          renewal_date?: string
          student_name?: string
          email?: string
          fees?: number
          mobile_number?: string
          payment_mode?: 'cash' | 'online'
          digital_signature_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'expired' | 'renewed'
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          admission_id: string | null
          email_type: 'admission_receipt' | 'renewal_reminder' | 'admin_report'
          recipient_email: string
          sent_at: string
          status: 'sent' | 'failed'
        }
        Insert: {
          id?: string
          admission_id?: string | null
          email_type: 'admission_receipt' | 'renewal_reminder' | 'admin_report'
          recipient_email: string
          sent_at?: string
          status?: 'sent' | 'failed'
        }
        Update: {
          id?: string
          admission_id?: string | null
          email_type?: 'admission_receipt' | 'renewal_reminder' | 'admin_report'
          recipient_email?: string
          sent_at?: string
          status?: 'sent' | 'failed'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for tables
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Admission = Database['public']['Tables']['admissions']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']
export type EmailLog = Database['public']['Tables']['email_logs']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type AdmissionInsert = Database['public']['Tables']['admissions']['Insert']
export type SettingInsert = Database['public']['Tables']['settings']['Insert']
export type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type AdmissionUpdate = Database['public']['Tables']['admissions']['Update']
export type SettingUpdate = Database['public']['Tables']['settings']['Update']
export type EmailLogUpdate = Database['public']['Tables']['email_logs']['Update']
