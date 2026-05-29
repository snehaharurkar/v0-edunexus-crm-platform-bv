-- Razorpay Integration Database Setup
-- Copy and paste this into your Supabase SQL editor to set up tables

-- ============================================================================
-- TABLE 1: TRANSACTIONS
-- Stores all payment records from Razorpay
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student and Course Reference
  student_id varchar NOT NULL,
  course_id varchar NOT NULL,
  
  -- Razorpay Payment Details
  payment_id varchar NOT NULL UNIQUE,
  order_id varchar NOT NULL,
  
  -- Amount (in Rupees)
  amount numeric NOT NULL,
  
  -- Payment Status
  status varchar DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Failed', 'Refunded')),
  
  -- Payment Gateway
  gateway varchar DEFAULT 'Razorpay' CHECK (gateway IN ('Razorpay', 'UPI', 'Card', 'Netbanking')),
  
  -- Timestamps
  date timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_course ON transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================================================
-- TABLE 2: ENROLLMENTS
-- Auto-created when student purchases a course
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student and Course Reference
  student_id varchar NOT NULL,
  course_id varchar NOT NULL,
  
  -- Enrollment Status
  status varchar DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'suspended')),
  
  -- Timestamps
  enrolled_at timestamp DEFAULT now(),
  completed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  -- Unique constraint: one enrollment per student per course
  CONSTRAINT unique_student_course UNIQUE(student_id, course_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View to see student payment history
CREATE OR REPLACE VIEW student_payment_history AS
SELECT 
  t.student_id,
  t.course_id,
  t.amount,
  t.status,
  t.gateway,
  t.date as payment_date,
  t.order_id,
  t.payment_id,
  e.status as enrollment_status
FROM transactions t
LEFT JOIN enrollments e ON t.student_id = e.student_id AND t.course_id = e.course_id
ORDER BY t.date DESC;

-- View to see course payment statistics
CREATE OR REPLACE VIEW course_payment_stats AS
SELECT 
  course_id,
  COUNT(*) as total_payments,
  COUNT(DISTINCT student_id) as unique_students,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_payment,
  COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_payments,
  COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_payments,
  COUNT(CASE WHEN status = 'Refunded' THEN 1 END) as refunded_payments
FROM transactions
GROUP BY course_id;

-- ============================================================================
-- FUNCTIONS (OPTIONAL BUT RECOMMENDED)
-- ============================================================================

-- Function to get student enrollment count
CREATE OR REPLACE FUNCTION get_student_enrollment_count(p_student_id varchar)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM enrollments WHERE student_id = p_student_id AND status = 'active');
END;
$$ LANGUAGE plpgsql;

-- Function to check if student is enrolled in course
CREATE OR REPLACE FUNCTION is_student_enrolled(p_student_id varchar, p_course_id varchar)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM enrollments 
    WHERE student_id = p_student_id 
    AND course_id = p_course_id 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get total revenue for course
CREATE OR REPLACE FUNCTION get_course_revenue(p_course_id varchar)
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(amount), 0) 
    FROM transactions 
    WHERE course_id = p_course_id AND status = 'Completed'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Get all payments for a specific student
-- SELECT * FROM transactions WHERE student_id = 'student-123';

-- Get enrollment status for a student
-- SELECT * FROM enrollments WHERE student_id = 'student-123';

-- Get total revenue by course
-- SELECT course_id, SUM(amount) as revenue FROM transactions 
-- WHERE status = 'Completed' GROUP BY course_id;

-- Get failed payments
-- SELECT * FROM transactions WHERE status = 'Failed';

-- Get student payment history (with enrollment status)
-- SELECT * FROM student_payment_history WHERE student_id = 'student-123';

-- Get course statistics
-- SELECT * FROM course_payment_stats;

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================

-- To delete all tables (DO NOT RUN unless you want to reset):
-- DROP TABLE IF EXISTS enrollments CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP VIEW IF EXISTS student_payment_history CASCADE;
-- DROP VIEW IF EXISTS course_payment_stats CASCADE;
-- DROP FUNCTION IF EXISTS get_student_enrollment_count CASCADE;
-- DROP FUNCTION IF EXISTS is_student_enrolled CASCADE;
-- DROP FUNCTION IF EXISTS get_course_revenue CASCADE;
