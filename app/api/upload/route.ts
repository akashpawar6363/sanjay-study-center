import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'profile_photo' or 'digital_signature'
    const userId = formData.get('userId') as string || user.id

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileType || !['profile_photo', 'digital_signature'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Check if user has permission to upload for this userId
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userId !== user.id && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only upload files for yourself unless you are an admin' },
        { status: 403 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${fileType}_${Date.now()}.${fileExt}`
    const filePath = fileName

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(filePath)

    // Update user profile with the file URL
    const updateField =
      fileType === 'profile_photo' ? 'profile_photo_url' : 'digital_signature_url'

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        [updateField]: publicUrl,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: publicUrl,
      type: fileType,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete uploaded file
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')
    const fileType = searchParams.get('type')
    const userId = searchParams.get('userId') || user.id

    if (!fileUrl || !fileType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userId !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Extract file path from URL
    const urlParts = fileUrl.split('/profile-photos/')
    if (urlParts.length < 2) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 })
    }
    const filePath = urlParts[1]

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([filePath])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Update profile to remove URL
    const updateField =
      fileType === 'profile_photo' ? 'profile_photo_url' : 'digital_signature_url'

    await supabase
      .from('profiles')
      .update({
        [updateField]: null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', userId)

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
