'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { Upload, X, User, FileSignature } from 'lucide-react'
import Image from 'next/image'
import { Profile } from '@/types/user.types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single() as { data: Profile | null }

        if (profileData) {
          setProfile(profileData)
          setFormData({
            full_name: profileData.full_name || '',
            email: profileData.email || '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not found')
        setSubmitting(false)
        return
      }

      // @ts-ignore - Supabase type inference issue in strict mode
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
        setSubmitting(false)
        return
      }

      setSuccess('Profile updated successfully!')
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = async (
    file: File,
    type: 'profile_photo' | 'digital_signature'
  ) => {
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    setUploading(type)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Upload failed')
        setUploading(null)
        return
      }

      setSuccess(
        type === 'profile_photo'
          ? 'Profile photo uploaded successfully!'
          : 'Digital signature uploaded successfully!'
      )

      // Refresh profile data
      await fetchProfile()
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error uploading file:', error)
      setError('Failed to upload file')
    } finally {
      setUploading(null)
    }
  }

  const handleDeleteFile = async (type: 'profile_photo' | 'digital_signature') => {
    if (!profile) return

    const fileUrl =
      type === 'profile_photo' ? profile.profile_photo_url : profile.digital_signature_url

    if (!fileUrl) return

    if (!confirm(`Are you sure you want to delete this ${type.replace('_', ' ')}?`)) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `/api/upload?url=${encodeURIComponent(fileUrl)}&type=${type}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Delete failed')
        return
      }

      setSuccess('File deleted successfully!')
      await fetchProfile()
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting file:', error)
      setError('Failed to delete file')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <div className="px-3 py-2 bg-muted rounded-md">
                <span className="capitalize">{profile?.role || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Photo & Digital Signature</CardTitle>
            <CardDescription>Upload your photo and digital signature for receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium mb-3">Profile Photo</label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {profile?.profile_photo_url ? (
                    <div className="relative">
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                        <Image
                          src={profile.profile_photo_url}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => handleDeleteFile('profile_photo')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={profilePhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'profile_photo')
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profilePhotoInputRef.current?.click()}
                      disabled={uploading === 'profile_photo'}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading === 'profile_photo'
                        ? 'Uploading...'
                        : profile?.profile_photo_url
                        ? 'Change Photo'
                        : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPEG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Signature */}
              <div>
                <label className="block text-sm font-medium mb-3">Digital Signature</label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {profile?.digital_signature_url ? (
                    <div className="relative">
                      <div className="w-48 h-24 rounded-lg overflow-hidden border-2 border-border bg-white">
                        <Image
                          src={profile.digital_signature_url}
                          alt="Signature"
                          width={192}
                          height={96}
                          className="object-contain w-full h-full p-2"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => handleDeleteFile('digital_signature')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-48 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <FileSignature className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'digital_signature')
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={uploading === 'digital_signature'}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading === 'digital_signature'
                        ? 'Uploading...'
                        : profile?.digital_signature_url
                        ? 'Change Signature'
                        : 'Upload Signature'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Will be added to admission receipts. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>
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
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
