"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import { useAuth } from "@/contexts/auth-context"
import { mockStudents, mockCourses } from "@/lib/mock-data"
import BuyCourseButton from "@/components/shared/BuyCourseButton"
import {
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  Download,
  Play,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

const recordings = [
  { id: 1, title: "React Fundamentals - Introduction", duration: "1h 30m", date: "May 20, 2024" },
  { id: 2, title: "Component Lifecycle & Hooks", duration: "2h 15m", date: "May 22, 2024" },
  { id: 3, title: "State Management with Redux", duration: "1h 45m", date: "May 24, 2024" },
  { id: 4, title: "React Router & Navigation", duration: "1h 20m", date: "May 26, 2024" },
]

const notes = [
  { id: 1, title: "React Basics Cheatsheet", size: "2.5 MB", type: "PDF" },
  { id: 2, title: "Hooks Reference Guide", size: "1.8 MB", type: "PDF" },
  { id: 3, title: "Redux Flow Diagram", size: "500 KB", type: "PNG" },
  { id: 4, title: "Project Setup Guide", size: "1.2 MB", type: "PDF" },
]

const assignments = [
  { id: 1, title: "Build a Todo App", dueDate: "May 30, 2024", status: "submitted", grade: "A" },
  { id: 2, title: "Create a Weather Dashboard", dueDate: "June 5, 2024", status: "pending", grade: null },
  { id: 3, title: "E-commerce Cart System", dueDate: "June 10, 2024", status: "pending", grade: null },
]

export default function StudentCourses() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"recordings" | "notes" | "assignments">("recordings")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const student = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]
  const enrolledCourse = mockCourses.find((c) => c.name === student.course) || mockCourses[0]

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} roleLabel="Student">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNavItems} roleLabel="Student">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Courses</h1>

        {/* Enrolled Course Card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{enrolledCourse.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Duration: {enrolledCourse.duration} • Trainer: {enrolledCourse.trainer}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>{recordings.length} Recordings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{notes.length} Notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span>{assignments.length} Assignments</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <div className="flex items-center gap-3">
                <div className="h-3 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
                <span className="font-medium">{student.progress}%</span>
              </div>
              <BuyCourseButton
                courseId={enrolledCourse.id}
                courseName={enrolledCourse.name}
                price={enrolledCourse.price}
                studentId={student.id}
                studentEmail={user?.email}
                studentName={student.name}
                size="sm"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {(["recordings", "notes", "assignments"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "recordings" && <Video className="h-4 w-4" />}
              {tab === "notes" && <FileText className="h-4 w-4" />}
              {tab === "assignments" && <ClipboardList className="h-4 w-4" />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === "recordings" &&
            recordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{recording.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recording.duration}
                      </span>
                      <span>{recording.date}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch
                </Button>
              </div>
            ))}

          {activeTab === "notes" &&
            notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-orange-500/10 p-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {note.type} • {note.size}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}

          {activeTab === "assignments" &&
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-lg p-2 ${
                      assignment.status === "submitted"
                        ? "bg-green-500/10"
                        : "bg-yellow-500/10"
                    }`}
                  >
                    <ClipboardList
                      className={`h-5 w-5 ${
                        assignment.status === "submitted"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Due: {assignment.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {assignment.grade && (
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                      Grade: {assignment.grade}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      assignment.status === "submitted"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    {assignment.status === "submitted" ? "Submitted" : "Pending"}
                  </span>
                  {assignment.status === "pending" && (
                    <Button size="sm">Submit</Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
