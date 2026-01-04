import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/mailer'
import { getRenewalReminderTemplate } from '@/lib/email/templates/renewal-reminder'
import { addDays, differenceInDays } from 'date-fns'

// This endpoint should be called by a cron job daily
// Example: Vercel Cron, GitHub Actions, or any external scheduler
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Find admissions expiring in 2 days
    const twoDaysFromNow = addDays(new Date(), 2)
    const threeDaysFromNow = addDays(new Date(), 3)

    const { data: expiringAdmissions, error } = await supabase
      .from('admissions')
      .select(
        `
        *,
        category:categories(name, fee)
      `
      )
      .gte('renewal_date', twoDaysFromNow.toISOString().split('T')[0])
      .lt('renewal_date', threeDaysFromNow.toISOString().split('T')[0])
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching expiring admissions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = {
      total: expiringAdmissions?.length || 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    }

    if (!expiringAdmissions || expiringAdmissions.length === 0) {
      return NextResponse.json({
        message: 'No admissions expiring in 2 days',
        results,
      })
    }

    // Send reminder emails
    for (const admission of expiringAdmissions) {
      if (!admission.email) {
        results.skipped++
        continue
      }

      const daysRemaining = differenceInDays(
        new Date(admission.renewal_date),
        new Date()
      )

      const emailHtml = getRenewalReminderTemplate({
        studentName: admission.student_name,
        admissionNumber: admission.admission_number,
        category: admission.category.name,
        categoryFee: admission.category.fee,
        renewalDate: admission.renewal_date,
        daysRemaining,
      })

      const emailResult = await sendEmail({
        to: admission.email,
        subject: `Renewal Reminder - ${admission.admission_number}`,
        html: emailHtml,
      })

      if (emailResult.success) {
        results.sent++
        // Log email in database
        // @ts-ignore - Supabase type inference issue in strict mode
        await supabase.from('email_logs').insert({
          admission_id: admission.id,
          email_type: 'reminder',
          recipient: admission.email,
          subject: `Renewal Reminder - ${admission.admission_number}`,
          status: 'sent',
        })
      } else {
        results.failed++
        // Log failed email
        // @ts-ignore - Supabase type inference issue in strict mode
        await supabase.from('email_logs').insert({
          admission_id: admission.id,
          email_type: 'reminder',
          recipient: admission.email,
          subject: `Renewal Reminder - ${admission.admission_number}`,
          status: 'failed',
        })
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return NextResponse.json({
      message: 'Renewal reminders processed',
      results,
    })
  } catch (error) {
    console.error('Error processing renewal reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
