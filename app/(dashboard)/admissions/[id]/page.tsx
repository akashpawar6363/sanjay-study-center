'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatPhoneNumber } from '@/lib/utils/formatters'
import { formatDate } from '@/lib/utils/dateUtils'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'

export default function ViewAdmissionPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [admission, setAdmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('coordinator')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchAdmission()
    fetchUserRole()
  }, [params.id])

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile) {
        setUserRole(profile.role)
      }
    }
  }

  const fetchAdmission = async () => {
    try {
      const response = await fetch(`/api/admissions/${params.id}`)
      const data = await response.json()
      if (data.admission) {
        setAdmission(data.admission)
      }
    } catch (error) {
      console.error('Error fetching admission:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admissions/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admissions')
        router.refresh()
      } else {
        alert('Failed to delete admission')
      }
    } catch (error) {
      console.error('Error deleting admission:', error)
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
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

  if (!admission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admissions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Admission Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              The admission you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = () => {
    const status = admission.status
    const colors = {
      active: 'bg-success/10 text-success',
      expired: 'bg-destructive/10 text-destructive',
      renewed: 'bg-primary/10 text-primary',
    }
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${colors[status] || 'bg-muted'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admissions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Admission Details</h1>
            <p className="text-muted-foreground">Receipt: {admission.receipt_no}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userRole === 'admin' && (
            <>
              <Link href={`/admissions/${admission.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Student Name</label>
              <p className="font-medium">{admission.student_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-medium">{admission.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Mobile Number</label>
              <p className="font-medium">{formatPhoneNumber(admission.mobile_number)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Seat Number</label>
              <p className="font-medium text-2xl text-primary">{admission.seat_no}</p>
            </div>
          </CardContent>
        </Card>

        {/* Admission Details */}
        <Card>
          <CardHeader>
            <CardTitle>Admission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Receipt Number</label>
              <p className="font-medium font-mono">{admission.receipt_no}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Category</label>
              <p className="font-medium">{admission.category?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Duration</label>
              <p className="font-medium">{admission.duration_months} Month{admission.duration_months > 1 ? 's' : ''}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <div>{getStatusBadge()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Category Rate</label>
              <p className="font-medium">{formatCurrency(admission.category?.rate || 0)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Discount Applied</label>
              <p className="font-medium">{formatCurrency(admission.discount || 0)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Total Fees Paid</label>
              <p className="font-medium text-2xl text-primary">{formatCurrency(admission.fees)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Payment Mode</label>
              <p className="font-medium capitalize">{admission.payment_mode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Admission Date</label>
              <p className="font-medium">{formatDate(admission.admission_date)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Renewal Date</label>
              <p className="font-medium">{formatDate(admission.renewal_date)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Created At</label>
              <p className="font-medium">{formatDate(admission.created_at)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Updated</label>
              <p className="font-medium">{formatDate(admission.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Admission"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this admission?</p>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">{admission.student_name}</p>
            <p className="text-sm text-muted-foreground">Seat: {admission.seat_no}</p>
            <p className="text-sm text-muted-foreground">Receipt: {admission.receipt_no}</p>
          </div>
          <p className="text-sm text-destructive">This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
