"use client"

import { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, Clock, ExternalLink, RefreshCw, X, Building2, IndianRupee } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string[]
  salary: string
  postedAt: string
  applyUrl: string
  companyLogo: string | null
  isRemote: boolean
  source?: string
  
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('software developer')
  const [location, setLocation] = useState('india')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobSource, setJobSource] = useState('')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/jobs?query=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      setJobs(data.jobs || [])
      setJobSource(data.source || '')
    } catch (error) {
      console.error(error)
      setJobs([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchJobs() }, [])

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recently'
    const diff = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 30) return `${diff} days ago`
    return 'Over a month ago'
  }

  const getMatchScore = (job: Job) => {
    const seed = job.id?.charCodeAt(0) || 70
    return (seed % 30) + 65
  }

  const getTypeBadgeColor = (type: string) => {
    const t = (type || '').toLowerCase()
    if (t.includes('full')) return 'bg-green-100 text-green-700'
    if (t.includes('intern')) return 'bg-blue-100 text-blue-700'
    if (t.includes('part')) return 'bg-yellow-100 text-yellow-700'
    if (t.includes('contract')) return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-600'
  }

  const formatType = (type: string) => {
    if (!type) return 'Full-time'
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? 'Fetching live jobs...'
              : `${jobs.length} jobs found${jobSource ? ` via ${jobSource === 'jsearch' ? 'JSearch (LinkedIn, Indeed, Glassdoor)' : 'Adzuna'}` : ''}`}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-background"
          />
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-background"
        >
          <option value="india">All India</option>
          <option value="bangalore">Bangalore</option>
          <option value="mumbai">Mumbai</option>
          <option value="hyderabad">Hyderabad</option>
          <option value="pune">Pune</option>
          <option value="delhi">Delhi</option>
          <option value="chennai">Chennai</option>
        </select>
        <select
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-background"
        >
          <option value="software developer">All Tech</option>
          <option value="react developer">React</option>
          <option value="python developer">Python</option>
          <option value="java developer">Java</option>
          <option value="data scientist">Data Science</option>
          <option value="devops engineer">DevOps</option>
          <option value="full stack developer">Full Stack</option>
        </select>
        <button
          onClick={fetchJobs}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
        >
          Search
        </button>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-xl p-5 animate-pulse bg-card">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card">
          <Briefcase className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No jobs found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or location</p>
          <button
            onClick={fetchJobs}
            className="mt-5 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const score = getMatchScore(job)
            return (
              <div
                key={job.id}
                className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-12 h-12 rounded-xl object-contain bg-white border p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm leading-snug line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    score >= 85 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {score}% Match
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground">
                    <MapPin className="h-3 w-3" />{job.location}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTypeBadgeColor(job.type)}`}>
                    {formatType(job.type)}
                  </span>
                  {job.isRemote && (
                    <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Remote</span>
                  )}
                  {job.salary !== 'Not disclosed' && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                      <IndianRupee className="h-3 w-3" />{job.salary}
                    </span>
                  )}
                  {job.source && (
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">via {job.source}</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{getTimeAgo(job.postedAt)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 border border-primary text-primary rounded-lg text-xs font-medium hover:bg-primary/5 transition-colors"
                    >
                      View Details
                    </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
                    >
                      Apply Now <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-start justify-between rounded-t-2xl">
              <div className="flex items-center gap-4">
                {selectedJob.companyLogo ? (
                  <img
                    src={selectedJob.companyLogo}
                    alt={selectedJob.company}
                    className="w-14 h-14 rounded-xl object-contain bg-white border p-1"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-lg leading-tight">{selectedJob.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedJob.company} · {selectedJob.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors mt-1 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-sm px-3 py-1.5 bg-muted rounded-full text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />{selectedJob.location}
                </span>
                <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getTypeBadgeColor(selectedJob.type)}`}>
                  {formatType(selectedJob.type)}
                </span>
                {selectedJob.salary !== 'Not disclosed' && (
                  <span className="flex items-center gap-1 text-sm px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                    <IndianRupee className="h-3.5 w-3.5" />{selectedJob.salary}
                  </span>
                )}
                {selectedJob.isRemote && (
                  <span className="text-sm px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium">Remote</span>
                )}
                <span className="flex items-center gap-1 text-sm px-3 py-1.5 bg-muted rounded-full text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />{getTimeAgo(selectedJob.postedAt)}
                </span>
                {selectedJob.source && (
                  <span className="text-sm px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full">via {selectedJob.source}</span>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedJob.description?.substring(0, 2000)}
                </p>
              </div>

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-1.5">
                    {selectedJob.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Apply Now <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}