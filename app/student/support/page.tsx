"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import { Modal } from "@/components/shared/modal"
import { mockCourses, mockTrainers } from "@/lib/mock-data"
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Paperclip,
  User,
  BookOpen,
  Briefcase,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface Query {
  id: string
  to: "trainer" | "bde"
  course?: string
  trainer?: string
  type: string
  subject: string
  message: string
  attachment?: string
  status: "Pending" | "Answered" | "Closed"
  createdAt: string
  replies: { sender: string; message: string; timestamp: string }[]
}

const mockStudentQueries: Query[] = [
  {
    id: "SQ-001",
    to: "trainer",
    course: "React Mastery",
    trainer: "Priya Verma",
    type: "Doubt",
    subject: "Confusion about useEffect cleanup",
    message: "I don't understand when the cleanup function in useEffect runs. Can you explain with an example?",
    status: "Answered",
    createdAt: "2024-03-28 10:30",
    replies: [
      { sender: "Trainer", message: "Great question! The cleanup function runs before the component unmounts AND before each re-render. It's used to clean up subscriptions, timers, etc.", timestamp: "2024-03-28 14:00" }
    ]
  },
  {
    id: "SQ-002",
    to: "trainer",
    course: "React Mastery",
    trainer: "Priya Verma",
    type: "Assignment Help",
    subject: "Help with Assignment 3",
    message: "I'm stuck on the API integration part. Getting a network error.",
    attachment: "assignment3.js",
    status: "Pending",
    createdAt: "2024-03-27 16:45",
    replies: []
  },
  {
    id: "SQ-003",
    to: "bde",
    type: "Payment Issue",
    subject: "EMI payment not reflecting",
    message: "I made my EMI payment on March 25 but it's not showing in my account. Transaction ID: TXN123456",
    status: "Answered",
    createdAt: "2024-03-26 11:00",
    replies: [
      { sender: "BDE", message: "Hi! I've checked your payment. It has been verified and your account is now updated. Thank you!", timestamp: "2024-03-26 15:30" }
    ]
  },
  {
    id: "SQ-004",
    to: "bde",
    type: "Course Info",
    subject: "Switching to weekend batch",
    message: "Due to my job change, I need to switch from weekday to weekend batch. Is this possible?",
    status: "Closed",
    createdAt: "2024-03-24 09:30",
    replies: [
      { sender: "BDE", message: "Yes, you can switch! I've processed your request. Your new batch starts this Saturday.", timestamp: "2024-03-24 14:00" },
      { sender: "Student", message: "Thank you so much!", timestamp: "2024-03-24 14:30" }
    ]
  },
]

const trainerQueryTypes = ["Doubt", "Assignment Help", "Technical Issue", "Other"]
const bdeQueryTypes = ["Payment Issue", "Course Info", "Enrollment", "Refund", "Other"]

