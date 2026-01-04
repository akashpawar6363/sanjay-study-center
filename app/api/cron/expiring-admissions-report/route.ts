import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/mailer'
import { addDays, format } from 'date-fns'
import * as XLSX from 'xlsx'

// This endpoint should be called by a cron job daily
// Sends Excel report of expiring admissions to admin
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Find admissions expiring tomorrow
    const tomorrow = addDays(new Date(), 1)
    const dayAfterTomorrow = addDays(new Date(), 2)

    const { data: expiringAdmissions, error } = await supabase
      .from('admissions')
      .select(
        `
        *,
        category:categories(name, rate)
      `
      )
      .gte('renewal_date', tomorrow.toISOString().split('T')[0])
      .lt('renewal_date', dayAfterTomorrow.toISOString().split('T')[0])
      .eq('status', 'active')
      .order('seat_no', { ascending: true })

    if (error) {
      console.error('Error fetching expiring admissions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!expiringAdmissions || expiringAdmissions.length === 0) {
      return NextResponse.json({
        message: 'No admissions expiring tomorrow',
        count: 0,
      })
    }

    // Get admin email
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'admin')
      .single()

    if (!adminProfile || !adminProfile.email) {
      return NextResponse.json({ error: 'Admin email not found' }, { status: 500 })
    }

    // Prepare Excel data
    const excelData = expiringAdmissions.map((admission) => ({
      'Seat No': admission.seat_no,
      'Receipt No': admission.receipt_no,
      'Student Name': admission.student_name,
      'Email': admission.email,
      'Mobile Number': admission.mobile_number,
      'Category': admission.category?.name || 'N/A',
      'Fees': admission.fees,
      'Discount': admission.discount || 0,
      'Admission Date': format(new Date(admission.admission_date), 'dd/MM/yyyy'),
      'Renewal Date': format(new Date(admission.renewal_date), 'dd/MM/yyyy'),
      'Duration (Months)': admission.duration_months,
      'Payment Mode': admission.payment_mode,
      'Status': admission.status,
    }))

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expiring Admissions')

    // Set column widths
    worksheet['!cols'] = [
      { wch: 10 }, // Seat No
      { wch: 15 }, // Receipt No
      { wch: 25 }, // Student Name
      { wch: 30 }, // Email
      { wch: 15 }, // Mobile
      { wch: 20 }, // Category
      { wch: 10 }, // Fees
      { wch: 10 }, // Discount
      { wch: 15 }, // Admission Date
      { wch: 15 }, // Renewal Date
      { wch: 15 }, // Duration
      { wch: 12 }, // Payment Mode
      { wch: 10 }, // Status
    ]

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const base64Excel = excelBuffer.toString('base64')

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expiring Admissions Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #dc2626;
    }
    .header h1 {
      margin: 0;
      color: #dc2626;
      font-size: 24px;
    }
    .content {
      margin: 30px 0;
    }
    .info-box {
      background-color: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 20px 0;
    }
    .count {
      font-size: 32px;
      font-weight: bold;
      color: #dc2626;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Expiring Admissions Alert</h1>
  </div>

  <div class="content">
    <p>Dear ${adminProfile.full_name || 'Admin'},</p>
    
    <div class="info-box">
      <strong>Important:</strong> The following admissions are expiring tomorrow (${format(tomorrow, 'dd MMM yyyy')}).
    </div>

    <div class="count">
      ${expiringAdmissions.length}
    </div>
    <p style="text-align: center; color: #666;">
      Student${expiringAdmissions.length > 1 ? 's' : ''} require${expiringAdmissions.length === 1 ? 's' : ''} renewal
    </p>

    <p>Please find the attached Excel file with complete details of all students whose admissions are expiring tomorrow.</p>

    <h3>Quick Summary:</h3>
    <ul>
      ${expiringAdmissions.slice(0, 5).map(admission => `
        <li>
          <strong>${admission.student_name}</strong> - Seat ${admission.seat_no}
          <br><small style="color: #666;">${admission.email} | ${admission.mobile_number}</small>
        </li>
      `).join('')}
      ${expiringAdmissions.length > 5 ? `<li><em>...and ${expiringAdmissions.length - 5} more</em></li>` : ''}
    </ul>

    <p><strong>Action Required:</strong> Please contact these students to process their renewals.</p>
  </div>

  <div class="footer">
    <p><strong>Sanjay Study Center</strong></p>
    <p>Library Management System</p>
    <p style="font-size: 12px; margin-top: 10px;">
      This is an automated daily report. Report generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}.
    </p>
  </div>
</body>
</html>
    `

    // Send email with Excel attachment
    const emailResult = await sendEmail({
      to: adminProfile.email,
      subject: `⚠️ ${expiringAdmissions.length} Admission${expiringAdmissions.length > 1 ? 's' : ''} Expiring Tomorrow - ${format(tomorrow, 'dd MMM yyyy')}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Expiring_Admissions_${format(tomorrow, 'dd-MMM-yyyy')}.xlsx`,
          content: base64Excel,
          encoding: 'base64',
        },
      ],
    })

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Log email in database
    // @ts-ignore - Supabase type inference issue in strict mode
    await supabase.from('email_logs').insert({
      email_type: 'admin_report',
      recipient_email: adminProfile.email,
      status: 'sent',
    })

    return NextResponse.json({
      message: 'Expiring admissions report sent to admin',
      count: expiringAdmissions.length,
      adminEmail: adminProfile.email,
    })
  } catch (error) {
    console.error('Error sending expiring admissions report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
