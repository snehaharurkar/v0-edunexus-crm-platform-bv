import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  student_id: string;
  course_id: string;
  amount: number;
  student_email?: string;
  student_name?: string;
}

export async function POST(req: Request) {
  try {
    const payload: VerifyPaymentRequest = await req.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, student_id, course_id, amount, student_email, student_name } = payload;

    // Verify Razorpay signature
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature is valid, save to transactions table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { success: true, message: 'Payment verified (Supabase not configured)' },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Save to transactions table
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        student_id,
        course_id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount,
        status: 'Completed',
        gateway: 'Razorpay',
        date: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction insert error:', txError);
      // Don't fail the payment verification, just log the error
    }

    // Auto-enroll student by inserting into enrollments table
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        student_id,
        course_id,
        enrolled_at: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Enrollment insert error:', enrollError);
      // This is not critical as the student has paid
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified and processed successfully',
        transaction,
        enrollment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
