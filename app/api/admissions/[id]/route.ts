import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateRenewalDate } from '@/lib/utils/dateUtils'
import { sendEmail } from '@/lib/email/mailer'
import { getAdmissionReceiptTemplate } from '@/lib/email/templates/admission-receipt'

// GET - Get single admission
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: admission, error } = await supabase
      .from('admissions')
      .select('*, category:categories(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching admission:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    return NextResponse.json({ admission })
  } catch (error) {
    console.error('Error in GET /api/admissions/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update admission
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (only admin can update)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Calculate renewal date if admission date or duration changed
    const renewalDate = calculateRenewalDate(
      body.admission_date,
      body.duration_months
    )

    // Update admission
    const { data: admission, error: updateError } = await supabase
      .from('admissions')
      .update({
        seat_no: body.seat_no,
        category_id: body.category_id,
        admission_date: body.admission_date,
        duration_months: body.duration_months,
        renewal_date: renewalDate.toISOString().split('T')[0],
        student_name: body.student_name,
        email: body.email,
        fees: body.fees,
        discount: body.discount || 0,
        mobile_number: body.mobile_number,
        payment_mode: body.payment_mode,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('*, category:categories(*)')
      .single()

    if (updateError) {
      console.error('Error updating admission:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Get user's digital signature for the email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('digital_signature_url')
      .eq('id', user.id)
      .single()

    // Send updated admission receipt email
    try {
      const emailHtml = getAdmissionReceiptTemplate({
        studentName: admission.student_name,
        admissionNumber: admission.seat_no.toString(),
        receiptNumber: admission.receipt_no,
        category: admission.category.name,
        categoryFee: admission.fees,
        startDate: admission.admission_date,
        renewalDate: admission.renewal_date,
        mobileNumber: admission.mobile_number,
        paymentMode: admission.payment_mode,
        digitalSignatureUrl: userProfile?.digital_signature_url || admission.digital_signature_url,
      })

      await sendEmail({
        to: admission.email,
        subject: `📝 Updated Admission Receipt - ${admission.receipt_no}`,
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Error sending updated admission receipt email:', emailError)
      // Don't fail the update if email fails
    }

    return NextResponse.json({ admission })
  } catch (error) {
    console.error('Error in PUT /api/admissions/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete admission
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (only admin can delete)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete admission
    const { error: deleteError } = await supabase
      .from('admissions')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting admission:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admissions/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
