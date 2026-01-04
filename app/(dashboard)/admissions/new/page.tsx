'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { calculateRenewalDate, getDateForInput } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/formatters'
import { Category } from '@/types/database.types'

export default function NewAdmissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    seat_no: '',
    category_id: '',
    admission_date: getDateForInput(),
    duration_months: '1',
    student_name: '',
    email: '',
    fees: '',
    discount: '0',
    mobile_number: '',
    payment_mode: 'cash',
  })
  const [renewalDate, setRenewalDate] = useState('')
  const [error, setError] = useState('')

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

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

  // Update fees when category, duration, or discount changes
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.seat_no || parseInt(formData.seat_no) < 1) {
        setError('Please enter a valid seat number')
        setLoading(false)
        return
      }

      if (!formData.category_id) {
        setError('Please select a category')
        setLoading(false)
        return
      }

      if (!formData.student_name || formData.student_name.trim().length < 2) {
        setError('Please enter a valid student name')
        setLoading(false)
        return
      }

      if (!formData.email || !formData.email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!formData.mobile_number || !/^[6-9]\d{9}$/.test(formData.mobile_number)) {
        setError('Please enter a valid 10-digit mobile number')
        setLoading(false)
        return
      }

      if (!formData.fees || parseFloat(formData.fees) < 0) {
        setError('Please enter a valid fee amount')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admissions', {
        method: 'POST',
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create admission')
        setLoading(false)
        return
      }

      // Success - redirect to admissions list
      router.push('/admissions')
      router.refresh()
    } catch (error) {
      console.error('Error creating admission:', error)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admissions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Admission</h1>
          <p className="text-muted-foreground">Create a new student admission</p>
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
                  placeholder="Enter seat number"
                  required
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  placeholder="Enter student name"
                  required
                  disabled={loading}
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
                  placeholder="student@example.com"
                  required
                  disabled={loading}
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
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  required
                  disabled={loading}
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
                  placeholder="Enter discount amount"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional discount on total fees
                </p>
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
                  placeholder="Calculated automatically"
                  required
                  disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                      className="w-4 h-4"
                    />
                    <span>Online</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/20 text-sm p-4 rounded-md">
              <p className="font-medium mb-2">Note:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Receipt number will be auto-generated</li>
                <li>Digital signature will be auto-added from your profile</li>
                <li>Admission receipt will be sent to the student's email</li>
                <li>Renewal reminder will be sent 2 days before expiry</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Link href="/admissions">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Admission...' : 'Create Admission'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
