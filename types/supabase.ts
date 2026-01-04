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
          discount: number
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
          discount?: number
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
          discount?: number
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
  }
}
