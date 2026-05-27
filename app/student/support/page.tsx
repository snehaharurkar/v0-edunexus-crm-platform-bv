"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import { Modal } from "@/components/shared/modal"
import { useAuth } from "@/contexts/auth-context"
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface Ticket {
  id: string
  subject: string
  category: string
  status: "open" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdate: string
  messages: Array<{
    id: string
    sender: string
    content: string
    timestamp: string
    isStaff: boolean
  }>
}

const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Unable to access course recordings",
    category: "Technical",
    status: "in_progress",
    priority: "high",
    createdAt: "May 24, 2024",
    lastUpdate: "May 25, 2024",
    messages: [
      {
        id: "1",
        sender: "You",
        content: "I cannot access the React Advanced course recordings. Getting a 403 error.",
        timestamp: "May 24, 2024 10:30 AM",
        isStaff: false,
      },
      {
        id: "2",
        sender: "Support Team",
        content: "Hi! We're looking into this issue. Could you please try clearing your browser cache and try again?",
        timestamp: "May 25, 2024 09:15 AM",
        isStaff: true,
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Certificate not showing after course completion",
    category: "Academic",
    status: "resolved",
    priority: "medium",
    createdAt: "May 20, 2024",
    lastUpdate: "May 22, 2024",
    messages: [
      {
        id: "1",
        sender: "You",
        content: "I completed the Node.js course but my certificate is not appearing.",
        timestamp: "May 20, 2024 02:00 PM",
        isStaff: false,
      },
      {
        id: "2",
        sender: "Support Team",
        content: "Your certificate has been generated and should now be visible in the Certificates section.",
        timestamp: "May 22, 2024 11:00 AM",
        isStaff: true,
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Request for deadline extension",
    category: "Academic",
    status: "open",
    priority: "low",
    createdAt: "May 26, 2024",
    lastUpdate: "May 26, 2024",
    messages: [
      {
        id: "1",
        sender: "You",
        content: "Due to personal circumstances, I need a 3-day extension for the current assignment.",
        timestamp: "May 26, 2024 04:30 PM",
        isStaff: false,
      },
    ],
  },
]

const categories = ["Technical", "Academic", "Billing", "Career Services", "Other"]

export default function StudentSupport() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Technical",
    description: "",
    priority: "medium" as const,
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleCreateTicket = () => {
    const ticket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newTicket.subject,
      category: newTicket.category,
      status: "open",
      priority: newTicket.priority,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastUpdate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      messages: [
        {
          id: "1",
          sender: "You",
          content: newTicket.description,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          isStaff: false,
        },
      ],
    }
    setTickets([ticket, ...tickets])
    setIsNewTicketOpen(false)
    setNewTicket({ subject: "", category: "Technical", description: "", priority: "medium" })
  }

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return
    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          id: String(selectedTicket.messages.length + 1),
          sender: "You",
          content: replyMessage,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          isStaff: false,
        },
      ],
      lastUpdate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    setSelectedTicket(updatedTicket)
    setReplyMessage("")
  }

  const getStatusIcon = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/10 text-yellow-600"
      case "in_progress":
        return "bg-blue-500/10 text-blue-600"
      case "resolved":
        return "bg-green-500/10 text-green-600"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} roleLabel="Student">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Support Center</h1>
          <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Raise Ticket
          </Button>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket)
                setIsDetailOpen(true)
              }}
              className="cursor-pointer rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ticket.id} • {ticket.category} • Created {ticket.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {ticket.messages.length} messages
                </span>
                <span>Last update: {ticket.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No tickets yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a support ticket if you need help
            </p>
          </div>
        )}

        {/* New Ticket Modal */}
        <Modal
          open={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          title="Raise Support Ticket"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <Input
                value={newTicket.subject}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, subject: e.target.value })
                }
                placeholder="Brief description of your issue"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                value={newTicket.category}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, category: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Priority</label>
              <select
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                placeholder="Describe your issue in detail..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={!newTicket.subject || !newTicket.description}
              >
                Submit Ticket
              </Button>
            </div>
          </div>
        </Modal>

        {/* Ticket Detail Modal */}
        <Modal
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={selectedTicket?.subject || "Ticket Details"}
        >
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Ticket ID:</span>{" "}
                    {selectedTicket.id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    {selectedTicket.category}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    selectedTicket.status
                  )}`}
                >
                  {getStatusIcon(selectedTicket.status)}
                  {selectedTicket.status.replace("_", " ")}
                </span>
              </div>

              {/* Messages Thread */}
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 ${
                      msg.isStaff ? "bg-primary/10 ml-4" : "bg-muted mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{msg.sender}</span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== "resolved" && (
                <div className="flex gap-2">
                  <Input
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                  />
                  <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                    <Send className="h-4 w-4" />
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
