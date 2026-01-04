import { format, addMonths, differenceInDays, parseISO } from 'date-fns'

export function calculateRenewalDate(
  admissionDate: Date | string,
  durationMonths: number
): Date {
  const date = typeof admissionDate === 'string' ? parseISO(admissionDate) : admissionDate
  return addMonths(date, durationMonths)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd MMM yyyy')
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd MMM yyyy HH:mm')
}

export function getDaysUntilExpiry(renewalDate: Date | string): number {
  const date = typeof renewalDate === 'string' ? parseISO(renewalDate) : renewalDate
  return differenceInDays(date, new Date())
}

export function isExpiringSoon(renewalDate: Date | string, days: number = 2): boolean {
  const daysUntil = getDaysUntilExpiry(renewalDate)
  return daysUntil >= 0 && daysUntil <= days
}

export function isExpired(renewalDate: Date | string): boolean {
  return getDaysUntilExpiry(renewalDate) < 0
}

export function getDateForInput(date?: Date | string): string {
  if (!date) return format(new Date(), 'yyyy-MM-dd')
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}
