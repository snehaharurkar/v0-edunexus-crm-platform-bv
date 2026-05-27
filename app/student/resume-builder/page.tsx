"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { studentNavItems } from "@/lib/nav-items"
import {
  User,
  Code,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Download,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface ResumeData {
  personal: {
    fullName: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
    summary: string
  }
  skills: string[]
  experience: Array<{
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    location: string
    graduationDate: string
    gpa: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string
    link: string
  }>
}

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Skills", icon: Code },
  { id: 3, title: "Experience", icon: Briefcase },
  { id: 4, title: "Education", icon: GraduationCap },
  { id: 5, title: "Projects", icon: FolderOpen },
]

const initialResumeData: ResumeData = {
  personal: {
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "+91 9876543210",
    location: "Bangalore, India",
    website: "johndoe.dev",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    summary:
      "Passionate Full Stack Developer with 2+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies.",
  },
  skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "MongoDB", "PostgreSQL", "Docker"],
  experience: [
    {
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Bangalore",
      startDate: "Jan 2023",
      endDate: "Present",
      description:
        "Developed responsive web applications using React and TypeScript. Improved page load time by 40%.",
    },
  ],
  education: [
    {
      degree: "B.Tech Computer Science",
      institution: "ABC University",
      location: "Bangalore",
      graduationDate: "2022",
      gpa: "8.5",
    },
  ],
  projects: [
    {
      name: "E-Commerce Platform",
      description: "Built a full-stack e-commerce platform with payment integration",
      technologies: "React, Node.js, MongoDB, Stripe",
      link: "github.com/johndoe/ecommerce",
    },
  ],
}

export default function ResumeBuilder() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData)
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const updatePersonal = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }))
  }

  const addSkill = () => {
    if (newSkill && !resumeData.skills.includes(newSkill)) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} roleLabel="Student">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNavItems} roleLabel="Student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{steps[currentStep - 1].title}</h2>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Full Name</label>
                    <Input
                      value={resumeData.personal.fullName}
                      onChange={(e) => updatePersonal("fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={resumeData.personal.email}
                      onChange={(e) => updatePersonal("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Phone</label>
                    <Input
                      value={resumeData.personal.phone}
                      onChange={(e) => updatePersonal("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Location</label>
                    <Input
                      value={resumeData.personal.location}
                      onChange={(e) => updatePersonal("location", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Website</label>
                    <Input
                      value={resumeData.personal.website}
                      onChange={(e) => updatePersonal("website", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">LinkedIn</label>
                    <Input
                      value={resumeData.personal.linkedin}
                      onChange={(e) => updatePersonal("linkedin", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">GitHub</label>
                    <Input
                      value={resumeData.personal.github}
                      onChange={(e) => updatePersonal("github", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Professional Summary</label>
                  <textarea
                    value={resumeData.personal.summary}
                    onChange={(e) => updatePersonal("summary", e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Job Title" value={exp.title} readOnly />
                      <Input placeholder="Company" value={exp.company} readOnly />
                      <Input placeholder="Location" value={exp.location} readOnly />
                      <div className="flex gap-2">
                        <Input placeholder="Start" value={exp.startDate} readOnly />
                        <Input placeholder="End" value={exp.endDate} readOnly />
                      </div>
                    </div>
                    <textarea
                      placeholder="Description"
                      value={exp.description}
                      className="mt-4 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      rows={3}
                      readOnly
                    />
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  + Add Experience
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Degree" value={edu.degree} readOnly />
                      <Input placeholder="Institution" value={edu.institution} readOnly />
                      <Input placeholder="Location" value={edu.location} readOnly />
                      <Input placeholder="Graduation Date" value={edu.graduationDate} readOnly />
                      <Input placeholder="GPA" value={edu.gpa} readOnly />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  + Add Education
                </Button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Project Name" value={project.name} readOnly />
                      <Input placeholder="Link" value={project.link} readOnly />
                    </div>
                    <Input
                      placeholder="Technologies"
                      value={project.technologies}
                      className="mt-4"
                      readOnly
                    />
                    <textarea
                      placeholder="Description"
                      value={project.description}
                      className="mt-4 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      rows={2}
                      readOnly
                    />
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  + Add Project
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                disabled={currentStep === 5}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl border bg-white p-8 text-black">
            <div className="border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {resumeData.personal.fullName}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {resumeData.personal.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {resumeData.personal.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {resumeData.personal.location}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {resumeData.personal.website}
                </span>
                <span className="flex items-center gap-1">
                  <Linkedin className="h-3 w-3" />
                  {resumeData.personal.linkedin}
                </span>
                <span className="flex items-center gap-1">
                  <Github className="h-3 w-3" />
                  {resumeData.personal.github}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-bold uppercase text-gray-900">Summary</h2>
              <p className="mt-1 text-sm text-gray-700">{resumeData.personal.summary}</p>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-bold uppercase text-gray-900">Skills</h2>
              <div className="mt-1 flex flex-wrap gap-1">
                {resumeData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-bold uppercase text-gray-900">Experience</h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">{exp.title}</span>
                    <span className="text-xs text-gray-600">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {exp.company}, {exp.location}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{exp.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-bold uppercase text-gray-900">Education</h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">{edu.degree}</span>
                    <span className="text-xs text-gray-600">{edu.graduationDate}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {edu.institution}, {edu.location} • GPA: {edu.gpa}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-bold uppercase text-gray-900">Projects</h2>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mt-2">
                  <span className="text-sm font-semibold text-gray-900">{project.name}</span>
                  <p className="text-xs text-gray-600">{project.technologies}</p>
                  <p className="mt-1 text-xs text-gray-600">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
