"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/shared/stat-card"
import { useAuth } from "@/contexts/auth-context"
import { mockStudents, mockJobs } from "@/lib/mock-data"
import {
  CalendarDays,
  CheckCircle,
  Coins,
  Briefcase,
  Play,
  Clock,
  MapPin,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{progress}%</span>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const student = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]
  const recentJobs = mockJobs.slice(0, 3)

  const upcomingClass = {
    title: "Advanced React Patterns",
    trainer: "John Smith",
    time: "Today, 3:00 PM",
    duration: "2 hours",
  }

  if (isLoading) {
    return (
      <>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {student.name}!</h1>
              <p className="mt-1 text-primary-foreground/80">
                Keep up the great work! You&apos;re making excellent progress.
              </p>
              <p className="mt-2 text-sm text-primary-foreground/70">
                Course: {student.course}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing progress={student.progress} />
              <span className="mt-2 text-sm font-medium">Course Progress</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Attendance"
            value={`${student.attendance}%`}
            icon={<CalendarDays className="h-6 w-6" />}
          />
          <StatCard
            title="Assignments Done"
            value="12/15"
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <StatCard
            title="Points Balance"
            value={student.points.toLocaleString()}
            icon={<Coins className="h-6 w-6" />}
          />
          <StatCard
            title="Jobs Matched"
            value="8"
            icon={<Briefcase className="h-6 w-6" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Class */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Upcoming Class</h2>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">{upcomingClass.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{upcomingClass.time}</span>
                    <span>•</span>
                    <span>{upcomingClass.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trainer: {upcomingClass.trainer}
                  </p>
                </div>
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Join Class
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Job Alerts */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Job Alerts</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                      {job.matchPercent}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
