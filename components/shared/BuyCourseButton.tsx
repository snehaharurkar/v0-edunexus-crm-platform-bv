'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useRazorpay } from '@/hooks/useRazorpay';
import { toast } from 'sonner';
import { Loader2, ShoppingCart } from 'lucide-react';

interface BuyCourseButtonProps {
  courseId: string;
  courseName: string;
  price: number;
  studentId?: string;
  studentEmail?: string;
  studentName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function BuyCourseButton({
  courseId,
  courseName,
  price,
  studentId,
  studentEmail,
  studentName,
  className,
  variant = 'default',
  size = 'default',
}: BuyCourseButtonProps) {
  const router = useRouter();
  const { openPayment, isLoading } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    // Check if student is logged in
    if (!studentId) {
      toast.error('Please log in to purchase a course');
      router.push('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create order via API
      const createOrderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          receipt: `receipt_${courseId}_${studentId}_${Date.now()}`,
          notes: {
            courseId,
            courseName,
            studentId,
            studentEmail,
            studentName,
          },
        }),
      });

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await createOrderResponse.json();

      // Step 2: Open Razorpay checkout
      await openPayment({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: price * 100, // Convert to paise
        currency: 'INR',
        name: 'EduNexus',
        description: `Enrollment for ${courseName}`,
        order_id: orderData.id,
        prefill: {
          name: studentName,
          email: studentEmail,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                student_id: studentId,
                course_id: courseId,
                amount: price,
                student_email: studentEmail,
                student_name: studentName,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyResponse.json();

            toast.success('Payment successful! You are now enrolled in the course.');
            router.refresh();

            // Redirect to course or dashboard after a brief delay
            setTimeout(() => {
              router.push('/student/courses');
            }, 2000);
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  }, [courseId, courseName, price, studentId, studentEmail, studentName, router, openPayment]);

  const isDisabled = isProcessing || isLoading;

  return (
    <Button
      onClick={handlePayment}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
    >
      {isDisabled ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now ₹{price.toLocaleString()}
        </>
      )}
    </Button>
  );
}
