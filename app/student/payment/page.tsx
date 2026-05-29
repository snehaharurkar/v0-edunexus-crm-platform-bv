"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import { mockCourses } from "@/lib/mock-data"
import BuyCourseButton from "@/components/shared/BuyCourseButton"
import { useAuth } from "@/contexts/auth-context"
import { mockStudents } from "@/lib/mock-data"
import {
  CreditCard,
  Smartphone,
  Wallet,
  Globe,
  Bitcoin,
  Check,
  Shield,
  Lock,
  ChevronRight,
  ChevronLeft,
  Download,
  Home,
  Copy,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

type PaymentMethod = "upi" | "phonepe" | "paytm" | "paypal" | "bitcoin"
type Step = 1 | 2 | 3 | 4

interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  icon: React.ReactNode
  color: string
  description: string
}

const paymentMethods: PaymentMethodInfo[] = [
  {
    id: "upi",
    name: "UPI (India)",
    icon: <Wallet className="h-6 w-6" />,
    color: "bg-green-500/10 text-green-600 border-green-200",
    description: "Pay directly from your bank using UPI ID"
  },
  {
    id: "phonepe",
    name: "PhonePe",
    icon: <Smartphone className="h-6 w-6" />,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    description: "Pay using PhonePe mobile number"
  },
  {
    id: "paytm",
    name: "Paytm",
    icon: <Smartphone className="h-6 w-6" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    description: "Pay using Paytm wallet or bank"
  },
  {
    id: "paypal",
    name: "PayPal (International)",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    description: "Pay internationally with PayPal"
  },
  {
    id: "bitcoin",
    name: "Bitcoin / Crypto",
    icon: <Bitcoin className="h-6 w-6" />,
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    description: "Pay with cryptocurrency"
  },
]

export default function PaymentPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<Step>(1)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [paymentInput, setPaymentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [useRazorpay, setUseRazorpay] = useState(false)

  // Mock course data
  const course = mockCourses[0]
  const student = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]
  const originalPrice = course.price
  const discount = 2000
  const finalAmount = originalPrice - discount

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handlePayment = async () => {
    if (!paymentInput && selectedMethod !== "bitcoin") {
      toast.error("Please fill in the required field")
      return
    }

    setIsProcessing(true)
    setStep(3)
    
    // Simulate payment processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }
    
    setIsProcessing(false)
    setStep(4)
    toast.success("Payment successful!")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const getMethodColor = (method: PaymentMethod) => {
    return paymentMethods.find(m => m.id === method)?.color || ""
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} roleLabel="Student">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNavItems} roleLabel="Student">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                s < step ? "bg-green-500 text-white" :
                s === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`h-1 w-12 sm:w-20 ${s < step ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Summary</span>
          <span>Payment</span>
          <span>Processing</span>
          <span>Success</span>
        </div>

        {/* Step 1: Order Summary */}
        {step === 1 && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Choose Payment Method</h2>
            <p className="text-sm text-muted-foreground">
              Select how you want to pay for this course
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Razorpay Option */}
              <button
                onClick={() => {
                  setUseRazorpay(true)
                  setStep(1)
                }}
                className="flex flex-col gap-4 rounded-lg border p-4 transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Razorpay</h3>
                    <p className="text-sm text-muted-foreground">UPI, Card, Netbanking</p>
                  </div>
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="rounded-lg bg-green-500/10 p-2 text-xs font-medium text-green-600">
                  Fastest & Most Secure
                </div>
              </button>

              {/* Traditional Payment Option */}
              <button
                onClick={() => {
                  setUseRazorpay(false)
                  setStep(2)
                }}
                className="flex flex-col gap-4 rounded-lg border p-4 transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Traditional</h3>
                    <p className="text-sm text-muted-foreground">Multiple options</p>
                  </div>
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
                <div className="rounded-lg bg-blue-500/10 p-2 text-xs font-medium text-blue-600">
                  View all methods
                </div>
              </button>
            </div>

            {/* Razorpay Quick Action */}
            {useRazorpay && (
              <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course</span>
                      <span>{course.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Price</span>
                      <span>₹{originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <BuyCourseButton
                  courseId={course.id}
                  courseName={course.title}
                  price={finalAmount}
                  studentId={student.id}
                  studentEmail={user?.email}
                  studentName={student.name}
                  className="w-full"
                />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setUseRazorpay(false)
                    setStep(2)
                  }}
                >
                  See other payment methods
                </Button>
              </div>
            )}

            {!useRazorpay && (
              <Button onClick={() => setStep(2)} className="w-full">
                View Traditional Methods
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Select Payment Method */}
        {step === 2 && !useRazorpay && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select Payment Method</h2>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id)
                    setPaymentInput("")
                  }}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                    selectedMethod === method.id
                      ? `ring-2 ring-primary ${method.color}`
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className={`rounded-lg p-2 ${method.color}`}>
                    {method.icon}
                  </div>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Input Based on Method */}
            {selectedMethod && (
              <div className="rounded-lg border p-4 space-y-3">
                {selectedMethod === "upi" && (
                  <div className="space-y-2">
                    <Label>Enter UPI ID</Label>
                    <Input
                      value={paymentInput}
                      onChange={e => setPaymentInput(e.target.value)}
                      placeholder="yourname@upi"
                    />
                  </div>
                )}

                {selectedMethod === "phonepe" && (
                  <div className="space-y-2">
                    <Label>PhonePe Registered Mobile Number</Label>
                    <Input
                      value={paymentInput}
                      onChange={e => setPaymentInput(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                )}

                {selectedMethod === "paytm" && (
                  <div className="space-y-2">
                    <Label>Paytm Registered Mobile Number</Label>
                    <Input
                      value={paymentInput}
                      onChange={e => setPaymentInput(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                )}

                {selectedMethod === "paypal" && (
                  <div className="space-y-2">
                    <Label>PayPal Email</Label>
                    <Input
                      type="email"
                      value={paymentInput}
                      onChange={e => setPaymentInput(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                {selectedMethod === "bitcoin" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Send exactly <span className="font-mono font-bold">0.00234 BTC</span> to:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted p-2 text-xs font-mono break-all">
                        bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* QR Code Placeholder */}
                    <div className="mx-auto w-32 h-32 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                      <span className="text-xs text-muted-foreground text-center">QR Code</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPaymentInput("confirmed")}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      I have sent the payment
                    </Button>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700">256-bit SSL Encrypted</p>
                    <p className="text-xs text-green-600">Your payment is 100% secure</p>
                  </div>
                </div>

                {selectedMethod !== "bitcoin" && (
                  <Button onClick={handlePayment} className="w-full" disabled={!paymentInput}>
                    Pay Rs. {finalAmount.toLocaleString()}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {selectedMethod === "bitcoin" && paymentInput === "confirmed" && (
                  <Button onClick={handlePayment} className="w-full">
                    Verify Payment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold">Processing Your Payment</h2>
            <p className="text-muted-foreground">Please wait while we securely process your payment...</p>
            
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Secured by 256-bit encryption
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="rounded-xl border bg-card p-8 text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground">Your enrollment has been confirmed.</p>
            
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">Rs. {finalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">TXN{Date.now()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getMethodColor(selectedMethod!)}`}>
                  {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              <Button asChild className="flex-1">
                <a href="/student/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
