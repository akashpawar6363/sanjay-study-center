'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { Category } from '@/types/database.types'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', rate: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, rate: category.rate.toString() })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', rate: '' })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', rate: '' })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Category name must be at least 2 characters')
        setSubmitting(false)
        return
      }

      if (!formData.rate || parseFloat(formData.rate) < 0) {
        setError('Rate must be a positive number')
        setSubmitting(false)
        return
      }

      const url = '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory
        ? { id: editingCategory.id, name: formData.name, rate: parseFloat(formData.rate) }
        : { name: formData.name, rate: parseFloat(formData.rate) }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save category')
        setSubmitting(false)
        return
      }

      handleCloseModal()
      fetchCategories()
      router.refresh()
    } catch (error) {
      console.error('Error saving category:', error)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/categories?id=${deletingCategory.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsDeleteModalOpen(false)
        setDeletingCategory(null)
        fetchCategories()
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage admission categories and rates</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admission Categories</CardTitle>
          <CardDescription>
            Configure different types of admissions with their respective rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No categories found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium">Category Name</th>
                    <th className="text-left py-3 px-2 text-sm font-medium">Rate</th>
                    <th className="text-left py-3 px-2 text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b last:border-0">
                      <td className="py-3 px-2 text-sm font-medium">{category.name}</td>
                      <td className="py-3 px-2 text-sm">{formatCurrency(category.rate)}</td>
                      <td className="py-3 px-2 text-sm">
                        {category.is_default ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            Default
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                            Custom
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(category)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!category.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingCategory(category)
                                setIsDeleteModalOpen(true)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Category Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Reserved, Non-Reserved"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="rate" className="block text-sm font-medium mb-2">
              Rate (₹)
            </label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              placeholder="Enter rate amount"
              required
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this category?</p>
          {deletingCategory && (
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">{deletingCategory.name}</p>
              <p className="text-sm text-muted-foreground">
                Rate: {formatCurrency(deletingCategory.rate)}
              </p>
            </div>
          )}
          <p className="text-sm text-destructive">
            This action cannot be undone. Existing admissions with this category will not be affected.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
