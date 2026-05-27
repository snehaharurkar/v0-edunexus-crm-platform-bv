"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { Award, Download, Linkedin, QrCode, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

const certificates = [
  {
    id: 1,
    title: "Full Stack Web Development",
    issueDate: "May 15, 2024",
    credentialId: "CERT-FS-2024-001",
    status: "issued",
    skills: ["React", "Node.js", "MongoDB"],
  },
  {
    id: 2,
    title: "React Advanced Patterns",
    issueDate: "April 20, 2024",
    credentialId: "CERT-RA-2024-042",
    status: "issued",
    skills: ["React", "TypeScript", "Testing"],
  },
  {
    id: 3,
    title: "AWS Cloud Practitioner",
    issueDate: "March 10, 2024",
    credentialId: "CERT-AWS-2024-156",
    status: "issued",
    skills: ["AWS", "Cloud Computing", "DevOps"],
  },
  {
    id: 4,
    title: "Data Structures & Algorithms",
    issueDate: "In Progress",
    credentialId: "—",
    status: "in_progress",
    skills: ["DSA", "Problem Solving"],
  },
]

export default function StudentCertificates() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72" />
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
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <span className="text-sm text-muted-foreground">
            {certificates.filter((c) => c.status === "issued").length} certificates earned
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className={`rounded-xl border bg-card transition-shadow hover:shadow-md ${
                cert.status === "in_progress" ? "opacity-75" : ""
              }`}
            >
              {/* Certificate Preview */}
              <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Award className="h-32 w-32" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      Certificate of Completion
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{cert.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">EduNexus Academy</p>
                </div>

                {/* QR Code Placeholder */}
                <div className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-lg border bg-white">
                  <QrCode className="h-10 w-10 text-gray-400" />
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{cert.issueDate}</span>
                  </div>
                  {cert.status === "issued" ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600">
                      In Progress
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Credential ID: {cert.credentialId}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {cert.status === "issued" && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Linkedin className="h-3 w-3" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
