import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
}

export function StatsCard({ title, value, icon, trend, subtitle }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1 text-destructive" />
            )}
            <span className={cn(
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {Math.abs(trend.value)}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
