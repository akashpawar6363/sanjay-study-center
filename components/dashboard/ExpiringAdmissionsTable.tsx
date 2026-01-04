import { AdmissionWithCategory } from '@/types/admission.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, getDaysUntilExpiry } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/formatters'
import { AlertCircle } from 'lucide-react'

interface ExpiringAdmissionsTableProps {
  admissions: AdmissionWithCategory[]
}

export function ExpiringAdmissionsTable({ admissions }: ExpiringAdmissionsTableProps) {
  if (admissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Expiring Admissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No admissions expiring soon
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
          Expiring Admissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-xs md:text-sm font-medium whitespace-nowrap">Seat</th>
                    <th className="text-left py-3 px-2 text-xs md:text-sm font-medium whitespace-nowrap">Student</th>
                    <th className="text-left py-3 px-2 text-xs md:text-sm font-medium whitespace-nowrap">Category</th>
                    <th className="text-left py-3 px-2 text-xs md:text-sm font-medium whitespace-nowrap">Renewal Date</th>
                    <th className="text-left py-3 px-2 text-xs md:text-sm font-medium whitespace-nowrap">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.map((admission) => {
                    const daysLeft = getDaysUntilExpiry(admission.renewal_date)
                    return (
                      <tr key={admission.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-xs md:text-sm font-medium whitespace-nowrap">{admission.seat_no}</td>
                        <td className="py-3 px-2 text-xs md:text-sm whitespace-nowrap">{admission.student_name}</td>
                        <td className="py-3 px-2 text-xs md:text-sm whitespace-nowrap">
                          {admission.category?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-xs md:text-sm whitespace-nowrap">
                          {formatDate(admission.renewal_date)}
                        </td>
                        <td className="py-3 px-2 text-xs md:text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              daysLeft === 0
                                ? 'bg-destructive/10 text-destructive'
                                : daysLeft <= 2
                                ? 'bg-accent/10 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {daysLeft === 0 ? 'Today' : `${daysLeft} days`}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
