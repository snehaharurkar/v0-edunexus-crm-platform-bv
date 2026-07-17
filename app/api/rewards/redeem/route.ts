import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCouponCode(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = prefix + '-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: Request) {
  try {
    const {
      studentId,
      studentName,
      rewardName,
      pointsRequired,
      discountAmount,
      rewardType
    } = await request.json()

    if (!studentId || !pointsRequired || !discountAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check student has enough points
    const { data: pointsData } = await supabase
      .from('student_points')
      .select('available_points')
      .eq('student_id', studentId)
      .single()

    const availablePoints = pointsData?.available_points || 0

    if (availablePoints < pointsRequired) {
      return NextResponse.json(
        { error: `Not enough points. You have ${availablePoints} but need ${pointsRequired}` },
        { status: 400 }
      )
    }

    // Generate coupon code
    const prefix = rewardType === 'discount' ? 'DISC' :
                   rewardType === 'amazon' ? 'AMZ' :
                   rewardType === 'starbucks' ? 'SBX' : 'RWRD'

    const couponCode = generateCouponCode(prefix)

    // Save coupon to database
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .insert([{
        code: couponCode,
        student_id: studentId,
        student_name: studentName,
        discount_amount: discountAmount,
        points_used: pointsRequired,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (couponError) {
      console.error('Coupon error:', couponError)
      return NextResponse.json(
        { error: 'Failed to generate coupon' },
        { status: 500 }
      )
    }

    // Save redemption record
    await supabase.from('reward_redemptions').insert([{
      student_id: studentId,
      student_name: studentName,
      reward_name: rewardName,
      points_used: pointsRequired,
      coupon_code: couponCode,
      status: rewardType === 'discount' ? 'approved' : 'pending'
    }])

    // Deduct points from student
    await supabase
      .from('student_points')
      .update({
        used_points: supabase.rpc('increment', { x: pointsRequired }),
        available_points: availablePoints - pointsRequired,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)

    return NextResponse.json({
      success: true,
      couponCode,
      discountAmount,
      expiresAt: coupon.expires_at,
      type: rewardType
    })

  } catch (error) {
    console.error('Redeem error:', error)
    return NextResponse.json(
      { error: 'Failed to process redemption' },
      { status: 500 }
    )
  }
}