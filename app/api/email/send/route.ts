import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/mailer'
import { getAdmissionReceiptTemplate } from '@/lib/email/templates/admission-receipt'
import { getRenewalReminderTemplate } from '@/lib/email/templates/renewal-reminder'
import { differenceInDays } from 'date-fns'

// Send admission receipt email
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

    const { admissionId, type = 'receipt' } = await request.json()

    // Fetch admission details with category
    const { data: admission, error: admissionError } = await supabase
      .from('admissions')
      .select(
        `
        *,
        category:categories(name, fee)
      `
      )
      .eq('id', admissionId)
      .single()

    if (admissionError || !admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    let emailHtml: string
    let emailSubject: string

    if (type === 'receipt') {
      emailHtml = getAdmissionReceiptTemplate({
        studentName: admission.student_name,
        admissionNumber: admission.admission_number,
        receiptNumber: admission.receipt_number,
        category: admission.category.name,
        categoryFee: admission.category.fee,
        startDate: admission.start_date,
        renewalDate: admission.renewal_date,
        mobileNumber: admission.mobile_number,
        paymentMode: admission.payment_mode,
      })
      emailSubject = `Admission Receipt - ${admission.receipt_number}`
    } else if (type === 'reminder') {
      const daysRemaining = differenceInDays(
        new Date(admission.renewal_date),
        new Date()
      )
      emailHtml = getRenewalReminderTemplate({
        studentName: admission.student_name,
        admissionNumber: admission.admission_number,
        category: admission.category.name,
        categoryFee: admission.category.fee,
        renewalDate: admission.renewal_date,
        daysRemaining,
      })
      emailSubject = `Renewal Reminder - ${admission.admission_number}`
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    // Send email if email address is available
    if (admission.email) {
      const emailResult = await sendEmail({
        to: admission.email,
        subject: emailSubject,
        html: emailHtml,
      })

      if (!emailResult.success) {
        return NextResponse.json(
          { error: 'Failed to send email', details: emailResult.error },
          { status: 500 }
        )
      }

      // Log email in database
      // @ts-ignore - Supabase type inference issue in strict mode
      await supabase.from('email_logs').insert({
        admission_id: admissionId,
        email_type: type,
        recipient: admission.email,
        subject: emailSubject,
        status: 'sent',
      })

      return NextResponse.json({
        message: 'Email sent successfully',
        messageId: emailResult.messageId,
      })
    } else {
      return NextResponse.json(
        { error: 'No email address found for this admission' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
