"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/shared/modal"
import { mockCourses, mockTrainers } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  HelpCircle, MessageSquare, Clock, CheckCircle, AlertCircle,
  Send, Paperclip, User, BookOpen, Briefcase, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface Reply {
  id: string
  sender: string
  message: string
  created_at: string
}

interface Query {
  id: string
  student_id: string
  student_name: string
  student_email: string
  recipient: "trainer" | "bde"
  course?: string
  trainer_name?: string
  query_type: string
  subject: string
  message: string
  attachment?: string
  status: "Pending" | "Answered" | "Closed"
  created_at: string
  replies: Reply[]
}

const trainerQueryTypes = ["Doubt", "Assignment Help", "Technical Issue", "Other"]
const bdeQueryTypes = ["Payment Issue", "Course Info", "Enrollment", "Refund", "Other"]

export default function StudentSupport() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"trainer" | "bde">("trainer")
  const [queries, setQueries] = useState<Query[]>([])
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [newQuery, setNewQuery] = useState({ course: "", type: "", subject: "", message: "", attachment: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Fetch queries from Supabase ─────────────────────────────────────────────
  const fetchQueries = async () => {
    if (!user?.email) return
    setIsLoading(true)
    try {
      const { data: queryData, error } = await supabase
        .from("support_queries")
        .select("*, support_replies(*)")
        .eq("student_email", user.email)
        .order("created_at", { ascending: false })

      if (error) throw error

      const mapped: Query[] = (queryData || []).map((q: any) => ({
        id: q.id,
        student_id: q.student_id,
        student_name: q.student_name,
        student_email: q.student_email,
        recipient: q.recipient,
        course: q.course,
        trainer_name: q.trainer_name,
        query_type: q.query_type,
        subject: q.subject,
        message: q.message,
        attachment: q.attachment,
        status: q.status,
        created_at: q.created_at,
        replies: (q.support_replies || []).sort(
          (a: Reply, b: Reply) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }))
      setQueries(mapped)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load queries")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [user?.email])

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.email) return
    const channel = supabase
      .channel("student-support")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_queries" }, fetchQueries)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_replies" }, fetchQueries)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.email])

  const filteredQueries = queries.filter((q) => q.recipient === activeTab)

  // ── Submit new query ────────────────────────────────────────────────────────
  const handleSubmitQuery = async () => {
    if (!newQuery.type || !newQuery.subject || !newQuery.message) {
      toast.error("Please fill all required fields")
      return
    }
    if (activeTab === "trainer" && !newQuery.course) {
      toast.error("Please select a course")
      return
    }
    if (!user) { toast.error("Not logged in"); return }

    setIsSubmitting(true)
    try {
      const course = mockCourses.find((c) => c.id === newQuery.course)
      const trainer = mockTrainers.find((t) => t.id === course?.trainerId)

      const { error } = await supabase.from("support_queries").insert({
        student_id: user.id || user.email,
        student_name: user.name || user.email,
        student_email: user.email,
        recipient: activeTab,
        course: course?.title,
        trainer_name: trainer?.name,
        query_type: newQuery.type,
        subject: newQuery.subject,
        message: newQuery.message,
        attachment: newQuery.attachment || null,
        status: "Pending",
      })

      if (error) throw error

      setNewQuery({ course: "", type: "", subject: "", message: "", attachment: "" })
      toast.success("Query submitted successfully!")
      fetchQueries()
    } catch (err) {
      console.error(err)
      toast.error("Failed to submit query")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Send reply ──────────────────────────────────────────────────────────────
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedQuery) return
    setIsSending(true)
    try {
      const { error } = await supabase.from("support_replies").insert({
        query_id: selectedQuery.id,
        sender: "Student",
        message: replyText,
      })
      if (error) throw error
      setReplyText("")
      toast.success("Reply sent!")
      fetchQueries()
    } catch (err) {
      toast.error("Failed to send reply")
    } finally {
      setIsSending(false)
    }
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  return (
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
              <Select value={newQuery.course} onValueChange={(v) => setNewQuery({ ...newQuery, course: v })}>
                <SelectTrigger><SelectValue placeholder="Choose course..." /></SelectTrigger>
                <SelectContent>
                  {mockCourses.filter((c) => c.status === "Active").map((course) => (
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
            <Select value={newQuery.type} onValueChange={(v) => setNewQuery({ ...newQuery, type: v })}>
              <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
              <SelectContent>
                {(activeTab === "trainer" ? trainerQueryTypes : bdeQueryTypes).map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={newQuery.subject}
              onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
              placeholder="Brief subject of your query..."
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <textarea
              value={newQuery.message}
              onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })}
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
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" />Submit Query</>
            )}
          </Button>
        </div>

        {/* Queries List */}
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            {activeTab === "trainer" ? "Trainer Queries" : "BDE Queries"}
          </h2>
          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {filteredQueries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HelpCircle className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No queries yet</p>
                <p className="text-sm text-muted-foreground">Submit your first query above</p>
              </div>
            ) : (
              filteredQueries.map((query) => (
                <div
                  key={query.id}
                  onClick={() => { setSelectedQuery(query); setIsDetailOpen(true) }}
                  className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{query.subject}</h4>
                      {query.trainer_name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">Trainer: {query.trainer_name}</p>
                      )}
                      <p className="mt-1 truncate text-xs text-muted-foreground">{query.message}</p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(query.status)}`}>
                      {getStatusIcon(query.status)}
                      {query.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{query.query_type}</span>
                    <span>{new Date(query.created_at).toLocaleString()}</span>
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
        onClose={() => { setIsDetailOpen(false); setSelectedQuery(null); setReplyText("") }}
        title={selectedQuery?.subject || "Query Details"}
      >
        {selectedQuery && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedQuery.query_type}</span>
                </p>
                {selectedQuery.trainer_name && (
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Trainer:</span>
                    <span className="font-medium">{selectedQuery.trainer_name}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(selectedQuery.created_at).toLocaleString()}</span>
                </p>
              </div>
              <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedQuery.status)}`}>
                {getStatusIcon(selectedQuery.status)}
                {selectedQuery.status}
              </span>
            </div>

            <div className="max-h-60 space-y-3 overflow-y-auto">
              {/* Original message */}
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" /> You
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedQuery.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{selectedQuery.message}</p>
                {selectedQuery.attachment && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <Paperclip className="h-3 w-3" /> {selectedQuery.attachment}
                  </p>
                )}
              </div>

              {/* Replies */}
              {selectedQuery.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-lg border p-3 ${
                    reply.sender === "Student" ? "mr-4 bg-muted/50" : "ml-4 bg-primary/5"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      {reply.sender === "Student" ? "You" : reply.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(reply.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{reply.message}</p>
                </div>
              ))}
            </div>

            {selectedQuery.status !== "Closed" && (
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Button onClick={handleSendReply} disabled={isSending || !replyText.trim()}>
                  {isSending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />Send Reply</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}