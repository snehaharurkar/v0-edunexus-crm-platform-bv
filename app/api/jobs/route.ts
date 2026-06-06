import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || 'software developer'
  const location = searchParams.get('location') || 'india'

  // Try JSearch first
  try {
    const jsearchKey = process.env.JSEARCH_API_KEY
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + ' in ' + location)}&page=1&num_pages=2&country=in&language=en`,
      {
        headers: {
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
          'x-rapidapi-key': jsearchKey || '',
        },
        cache: 'no-store'
      }
    )

    const data = await response.json()

    if (data.data && data.data.length > 0) {
      const jobs = data.data.map((job: any) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name || 'Company',
        location: job.job_city
          ? `${job.job_city}, ${job.job_country}`
          : job.job_country || location,
        type: job.job_employment_type || 'Full-time',
        description: job.job_description?.substring(0, 500) || '',
        requirements: job.job_highlights?.Qualifications?.slice(0, 4) || [],
        salary: job.job_min_salary
          ? `₹${Math.round(job.job_min_salary).toLocaleString()} - ₹${Math.round(job.job_max_salary).toLocaleString()}`
          : 'Not disclosed',
        postedAt: job.job_posted_at_datetime_utc || '',
        applyUrl: (() => {
          const raw = job.job_apply_link || ''
          console.log('RAW apply link:', raw.substring(0, 100))
          if (!raw) return `https://www.google.com/search?q=${encodeURIComponent(job.job_title + ' ' + job.employer_name)}`
          if (raw.startsWith('http')) return raw
          // Extract URL from: href=https://...target=
          const match = raw.match(/href=["']?(https?:\/\/[^\s"']+?)(?:target|rel|class|["'\s])/i)
          if (match) return match[1]
          // Fallback: grab first http URL in the string
          const urlMatch = raw.match(/https?:\/\/[^\s"']+/)
          if (urlMatch) return urlMatch[0]
          return `https://www.google.com/search?q=${encodeURIComponent(job.job_title + ' ' + job.employer_name)}`
        })(),
        companyLogo: job.employer_logo || null,
        isRemote: job.job_is_remote || false,
        source: job.job_publisher || 'JSearch',
      }))

      return NextResponse.json({
        jobs,
        total: jobs.length,
        source: 'jsearch',
        lastUpdated: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('JSearch failed, falling back to Adzuna:', error)
  }

  // Fallback to Adzuna
  try {
    const appId = process.env.ADZUNA_APP_ID
    const apiKey = process.env.ADZUNA_API_KEY

    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&content-type=application/json`,
      { cache: 'no-store' }
    )

    const data = await response.json()

    const jobs = data.results?.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Company',
      location: job.location?.display_name || location,
      type: job.contract_time || 'Full-time',
      description: job.description || '',
      requirements: job.category?.label ? [job.category.label] : [],
      salary: job.salary_min
        ? `₹${Math.round(job.salary_min).toLocaleString()} - ₹${Math.round(job.salary_max).toLocaleString()}`
        : 'Not disclosed',
      postedAt: job.created,
      applyUrl: job.redirect_url,
      companyLogo: null,
      isRemote: job.title?.toLowerCase().includes('remote') || false,
      source: 'Adzuna',
    })) || []

    return NextResponse.json({
      jobs,
      total: data.count || 0,
      source: 'adzuna',
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Adzuna also failed:', error)
    return NextResponse.json({
      jobs: [],
      error: 'Failed to fetch jobs from all sources'
    })
  }
}