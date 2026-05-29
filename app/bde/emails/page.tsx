"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { bdeNavItems } from "@/lib/nav-items"
import { Modal } from "@/components/shared/modal"
import { mockStudents } from "@/lib/mock-data"
import { useLeads, CURRENT_BDE } from "@/contexts/leads-context"
import { getEmailjsErrorMessage, sendLeadEmail, personalizeEmailContent } from "@/lib/emailjs-send"
import {
  Mail,
  Send,
  Users,
  Eye,
  Check,
  Clock,
  Search,
  Loader2,
  BarChart,
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

const emailTypes = [
  { value: "welcome", label: "Welcome Email", subject: "Welcome to EduNexus! 🎉" },
  { value: "followup", label: "Follow-up Reminder", subject: "Just checking in - EduNexus" },
  { value: "demo", label: "Demo Scheduled Confirmation", subject: "Your Demo is Confirmed!" },
  { value: "payment", label: "Payment Reminder", subject: "Payment Reminder - Complete Your Enrollment" },
  { value: "enrollment", label: "Course Enrollment Confirmation", subject: "Welcome to Your Course!" },
  { value: "offer", label: "Special Offer", subject: "Exclusive Offer Just for You!" },
]

const emailTemplates: Record<string, string> = {
  welcome: `Dear {name},

Welcome to EduNexus! We're thrilled to have you join our learning community.

Your interest in {course} shows great ambition, and we're here to help you achieve your goals.

Here's what you can expect:
- Industry-leading curriculum
- Expert trainers with real-world experience
- Placement assistance with top companies
- 24/7 doubt resolution support

Our team will reach out soon to discuss the next steps. Feel free to reply to this email with any questions.

Best regards,
EduNexus Team`,

  followup: `Hi {name},

I wanted to follow up on our previous conversation about {course}.

I understand choosing the right course is a big decision. I'm here to help answer any questions you might have.

Would you be available for a quick call this week? I'd love to discuss:
- Course curriculum and outcomes
- Flexible batch timings
- EMI options available
- Success stories from our alumni

Let me know what works best for you!

Best,
{bde_name}
EduNexus`,

  demo: `Hi {name},

Great news! Your demo session has been scheduled.

📅 Date: {demo_date}
⏰ Time: {demo_time}
💻 Platform: Zoom (link will be shared before the session)

What to expect in the demo:
- Overview of the {course} curriculum
- Live session experience
- Q&A with our expert trainer
- Special enrollment offers

Please join 5 minutes early to ensure a smooth experience.

See you there!
{bde_name}
EduNexus`,

  payment: `Hi {name},

This is a friendly reminder about your pending enrollment for {course}.

Your payment of ₹{amount} is pending. Complete it today to:
✅ Secure your seat in the upcoming batch
✅ Get early access to course materials
✅ Avail the current discount offer

Payment Link: {payment_link}

Need help with EMI options? Reply to this email or call us.

Thanks,
{bde_name}
EduNexus`,

  enrollment: `Dear {name},

Congratulations! 🎉 Your enrollment for {course} is now complete.

Here are your details:
📚 Course: {course}
📅 Batch: {batch}
👨‍🏫 Trainer: {trainer}
🕐 Timing: {timing}

What's next:
1. Check your email for login credentials
2. Access the student portal
3. Join the orientation session
4. Start your learning journey!

Welcome aboard! Your success story starts now.

Best wishes,
EduNexus Team`,

  offer: `Hi {name},

We have an EXCLUSIVE offer just for you! 🎁

Get FLAT 20% OFF on {course}

Original Price: ₹{original_price}
Your Price: ₹{discounted_price}

This offer is valid only till {expiry_date}. Don't miss out!

Why choose EduNexus?
⭐ 4.8/5 rating from 10,000+ students
💼 90% placement rate
👨‍🏫 Industry expert trainers
📜 Recognized certifications

Claim your offer now: {offer_link}

Best,
{bde_name}
EduNexus`,
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

type BulkRecipient = {
  email: string
  name: string
  course?: string
  courseInterest?: string
}

export default function BDEEmailsPage() {
  const { leads, addActivity } = useLeads()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  
  // Single email state
  const [selectedLead, setSelectedLead] = useState("")
  const [emailType, setEmailType] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Bulk email state
  const [recipientType, setRecipientType] = useState("all_students")
  const [bulkSubject, setBulkSubject] = useState("")
  const [bulkBody, setBulkBody] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [isBulkSending, setIsBulkSending] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Sent emails log
  const [sentEmails, setSentEmails] = useState([
    { id: 1, to: "aditya@gmail.com", subject: "Welcome to EduNexus!", type: "Welcome Email", sentAt: "2024-03-28 14:30", status: "Delivered" },
    { id: 2, to: "meera@gmail.com", subject: "Your Demo is Confirmed!", type: "Demo Scheduled", sentAt: "2024-03-28 11:15", status: "Delivered" },
    { id: 3, to: "karthik@gmail.com", subject: "Payment Reminder", type: "Payment Reminder", sentAt: "2024-03-27 16:45", status: "Opened" },
  ])

  // Bulk campaigns log
  const [bulkCampaigns, setBulkCampaigns] = useState([
    { id: 1, name: "March Newsletter", recipients: 245, sentAt: "2024-03-25 10:00", openRate: 42, status: "Completed" },
    { id: 2, name: "New Course Launch", recipients: 180, sentAt: "2024-03-20 09:30", openRate: 38, status: "Completed" },
    { id: 3, name: "Weekend Batch Offer", recipients: 120, sentAt: "2024-03-15 14:00", openRate: 55, status: "Completed" },
  ])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (emailType) {
      const template = emailTypes.find(t => t.value === emailType)
      if (template) {
        setSubject(template.subject)
        setBody(emailTemplates[emailType] || "")
      }
    }
  }, [emailType])

  const resolveBulkRecipients = (): BulkRecipient[] => {
    switch (recipientType) {
      case "all_students":
        return mockStudents.map((s) => ({
          email: s.email,
          name: s.name,
          course: s.course,
        }))
      case "all_leads":
        return leads.map((l) => ({
          email: l.email,
          name: l.name,
          courseInterest: l.courseInterest,
        }))
      case "specific_course":
        return leads.slice(0, 25).map((l) => ({
          email: l.email,
          name: l.name,
          courseInterest: l.courseInterest,
        }))
      case "specific_batch":
        return leads.slice(0, 15).map((l) => ({
          email: l.email,
          name: l.name,
          courseInterest: l.courseInterest,
        }))
      case "custom":
        return leads
          .filter((l) => selectedRecipients.includes(l.id))
          .map((l) => ({
            email: l.email,
            name: l.name,
            courseInterest: l.courseInterest,
          }))
      default:
        return []
    }
  }

  const getRecipientCount = () => resolveBulkRecipients().length

  const handleSendEmail = async () => {
    if (!selectedLead || !subject || !body) {
      toast.error("Please fill all required fields")
      return
    }

    const lead = leads.find((l) => l.id === selectedLead)
    if (!lead) {
      toast.error("Lead not found")
      return
    }

    setIsSending(true)
    try {
      const emailSubject = personalizeEmailContent(subject, lead)
      const emailBody = personalizeEmailContent(body, lead)

      await sendLeadEmail({
        to_email: lead.email,
        to_name: lead.name,
        subject: emailSubject,
        message: emailBody,
      })

      addActivity(lead.id, {
        type: "email",
        text: "Email sent: " + emailSubject,
        by: CURRENT_BDE,
      })

      setSentEmails((prev) => [
        {
          id: prev.length + 1,
          to: lead.email,
          subject: emailSubject,
          type: emailTypes.find((t) => t.value === emailType)?.label || "Custom",
          sentAt: new Date().toLocaleString(),
          status: "Delivered",
        },
        ...prev,
      ])

      setSelectedLead("")
      setEmailType("")
      setSubject("")
      setBody("")
      toast.success("Email sent to " + lead.name + "!")
    } catch (error) {
      toast.error(getEmailjsErrorMessage(error))
      console.error("EmailJS error:", error)
    }
    setIsSending(false)
  }

  const handleBulkSend = async () => {
    if (!bulkSubject || !bulkBody) {
      toast.error("Please fill subject and body")
      return
    }

    const recipients = resolveBulkRecipients()
    if (recipients.length === 0) {
      toast.error("No recipients selected")
      return
    }

    setIsConfirmOpen(false)
    setIsBulkSending(true)
    setBulkProgress(0)

    let sent = 0
    let failed = 0

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      try {
        const emailSubject = personalizeEmailContent(bulkSubject, recipient)
        const emailBody = personalizeEmailContent(bulkBody, recipient)

        await sendLeadEmail({
          to_email: recipient.email,
          to_name: recipient.name,
          subject: emailSubject,
          message: emailBody,
        })
        sent++
      } catch (error) {
        failed++
        console.error(error)
      }
      setBulkProgress(Math.round(((i + 1) / recipients.length) * 100))
    }

    setBulkCampaigns((prev) => [
      {
        id: prev.length + 1,
        name: bulkSubject.slice(0, 30) + (bulkSubject.length > 30 ? "..." : ""),
        recipients: sent,
        sentAt: new Date().toLocaleString(),
        openRate: 0,
        status: sent > 0 ? "Completed" : "Failed",
      },
      ...prev,
    ])

    setIsBulkSending(false)
    setBulkSubject("")
    setBulkBody("")
    setSelectedRecipients([])

    if (sent > 0) {
      toast.success(`Bulk email sent to ${sent} recipient${sent === 1 ? "" : "s"}!`)
    }
    if (failed > 0) {
      toast.error(`${failed} email(s) failed to send`)
    }
  }

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <DashboardLayout navItems={bdeNavItems} roleLabel="BDE">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={bdeNavItems} roleLabel="BDE">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email Center</h1>
            <p className="text-muted-foreground">Send automated and bulk emails to leads and students</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "single"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="mr-2 inline h-4 w-4" />
            Send Automated Email
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "bulk"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="mr-2 inline h-4 w-4" />
            Bulk Email
          </button>
        </div>

        {activeTab === "single" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Email Form */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Compose Email</h2>
              
              <div className="space-y-2">
                <Label>Select Lead</Label>
                <Select value={selectedLead} onValueChange={setSelectedLead}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} ({lead.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Type</Label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your email..."
                  className="min-h-[200px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!subject || !body}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={handleSendEmail} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sent Emails Log */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Sent Emails Log</h2>
              <div className="space-y-3">
                {sentEmails.map(email => (
                  <div key={email.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">To: {email.to}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {email.sentAt}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{email.type}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        email.status === "Delivered" ? "bg-green-500/10 text-green-600" :
                        email.status === "Opened" ? "bg-blue-500/10 text-blue-600" :
                        "bg-yellow-500/10 text-yellow-600"
                      }`}>
                        {email.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bulk Email Form */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Compose Bulk Email</h2>
              
              <div className="space-y-2">
                <Label>Select Recipients</Label>
                <div className="space-y-2">
                  {[
                    { value: "all_students", label: "All Students" },
                    { value: "all_leads", label: "All Leads" },
                    { value: "specific_course", label: "Specific Course" },
                    { value: "specific_batch", label: "Specific Batch" },
                    { value: "custom", label: "Custom Select" },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recipientType"
                        value={option.value}
                        checked={recipientType === option.value}
                        onChange={e => setRecipientType(e.target.value)}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {recipientType === "custom" && (
                <div className="space-y-2">
                  <Label>Search & Select</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search leads..."
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1">
                    {filteredLeads.map(lead => (
                      <label key={lead.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted rounded">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.includes(lead.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedRecipients(prev => [...prev, lead.id])
                            } else {
                              setSelectedRecipients(prev => prev.filter(id => id !== lead.id))
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{lead.name} - {lead.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-primary/10 p-3">
                <span className="text-sm font-medium text-primary">
                  {getRecipientCount()} recipients selected
                </span>
              </div>

              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={bulkSubject}
                  onChange={e => setBulkSubject(e.target.value)}
                  placeholder="Bulk email subject..."
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <textarea
                  value={bulkBody}
                  onChange={e => setBulkBody(e.target.value)}
                  placeholder="Write your bulk email..."
                  className="min-h-[150px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              {isBulkSending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sending emails...</span>
                    <span>{bulkProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${bulkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!bulkSubject || !bulkBody}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={isBulkSending || !bulkSubject || !bulkBody || getRecipientCount() === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send to All
                </Button>
              </div>
            </div>

            {/* Bulk Campaigns Log */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Bulk Campaign Log</h2>
              <div className="space-y-3">
                {bulkCampaigns.map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.recipients} recipients
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {campaign.sentAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <BarChart className="h-4 w-4 text-primary" />
                        {campaign.openRate}% open rate
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        campaign.status === "Completed" ? "bg-green-500/10 text-green-600" :
                        "bg-yellow-500/10 text-yellow-600"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        <Modal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Email Preview"
        >
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Subject:</p>
              <p className="font-medium">{activeTab === "single" ? subject : bulkSubject}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Body:</p>
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {activeTab === "single" ? body : bulkBody}
              </pre>
            </div>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <Modal
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Bulk Send"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You are about to send email to <span className="font-bold text-foreground">{getRecipientCount()}</span> recipients. Are you sure?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkSend}>
                <Check className="mr-2 h-4 w-4" />
                Confirm Send
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
