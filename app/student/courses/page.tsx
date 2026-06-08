"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Video, FileText, ClipboardList, Download, Play, Clock, ShoppingCart, CheckCircle, Lock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from '@/lib/supabase'

declare global { interface Window { Razorpay: any } }

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

const gradients = [
  'from-blue-600 via-blue-500 to-indigo-600',
  'from-green-600 via-green-500 to-teal-600',
  'from-purple-600 via-purple-500 to-pink-600',
  'from-orange-600 via-orange-500 to-red-600',
  'from-cyan-600 via-cyan-500 to-blue-600',
  'from-rose-600 via-rose-500 to-pink-600',
]

const icons = ['⚛️', '🐍', '📊', '☕', '🌐', '🎯']

const notes = [
  { id: 1, title: "Basics Cheatsheet", size: "2.5 MB", type: "PDF", locked: false },
  { id: 2, title: "Reference Guide", size: "1.8 MB", type: "PDF", locked: false },
  { id: 3, title: "Advanced Notes", size: "500 KB", type: "PNG", locked: true },
  { id: 4, title: "Project Setup Guide", size: "1.2 MB", type: "PDF", locked: true },
]

const assignments = [
  { id: 1, title: "Beginner Assignment", dueDate: "May 30, 2024", status: "submitted", grade: "A", locked: false },
  { id: 2, title: "Intermediate Project", dueDate: "June 5, 2024", status: "pending", grade: null, locked: false },
  { id: 3, title: "Advanced Project", dueDate: "June 10, 2024", status: "pending", grade: null, locked: true },
]

interface Course {
  id: string
  title: string
  description: string
  trainer: string
  price: number
  duration: string
  batches: number
  status: string
  video_url?: string
  thumbnail_url?: string
}

