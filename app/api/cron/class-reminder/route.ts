import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    const in15Min = new Date(now.getTime() + 15 * 60 * 1000)

    const targetDate = in15Min.toISOString().split('T')[0]
    const targetHour = in15Min.getHours().toString().padStart(2, '0')
    const targetMinute = in15Min.getMinutes().toString().padStart(2, '0')
    const targetTime = `${targetHour}:${targetMinute}`

    // Find classes starting in 15 minutes
    const { data: upcomingClasses } = await supabase
      .from('classes')
      .select('*')
      .eq('date', targetDate)
      .eq('time', targetTime)
      .eq('auto_reminder', true)

    if (!upcomingClasses || upcomingClasses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No classes in 15 minutes',
        checked_time: targetTime
      })
    }

    const results = []

    for (const cls of upcomingClasses) {
      const { data: students } = await supabase
        .from('users')
        .select('name, email')
        .eq('role', 'student')
        .eq('status', 'active')

      if (!students || students.length === 0) continue

      const emailPromises = students.map(async (student: any) => {
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
            template_params: {
              to_email: student.email,
              to_name: student.name,
              subject: `⏰ Class Starting in 15 mins: ${cls.title}`,
              message: `Hi ${student.name},

Your class starts in 15 minutes!

🎓 Class: ${cls.title}
⏰ Time: ${cls.time}
💻 Platform: ${cls.platform}
🔗 Join Now: ${cls.meeting_link}
👥 Batch: ${cls.batch}

Please join on time!

EduNexus Team`,
              from_name: 'EduNexus CRM',
              reply_to: 'noreply@edunexus.com'
            }
          })
        })
      })

      const sent = await Promise.allSettled(emailPromises)
      const succeeded = sent.filter(r => r.status === 'fulfilled').length

      results.push({
        class: cls.title,
        time: cls.time,
        sent: succeeded,
        total: students.length
      })
    }

    return NextResponse.json({
      success: true,
      processed: upcomingClasses.length,
      results
    })

  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}