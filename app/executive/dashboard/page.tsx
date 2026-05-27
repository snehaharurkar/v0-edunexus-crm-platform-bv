"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { StatCard } from "@/components/shared/stat-card"
import {
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

const tickets = [
  { id: "TKT-001", student: "Rahul Kumar", subject: "Certificate Issue", status: "open", priority: "high", date: "May 25, 2024" },
  { id: "TKT-002", student: "Priya Singh", subject: "Payment Refund", status: "in_progress", priority: "medium", date: "May 24, 2024" },
  { id: "TKT-003", student: "Amit Patel", subject: "Course Access", status: "open", priority: "high", date: "May 24, 2024" },
  { id: "TKT-004", student: "Sneha Reddy", subject: "Job Portal Bug", status: "resolved", priority: "low", date: "May 23, 2024" },
]

const onboardingChecklist = [
  { id: 1, student: "Rahul Kumar", course: "Full Stack Development", step: "Document Verification", completed: true },
  { id: 2, student: "Priya Singh", course: "Data Science", step: "Fee Payment", completed: false },
  { id: 3, student: "Amit Patel", course: "Cloud Computing", step: "Batch Assignment", completed: false },
  { id: 4, student: "Sneha Reddy", course: "UI/UX Design", step: "Welcome Email", completed: true },
  { id: 5, student: "Vikram Joshi", course: "DevOps", step: "LMS Access", completed: false },
]

const pendingPayments = [
  { id: 1, student: "Rahul Kumar", course: "Full Stack Development", amount: 25000, dueDate: "May 30, 2024", remindersSent: 1 },
  { id: 2, student: "Priya Singh", course: "Data Science", amount: 15000, dueDate: "May 28, 2024", remindersSent: 2 },
  { id: 3, student: "Amit Patel", course: "Cloud Computing", amount: 30000, dueDate: "June 5, 2024", remindersSent: 0 },
  { id: 4, student: "Vikram Joshi", course: "DevOps", amount: 20000, dueDate: "June 10, 2024", remindersSent: 0 },
]

export default function ExecutiveDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/10 text-yellow-600"
      case "in_progress":
        return "bg-blue-500/10 text-blue-600"
      case "resolved":
        return "bg-green-500/10 text-green-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="executive">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="executive">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Students"
            value="1,247"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="This Month Enrollments"
            value="156"
            icon={GraduationCap}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Payments"
            value="₹4.5L"
            icon={IndianRupee}
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Placement Rate"
            value="87%"
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tickets Management */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Support Tickets</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.student} • {ticket.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        ticket.priority === "high"
                          ? "bg-red-500/10 text-red-600"
                          : ticket.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Onboarding Checklist */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Onboarding Checklist</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {onboardingChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        item.completed
                          ? "bg-green-500/20 text-green-600"
                          : "bg-yellow-500/20 text-yellow-600"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.student}</p>
                      <p className="text-sm text-muted-foreground">{item.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium ${
                        item.completed ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {item.step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Payments</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Reminders</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{payment.student}</td>
                    <td className="py-3 text-muted-foreground">{payment.course}</td>
                    <td className="py-3">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground">{payment.dueDate}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {payment.remindersSent} sent
                      </span>
                    </td>
                    <td className="py-3">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Send className="h-3 w-3" />
                        Remind
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
