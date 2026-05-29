# 🚀 Razorpay Integration - Quick Start Guide

## Setup in 5 Minutes

### Step 1: Add Environment Variables
Add these to your Vercel project settings (Settings → Vars):

```env
# Public key (visible in frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Private keys (server-side only)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Supabase (usually already set)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Get Razorpay keys from: https://dashboard.razorpay.com/app/keys

### Step 2: Create Database Tables in Supabase

```sql
-- Table 1: Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id varchar NOT NULL,
  course_id varchar NOT NULL,
  payment_id varchar NOT NULL UNIQUE,
  order_id varchar NOT NULL,
  amount numeric NOT NULL,
  status varchar DEFAULT 'Completed',
  gateway varchar DEFAULT 'Razorpay',
  date timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_transactions_student ON transactions(student_id);
CREATE INDEX idx_transactions_course ON transactions(course_id);

-- Table 2: Enrollments
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id varchar NOT NULL,
  course_id varchar NOT NULL,
  enrolled_at timestamp DEFAULT now(),
  status varchar DEFAULT 'active',
  created_at timestamp DEFAULT now(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

### Step 3: Test Payment Flow

1. Go to `/student/payment`
2. Click on the Razorpay option
3. Click "Buy Now" button
4. Use test credentials:
   - **UPI**: success@razorpay
   - **Card**: 4111 1111 1111 1111 (any future expiry, CVV: 123)
   - **OTP**: 123456

### Step 4: Verify Success

- Check `/student/courses` for "Buy Now" button
- Check `/student/dashboard` for promo section
- Check Supabase `transactions` table for payment record
- Check Supabase `enrollments` table for new enrollment

---

## 🔄 How It Works

### User Flow
```
Student sees "Buy Now ₹5999" button
    ↓
Clicks button → BuyCourseButton component triggered
    ↓
POST /api/payment/create-order → Creates Razorpay order
    ↓
Razorpay checkout modal opens with payment options
    ↓
Student selects UPI/Card/Netbanking and completes payment
    ↓
POST /api/payment/verify → Verifies signature
    ↓
Saves transaction to Supabase
    ↓
Auto-enrolls student in course
    ↓
Success toast shown + Page refreshes
```

### Behind the Scenes
- **useRazorpay hook**: Handles checkout modal and script loading
- **BuyCourseButton**: Orchestrates the entire payment flow
- **create-order API**: Communicates with Razorpay to create order
- **verify API**: Validates payment and updates database

---

## 💰 Payment Methods

Students can pay using:
- **UPI**: Google Pay, PhonePe, Paytm, WhatsApp Pay
- **Cards**: Visa, Mastercard, American Express
- **Net Banking**: All major Indian banks
- **Wallets**: PayTM, PhonePe, Amazon Pay
- **Crypto**: Bitcoin, Ethereum (via Razorpay)

---

## 🔐 Security

✅ **What's Protected**:
- Signature verification (HMAC-SHA256)
- Server-side validation only
- SSL 256-bit encryption
- API keys in env vars (not in code)
- Database indexes for performance

❌ **What's NOT Protected** (add later):
- Rate limiting
- Webhooks for async updates
- Refund management
- Fraud detection
- PCI DSS compliance

---

## 📦 Files Reference

| File | Purpose |
|------|---------|
| `hooks/useRazorpay.ts` | Checkout script & modal |
| `components/shared/BuyCourseButton.tsx` | Buy button & flow |
| `app/api/payment/create-order/route.ts` | Create Razorpay order |
| `app/api/payment/verify/route.ts` | Verify & save payment |
| `app/student/courses/page.tsx` | Course purchase button |
| `app/student/dashboard/page.tsx` | Promo section |
| `app/student/payment/page.tsx` | Payment page |

---

## 🐛 Troubleshooting

### "Razorpay is not defined"
- Check if `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify checkout script loads in browser DevTools

### "Invalid signature"
- Ensure `RAZORPAY_KEY_SECRET` matches your account
- Check payment_id and order_id are correct

### "Supabase connection error"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check database tables exist with correct schema
- Review table indexes and constraints

### "Transaction not saved"
- Check Supabase tables have correct column names
- Verify foreign keys if using constraints
- Check table permissions

---

## 🎯 Next Steps

1. ✅ Add environment variables
2. ✅ Create database tables
3. ✅ Test with test credentials
4. 📋 [TODO] Switch to live keys when ready
5. 📋 [TODO] Add webhook for async updates
6. 📋 [TODO] Implement refund interface
7. 📋 [TODO] Add payment analytics

---

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/
- **Test Credentials**: https://razorpay.com/docs/payments/payments-guide/test-mode/
- **Dashboard**: https://dashboard.razorpay.com/

---

## ✨ Features Checklist

- ✅ Multiple payment methods (UPI, Card, Netbanking)
- ✅ Real-time payment processing
- ✅ Auto-enrollment after payment
- ✅ Transaction history in database
- ✅ Success/error notifications
- ✅ Signature verification
- ✅ Server-side validation
- ✅ Environment variable protection
- ✅ Loading states & animations
- ✅ Mobile responsive design

---

**Happy Selling! 🎉**
