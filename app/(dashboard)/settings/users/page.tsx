'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { User, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Call API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          full_name: newUser.full_name,
          password: newUser.password,
          role: 'coordinator',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create user')
        return
      }

      setSuccess('User created successfully!')
      setIsAddModalOpen(false)
      setNewUser({ email: '', full_name: '', password: '' })
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error creating user:', error)
      setError('An unexpected error occurred')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/users/${deleteUserId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to delete user')
        return
      }

      setSuccess('User deleted successfully!')
      setDeleteUserId(null)
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('An unexpected error occurred')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading users...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage coordinators and administrators</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coordinator
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          {user.full_name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-500/10 text-purple-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {user.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setNewUser({ email: '', full_name: '', password: '' })
          setError('')
        }}
        title="Add New Coordinator"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              id="full_name"
              type="text"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Enter password (min 8 characters)"
              required
              minLength={8}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setNewUser({ email: '', full_name: '', password: '' })
                setError('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
