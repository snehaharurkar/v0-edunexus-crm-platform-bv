"use client"

import React, { useState, useEffect } from 'react'
import { mockClasses, type ClassSession } from '@/lib/mock-data'
import { Modal } from '@/components/shared/modal'
import { StatusBadge } from '@/components/shared/badge'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Video,
  Users,
  Clock,
  ExternalLink,
  Mail,
  Bell,
  Loader2,
  Check,
} from 'lucide-react'

interface ExtendedClassSession extends ClassSession {
  autoReminder?: boolean
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function TrainerClassesPage() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ExtendedClassSession[]>([])
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ExtendedClassSession | null>(null)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    batch: '',
    date: '',
    time: '',
    platform: 'Zoom' as 'Zoom' | 'Google Meet',
    meetingLink: '',
    description: '',
    autoReminder: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter classes for current trainer (mock: Priya Verma, id: 3)
      const trainerClasses = mockClasses.filter(c => c.trainerId === '3').map(c => ({
        ...c,
        autoReminder: true
      }))
      setClasses(trainerClasses)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newClass: ExtendedClassSession = {
      id: String(classes.length + 10),
      title: formData.title,
      batch: formData.batch,
      courseId: '1',
      trainerId: '3',
      date: formData.date,
      time: formData.time,
      platform: formData.platform,
      meetingLink: formData.meetingLink,
      description: formData.description,
      studentCount: 20,
      autoReminder: formData.autoReminder,
    }
    
    setClasses([...classes, newClass])
    toast.success('Class scheduled successfully')
    setIsSubmitting(false)
    setIsModalOpen(false)
    setFormData({
      title: '',
      batch: '',
      date: '',
      time: '',
      platform: 'Zoom',
      meetingLink: '',
      description: '',
      autoReminder: true,
    })
  }

  const handleSendReminder = async () => {
    if (!selectedClass) return
    setIsSendingReminder(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSendingReminder(false)
    setIsReminderModalOpen(false)
    toast.success(`Reminder sent to ${selectedClass.studentCount} students!`)
  }

  const toggleAutoReminder = (classId: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const newValue = !c.autoReminder
        toast.success(`Auto reminder ${newValue ? 'enabled' : 'disabled'}`)
        return { ...c, autoReminder: newValue }
      }
      return c
    }))
  }

  // Generate calendar grid for current month
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const getClassesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return classes.filter(c => c.date === dateStr)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
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
            <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage your classes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === 'calendar' ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const dayClasses = day ? getClassesForDay(day) : []
                const isToday = day === today.getDate()
                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-24 p-2 border border-border rounded-lg",
                      day ? "bg-card" : "bg-muted/30",
                      isToday && "ring-2 ring-primary"
                    )}
                  >
                    {day && (
                      <>
                        <span className={cn(
                          "text-sm font-medium",
                          isToday && "text-primary"
                        )}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayClasses.map(cls => (
                            <div
                              key={cls.id}
                              className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                              title={cls.title}
                            >
                              {cls.time} - {cls.title}
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
          /* List View */
          <div className="grid gap-4">
            {classes.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground">No classes scheduled</h3>
                <p className="text-muted-foreground mt-1">Create your first class to get started</p>
              </div>
            ) : (
              classes.map(cls => (
                <div
                  key={cls.id}
                  className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">{cls.title}</h3>
                        {cls.autoReminder && (
                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Auto Reminder: ON
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{cls.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <StatusBadge variant="default">{cls.batch}</StatusBadge>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(cls.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {cls.time}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Video className="h-4 w-4" />
                          {cls.platform}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {cls.studentCount} students
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(cls)
                          setIsReminderModalOpen(true)
                        }}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                      <Button asChild size="sm">
                        <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Join
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Class Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Class"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Class Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., React Hooks Deep Dive"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) => setFormData({ ...formData, batch: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Batch A - Morning">Batch A - Morning</SelectItem>
                    <SelectItem value="Batch A - Evening">Batch A - Evening</SelectItem>
                    <SelectItem value="Batch B - Weekend">Batch B - Weekend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value as 'Zoom' | 'Google Meet' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the class content"
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
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  formData.autoReminder ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    formData.autoReminder && "translate-x-5"
                  )}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Send Reminder Modal */}
        <Modal
          open={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          title="Send Class Reminder"
        >
          {selectedClass && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Send reminder email to all students in this batch?
              </p>
              
              {/* Email Preview */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium">Email Preview:</p>
                <div className="bg-background rounded p-3 text-sm space-y-1">
                  <p><strong>Subject:</strong> Class Reminder - {selectedClass.title}</p>
                  <hr className="my-2" />
                  <p>Your class <strong>{selectedClass.title}</strong> starts in 15 minutes!</p>
                  <p className="mt-2">Join here: <span className="text-primary">{selectedClass.meetingLink}</span></p>
                  <p>Trainer: <strong>Priya Verma</strong></p>
                  <p>Time: <strong>{selectedClass.time}</strong></p>
                  <p>Batch: <strong>{selectedClass.batch}</strong></p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                This will send to {selectedClass.studentCount} students in {selectedClass.batch}
              </p>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReminderModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendReminder} disabled={isSendingReminder}>
                  {isSendingReminder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
