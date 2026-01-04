import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdmissionList } from '@/components/admissions/AdmissionList'

export default async function AdmissionsPage() {
  const supabase = await createServerSupabaseClient()

  // Get user profile to check role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all admissions with category details
  const { data: admissions } = await supabase
    .from('admissions')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admissions</h1>
          <p className="text-muted-foreground">Manage student admissions</p>
        </div>
        <Link href="/admissions/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <AdmissionList 
          admissions={admissions || []} 
          userRole={profile?.role || 'coordinator'}
        />
      </Card>
    </div>
  )
}
