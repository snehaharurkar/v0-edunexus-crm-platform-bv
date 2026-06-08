import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { code, studentId } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    if (coupon.status === 'used') {
      return NextResponse.json(
        { valid: false, error: 'Coupon already used' },
        { status: 400 }
      )
    }

    if (coupon.status === 'expired') {
      return NextResponse.json(
        { valid: false, error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    if (new Date(coupon.expires_at) < new Date()) {
      await supabase
        .from('coupons')
        .update({ status: 'expired' })
        .eq('id', coupon.id)
      return NextResponse.json(
        { valid: false, error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    if (studentId && coupon.student_id !== studentId) {
      return NextResponse.json(
        { valid: false, error: 'This coupon belongs to another student' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      discountAmount: coupon.discount_amount,
      code: coupon.code,
      expiresAt: coupon.expires_at
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { code } = await request.json()

    await supabase
      .from('coupons')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('code', code)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark coupon as used' },
      { status: 500 }
    )
  }
}