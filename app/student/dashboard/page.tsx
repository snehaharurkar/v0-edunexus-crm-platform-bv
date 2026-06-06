"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { mockCourses } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import {
  Flame, Clock, CalendarDays, Star, Play, Video,
  ExternalLink, BookOpen, ChevronRight, Trophy,
  Target, TrendingUp, Bell, ShoppingCart,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

const courseGradients: Record<string, string> = {
  '1': 'from-blue-600 to-indigo-600',
  '2': 'from-green-500 to-teal-600',
  '3': 'from-purple-500 to-pink-600',
  '4': 'from-orange-500 to-red-600',
  '5': 'from-cyan-500 to-blue-600',
}

const courseIcons: Record<string, string> = {
  '1': '⚛️', '2': '🐍', '3': '📊', '4': '☕', '5': '🌐',
}

const weeklyStudyData = [
  { day: 'Sun', mins: 0 },
  { day: 'Mon', mins: 45 },
  { day: 'Tue', mins: 120 },
  { day: 'Wed', mins: 30 },
  { day: 'Thu', mins: 0 },
  { day: 'Fri', mins: 90 },
  { day: 'Sat', mins: 180 },
]

const motivationalQuotes = [
  "The expert in anything was once a beginner.",
  "Code is like humor. When you have to explain it, it's bad.",
  "Every expert was once a beginner.",
  "Learning never exhausts the mind.",
  "The only way to do great work is to love what you do.",
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])

  const quote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length]

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: classes } = await supabase
        .from('classes')
        .select('*')
        .gte('date', todayStr)
        .order('date', { ascending: true })
        .limit(3)
      if (classes) setUpcomingClasses(classes)

      if (user?.id) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('course_id')
          .eq('student_id', user.id)
          .eq('status', 'Completed')
        if (transactions) {
          const courseIds = [...new Set(transactions.map(t => t.course_id))]
          const courses = mockCourses.filter(c => courseIds.includes(c.id))
          setEnrolledCourses(courses.length > 0 ? courses : [mockCourses[0]])
        } else {
          setEnrolledCourses([mockCourses[0]])
        }
      } else {
        setEnrolledCourses([mockCourses[0]])
      }
    }
    fetchData()

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'classes'
      }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const student = {
    name: user?.name || 'Student',
    email: user?.email || '',
    id: user?.id || '',
    progress: 0,
    attendance: 0,
    points: 0,
    streak: 1,
    studyHours: 35,
    activeDays: 7,
    assignmentsDone: 12,
    totalAssignments: 15,
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayClass = upcomingClasses.find(c => c.date === todayStr)

  const profileCompletion = [
    { label: 'Name', done: !!user?.name },
    { label: 'Email', done: !!user?.email },
    { label: 'Phone', done: false },
    { label: 'Profile Photo', done: false },
    { label: 'Course Enrolled', done: enrolledCourses.length > 0 },
  ]
  const profilePct = Math.round(
    (profileCompletion.filter(p => p.done).length / profileCompletion.length) * 100
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Today's Class Alert */}
      {todayClass && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-2 shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800">🎓 You have a class today!</p>
              <p className="text-sm text-green-700">
                <strong>{todayClass.title}</strong> at {todayClass.time} • {todayClass.platform}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open(todayClass.meeting_link, '_blank')}
            className="shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="h-4 w-4" /> Join Now
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5 italic">&ldquo;{quote}&rdquo;</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 md:ml-auto">
            <div className="text-center px-4 py-2 rounded-xl bg-orange-50 border border-orange-100">
              <div className="flex items-center gap-1 justify-center text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="font-bold text-lg">{student.streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-1 justify-center text-blue-500">
                <Clock className="h-4 w-4" />
                <span className="font-bold text-lg">{student.studyHours}h</span>
              </div>
              <p className="text-xs text-muted-foreground">Study Time</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-1 justify-center text-green-500">
                <CalendarDays className="h-4 w-4" />
                <span className="font-bold text-lg">{student.activeDays}</span>
              </div>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-purple-50 border border-purple-100">
              <div className="flex items-center gap-1 justify-center text-purple-500">
                <Star className="h-4 w-4" />
                <span className="font-bold text-lg">{student.points}</span>
              </div>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Attendance', value: `${student.attendance}%`, icon: <CalendarDays className="h-5 w-5" />, color: 'text-blue-500 bg-blue-50' },
          { label: 'Assignments', value: `${student.assignmentsDone}/${student.totalAssignments}`, icon: <Target className="h-5 w-5" />, color: 'text-green-500 bg-green-50' },
          { label: 'Points Balance', value: student.points.toLocaleString(), icon: <Trophy className="h-5 w-5" />, color: 'text-yellow-500 bg-yellow-50' },
          { label: 'Course Progress', value: `${student.progress}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-500 bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* My Courses */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">My Courses</h2>
              <a href="/student/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-3">
              {enrolledCourses.slice(0, 3).map(course => (
                <div key={course.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${courseGradients[course.id] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-2xl shrink-0`}>
                    {courseIcons[course.id] || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.trainer} • {course.duration}</p>
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${student.progress}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{student.progress}%</p>
                    <a href="/student/courses" className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                      <Play className="h-3 w-3" /> Continue
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Time Chart */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-lg">Study Time</h2>
              <span className="text-xs text-muted-foreground">
                {Math.round(weeklyStudyData.reduce((a, b) => a + b.mins, 0) / 60)}h this week
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Daily study minutes this week</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyStudyData} barSize={28}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: any) => [`${value} mins`, 'Study Time']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="mins" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Classes */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Upcoming Classes</h2>
              <a href="/student/classes" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming classes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.map(cls => {
                  const isToday = cls.date === todayStr
                  return (
                    <div key={cls.id} className={`flex items-center justify-between p-3 rounded-xl ${isToday ? 'bg-green-50 border border-green-200' : 'bg-muted/40'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isToday ? 'bg-green-100' : 'bg-primary/10'}`}>
                          <Video className={`h-4 w-4 ${isToday ? 'text-green-600' : 'text-primary'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{cls.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cls.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} at {cls.time} • {cls.platform}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(cls.meeting_link, '_blank')}
                        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${isToday ? 'bg-green-600 text-white' : 'border hover:bg-muted'}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {isToday ? 'Join Now' : 'Join'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div className="space-y-6">

          {/* Complete Profile */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Complete Your Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg className="transform -rotate-90" width="64" height="64">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="none"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - profilePct / 100)}
                    strokeLinecap="round" className="text-orange-500 transition-all" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{profilePct}%</div>
              </div>
              <div className="space-y-1.5 flex-1">
                {profileCompletion.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-muted border'}`}>
                      {item.done && <span className="text-white text-[8px]">✓</span>}
                    </div>
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
              Complete Profile →
            </button>
          </div>

          {/* Explore Courses */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Explore Courses</h2>
              <a href="/student/courses" className="text-xs text-primary hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {mockCourses.slice(0, 3).map(course => (
                <div key={course.id} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${courseGradients[course.id]} flex items-center justify-center text-lg shrink-0`}>
                    {courseIcons[course.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <p className="text-xs text-primary font-semibold">₹{course.price.toLocaleString()}</p>
                  </div>
                  <a href="/student/courses" className="shrink-0 text-xs bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600">
                    View
                  </a>
                </div>
              ))}
            </div>
            <a href="/student/courses" className="mt-4 w-full flex items-center justify-center gap-2 border border-orange-500 text-orange-500 py-2 rounded-lg text-sm font-medium hover:bg-orange-50">
              <ShoppingCart className="h-4 w-4" /> Explore All Courses →
            </a>
          </div>

          {/* Progress Summary */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-4">Your Progress</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary/5 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{student.assignmentsDone}</p>
                <p className="text-xs text-muted-foreground mt-1">Assignments Done</p>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{upcomingClasses.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Upcoming Classes</p>
              </div>
              <div className="rounded-xl bg-yellow-50 p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{student.points}</p>
                <p className="text-xs text-muted-foreground mt-1">Points Earned</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{student.attendance}%</p>
                <p className="text-xs text-muted-foreground mt-1">Attendance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}