export default function StudentCourses() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [activeTab, setActiveTab] = useState<"recordings" | "notes" | "assignments">("recordings")
  const [activeSection, setActiveSection] = useState<"my-course" | "browse">("my-course")
  const [payingCourseId, setPayingCourseId] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState<Record<string, string>>({})
  const [paidCourses, setPaidCourses] = useState<Record<string, number>>({})
  const [classes, setClasses] = useState<any[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponApplied, setCouponApplied] = useState(false)

  useEffect(() => {
    const fetchCoursesAndPaid = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setCourses(data)
      
      // Fetch paid courses from transactions
      if (user?.id) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('student_id', user.id)
          .eq('status', 'Completed')
        
        if (transactions && transactions.length > 0) {
          const paid: Record<string, number> = {}
          transactions.forEach((t: any) => {
            if (t.course_id) {
              paid[t.course_id] = (paid[t.course_id] || 0) + (t.amount || 0)
            }
          })
          setPaidCourses(paid)
        }
      }
      setIsLoading(false)
    }
    fetchCoursesAndPaid()
    const channel = supabase
      .channel('student-courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchCoursesAndPaid)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('*').order('date', { ascending: true })
      if (data) setClasses(data)
    }
    fetchClasses()
    const channel = supabase
      .channel('student-classes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, fetchClasses)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Listen for transaction changes to update paid courses
  useEffect(() => {
    const channel = supabase
      .channel('student-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `student_id=eq.${user?.id}` }, async () => {
        if (user?.id) {
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('student_id', user.id)
            .eq('status', 'Completed')
          
          if (transactions && transactions.length > 0) {
            const paid: Record<string, number> = {}
            transactions.forEach((t: any) => {
              if (t.course_id) {
                paid[t.course_id] = (paid[t.course_id] || 0) + (t.amount || 0)
              }
            })
            setPaidCourses(paid)
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const student = {
    name: user?.name || 'Student',
    email: user?.email || '',
    phone: '',
    courseId: '',
    progress: 0,
    id: user?.id || '',
  }

  const enrolledCourses = courses.filter(c => paidCourses[c.id])
  const enrolledCourse = enrolledCourses[0]

  const getUnlockPercent = (courseId: string) => {
    const paid = paidCourses[courseId] || 0
    const course = courses.find(c => c.id === courseId)
    if (!course) return 0
    return Math.min(100, Math.round((paid / course.price) * 100))
  }

  const isModuleLocked = (courseId: string, moduleIndex: number, totalModules: number) => {
    const unlockPercent = getUnlockPercent(courseId)
    const moduleThreshold = ((moduleIndex + 1) / totalModules) * 100
    return unlockPercent < moduleThreshold
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/rewards/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), studentId: user?.id })
      })
      const data = await res.json()
      if (data.valid) {
        setCouponDiscount(data.discountAmount)
        setCouponApplied(true)
        toast.success(`✅ Coupon applied! ₹${data.discountAmount} discount`)
      } else {
        toast.error(data.error || 'Invalid coupon')
      }
    } catch {
      toast.error('Failed to validate coupon')
    }
    setCouponLoading(false)
  }

  const handlePayment = async (course: Course) => {
    const baseAmount = parseFloat(customAmount[course.id] || String(course.price))
    const finalAmount = Math.max(1, baseAmount - couponDiscount)
    if (!finalAmount || finalAmount < 1) { toast.error("Minimum ₹1 required"); return }

    if (!window.Razorpay) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve()
        document.body.appendChild(script)
      })
    }

    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: finalAmount, receipt: `course_${course.id}_${student.id}` })
    })

    if (!res.ok) { toast.error('Payment failed'); return }
    const order = await res.json()
    if (!order.id) { toast.error('Failed to create order'); return }

    new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "EduNexus",
      description: course.title,
      order_id: order.id,
      prefill: { name: student.name, email: student.email, contact: student.phone },
      theme: { color: "#4F46E5" },
      handler: async (response: any) => {
        try {
          const verify = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, studentId: student.id, courseId: course.id, amount: finalAmount }),
          })
          const result = await verify.json()
          if (result.success) {
            const unlockPct = Math.min(100, Math.round((finalAmount / course.price) * 100))
            toast.success(`🎉 ${unlockPct}% of ${course.title} unlocked!`)
            setPaidCourses(prev => ({ ...prev, [course.id]: (prev[course.id] || 0) + finalAmount }))
            setPayingCourseId(null)
            setCouponApplied(false)
            setCouponDiscount(0)
            setCouponCode('')
            setActiveSection("my-course")
          } else {
            toast.error("Payment verification failed")
          }
        } catch { toast.error("Verification error") }
      },
      modal: { ondismiss: () => toast.error("Payment cancelled") },
    }).open()
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-72" />)}
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const validTill = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Courses</h1>

      <div className="flex gap-2">
        <button onClick={() => setActiveSection("my-course")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === "my-course" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          My Enrolled Courses
        </button>
        <button onClick={() => setActiveSection("browse")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeSection === "browse" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          <ShoppingCart className="h-4 w-4" /> Browse & Buy Courses
        </button>
      </div>

      {/* BROWSE */}
      {activeSection === "browse" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 ? (
            <div className="col-span-3 text-center py-12 border rounded-xl bg-card">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No courses available yet</p>
            </div>
          ) : courses.map((course, index) => {
            const isPaid = !!paidCourses[course.id]
            const isPaying = payingCourseId === course.id
            const unlockPct = getUnlockPercent(course.id)
            const gradient = gradients[index % gradients.length]
            const icon = icons[index % icons.length]
            return (
              <div key={course.id} className="rounded-xl border bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className={`relative h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 p-4`}>
                  <span className="text-5xl">{icon}</span>
                  <p className="text-white/90 text-xs font-bold tracking-widest text-center">{course.trainer}</p>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${course.status === "Active" ? "bg-green-400 text-green-900" : course.status === "Upcoming" ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-700"}`}>
                      {course.status}
                    </span>
                  </div>
                  {isPaid && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/40 rounded-lg px-2 py-1">
                      <div className="flex justify-between text-white text-xs mb-1"><span>Access</span><span>{unlockPct}%</span></div>
                      <div className="h-1.5 bg-white/30 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${unlockPct}%` }} /></div>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <h3 className="font-semibold text-base leading-snug">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">₹{Number(course.price).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">⏱ {course.duration}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">🎓 {course.trainer}</p>
                  {isPaid && !isPaying ? (
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" /> Enrolled — {unlockPct}% unlocked
                      </div>
                      {unlockPct < 100 && (
                        <button onClick={() => setPayingCourseId(course.id)}
                          className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50">
                          Pay More to Unlock More
                        </button>
                      )}
                      <button className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2">
                        <Play className="h-4 w-4" /> Start Learning →
                      </button>
                    </div>
                  ) : isPaying ? (
                    <div className="space-y-2 mt-auto">
                      <p className="text-xs text-muted-foreground">Full price ₹{Number(course.price).toLocaleString()} — pay any amount (min ₹1)</p>
                      {/* Coupon */}
                      <div className="flex gap-2">
                        <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Coupon code" disabled={couponApplied}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background uppercase" />
                        <button onClick={applyCoupon} disabled={couponApplied || couponLoading || !couponCode}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${couponApplied ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`}>
                          {couponLoading ? '...' : couponApplied ? '✓' : 'Apply'}
                        </button>
                      </div>
                      {couponApplied && (
                        <p className="text-xs text-green-600">🎉 ₹{couponDiscount} discount applied!</p>
                      )}
                      <input type="number" min={1} placeholder={`e.g. ₹${course.price}`}
                        value={customAmount[course.id] || ""}
                        onChange={(e) => setCustomAmount(prev => ({ ...prev, [course.id]: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                      {couponApplied && (
                        <div className="p-2 bg-gray-50 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between"><span>Amount</span><span>₹{customAmount[course.id] || course.price}</span></div>
                          <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{couponDiscount}</span></div>
                          <div className="flex justify-between font-bold border-t pt-1"><span>Final</span><span>₹{Math.max(1, (parseFloat(customAmount[course.id] || String(course.price))) - couponDiscount)}</span></div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handlePayment(course)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Pay Now</button>
                        <button onClick={() => setPayingCourseId(null)}
                          className="px-3 py-2 rounded-lg text-sm border hover:bg-muted">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setPayingCourseId(course.id)}
                      className="mt-auto w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Enroll Now
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MY ENROLLED COURSES */}
      {activeSection === "my-course" && (
        <>
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12 border rounded-xl bg-card">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No courses enrolled yet</p>
              <p className="text-xs text-muted-foreground mt-1">Browse and buy a course to get started</p>
              <button onClick={() => setActiveSection("browse")} className="mt-3 text-sm text-primary hover:underline">Browse courses →</button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course, index) => {
                const unlockPct = getUnlockPercent(course.id)
                const gradient = gradients[index % gradients.length]
                const icon = icons[index % icons.length]
                return (
                  <div key={course.id} className="rounded-xl border bg-card overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <div className={`relative h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 p-4`}>
                      <span className="text-5xl">{icon}</span>
                      <p className="text-white/90 text-xs font-bold tracking-widest text-center">{course.trainer}</p>
                      <div className="absolute top-2 right-2 bg-green-400 text-green-900 text-xs px-2 py-0.5 rounded-full font-semibold">Active</div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="font-semibold text-base">{course.title}</h3>
                      <div className="text-xs text-muted-foreground">📅 Enrolled: {today}</div>
                      <div className="text-xs text-muted-foreground">⏳ Valid till: {validTill}</div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="font-medium">{unlockPct}%</span></div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${unlockPct}%` }} />
                        </div>
                      </div>
                      <button className="mt-3 w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2">
                        <Play className="h-4 w-4" /> Start Learning →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {enrolledCourse && (
            <>
              <h2 className="text-lg font-semibold mt-2">Course Content — {enrolledCourse.title}</h2>
              <div className="flex gap-2 border-b">
                {(["recordings", "notes", "assignments"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {tab === "recordings" && <Video className="h-4 w-4" />}
                    {tab === "notes" && <FileText className="h-4 w-4" />}
                    {tab === "assignments" && <ClipboardList className="h-4 w-4" />}
                    <span className="capitalize">{tab}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {activeTab === "recordings" && (
                  classes.length === 0 ? (
                    <div className="text-center py-12 border rounded-xl bg-card">
                      <Video className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">No classes scheduled yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Your trainer hasn&apos;t posted any classes yet</p>
                    </div>
                  ) : classes.map((cls, index) => {
                    const locked = isModuleLocked(enrolledCourse.id, index, classes.length)
                    const isPast = new Date(cls.date) < new Date()
                    return (
                      <div key={cls.id} className={`flex items-center justify-between rounded-lg border bg-card p-4 ${locked ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`rounded-lg p-2 ${locked ? 'bg-gray-100' : 'bg-primary/10'}`}>
                            {locked ? <Lock className="h-5 w-5 text-gray-400" /> : <Play className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{cls.title}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cls.time}</span>
                              <span>{new Date(cls.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className="flex items-center gap-1"><Video className="h-3 w-3" />{cls.platform}</span>
                            </div>
                            {cls.batch && <span className="text-xs text-muted-foreground mt-0.5 block">Batch: {cls.batch}</span>}
                            {cls.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cls.description}</p>}
                          </div>
                        </div>
                        {locked ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Lock className="h-3 w-3" />Pay more to unlock
                          </span>
                        ) : (
                          <button onClick={() => window.open(cls.meeting_link, '_blank')}
                            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isPast ? 'border border-muted-foreground/30 text-muted-foreground hover:bg-muted' : 'bg-primary text-primary-foreground hover:opacity-90'}`}>
                            <ExternalLink className="h-4 w-4" />
                            {isPast ? 'View Recording' : 'Join Class'}
                          </button>
                        )}
                      </div>
                    )
                  })
                )}

                {activeTab === "notes" && notes.map((note, index) => {
                  const locked = isModuleLocked(enrolledCourse.id, index, notes.length) && note.locked
                  return (
                    <div key={note.id} className={`flex items-center justify-between rounded-lg border bg-card p-4 ${locked ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-2 ${locked ? 'bg-gray-100' : 'bg-orange-500/10'}`}>
                          {locked ? <Lock className="h-5 w-5 text-gray-400" /> : <FileText className="h-5 w-5 text-orange-500" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{note.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{note.type} • {note.size}</p>
                        </div>
                      </div>
                      {locked ? <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" />Pay more to unlock</span>
                        : <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Download</Button>}
                    </div>
                  )
                })}

                {activeTab === "assignments" && assignments.map((assignment, index) => {
                  const locked = isModuleLocked(enrolledCourse.id, index, assignments.length) && assignment.locked
                  return (
                    <div key={assignment.id} className={`flex items-center justify-between rounded-lg border bg-card p-4 ${locked ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-2 ${locked ? 'bg-gray-100' : assignment.status === "submitted" ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                          {locked ? <Lock className="h-5 w-5 text-gray-400" /> : <ClipboardList className={`h-5 w-5 ${assignment.status === "submitted" ? "text-green-500" : "text-yellow-500"}`} />}
                        </div>
                        <div>
                          <h3 className="font-medium">{assignment.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                        </div>
                      </div>
                      {locked ? <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" />Pay more to unlock</span>
                        : (
                          <div className="flex items-center gap-3">
                            {assignment.grade && <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">Grade: {assignment.grade}</span>}
                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${assignment.status === "submitted" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                              {assignment.status === "submitted" ? "Submitted" : "Pending"}
                            </span>
                            {assignment.status === "pending" && <Button size="sm">Submit</Button>}
                          </div>
                        )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
