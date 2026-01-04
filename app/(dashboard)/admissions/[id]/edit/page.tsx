'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { calculateRenewalDate, getDateForInput } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/formatters'
import { Category } from '@/types/database.types'

export default function EditAdmissionPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    seat_no: '',
    category_id: '',
    admission_date: '',
    duration_months: '1',
    student_name: '',
    email: '',
    fees: '',
    discount: '0',
    mobile_number: '',
    payment_mode: 'cash',
    status: 'active',
  })
  const [renewalDate, setRenewalDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchAdmission()
  }, [params.id])

  // Calculate renewal date when admission date or duration changes
  useEffect(() => {
    if (formData.admission_date && formData.duration_months) {
      const renewal = calculateRenewalDate(
        formData.admission_date,
        parseInt(formData.duration_months)
      )
      setRenewalDate(getDateForInput(renewal))
    }
  }, [formData.admission_date, formData.duration_months])

  // Auto-calculate fees when category, duration, or discount changes
  useEffect(() => {
    if (formData.category_id && formData.duration_months) {
      const category = categories.find((c) => c.id === formData.category_id)
      if (category) {
        const duration = parseInt(formData.duration_months) || 1
        const discount = parseFloat(formData.discount) || 0
        const totalFees = (category.rate * duration) - discount
        setFormData((prev) => ({ ...prev, fees: Math.max(0, totalFees).toFixed(2) }))
      }
    }
  }, [formData.category_id, formData.duration_months, formData.discount, categories])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchAdmission = async () => {
    try {
      const response = await fetch(`/api/admissions/${params.id}`)
      const data = await response.json()
      
      if (data.admission) {
        const admission = data.admission
        setFormData({
          seat_no: admission.seat_no.toString(),
          category_id: admission.category_id || '',
          admission_date: admission.admission_date,
          duration_months: admission.duration_months.toString(),
          student_name: admission.student_name,
          email: admission.email,
          fees: admission.fees.toString(),
          discount: (admission.discount || 0).toString(),
          mobile_number: admission.mobile_number,
          payment_mode: admission.payment_mode,
          status: admission.status,
        })
      }
    } catch (error) {
      console.error('Error fetching admission:', error)
      setError('Failed to load admission')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validation
      if (!formData.seat_no || parseInt(formData.seat_no) < 1) {
        setError('Please enter a valid seat number')
        setSubmitting(false)
        return
      }

      if (!formData.category_id) {
        setError('Please select a category')
        setSubmitting(false)
        return
      }

      if (!formData.student_name || formData.student_name.trim().length < 2) {
        setError('Please enter a valid student name')
        setSubmitting(false)
        return
      }

      if (!formData.email || !formData.email.includes('@')) {
        setError('Please enter a valid email address')
        setSubmitting(false)
        return
      }

      if (!formData.mobile_number || !/^[6-9]\d{9}$/.test(formData.mobile_number)) {
        setError('Please enter a valid 10-digit mobile number')
        setSubmitting(false)
        return
      }

      if (!formData.fees || parseFloat(formData.fees) < 0) {
        setError('Please enter a valid fee amount')
        setSubmitting(false)
        return
      }

      const response = await fetch(`/api/admissions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seat_no: parseInt(formData.seat_no),
          category_id: formData.category_id,
          admission_date: formData.admission_date,
          duration_months: parseInt(formData.duration_months),
          student_name: formData.student_name.trim(),
          email: formData.email.toLowerCase().trim(),
          fees: parseFloat(formData.fees),
          discount: parseFloat(formData.discount) || 0,
          mobile_number: formData.mobile_number,
          payment_mode: formData.payment_mode,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update admission')
        setSubmitting(false)
        return
      }

      // Success - redirect to view page
      router.push(`/admissions/${params.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating admission:', error)
      setError('An unexpected error occurred')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admissions/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Admission</h1>
          <p className="text-muted-foreground">Update admission details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seat Number */}
              <div>
                <label htmlFor="seat_no" className="block text-sm font-medium mb-2">
                  Seat Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id="seat_no"
                  name="seat_no"
                  type="number"
                  min="1"
                  value={formData.seat_no}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium mb-2">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - {formatCurrency(category.rate)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Admission Date */}
              <div>
                <label htmlFor="admission_date" className="block text-sm font-medium mb-2">
                  Admission Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="admission_date"
                  name="admission_date"
                  type="date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration_months" className="block text-sm font-medium mb-2">
                  Duration (Months) <span className="text-destructive">*</span>
                </label>
                <Select
                  id="duration_months"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <option key={month} value={month}>
                      {month} {month === 1 ? 'Month' : 'Months'}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Renewal Date (Read-only) */}
              <div>
                <label htmlFor="renewal_date" className="block text-sm font-medium mb-2">
                  Renewal Date (Auto-calculated)
                </label>
                <Input
                  id="renewal_date"
                  type="date"
                  value={renewalDate}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Student Name */}
              <div>
                <label htmlFor="student_name" className="block text-sm font-medium mb-2">
                  Student Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="student_name"
                  name="student_name"
                  type="text"
                  value={formData.student_name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile_number" className="block text-sm font-medium mb-2">
                  Mobile Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id="mobile_number"
                  name="mobile_number"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Discount */}
              <div>
                <label htmlFor="discount" className="block text-sm font-medium mb-2">
                  Discount (₹)
                </label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              {/* Fees */}
              <div>
                <label htmlFor="fees" className="block text-sm font-medium mb-2">
                  Total Fees (₹) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="fees"
                  name="fees"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="bg-muted font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated: (Rate × Duration) - Discount
                </p>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Mode <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_mode"
                      value="cash"
                      checked={formData.payment_mode === 'cash'}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_mode"
                      value="online"
                      checked={formData.payment_mode === 'online'}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span>Online</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2">
                  Status <span className="text-destructive">*</span>
                </label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="renewed">Renewed</option>
                </Select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Link href={`/admissions/${params.id}`}>
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Admission'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
