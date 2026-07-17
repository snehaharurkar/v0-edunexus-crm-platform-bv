'use client';

declare global {
  interface Window { Razorpay: any; }
}

interface Props {
  amount: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseId: string;
  studentId: string;
  onSuccess?: () => void;
}

export default function PaymentButton({
  amount, studentName, studentEmail,
  studentPhone, courseId, studentId, onSuccess
}: Props) {

  const handlePayment = async () => {
    // Load Razorpay script dynamically
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      await new Promise(r => script.onload = r);
    }

    // 1. Create order
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        receipt: `course_${courseId}`,
        notes: { studentId, courseId },
      }),
    });
    const order = await res.json();

    // 2. Open Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: 'INR',
      name: 'EduNexus',
      description: 'Course Enrollment Fee',
      order_id: order.id,
      prefill: {
        name: studentName,
        email: studentEmail,
        contact: studentPhone,
      },
      theme: { color: '#4F46E5' },
      handler: async (response: any) => {
        // 3. Verify payment
        const verify = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, studentId, courseId }),
        });
        const result = await verify.json();
        if (result.success) {
          alert('✅ Payment successful!');
          onSuccess?.();
        }
      },
    };

    new window.Razorpay(options).open();
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      Pay ₹{amount}
    </button>
  );
}