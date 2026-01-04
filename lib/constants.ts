export const APP_NAME = 'Sanjay Study Center'
export const APP_DESCRIPTION = 'Library Management System'

export const DEFAULT_CATEGORIES = [
  { name: 'Reserved', rate: 1300, is_default: true },
  { name: 'Non-Reserved', rate: 1100, is_default: true },
  { name: 'Reserved with Locker', rate: 1600, is_default: true },
]

export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'online', label: 'Online' },
] as const

export const USER_ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
} as const

export const ADMISSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  RENEWED: 'renewed',
} as const

export const EMAIL_TYPES = {
  ADMISSION_RECEIPT: 'admission_receipt',
  RENEWAL_REMINDER: 'renewal_reminder',
  ADMIN_REPORT: 'admin_report',
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMISSIONS: '/admissions',
  ADMISSIONS_NEW: '/admissions/new',
  SETTINGS: '/settings',
  SETTINGS_CATEGORIES: '/settings/categories',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_GENERAL: '/settings/general',
} as const

export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  DIGITAL_SIGNATURES: 'digital-signatures',
} as const
