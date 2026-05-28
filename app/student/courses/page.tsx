"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { mockStudents, mockCourses, type Course } from "@/lib/mock-data"
import { toast } from "sonner"
import {
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  Download,
  Play,
  Clock,
  ShoppingCart,
  CreditCard,
  Check,
  Copy,
  Loader2,
  Lock,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface EnrolledCourse {
  id: string
  name: string
  trainer: string
  duration: string
  progress: number
  price: number
}

const recordings = [
  { id: 1, title: "React Fundamentals - Introduction", duration: "1h 30m", date: "May 20, 2024" },
  { id: 2, title: "Component Lifecycle & Hooks", duration: "2h 15m", date: "May 22, 2024" },
  { id: 3, title: "State Management with Redux", duration: "1h 45m", date: "May 24, 2024" },
  { id: 4, title: "React Router & Navigation", duration: "1h 20m", date: "May 26, 2024" },
]

const notes = [
  { id: 1, title: "React Basics Cheatsheet", size: "2.5 MB", type: "PDF" },
  { id: 2, title: "Hooks Reference Guide", size: "1.8 MB", type: "PDF" },
  { id: 3, title: "Redux Flow Diagram", size: "500 KB", type: "PNG" },
  { id: 4, title: "Project Setup Guide", size: "1.2 MB", type: "PDF" },
]

const assignments = [
  { id: 1, title: "Build a Todo App", dueDate: "May 30, 2024", status: "submitted", grade: "A" },
  { id: 2, title: "Create a Weather Dashboard", dueDate: "June 5, 2024", status: "pending", grade: null },
  { id: 3, title: "E-commerce Cart System", dueDate: "June 10, 2024", status: "pending", grade: null },
]

type PaymentMethod = 'upi' | 'phonepe' | 'paytm' | 'paypal' | 'bitcoin'
type PaymentStep = 'summary' | 'payment' | 'processing' | 'success'

export default function StudentCourses() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"recordings" | "notes" | "assignments">("recordings")
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('summary')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [paymentInput, setPaymentInput] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [transactionId, setTransactionId] = useState('')
  
  // Enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      // Initialize with one enrolled course
      const student = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]
      const enrolled = mockCourses.find((c) => c.title === student.course)
      if (enrolled) {
        setEnrolledCourses([{
          id: enrolled.id,
          name: enrolled.title,
          trainer: enrolled.trainer,
          duration: enrolled.duration,
          progress: student.progress,
          price: enrolled.price,
        }])
      }
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [user?.email])

  const student = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]
  
  // Get unenrolled courses
  const unenrolledCourses = mockCourses.filter(
    course => !enrolledCourses.some(ec => ec.id === course.id)
  )

  const handleBuyCourse = (course: Course) => {
    setSelectedCourse(course)
    setPaymentStep('summary')
    setPaymentMethod(null)
    setCouponCode('')
    setAppliedDiscount(0)
    setPaymentInput('')
    setIsPaymentModalOpen(true)
  }

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'edu20') {
      setAppliedDiscount(20)
      toast.success('Coupon applied! 20% discount')
    } else if (couponCode.toLowerCase() === 'edu10') {
      setAppliedDiscount(10)
      toast.success('Coupon applied! 10% discount')
    } else if (couponCode) {
      toast.error('Invalid coupon code')
    }
  }

  const getFinalAmount = () => {
    if (!selectedCourse) return 0
    return selectedCourse.price * (1 - appliedDiscount / 100)
  }

  const getUSDAmount = () => {
    return (getFinalAmount() / 83).toFixed(2) // Approx INR to USD
  }

  const getBTCAmount = () => {
    return (getFinalAmount() / 5500000).toFixed(6) // Approx INR to BTC
  }

  const handlePayment = async () => {
    // Validate input based on payment method
    if (paymentMethod === 'upi' && !paymentInput.includes('@')) {
      toast.error('Please enter a valid UPI ID')
      return
    }
    if ((paymentMethod === 'phonepe' || paymentMethod === 'paytm') && paymentInput.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    if (paymentMethod === 'paypal' && !paymentInput.includes('@')) {
      toast.error('Please enter a valid PayPal email')
      return
    }

    // Move to processing
    setPaymentStep('processing')
    setProcessingProgress(0)

    // Simulate processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // After processing complete, show success
    setTimeout(() => {
      clearInterval(interval)
      setProcessingProgress(100)
      setTransactionId(`TXN${Date.now()}`)
      setPaymentStep('success')
    }, 2500)
  }

  const handleBitcoinConfirm = () => {
    setPaymentStep('processing')
    setProcessingProgress(0)

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setProcessingProgress(100)
      setTransactionId(`TXN${Date.now()}`)
      setPaymentStep('success')
    }, 2500)
  }

  const handleCompleteEnrollment = () => {
    if (selectedCourse) {
      // Add to enrolled courses
      setEnrolledCourses(prev => [...prev, {
        id: selectedCourse.id,
        name: selectedCourse.title,
        trainer: selectedCourse.trainer,
        duration: selectedCourse.duration,
        progress: 0,
        price: selectedCourse.price,
      }])
      toast.success('Course enrolled successfully!', {
        description: `You can now access ${selectedCourse.title}`,
      })
    }
    setIsPaymentModalOpen(false)
    setSelectedCourse(null)
    setPaymentStep('summary')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Courses</h1>

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Enrolled Courses</h2>
          {enrolledCourses.map(course => (
            <div key={course.id} className="rounded-xl border bg-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{course.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Duration: {course.duration} - Trainer: {course.trainer}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>{recordings.length} Recordings</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{notes.length} Notes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        <span>{assignments.length} Assignments</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-32 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs for enrolled course content */}
      {enrolledCourses.length > 0 && (
        <>
          <div className="flex gap-2 border-b">
            {(["recordings", "notes", "assignments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "recordings" && <Video className="h-4 w-4" />}
                {tab === "notes" && <FileText className="h-4 w-4" />}
                {tab === "assignments" && <ClipboardList className="h-4 w-4" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTab === "recordings" &&
              recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{recording.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recording.duration}
                        </span>
                        <span>{recording.date}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Play className="h-4 w-4" />
                    Watch
                  </Button>
                </div>
              ))}

            {activeTab === "notes" &&
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-orange-500/10 p-2">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{note.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {note.type} - {note.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}

            {activeTab === "assignments" &&
              assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-lg p-2 ${
                        assignment.status === "submitted"
                          ? "bg-green-500/10"
                          : "bg-yellow-500/10"
                      }`}
                    >
                      <ClipboardList
                        className={`h-5 w-5 ${
                          assignment.status === "submitted"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Due: {assignment.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {assignment.grade && (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                        Grade: {assignment.grade}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        assignment.status === "submitted"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}
                    >
                      {assignment.status === "submitted" ? "Submitted" : "Pending"}
                    </span>
                    {assignment.status === "pending" && (
                      <Button size="sm">Submit</Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Available Courses */}
      {unenrolledCourses.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Available Courses</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {unenrolledCourses.map(course => (
              <div key={course.id} className="rounded-xl border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{course.duration}</span>
                      <span>-</span>
                      <span>{course.trainer}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold text-primary">
                        Rs. {course.price.toLocaleString()}
                      </span>
                      <Button onClick={() => handleBuyCourse(course)} className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Buy Course
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-xl m-4">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Step 1: Order Summary */}
            {paymentStep === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Order Summary</h2>
                  <p className="text-muted-foreground">Review your order</p>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course</span>
                    <span className="font-medium">{selectedCourse.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{selectedCourse.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span>Rs. {selectedCourse.price.toLocaleString()}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedDiscount}%)</span>
                      <span>- Rs. {((selectedCourse.price * appliedDiscount) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rs. {getFinalAmount().toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="space-y-2">
                  <Label>Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      disabled={appliedDiscount > 0}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={appliedDiscount > 0}
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Try: EDU20 for 20% off</p>
                </div>

                <Button className="w-full" onClick={() => setPaymentStep('payment')}>
                  Proceed to Payment
                </Button>
              </div>
            )}

            {/* Step 2: Payment Method Selection */}
            {paymentStep === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Select Payment Method</h2>
                  <p className="text-muted-foreground">Choose how you want to pay</p>
                </div>

                <div className="space-y-3">
                  {/* UPI */}
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      paymentMethod === 'upi' ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                        UPI
                      </div>
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                      </div>
                    </div>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => setPaymentMethod('phonepe')}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      paymentMethod === 'phonepe' ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        Pe
                      </div>
                      <div>
                        <p className="font-medium">PhonePe</p>
                        <p className="text-sm text-muted-foreground">Pay with PhonePe wallet</p>
                      </div>
                    </div>
                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => setPaymentMethod('paytm')}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      paymentMethod === 'paytm' ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        PT
                      </div>
                      <div>
                        <p className="font-medium">Paytm</p>
                        <p className="text-sm text-muted-foreground">Pay with Paytm wallet</p>
                      </div>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      paymentMethod === 'paypal' ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        PP
                      </div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-muted-foreground">Pay in USD (auto converted)</p>
                      </div>
                    </div>
                  </button>

                  {/* Bitcoin */}
                  <button
                    onClick={() => setPaymentMethod('bitcoin')}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      paymentMethod === 'bitcoin' ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        B
                      </div>
                      <div>
                        <p className="font-medium">Bitcoin</p>
                        <p className="text-sm text-muted-foreground">Pay with cryptocurrency</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Payment Input based on method */}
                {paymentMethod && paymentMethod !== 'bitcoin' && (
                  <div className="space-y-3 pt-4 border-t">
                    <Label>
                      {paymentMethod === 'upi' && 'Enter UPI ID'}
                      {paymentMethod === 'phonepe' && 'Enter Mobile Number'}
                      {paymentMethod === 'paytm' && 'Enter Mobile Number'}
                      {paymentMethod === 'paypal' && 'Enter PayPal Email'}
                    </Label>
                    <Input
                      value={paymentInput}
                      onChange={(e) => setPaymentInput(e.target.value)}
                      placeholder={
                        paymentMethod === 'upi' ? 'yourname@upi' :
                        paymentMethod === 'paypal' ? 'email@example.com' :
                        '10-digit mobile number'
                      }
                    />
                    {paymentMethod === 'paypal' && (
                      <p className="text-sm text-muted-foreground">
                        Amount: ${getUSDAmount()} USD (auto converted from INR)
                      </p>
                    )}
                    <Button className="w-full" onClick={handlePayment}>
                      Pay Rs. {getFinalAmount().toLocaleString()}
                    </Button>
                  </div>
                )}

                {/* Bitcoin Payment Details */}
                {paymentMethod === 'bitcoin' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="rounded-lg bg-muted p-4 space-y-3">
                      <p className="text-sm font-medium">Send exactly:</p>
                      <p className="text-xl font-bold text-orange-500">{getBTCAmount()} BTC</p>
                      
                      <p className="text-sm font-medium">To wallet address:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background p-2 rounded break-all">
                          bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center py-4">
                        <div className="h-32 w-32 bg-white rounded-lg flex items-center justify-center border">
                          <span className="text-xs text-muted-foreground">QR Code</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleBitcoinConfirm}>
                      I have sent the payment
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPaymentStep('summary')}
                >
                  Back
                </Button>
              </div>
            )}

            {/* Step 3: Processing */}
            {paymentStep === 'processing' && (
              <div className="space-y-6 py-8 text-center">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Processing your payment</h2>
                  <p className="text-muted-foreground mt-2">Please wait while we confirm your payment...</p>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  256-bit SSL Encrypted
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {paymentStep === 'success' && (
              <div className="space-y-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Payment Successful!</h2>
                  <p className="text-muted-foreground mt-2">Your enrollment is complete</p>
                </div>

                <div className="rounded-lg border p-4 space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course</span>
                    <span className="font-medium">{selectedCourse.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">Rs. {getFinalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs">{transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                  <Button className="w-full" onClick={handleCompleteEnrollment}>
                    Go to My Courses
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
