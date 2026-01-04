import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateRenewalDate } from '@/lib/utils/dateUtils'
import { sendEmail } from '@/lib/email/mailer'
import { getAdmissionReceiptTemplate } from '@/lib/email/templates/admission-receipt'

// GET - List all admissions
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admissions with category details
    const { data: admissions, error } = await supabase
      .from('admissions')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admissions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ admissions })
  } catch (error) {
    console.error('Error in GET /api/admissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new admission
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (admin or coordinator can create)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'coordinator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Get next receipt number
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'current_receipt_number')
      .single()

    const currentNumber = parseInt(setting?.value || '1000')
    const nextNumber = currentNumber + 1
    const receiptNo = `RCP-${nextNumber}`

    // Calculate renewal date
    const renewalDate = calculateRenewalDate(
      body.admission_date,
      body.duration_months
    )

    // Get user's digital signature
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('digital_signature_url')
      .eq('id', user.id)
      .single()

    // Create admission
    const { data: admission, error: admissionError } = await supabase
      .from('admissions')
      .insert({
        seat_no: body.seat_no,
        category_id: body.category_id,
        receipt_no: receiptNo,
        admission_date: body.admission_date,
        duration_months: body.duration_months,
        renewal_date: renewalDate.toISOString().split('T')[0],
        student_name: body.student_name,
        email: body.email,
        fees: body.fees,
        discount: body.discount || 0,
        mobile_number: body.mobile_number,
        payment_mode: body.payment_mode,
        digital_signature_url: userProfile?.digital_signature_url,
        created_by: user.id,
        status: 'active',
      })
      .select('*, category:categories(*)')
      .single()

    if (admissionError) {
      console.error('Error creating admission:', admissionError)
      return NextResponse.json({ error: admissionError.message }, { status: 500 })
    }

    // Update receipt number
    await supabase
      .from('settings')
      .update({ value: nextNumber.toString() })
      .eq('key', 'current_receipt_number')

    // Send admission receipt email
    try {
      const emailHtml = getAdmissionReceiptTemplate({
        studentName: admission.student_name,
        admissionNumber: admission.seat_no,
        receiptNumber: admission.receipt_no,
        category: admission.category.name,
        categoryFee: admission.fees,
        startDate: admission.admission_date,
        renewalDate: admission.renewal_date,
        mobileNumber: admission.mobile_number,
        paymentMode: admission.payment_mode,
        digitalSignatureUrl: admission.digital_signature_url,
      })

      await sendEmail({
        to: admission.email,
        subject: `Admission Receipt - ${admission.receipt_no}`,
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Error sending admission receipt email:', emailError)
      // Don't fail the admission creation if email fails
    }

    return NextResponse.json({ admission }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
