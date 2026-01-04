import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'

// GET - Get all settings
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Convert array to object for easier access
    const settingsObj: Record<string, string> = {}
    settings?.forEach((setting) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication and admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update each setting
    // @ts-ignore - Supabase type inference issue in strict mode
    const updates = Object.entries(body).map(([key, value]) =>
      supabase
        .from('settings')
        .update({ value: String(value), updated_at: new Date().toISOString() })
        .eq('key', key)
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
