'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface OccupancyChartProps {
  occupiedSeats: number
  totalSeats: number
}

export function OccupancyChart({ occupiedSeats, totalSeats }: OccupancyChartProps) {
  const availableSeats = totalSeats - occupiedSeats
  const occupancyRate = ((occupiedSeats / totalSeats) * 100).toFixed(1)

  const data = {
    labels: ['Occupied', 'Available'],
    datasets: [
      {
        data: [occupiedSeats, availableSeats],
        backgroundColor: [
          'hsl(var(--primary))',
          'hsl(var(--muted))',
        ],
        borderColor: [
          'hsl(var(--primary))',
          'hsl(var(--muted))',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const percentage = ((value / totalSeats) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seat Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-center justify-center">
          <Doughnut data={data} options={options} />
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold">{occupancyRate}%</p>
          <p className="text-sm text-muted-foreground">Occupancy Rate</p>
        </div>
      </CardContent>
    </Card>
  )
}