export default function StudentSupport() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"trainer" | "bde">("trainer")
  const [queries, setQueries] = useState<Query[]>(mockStudentQueries)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  // New query form state
  const [newQuery, setNewQuery] = useState({
    course: "",
    type: "",
    subject: "",
    message: "",
    attachment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredQueries = queries.filter(q => q.to === activeTab)

  const handleSubmitQuery = async () => {
    if (!newQuery.type || !newQuery.subject || !newQuery.message) {
      toast.error("Please fill all required fields")
      return
    }
    if (activeTab === "trainer" && !newQuery.course) {
      toast.error("Please select a course")
      return
    }
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const course = mockCourses.find(c => c.id === newQuery.course)
    const trainer = mockTrainers.find(t => t.id === course?.trainerId)
    
    const query: Query = {
      id: `SQ-${String(queries.length + 1).padStart(3, "0")}`,
      to: activeTab,
      course: course?.title,
      trainer: trainer?.name,
      type: newQuery.type,
      subject: newQuery.subject,
      message: newQuery.message,
      attachment: newQuery.attachment,
      status: "Pending",
      createdAt: new Date().toLocaleString(),
      replies: []
    }
    
    setQueries([query, ...queries])
    setNewQuery({ course: "", type: "", subject: "", message: "", attachment: "" })
    setIsSubmitting(false)
    toast.success("Query submitted successfully!")
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedQuery) return
    
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updatedQuery = {
      ...selectedQuery,
      replies: [...selectedQuery.replies, {
        sender: "Student",
        message: replyText,
        timestamp: new Date().toLocaleString()
      }]
    }
    
    setQueries(prev => prev.map(q => q.id === selectedQuery.id ? updatedQuery : q))
    setSelectedQuery(updatedQuery)
    setReplyText("")
    setIsSending(false)
    toast.success("Reply sent!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/10 text-yellow-600"
      case "Answered": return "bg-blue-500/10 text-blue-600"
      case "Closed": return "bg-green-500/10 text-green-600"
      default: return "bg-gray-500/10 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="h-4 w-4" />
      case "Answered": return <MessageSquare className="h-4 w-4" />
      case "Closed": return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} roleLabel="Student">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNavItems} roleLabel="Student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Get help from trainers and BDEs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("trainer")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "trainer"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Ask Trainer
          </button>
          <button
            onClick={() => setActiveTab("bde")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "bde"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Ask BDE
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* New Query Form */}
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">
              {activeTab === "trainer" ? "Ask Your Trainer" : "Ask Your BDE"}
            </h2>
            
            {activeTab === "trainer" && (
              <div className="space-y-2">
                <Label>Select Course/Subject</Label>
                <Select value={newQuery.course} onValueChange={v => setNewQuery({ ...newQuery, course: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.filter(c => c.status === "Active").map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - {course.trainer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Query Type</Label>
              <Select value={newQuery.type} onValueChange={v => setNewQuery({ ...newQuery, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {(activeTab === "trainer" ? trainerQueryTypes : bdeQueryTypes).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newQuery.subject}
                onChange={e => setNewQuery({ ...newQuery, subject: e.target.value })}
                placeholder="Brief subject of your query..."
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                value={newQuery.message}
                onChange={e => setNewQuery({ ...newQuery, message: e.target.value })}
                placeholder="Describe your query in detail..."
                className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            {activeTab === "trainer" && (
              <div className="space-y-2">
                <Label>Attachment (optional)</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attach File
                  </Button>
                  {newQuery.attachment && (
                    <span className="text-sm text-muted-foreground">{newQuery.attachment}</span>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleSubmitQuery} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Query
                </>
              )}
            </Button>
          </div>

          {/* Queries List */}
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">
              {activeTab === "trainer" ? "Trainer Queries" : "BDE Queries"}
            </h2>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredQueries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <HelpCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No queries yet</p>
                  <p className="text-sm text-muted-foreground">Submit your first query above</p>
                </div>
              ) : (
                filteredQueries.map(query => (
                  <div
                    key={query.id}
                    onClick={() => {
                      setSelectedQuery(query)
                      setIsDetailOpen(true)
                    }}
                    className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{query.subject}</h4>
                        {query.trainer && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Trainer: {query.trainer}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {query.message}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(query.status)}`}>
                        {getStatusIcon(query.status)}
                        {query.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{query.type}</span>
                      <span>{query.createdAt}</span>
                      <span>{query.replies.length} replies</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Query Detail Modal */}
        <Modal
          open={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedQuery(null)
            setReplyText("")
          }}
          title={selectedQuery?.subject || "Query Details"}
        >
          {selectedQuery && (
            <div className="space-y-4">
              {/* Query Info */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{selectedQuery.type}</span>
                  </p>
                  {selectedQuery.trainer && (
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">Trainer:</span>
                      <span className="font-medium">{selectedQuery.trainer}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{selectedQuery.createdAt}</span>
                  </p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedQuery.status)}`}>
                  {getStatusIcon(selectedQuery.status)}
                  {selectedQuery.status}
                </span>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {/* Original Message */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      You
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedQuery.createdAt}</span>
                  </div>
                  <p className="text-sm">{selectedQuery.message}</p>
                  {selectedQuery.attachment && (
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {selectedQuery.attachment}
                    </p>
                  )}
                </div>

                {/* Replies */}
                {selectedQuery.replies.map((reply, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 ${
                      reply.sender === "Student" ? "bg-muted/50 mr-4" : "bg-primary/5 ml-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {reply.sender === "Student" ? "You" : reply.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                    </div>
                    <p className="text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selectedQuery.status !== "Closed" && (
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <Button onClick={handleSendReply} disabled={isSending || !replyText.trim()}>
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
