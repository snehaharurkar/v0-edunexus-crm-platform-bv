"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/shared/modal'
import { StatusBadge } from '@/components/shared/badge'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Plus, Calendar as CalendarIcon, List, Video, Users, Clock,
  ExternalLink, Mail, Bell, Loader2, Send, Trash2,
} from 'lucide-react'

interface ClassSession {
  id: string
  title: string
  batch: string
  course_id: string
  trainer_id: string
  date: string
  time: string
  platform: string
  meeting_link: string
  description: string
  student_count: number
  auto_reminder: boolean
  is_demo: boolean
  created_at: string
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function TrainerClassesPage() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false)
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [isSendingTelegram, setIsSendingTelegram] = useState(false)
  const [isSendingDiscord, setIsSendingDiscord] = useState(false)
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false)
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [telegramTitle, setTelegramTitle] = useState('')
  const [telegramMessage, setTelegramMessage] = useState('')
  const [discordTitle, setDiscordTitle] = useState('')
  const [discordMessage, setDiscordMessage] = useState('')
  const [discordType, setDiscordType] = useState('announcement')
  const [whatsappTitle, setWhatsappTitle] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [bulkEmailSubject, setBulkEmailSubject] = useState('')
  const [bulkEmailMessage, setBulkEmailMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '', batch: '', date: '', time: '',
    platform: 'Zoom' as 'Zoom' | 'Google Meet',
    meetingLink: '', description: '',
    autoReminder: true,
    isDemo: false,
  })

  const fetchClasses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('date', { ascending: true })
    if (error) toast.error('Failed to load classes')
    else setClasses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchClasses()
    const channel = supabase
      .channel('classes-realtime')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'classes'
      }, () => { fetchClasses() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      title: formData.title,
      batch: formData.batch,
      date: formData.date,
      time: formData.time,
      platform: formData.platform,
      meeting_link: formData.meetingLink,
      description: formData.description,
      auto_reminder: formData.autoReminder,
      is_demo: formData.isDemo,
      trainer_id: '3',
      course_id: '1',
      student_count: 0,
    }

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert([payload])
      .select()
      .single()

    if (error) {
      toast.error('Failed to create class: ' + error.message)
      setIsSubmitting(false)
      return
    }

    toast.success('Class scheduled successfully!')

    // Auto send notifications
    if (newClass) {
      try {
        const notifyType = formData.isDemo ? 'demo_class' : 'new_class'
        const res = await fetch('/api/classes/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: newClass.id,
            type: notifyType
          })
        })
        const result = await res.json()
        if (result.success) {
          if (formData.isDemo) {
            toast.success(
              `🎓 Demo class notifications sent to ${result.students} students + ${result.leads} leads!`,
              { duration: 5000 }
            )
          } else {
            toast.success(
              `📧 Class notification sent to ${result.sent} students!`,
              { duration: 4000 }
            )
          }
        }
      } catch (err) {
        console.error('Notification error:', err)
        toast.error('Class created but notifications failed')
      }
    }

    setIsModalOpen(false)
    setFormData({
      title: '', batch: '', date: '', time: '',
      platform: 'Zoom', meetingLink: '',
      description: '', autoReminder: true, isDemo: false,
    })
    fetchClasses()
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else { toast.success('Class deleted!'); fetchClasses() }
  }

  const handleSendReminder = async () => {
    if (!selectedClass) return
    setIsSendingReminder(true)
    try {
      const res = await fetch('/api/classes/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass.id,
          type: 'reminder'
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success(`✅ Reminder sent to ${result.sent} students!`)
        setIsReminderModalOpen(false)
      } else {
        toast.error('Failed: ' + result.error)
      }
    } catch (err) {
      console.error('Reminder error:', err)
      toast.error('Failed to send reminders')
    } finally {
      setIsSendingReminder(false)
    }
  }

  const handleSendBulkEmail = async () => {
    if (!bulkEmailSubject || !bulkEmailMessage) {
      toast.error('Please fill in both subject and message')
      return
    }
    setIsSendingBulkEmail(true)
    try {
      const { data: students, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('role', 'student')
        .eq('status', 'active')

      if (error) throw error
      if (!students || students.length === 0) {
        toast.error('No active students found')
        setIsSendingBulkEmail(false)
        return
      }

      const { sendLeadEmail } = await import('@/lib/emailjs-send')
      const results = await Promise.allSettled(
        students.map((student: any) =>
          sendLeadEmail({
            to_email: student.email,
            to_name: student.name,
            subject: bulkEmailSubject,
            message: `Hi ${student.name},\n\n${bulkEmailMessage}\n\nBest regards,\nEduNexus Team`,
          })
        )
      )

      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (failed === 0) {
        toast.success(`✅ Email sent to ${succeeded} students!`)
      } else {
        toast.success(`Sent to ${succeeded} students`, { description: `${failed} failed` })
      }

      setBulkEmailSubject('')
      setBulkEmailMessage('')
      setIsBulkEmailModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to send emails')
    } finally {
      setIsSendingBulkEmail(false)
    }
  }

  const handleSendTelegram = async () => {
    if (!telegramTitle || !telegramMessage) {
      toast.error('Please fill in both fields')
      return
    }
    setIsSendingTelegram(true)
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: telegramTitle, message: telegramMessage })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Sent to Telegram!')
        setTelegramTitle('')
        setTelegramMessage('')
        setIsTelegramModalOpen(false)
      } else {
        toast.error('Failed: ' + data.error)
      }
    } catch {
      toast.error('Failed to send')
    }
    setIsSendingTelegram(false)
  }

  const handleSendDiscord = async () => {
    if (!discordTitle || !discordMessage) {
      toast.error('Please fill in both fields')
      return
    }
    setIsSendingDiscord(true)
    try {
      const res = await fetch('/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: discordTitle,
          message: discordMessage,
          type: discordType
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Sent to Discord!')
        setDiscordTitle('')
        setDiscordMessage('')
        setIsDiscordModalOpen(false)
      } else {
        toast.error('Failed: ' + data.error)
      }
    } catch {
      toast.error('Failed to send')
    }
    setIsSendingDiscord(false)
  }

  const handleSendWhatsApp = async () => {
    if (!whatsappTitle || !whatsappMessage) {
      toast.error('Please fill in both fields')
      return
    }
    setIsSendingWhatsapp(true)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '7892671224',
          message: `*${whatsappTitle}*\n\n${whatsappMessage}\n\n_Sent from EduNexus CRM_`
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Sent via WhatsApp!')
        setWhatsappTitle('')
        setWhatsappMessage('')
        setIsWhatsAppModalOpen(false)
      } else {
        toast.error('Failed: ' + data.error)
      }
    } catch {
      toast.error('Failed to send')
    }
    setIsSendingWhatsapp(false)
  }

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const getClassesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return classes.filter(c => c.date === dateStr)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage your classes</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setIsBulkEmailModalOpen(true)} className="border-orange-500 text-orange-600 hover:bg-orange-50">
            <Mail className="h-4 w-4 mr-2" />Bulk Email
          </Button>
          <Button variant="outline" onClick={() => setIsTelegramModalOpen(true)} className="border-blue-500 text-blue-600 hover:bg-blue-50">
            <Send className="h-4 w-4 mr-2" />Telegram
          </Button>
          <Button variant="outline" onClick={() => setIsDiscordModalOpen(true)} className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
            💬 Discord
          </Button>
          <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(true)} className="border-green-500 text-green-600 hover:bg-green-50">
            📱 WhatsApp
          </Button>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn("px-3 py-2 text-sm font-medium transition-colors",
                viewMode === 'calendar' ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("px-3 py-2 text-sm font-medium transition-colors",
                viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Create Class
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
            ))}
            {calendarDays.map((day, index) => {
              const dayClasses = day ? getClassesForDay(day) : []
              const isToday = day === today.getDate()
              return (
                <div key={index} className={cn("min-h-24 p-2 border rounded-lg",
                  day ? "bg-card" : "bg-muted/30",
                  isToday && "ring-2 ring-primary"
                )}>
                  {day && (
                    <>
                      <span className={cn("text-sm font-medium", isToday && "text-primary")}>{day}</span>
                      <div className="mt-1 space-y-1">
                        {dayClasses.map(cls => (
                          <div key={cls.id} className="text-xs p-1 rounded bg-primary/10 text-primary truncate" title={cls.title}>
                            {cls.time} - {cls.title}
                            {cls.is_demo && ' 🎓'}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No classes scheduled</h3>
              <p className="text-muted-foreground mt-1">Create your first class to get started</p>
            </div>
          ) : (
            classes.map(cls => (
              <div key={cls.id} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{cls.title}</h3>
                      {cls.is_demo && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                          🎓 Demo Class
                        </span>
                      )}
                      {cls.auto_reminder && (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 flex items-center gap-1">
                          <Bell className="h-3 w-3" />Auto Reminder: ON
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{cls.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <StatusBadge variant="default">{cls.batch}</StatusBadge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />{new Date(cls.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />{cls.time}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Video className="h-4 w-4" />{cls.platform}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />{cls.student_count} students
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedClass(cls); setIsReminderModalOpen(true) }}>
                      <Mail className="h-4 w-4 mr-1" />Send Reminder
                    </Button>
                    <Button asChild size="sm">
                      <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />Join
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(cls.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Class Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Class">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Class Title</Label>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., React Hooks Deep Dive"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={formData.batch} onValueChange={value => setFormData({ ...formData, batch: value })}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Batch A - Morning">Batch A - Morning</SelectItem>
                  <SelectItem value="Batch A - Evening">Batch A - Evening</SelectItem>
                  <SelectItem value="Batch B - Weekend">Batch B - Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={formData.platform} onValueChange={value => setFormData({ ...formData, platform: value as 'Zoom' | 'Google Meet' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input
              value={formData.meetingLink}
              onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://zoom.us/j/..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          {/* Auto Reminder Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">Auto-send reminder 15 mins before class</p>
              <p className="text-xs text-muted-foreground">Students will receive email reminder automatically</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, autoReminder: !formData.autoReminder })}
              className={cn("relative h-6 w-11 rounded-full transition-colors",
                formData.autoReminder ? "bg-primary" : "bg-muted"
              )}
            >
              <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                formData.autoReminder && "translate-x-5"
              )} />
            </button>
          </div>

          {/* Demo Class Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-amber-50">
            <div>
              <p className="font-medium text-sm">🎓 This is a Demo / Free Class</p>
              <p className="text-xs text-muted-foreground">
                All leads will also be notified via email in addition to students
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isDemo: !formData.isDemo })}
              className={cn("relative h-6 w-11 rounded-full transition-colors",
                formData.isDemo ? "bg-amber-500" : "bg-muted"
              )}
            >
              <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                formData.isDemo && "translate-x-5"
              )} />
            </button>
          </div>

          {/* Info box when demo is on */}
          {formData.isDemo && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              ⚡ When you create this class, emails will automatically be sent to:
              <ul className="mt-1 ml-4 list-disc text-xs space-y-0.5">
                <li>All active students</li>
                <li>All leads (except Converted and Lost)</li>
              </ul>
            </div>
          )}

          {/* Info box for normal class */}
          {!formData.isDemo && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
              📧 When you create this class, emails will automatically be sent to all active students.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating & Notifying...</>
              ) : (
                formData.isDemo ? '🎓 Create Demo Class' : '📅 Create Class'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Send Reminder Modal */}
      <Modal open={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} title="Send Class Reminder">
        {selectedClass && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Real emails will be sent to <strong>all active students</strong> via EmailJS.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-1">
              <p><strong>Class:</strong> {selectedClass.title}</p>
              <p><strong>Date:</strong> {new Date(selectedClass.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedClass.time}</p>
              <p><strong>Batch:</strong> {selectedClass.batch}</p>
              <p><strong>Platform:</strong> {selectedClass.platform}</p>
              <p><strong>Link:</strong> <span className="text-primary break-all">{selectedClass.meeting_link}</span></p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReminderModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSendReminder} disabled={isSendingReminder}>
                {isSendingReminder
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending emails...</>
                  : <><Mail className="h-4 w-4 mr-2" />Send Reminder Emails</>
                }
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Email Modal */}
      <Modal open={isBulkEmailModalOpen} onClose={() => setIsBulkEmailModalOpen(false)} title="Send Bulk Email to All Students">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <span className="text-2xl">📧</span>
            <p className="text-sm text-orange-700">
              Real emails will be sent to <strong>all active students</strong> via EmailJS
            </p>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={bulkEmailSubject}
              onChange={e => setBulkEmailSubject(e.target.value)}
              placeholder="e.g. Important Announcement — No Class Today"
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={bulkEmailMessage}
              onChange={e => setBulkEmailMessage(e.target.value)}
              placeholder="Type your announcement or message here..."
              rows={6}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsBulkEmailModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendBulkEmail}
              disabled={isSendingBulkEmail || !bulkEmailSubject || !bulkEmailMessage}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSendingBulkEmail
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending to all students...</>
                : <><Mail className="h-4 w-4 mr-2" />Send to All Students</>
              }
            </Button>
          </div>
        </div>
      </Modal>

      {/* Telegram Modal */}
      <Modal open={isTelegramModalOpen} onClose={() => setIsTelegramModalOpen(false)} title="Send Telegram Notification">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">✈️</span>
            <p className="text-sm text-blue-700">Message will be sent instantly to all students on Telegram</p>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={telegramTitle} onChange={e => setTelegramTitle(e.target.value)} placeholder="e.g. Class Cancelled" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={telegramMessage} onChange={e => setTelegramMessage(e.target.value)} placeholder="Type your announcement..." rows={5} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsTelegramModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendTelegram}
              disabled={isSendingTelegram || !telegramTitle || !telegramMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSendingTelegram
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                : <><Send className="h-4 w-4 mr-2" />Send to Telegram</>
              }
            </Button>
          </div>
        </div>
      </Modal>

      {/* Discord Modal */}
      <Modal open={isDiscordModalOpen} onClose={() => setIsDiscordModalOpen(false)} title="Send Discord Notification">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
            <span className="text-2xl">💬</span>
            <p className="text-sm text-indigo-700">Message will be sent to your Discord server instantly</p>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              value={discordType}
              onChange={e => setDiscordType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="announcement">📢 Announcement</option>
              <option value="class">📚 Class Update</option>
              <option value="assignment">📝 Assignment</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={discordTitle} onChange={e => setDiscordTitle(e.target.value)} placeholder="e.g. New Assignment Posted" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={discordMessage} onChange={e => setDiscordMessage(e.target.value)} placeholder="Type your message..." rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDiscordModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendDiscord}
              disabled={isSendingDiscord || !discordTitle || !discordMessage}
              className="bg-indigo-600 text-white"
            >
              {isSendingDiscord
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                : <>💬 Send to Discord</>
              }
            </Button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal open={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} title="Send WhatsApp Broadcast">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <span className="text-2xl">📱</span>
            <p className="text-sm text-green-700">Message will be sent via WhatsApp to students</p>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={whatsappTitle} onChange={e => setWhatsappTitle(e.target.value)} placeholder="e.g. Class Reminder" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value)} placeholder="Type your message..." rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsapp || !whatsappTitle || !whatsappMessage}
              className="bg-green-600 text-white"
            >
              {isSendingWhatsapp
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                : <>📱 Send WhatsApp</>
              }
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}