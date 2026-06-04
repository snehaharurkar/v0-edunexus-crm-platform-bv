"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import { supabase } from "@/lib/supabase"
import { Play, Clock, Video, Calendar, ExternalLink, Bell } from "lucide-react"
import { toast } from "sonner"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('classes')
        .select('*')
        .order('date', { ascending: true })
      if (data) setClasses(data)
      setLoading(false)
    }
    fetchClasses()

    // Real-time updates
    const channel = supabase
      .channel('student-classes-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
        fetchClasses()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = classes.filter(cls => {
    const classDate = new Date(cls.date)
    classDate.setHours(0, 0, 0, 0)
    if (filter === "upcoming") return classDate >= today
    if (filter === "past") return classDate < today
    return true
  })

  const upcoming = classes.filter(cls => new Date(cls.date) >= today).length
  const past = classes.filter(cls => new Date(cls.date) < today).length

  return (
    <DashboardLayout navItems={studentNavItems} roleLabel="Student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">View all your scheduled and past classes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{classes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Classes</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{upcoming}</p>
            <p className="text-sm text-muted-foreground mt-1">Upcoming</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-gray-500">{past}</p>
            <p className="text-sm text-muted-foreground mt-1">Completed</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "upcoming", "past"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Classes list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border rounded-xl bg-card">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground">No classes found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "upcoming" ? "No upcoming classes scheduled" : filter === "past" ? "No past classes yet" : "Your trainer hasn't posted any classes yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(cls => {
              const classDate = new Date(cls.date)
              classDate.setHours(0, 0, 0, 0)
              const isPast = classDate < today
              const isToday = classDate.getTime() === today.getTime()

              return (
                <div key={cls.id} className={`rounded-xl border bg-card p-4 hover:shadow-md transition-shadow ${isToday ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 shrink-0 ${isPast ? 'bg-gray-100' : isToday ? 'bg-primary/10' : 'bg-blue-50'}`}>
                        <Video className={`h-6 w-6 ${isPast ? 'text-gray-400' : isToday ? 'text-primary' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{cls.title}</h3>
                          {isToday && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                              <Bell className="h-3 w-3" /> Today
                            </span>
                          )}
                          {isPast && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Completed</span>
                          )}
                        </div>
                        {cls.description && <p className="text-sm text-muted-foreground mt-1">{cls.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(cls.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />{cls.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-3.5 w-3.5" />{cls.platform}
                          </span>
                          {cls.batch && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{cls.batch}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (cls.meeting_link) {
                          window.open(cls.meeting_link, '_blank')
                        } else {
                          toast.error('Meeting link not available')
                        }
                      }}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isPast
                          ? 'border border-muted-foreground/30 text-muted-foreground hover:bg-muted'
                          : isToday
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-primary text-primary-foreground hover:opacity-90'
                      }`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {isPast ? 'View Recording' : isToday ? 'Join Now' : 'Join Class'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}