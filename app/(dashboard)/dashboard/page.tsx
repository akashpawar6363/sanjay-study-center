import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { OccupancyChart } from '@/components/dashboard/OccupancyChart'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { ExpiringAdmissionsTable } from '@/components/dashboard/ExpiringAdmissionsTable'
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Get total admissions
  const { count: totalAdmissions } = await supabase
    .from('admissions')
    .select('*', { count: 'exact', head: true })

  // Get active admissions
  const { count: activeAdmissions } = await supabase
    .from('admissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('admissions')
    .select('fees') as { data: { fees: number }[] | null }

  const totalRevenue = revenueData?.reduce((sum, admission) => sum + admission.fees, 0) || 0

  // Get total seats from settings
  const { data: seatsSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'total_seats')
    .single() as { data: { value: string } | null }

  const totalSeats = parseInt(seatsSetting?.value || '50')
  const occupiedSeats = activeAdmissions || 0

  // Get expiring admissions (next 7 days)
  const today = new Date()
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  const { data: expiringAdmissions } = await supabase
    .from('admissions')
    .select('*, category:categories(*)')
    .eq('status', 'active')
    .gte('renewal_date', today.toISOString().split('T')[0])
    .lte('renewal_date', sevenDaysLater.toISOString().split('T')[0])
    .order('renewal_date', { ascending: true })

  const { count: expiringCount } = await supabase
    .from('admissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('renewal_date', today.toISOString().split('T')[0])
    .lte('renewal_date', sevenDaysLater.toISOString().split('T')[0])

  // Get monthly revenue data for chart (last 6 months)
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    const { data: monthData } = await supabase
      .from('admissions')
      .select('fees')
      .gte('admission_date', monthStart.toISOString().split('T')[0])
      .lte('admission_date', monthEnd.toISOString().split('T')[0]) as { data: { fees: number }[] | null }

    const revenue = monthData?.reduce((sum, admission) => sum + admission.fees, 0) || 0

    monthlyRevenue.push({
      month: format(monthDate, 'MMM'),
      revenue,
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Overview of your library management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Admissions"
          value={totalAdmissions || 0}
          icon={<Users className="w-4 h-4" />}
          subtitle="All time"
        />
        <StatsCard
          title="Active Admissions"
          value={activeAdmissions || 0}
          icon={<TrendingUp className="w-4 h-4" />}
          subtitle="Currently enrolled"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle="All time earnings"
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringCount || 0}
          icon={<AlertCircle className="w-4 h-4" />}
          subtitle="Next 7 days"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        <OccupancyChart occupiedSeats={occupiedSeats} totalSeats={totalSeats} />
        <RevenueChart monthlyData={monthlyRevenue} />
      </div>

      {/* Expiring Admissions Table */}
      <ExpiringAdmissionsTable admissions={expiringAdmissions || []} />
    </div>
  )
}
