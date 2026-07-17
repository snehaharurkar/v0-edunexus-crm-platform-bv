"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { bdeNavItems } from "@/lib/nav-items"
import { Modal } from "@/components/shared/modal"
import {
  MessageSquare,
  Search,
  Clock,
  Check,
  Send,
  User,
  Filter,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Query {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  type: string
  subject: string
  message: string
  status: "Pending" | "Answered" | "Closed"
  createdAt: string
  replies: { sender: string; message: string; timestamp: string }[]
}

const mockQueries: Query[] = [
  {
    id: "Q-001",
    studentId: "5",
    studentName: "Sneha Patel",
    studentEmail: "student@test.com",
    type: "Payment Issue",
    subject: "EMI payment not reflecting",
    message: "I made my second EMI payment yesterday but it is not showing in my account. Transaction ID: TXN789456123",
    status: "Pending",
    createdAt: "2024-03-28 10:30",
    replies: []
  },
  {
    id: "Q-002",
    studentId: "9",
    studentName: "Neha Singh",
    studentEmail: "neha@test.com",
    type: "Course Info",
    subject: "Can I switch to weekend batch?",
    message: "Due to my new job, I am unable to attend weekday classes. Is it possible to switch to weekend batch?",
    status: "Answered",
    createdAt: "2024-03-27 14:15",
    replies: [
      { sender: "BDE", message: "Hi Neha, yes you can switch to weekend batch. I will process the request today.", timestamp: "2024-03-27 15:00" }
    ]
  },
  {
    id: "Q-003",
    studentId: "10",
    studentName: "Arjun Reddy",
    studentEmail: "arjun@test.com",
    type: "Enrollment",
    subject: "Want to enroll in additional course",
    message: "I am currently doing React course and want to also enroll in Data Science. Is there any combo offer?",
    status: "Pending",
    createdAt: "2024-03-28 09:00",
    replies: []
  },
  {
    id: "Q-004",
    studentId: "12",
    studentName: "Rahul Dravid",
    studentEmail: "rahul.d@test.com",
    type: "Refund",
    subject: "Partial refund request",
    message: "I need to discontinue the course due to health reasons. Can I get a partial refund for the remaining duration?",
    status: "Pending",
    createdAt: "2024-03-26 16:45",
    replies: []
  },
  {
    id: "Q-005",
    studentId: "13",
    studentName: "Virat Kohli",
    studentEmail: "virat@test.com",
    type: "Other",
    subject: "Certificate name correction",
    message: "My name is misspelled on the certificate. It shows 'Virat Kholi' instead of 'Virat Kohli'. Please correct it.",
    status: "Closed",
    createdAt: "2024-03-25 11:20",
    replies: [
      { sender: "BDE", message: "I apologize for the error. I have raised a request to correct your certificate.", timestamp: "2024-03-25 14:00" },
      { sender: "Student", message: "Thank you! When can I expect the corrected certificate?", timestamp: "2024-03-25 14:30" },
      { sender: "BDE", message: "The corrected certificate has been uploaded to your account. Please check now.", timestamp: "2024-03-26 10:00" }
    ]
  },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function BDEQueriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [queries, setQueries] = useState<Query[]>(mockQueries)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredQueries = queries.filter(query => {
    const matchesSearch = 
      query.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || query.status === statusFilter
    const matchesType = typeFilter === "all" || query.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedQuery) return
    
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setQueries(prev => prev.map(q => {
      if (q.id === selectedQuery.id) {
        return {
          ...q,
          status: "Answered" as const,
          replies: [...q.replies, {
            sender: "BDE",
            message: replyText,
            timestamp: new Date().toLocaleString()
          }]
        }
      }
      return q
    }))
    
    setIsSending(false)
    setReplyText("")
    toast.success("Reply sent successfully!")
  }

  const handleMarkResolved = async () => {
    if (!selectedQuery) return
    
    setQueries(prev => prev.map(q => {
      if (q.id === selectedQuery.id) {
        return { ...q, status: "Closed" as const }
      }
      return q
    }))
    
    setSelectedQuery(prev => prev ? { ...prev, status: "Closed" } : null)
    toast.success("Query marked as resolved!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/10 text-yellow-600"
      case "Answered": return "bg-blue-500/10 text-blue-600"
      case "Closed": return "bg-green-500/10 text-green-600"
      default: return "bg-gray-500/10 text-gray-600"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Payment Issue": return "bg-red-500/10 text-red-600"
      case "Course Info": return "bg-blue-500/10 text-blue-600"
      case "Enrollment": return "bg-purple-500/10 text-purple-600"
      case "Refund": return "bg-orange-500/10 text-orange-600"
      default: return "bg-gray-500/10 text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={bdeNavItems} roleLabel="BDE">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={bdeNavItems} roleLabel="BDE">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Student Queries</h1>
          <p className="text-muted-foreground">Manage and respond to student queries</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student name or subject..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Answered">Answered</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Payment Issue">Payment Issue</SelectItem>
              <SelectItem value="Course Info">Course Info</SelectItem>
              <SelectItem value="Enrollment">Enrollment</SelectItem>
              <SelectItem value="Refund">Refund</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{queries.filter(q => q.status === "Pending").length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{queries.filter(q => q.status === "Answered").length}</p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{queries.filter(q => q.status === "Closed").length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Queries Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredQueries.map(query => (
                  <tr key={query.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{query.studentName}</p>
                          <p className="text-xs text-muted-foreground">{query.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{query.subject}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{query.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(query.type)}`}>
                        {query.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(query.status)}`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">{query.createdAt}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuery(query)
                          setIsReplyOpen(true)
                        }}
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {query.status === "Closed" ? "View" : "Reply"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reply Modal */}
        <Modal
          open={isReplyOpen}
          onClose={() => {
            setIsReplyOpen(false)
            setSelectedQuery(null)
            setReplyText("")
          }}
          title={selectedQuery?.subject || "Query Details"}
        >
          {selectedQuery && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedQuery.studentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuery.studentEmail}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(selectedQuery.type)}`}>
                    {selectedQuery.type}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedQuery.status)}`}>
                    {selectedQuery.status}
                  </span>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {/* Original Message */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{selectedQuery.studentName}</span>
                    <span className="text-xs text-muted-foreground">{selectedQuery.createdAt}</span>
                  </div>
                  <p className="text-sm">{selectedQuery.message}</p>
                </div>

                {/* Replies */}
                {selectedQuery.replies.map((reply, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 ${reply.sender === "BDE" ? "bg-primary/5 ml-4" : "mr-4"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {reply.sender === "BDE" ? "You" : selectedQuery.studentName}
                      </span>
                      <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                    </div>
                    <p className="text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selectedQuery.status !== "Closed" && (
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
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
                    <Button variant="outline" onClick={handleMarkResolved}>
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
