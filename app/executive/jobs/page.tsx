"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { executiveNavItems } from "@/lib/nav-items"
import { Modal } from "@/components/shared/modal"
import { mockJobs } from "@/lib/mock-data"
import {
  Briefcase,
  Plus,
  Search,
  Building,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Zap,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function JobsPlacementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState(mockJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddJobOpen, setIsAddJobOpen] = useState(false)
  const [autoMatch, setAutoMatch] = useState(true)
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experience: "",
    salary: "",
    skills: "",
    description: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleAddJob = () => {
    const job = {
      id: jobs.length + 1,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      experience: newJob.experience,
      salary: newJob.salary,
      skills: newJob.skills.split(",").map((s) => s.trim()),
      matchPercent: 0,
      postedDate: "Just now",
      applicants: 0,
      status: "active" as const,
    }
    setJobs([job, ...jobs])
    setIsAddJobOpen(false)
    setNewJob({
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      experience: "",
      salary: "",
      skills: "",
      description: "",
    })
  }

  const handleDeleteJob = (id: number) => {
    setJobs(jobs.filter((j) => j.id !== id))
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <DashboardLayout navItems={executiveNavItems} roleLabel="Executive">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={executiveNavItems} roleLabel="Executive">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jobs & Placement</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-Match</span>
              <button
                onClick={() => setAutoMatch(!autoMatch)}
                className="text-primary"
              >
                {autoMatch ? (
                  <ToggleRight className="h-8 w-8" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button onClick={() => setIsAddJobOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </div>
        </div>

        {autoMatch && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">AI Auto-Match is Active</p>
              <p className="text-sm text-muted-foreground">
                Jobs are automatically matched with students based on skills and preferences
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Jobs Table */}
        <div className="rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Job Title</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Applicants</th>
                  <th className="p-4 font-medium">Posted</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.experience} • {job.salary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {job.company}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {job.location}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {job.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {job.applicants || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {job.postedDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          job.status === "active"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {job.status || "active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add new job listings to get started
            </p>
          </div>
        )}

        {/* Add Job Modal */}
        <Modal
          open={isAddJobOpen}
          onClose={() => setIsAddJobOpen(false)}
          title="Add New Job"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Job Title</label>
                <Input
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Company</label>
                <Input
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="e.g., Google"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <Input
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="e.g., Bangalore"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Job Type</label>
                <select
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Experience</label>
                <Input
                  value={newJob.experience}
                  onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                  placeholder="e.g., 2-4 years"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Salary Range</label>
                <Input
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  placeholder="e.g., 8-12 LPA"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Required Skills (comma separated)
              </label>
              <Input
                value={newJob.skills}
                onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Job Description</label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Enter job description..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddJobOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddJob}
                disabled={!newJob.title || !newJob.company}
              >
                Add Job
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
