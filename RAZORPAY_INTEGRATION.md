# Razorpay Payment Integration Guide

## Overview
This document describes the Razorpay payment gateway integration for the EduNexus CRM platform. Students can now purchase courses using multiple payment methods: UPI, Credit/Debit Cards, Net Banking, and Digital Wallets.

## Architecture

### 1. **useRazorpay Hook** (`hooks/useRazorpay.ts`)
- Dynamically loads the Razorpay checkout script from CDN
- Provides `openPayment()` function to open the checkout modal
- Handles payment response callbacks
- Supports UPI, Card, Netbanking, and Wallet payment methods

### 2. **Create Order API** (`app/api/payment/create-order/route.ts`)
- POST endpoint that creates a Razorpay order
- Converts amount from rupees to paise (multiply by 100)
- Accepts: `amount`, `receipt`, `notes` (courseId, studentId, etc.)
- Returns order ID for payment authorization

### 3. **Verify Payment API** (`app/api/payment/verify/route.ts`)
- POST endpoint that verifies the Razorpay signature
- Validates payment authenticity using HMAC-SHA256
- On success: Saves transaction to Supabase `transactions` table
- Auto-enrolls student by inserting into `enrollments` table
- Returns: transaction and enrollment records

### 4. **BuyCourseButton Component** (`components/shared/BuyCourseButton.tsx`)
- Client component with "Buy Now ₹{price}" button
- Handles payment flow: Create Order → Open Checkout → Verify Payment
- Shows loading/processing states
- Displays success/error toast notifications
- Calls `router.refresh()` after successful payment

## Payment Flow

```
1. User clicks "Buy Now" button
   ↓
2. BuyCourseButton calls /api/payment/create-order
   ↓
3. Razorpay order created, order ID returned
   ↓
4. useRazorpay hook opens checkout modal with order ID
   ↓
5. User selects payment method (UPI, Card, etc.)
   ↓
6. User completes payment in Razorpay checkout
   ↓
7. Razorpay returns payment_id and signature
   ↓
8. BuyCourseButton calls /api/payment/verify
   ↓
9. Verify API validates signature and saves to Supabase
   ↓
10. Student auto-enrolled and success toast shown
```

## Database Schema

### transactions table
```sql
- student_id: UUID/String (references students)
- course_id: UUID/String (references courses)
- payment_id: String (Razorpay payment ID)
- order_id: String (Razorpay order ID)
- amount: Numeric (amount in rupees)
- status: Enum ('Completed', 'Pending', 'Failed', 'Refunded')
- gateway: String ('Razorpay')
- date: Timestamp (payment datetime)
```

### enrollments table
```sql
- student_id: UUID/String (references students)
- course_id: UUID/String (references courses)
- enrolled_at: Timestamp (enrollment datetime)
- status: Enum ('active', 'completed', 'cancelled')
```

## Environment Variables Required

```bash
# Public (visible in frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Private (server-side only)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Usage

### Adding BuyCourseButton to a page
```tsx
import BuyCourseButton from '@/components/shared/BuyCourseButton'

export default function CoursePage() {
  return (
    <BuyCourseButton
      courseId="course-123"
      courseName="Advanced React Development"
      price={5999}
      studentId={student.id}
      studentEmail={student.email}
      studentName={student.name}
    />
  )
}
```

### Props
- `courseId`: Unique course identifier
- `courseName`: Display name of the course
- `price`: Price in INR (rupees)
- `studentId`: Student's unique ID
- `studentEmail`: Student's email (optional)
- `studentName`: Student's name (optional)
- `className`: Additional CSS classes (optional)
- `variant`: Button variant - 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' (default: 'default')
- `size`: Button size - 'default' | 'sm' | 'lg' | 'icon' (default: 'default')

## Pages with BuyCourseButton Integration

1. **Student Courses** (`app/student/courses/page.tsx`)
   - Shows "Buy Now" button next to enrolled course progress

2. **Student Dashboard** (`app/student/dashboard/page.tsx`)
   - Quick action to purchase new courses

3. **Student Payment** (`app/student/payment/page.tsx`)
   - Two payment options: Razorpay (recommended) and Traditional
   - Direct integration with BuyCourseButton

## Payment Methods Supported

- **UPI**: Google Pay, PhonePe, Paytm, WhatsApp Pay
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Net Banking**: All major Indian banks
- **Digital Wallets**: PhonePe, PayTM, Amazon Pay
- **Emerging**: Cryptocurrency support (via Razorpay)

## Error Handling

### Create Order Failures
- Invalid amount or receipt
- Missing environment variables
- Razorpay API errors

### Payment Verification Failures
- Invalid signature (potential fraud)
- Supabase connection issues
- Missing database tables

All errors are logged and appropriate user-friendly toast messages are shown.

## Security Features

1. **Signature Verification**: HMAC-SHA256 validation
2. **SSL Encryption**: 256-bit encryption for all transactions
3. **PCI Compliance**: Razorpay handles sensitive card data
4. **Server-side Validation**: All amounts and signatures verified on server
5. **Environment Variable Protection**: Keys stored securely in env vars

## Testing

### Test Razorpay Keys
- Key ID: `rzp_test_xxxxxxxxxxxxx`
- Key Secret: `xxxxxxxxxxxxxxxx`

### Test Payment Details
```
UPI: success@razorpay  (or any UPI-style ID)
Card: 4111 1111 1111 1111 (expires: any future date, CVV: 123)
OTP: 123456
```

## Troubleshooting

### "Razorpay credentials are not configured"
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Verify environment variables in deployment platform

### "Invalid signature"
- Ensure `RAZORPAY_KEY_SECRET` matches your Razorpay account
- Check payment_id and order_id are correct

### "Failed to save transaction"
- Verify `transactions` table exists in Supabase
- Check column names match the schema
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is valid

### Payment modal doesn't open
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is correct
- Check browser console for errors
- Ensure checkout script loaded from CDN

## Future Enhancements

1. Webhook support for asynchronous payment updates
2. Subscription/recurring payments
3. Refund management interface
4. Payment reconciliation dashboard
5. International payment support
6. Email receipt generation
7. Payment analytics and reports

## Support

For Razorpay integration issues, refer to:
- Razorpay Documentation: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Dashboard: https://dashboard.razorpay.com/
