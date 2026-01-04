'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

export default function GeneralSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    total_seats: '',
    current_receipt_number: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.settings) {
        setFormData({
          total_seats: data.settings.total_seats || '50',
          current_receipt_number: data.settings.current_receipt_number || '1000',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (parseInt(formData.total_seats) < 1) {
        setError('Total seats must be at least 1')
        setSubmitting(false)
        return
      }

      if (parseInt(formData.current_receipt_number) < 1) {
        setError('Receipt number must be at least 1')
        setSubmitting(false)
        return
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save settings')
        setSubmitting(false)
        return
      }

      setSuccess('Settings saved successfully!')
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">General Settings</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">Configure library settings and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Library Configuration</CardTitle>
            <CardDescription>Manage total seats and receipt numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="total_seats" className="block text-sm font-medium mb-2">
                Total Library Seats
              </label>
              <Input
                id="total_seats"
                type="number"
                min="1"
                value={formData.total_seats}
                onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                placeholder="Enter total number of seats"
                required
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This affects the occupancy calculations on the dashboard
              </p>
            </div>

            <div>
              <label htmlFor="current_receipt_number" className="block text-sm font-medium mb-2">
                Current Receipt Number
              </label>
              <Input
                id="current_receipt_number"
                type="number"
                min="1"
                value={formData.current_receipt_number}
                onChange={(e) =>
                  setFormData({ ...formData, current_receipt_number: e.target.value })
                }
                placeholder="Enter starting receipt number"
                required
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                New admissions will start from this number. Next receipt will be RCP-
                {parseInt(formData.current_receipt_number) + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 text-success text-sm p-3 rounded-md">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
