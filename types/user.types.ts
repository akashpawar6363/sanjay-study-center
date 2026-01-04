import { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserRole = 'admin' | 'coordinator'

export interface User extends Profile {
  // Additional user properties can be added here
}
