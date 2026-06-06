"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/shared/modal"
import { supabase } from "@/lib/supabase"
import {
  MessageSquare, Search, Clock, Check, Send, User, Loader2, BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Reply {
  id: string
  sender: string
  message: string
  created_at: string
}

interface Query {
  id: string
  student_name: string
  student_email: string
  course?: string
  query_type: string
  subject: string
  message: string
  attachment?: string
  status: "Pending" | "Answered" | "Closed"
  created_at: string
  replies: Reply[]
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function TrainerQueriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [queries, setQueries] = useState<Query[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)

  const fetchQueries = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("support_queries")
        .select("*, support_replies(*)")
        .eq("recipient", "trainer")
        .order("created_at", { ascending: false })

      if (error) throw error

      const mapped: Query[] = (data || []).map((q: any) => ({
        id: q.id,
        student_name: q.student_name,
        student_email: q.student_email,
        course: q.course,
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
  }, [])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("trainer-queries")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_queries" }, fetchQueries)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_replies" }, fetchQueries)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filteredQueries = queries.filter((q) => {
    const matchesSearch =
      q.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || q.status === statusFilter
    const matchesType = typeFilter === "all" || q.query_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedQuery) return
    setIsSending(true)
    try {
      const { error: replyError } = await supabase.from("support_replies").insert({
        query_id: selectedQuery.id,
        sender: "Trainer",
        message: replyText,
      })
      if (replyError) throw replyError

      // Update status to Answered
      await supabase
        .from("support_queries")
        .update({ status: "Answered" })
        .eq("id", selectedQuery.id)

      setReplyText("")
      toast.success("Reply sent!")
      fetchQueries()
    } catch (err) {
      toast.error("Failed to send reply")
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkResolved = async () => {
    if (!selectedQuery) return
    try {
      await supabase
        .from("support_queries")
        .update({ status: "Closed" })
        .eq("id", selectedQuery.id)
      toast.success("Query marked as resolved!")
      setIsReplyOpen(false)
      fetchQueries()
    } catch {
      toast.error("Failed to update status")
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Doubt": return "bg-purple-500/10 text-purple-600"
      case "Assignment Help": return "bg-blue-500/10 text-blue-600"
      case "Technical Issue": return "bg-red-500/10 text-red-600"
      default: return "bg-gray-500/10 text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Queries</h1>
        <p className="text-muted-foreground">Answer student doubts and questions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or subject..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
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
            <SelectItem value="Doubt">Doubt</SelectItem>
            <SelectItem value="Assignment Help">Assignment Help</SelectItem>
            <SelectItem value="Technical Issue">Technical Issue</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pending", status: "Pending", color: "yellow" },
          { label: "Answered", status: "Answered", color: "blue" },
          { label: "Resolved", status: "Closed", color: "green" },
        ].map(({ label, status, color }) => (
          <div key={status} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-${color}-500/10 p-2`}>
                <MessageSquare className={`h-5 w-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{queries.filter((q) => q.status === status).length}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
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
              {filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No queries found
                  </td>
                </tr>
              ) : (
                filteredQueries.map((query) => (
                  <tr key={query.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{query.student_name}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3" /> {query.course}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{query.subject}</p>
                      <p className="max-w-xs truncate text-xs text-muted-foreground">{query.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(query.query_type)}`}>
                        {query.query_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(query.status)}`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        {new Date(query.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedQuery(query); setIsReplyOpen(true) }}
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {query.status === "Closed" ? "View" : "Reply"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal
        open={isReplyOpen}
        onClose={() => { setIsReplyOpen(false); setSelectedQuery(null); setReplyText("") }}
        title={selectedQuery?.subject || "Query Details"}
      >
        {selectedQuery && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{selectedQuery.student_name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BookOpen className="h-3 w-3" /> {selectedQuery.course}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedQuery.status)}`}>
                {selectedQuery.status}
              </span>
            </div>

            <div className="max-h-60 space-y-3 overflow-y-auto">
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedQuery.student_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedQuery.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{selectedQuery.message}</p>
                {selectedQuery.attachment && (
                  <p className="mt-2 text-xs text-primary">Attachment: {selectedQuery.attachment}</p>
                )}
              </div>

              {selectedQuery.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-lg border p-3 ${reply.sender === "Trainer" ? "ml-4 bg-primary/5" : "mr-4"}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {reply.sender === "Trainer" ? "You" : selectedQuery.student_name}
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
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSendReply} disabled={isSending || !replyText.trim()}>
                    {isSending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Send Reply</>
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
  )
}