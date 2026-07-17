import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, courseId, amount } = await req.json();

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    await supabase.from('transactions').insert({
      student_id: studentId,
      course_id: courseId,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: 'Completed',
      gateway: 'Razorpay',
      amount,
      date: new Date().toISOString().split('T')[0],
    });

    await supabase.from('enrollments').insert({
      student_id: studentId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      status: 'active',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}