"use client"

import { useState, useEffect, useRef } from "react"
import { Award, Download, Linkedin, QrCode, Calendar, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface Certificate {
  id: number
  title: string
  issueDate: string
  credentialId: string
  status: "issued" | "in_progress"
  skills: string[]
}

const certificates: Certificate[] = [
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

// Renders a certificate card's content into an off-screen canvas and downloads it as PNG,
// then triggers the browser print dialog to save as PDF.
function CertificateDownloadCard({ cert }: { cert: Certificate }) {
  return (
    <div
      id={`cert-preview-${cert.id}`}
      style={{
        width: 800,
        padding: 48,
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        color: "#fff",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ textAlign: "center", borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 14, letterSpacing: 4, textTransform: "uppercase", opacity: 0.8 }}>
          EduNexus Academy
        </p>
        <h1 style={{ fontSize: 32, fontWeight: "bold", margin: "12px 0" }}>Certificate of Completion</h1>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 16, opacity: 0.8 }}>This is to certify that the student has successfully completed</p>
        <h2 style={{ fontSize: 28, fontWeight: "bold", margin: "12px 0" }}>{cert.title}</h2>
        <p style={{ fontSize: 14, opacity: 0.7 }}>Issued on {cert.issueDate}</p>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Credential ID: {cert.credentialId}</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, opacity: 0.8 }}>Skills: {cert.skills.join(", ")}</p>
      </div>
    </div>
  )
}

export default function StudentCertificates() {
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // ── Download Certificate as PDF ─────────────────────────────────────────────
  const handleDownload = async (cert: Certificate) => {
    setDownloadingId(cert.id)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      // Create a temporary off-screen container
      const container = document.createElement("div")
      container.style.position = "fixed"
      container.style.top = "-9999px"
      container.style.left = "-9999px"
      container.style.zIndex = "-1"
      document.body.appendChild(container)

      // Render certificate HTML into it
      const { createRoot } = await import("react-dom/client")
      const root = createRoot(container)
      root.render(<CertificateDownloadCard cert={cert} />)

      // Wait a tick for render
      await new Promise((r) => setTimeout(r, 300))

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH)
      pdf.save(`${cert.title.replace(/\s+/g, "_")}_Certificate.pdf`)

      root.unmount()
      document.body.removeChild(container)
      toast.success("Certificate downloaded!")
    } catch (err) {
      console.error(err)
      toast.error("Download failed. Please try again.")
    } finally {
      setDownloadingId(null)
    }
  }

  // ── Share to LinkedIn ───────────────────────────────────────────────────────
  const handleLinkedInShare = (cert: Certificate) => {
    // LinkedIn "Add to Profile" deep link
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: cert.title,
      organizationId: "edunexus", // replace with your actual LinkedIn org ID if you have one
      issueYear: new Date(cert.issueDate).getFullYear().toString() || "2024",
      issueMonth: (new Date(cert.issueDate).getMonth() + 1).toString() || "1",
      certId: cert.credentialId,
      certUrl: `https://edunexus.in/verify/${cert.credentialId}`, // update to your real verify URL
    })
    const linkedInUrl = `https://www.linkedin.com/profile/add?${params.toString()}`
    window.open(linkedInUrl, "_blank", "noopener,noreferrer")
    toast.success("Opening LinkedIn to add certificate to your profile!")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    )
  }

  return (
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
            {/* Certificate Visual Preview */}
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
              <div className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-lg border bg-white">
                <QrCode className="h-10 w-10 text-gray-400" />
              </div>
            </div>

            {/* Details */}
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
                  <span key={skill} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {skill}
                  </span>
                ))}
              </div>

              {cert.status === "issued" && (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleDownload(cert)}
                    disabled={downloadingId === cert.id}
                  >
                    {downloadingId === cert.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    {downloadingId === cert.id ? "..." : "Download"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleLinkedInShare(cert)}
                  >
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
  )
}