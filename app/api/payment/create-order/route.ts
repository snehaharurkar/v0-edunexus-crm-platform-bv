import { NextResponse } from 'next/server';

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { amount, receipt, notes } = await req.json();
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt,
    notes,
  });
  return NextResponse.json(order);
}