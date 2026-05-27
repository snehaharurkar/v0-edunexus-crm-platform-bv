"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  CreditCard,
  Users,
  Calendar,
  Check,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface Notification {
  id: string
  type: "alert" | "info" | "success" | "message" | "payment" | "user" | "event"
  title: string
  description: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "High Priority Ticket",
    description: "New support ticket from Rahul Kumar requires immediate attention",
    timestamp: "5 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    description: "Priya Singh paid ₹25,000 for Full Stack Development course",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "user",
    title: "New Student Enrollment",
    description: "Amit Patel enrolled in Cloud Computing course",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "event",
    title: "Batch Starting Tomorrow",
    description: "DevOps Batch #12 starts tomorrow at 10:00 AM",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "message",
    title: "New Message from Trainer",
    description: "John Smith sent you a message regarding syllabus update",
    timestamp: "4 hours ago",
    read: true,
  },
  {
    id: "6",
    type: "success",
    title: "Student Placed",
    description: "Sneha Reddy got placed at Google with 18 LPA package",
    timestamp: "5 hours ago",
    read: true,
  },
  {
    id: "7",
    type: "info",
    title: "System Maintenance",
    description: "Scheduled maintenance on May 30, 2024 from 2-4 AM",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: "8",
    type: "payment",
    title: "Payment Overdue",
    description: "3 students have payments overdue by more than 7 days",
    timestamp: "1 day ago",
    read: true,
  },
]

const notificationTypes = [
  { key: "all", label: "All" },
  { key: "alert", label: "Alerts" },
  { key: "payment", label: "Payments" },
  { key: "user", label: "Users" },
  { key: "message", label: "Messages" },
  { key: "event", label: "Events" },
]

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-orange-500" />
      case "user":
        return <Users className="h-5 w-5 text-cyan-500" />
      case "event":
        return <Calendar className="h-5 w-5 text-pink-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter)

  const unreadCount = notifications.filter((n) => !n.read).length

  if (isLoading) {
    return (
      <DashboardLayout role="executive">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="executive">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notifications
            </p>
          </div>
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {notificationTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setFilter(type.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === type.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors ${
                !notification.read ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <div className="rounded-lg bg-muted p-2">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-medium ${!notification.read ? "text-foreground" : ""}`}>
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {notification.timestamp}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;re all caught up!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
