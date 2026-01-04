'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdmissionWithCategory } from '@/types/admission.types'
import { formatDate, getDaysUntilExpiry, isExpired } from '@/lib/utils/dateUtils'
import { formatCurrency, formatPhoneNumber } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Eye, Edit, Trash2, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface AdmissionListProps {
  admissions: AdmissionWithCategory[]
  userRole: 'admin' | 'coordinator'
}

export function AdmissionList({ admissions, userRole }: AdmissionListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionWithCategory | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredAdmissions = admissions.filter((admission) => {
    const matchesSearch =
      admission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.mobile_number.includes(searchTerm) ||
      admission.receipt_no.includes(searchTerm) ||
      admission.seat_no.toString().includes(searchTerm)

    const matchesStatus =
      statusFilter === 'all' ||
      admission.status === statusFilter ||
      (statusFilter === 'expiring' && getDaysUntilExpiry(admission.renewal_date) <= 7)

    return matchesSearch && matchesStatus
  })

  const handleDelete = async () => {
    if (!selectedAdmission) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admissions/${selectedAdmission.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
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

  const getStatusBadge = (admission: AdmissionWithCategory) => {
    if (isExpired(admission.renewal_date)) {
      return <span className="px-2 py-1 text-xs rounded-full bg-destructive/10 text-destructive">Expired</span>
    }
    const daysLeft = getDaysUntilExpiry(admission.renewal_date)
    if (daysLeft <= 2) {
      return <span className="px-2 py-1 text-xs rounded-full bg-destructive/10 text-destructive">Expiring Soon</span>
    }
    if (daysLeft <= 7) {
      return <span className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent">Expiring</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">Active</span>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, mobile, receipt, or seat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="renewed">Renewed</option>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredAdmissions.length} of {admissions.length} admissions
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 text-sm font-medium">Seat</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Receipt</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Student</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Contact</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Category</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Fees</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Admission</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Renewal</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Status</th>
              <th className="text-left py-3 px-2 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmissions.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  No admissions found
                </td>
              </tr>
            ) : (
              filteredAdmissions.map((admission) => (
                <tr key={admission.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm font-medium">{admission.seat_no}</td>
                  <td className="py-3 px-2 text-sm font-mono">{admission.receipt_no}</td>
                  <td className="py-3 px-2 text-sm">{admission.student_name}</td>
                  <td className="py-3 px-2 text-sm">
                    <div className="text-xs">{admission.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPhoneNumber(admission.mobile_number)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm">{admission.category?.name || 'N/A'}</td>
                  <td className="py-3 px-2 text-sm font-medium">{formatCurrency(admission.fees)}</td>
                  <td className="py-3 px-2 text-sm">{formatDate(admission.admission_date)}</td>
                  <td className="py-3 px-2 text-sm">{formatDate(admission.renewal_date)}</td>
                  <td className="py-3 px-2 text-sm">{getStatusBadge(admission)}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/admissions/${admission.id}`}>
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {userRole === 'admin' && (
                        <>
                          <Link href={`/admissions/${admission.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setIsDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Admission"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this admission?</p>
          {selectedAdmission && (
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">{selectedAdmission.student_name}</p>
              <p className="text-sm text-muted-foreground">Seat: {selectedAdmission.seat_no}</p>
              <p className="text-sm text-muted-foreground">Receipt: {selectedAdmission.receipt_no}</p>
            </div>
          )}
          <p className="text-sm text-destructive">This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
