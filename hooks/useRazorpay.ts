'use client';

import { useCallback, useEffect, useState } from 'react';

interface RazorpayOptions {
  key_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Window {
  Razorpay?: any;
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const openPayment = useCallback(async (options: RazorpayOptions) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      console.error('Razorpay is not loaded');
      return;
    }

    setIsLoading(true);

    try {
      const razorpayInstance = new window.Razorpay({
        key_id: options.key_id,
        order_id: options.order_id,
        currency: options.currency,
        amount: options.amount,
        name: options.name,
        description: options.description,
        prefill: options.prefill || {},
        theme: options.theme || { color: '#3b82f6' },
        handler: (response: RazorpayPaymentResponse) => {
          setIsLoading(false);
          if (options.handler) {
            options.handler(response);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
          },
        },
      });

      razorpayInstance.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { openPayment, isLoading };
};
