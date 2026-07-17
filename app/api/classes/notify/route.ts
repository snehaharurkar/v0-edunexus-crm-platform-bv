import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { classId, type } = await request.json()
    // type: 'new_class' | 'demo_class' | 'reminder'

    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    const results = []

    // Always notify students
    const { data: students } = await supabase
      .from('users')
      .select('name, email')
      .eq('role', 'student')
      .eq('status', 'active')

    // For demo class also notify leads
    let leads: any[] = []
    if (type === 'demo_class') {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('name, email')
        .not('email', 'is', null)
        .neq('email', '')
        .neq('status', 'Converted')
        .neq('status', 'Lost')
      leads = leadsData || []
    }

    const recipients = [
      ...(students || []).map(s => ({ ...s, type: 'student' })),
      ...leads.map(l => ({ ...l, type: 'lead' }))
    ]

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recipients found',
        sent: 0
      })
    }

    const getSubject = () => {
      if (type === 'demo_class') return `🎓 Free Demo Class: ${classData.title}`
      if (type === 'reminder') return `⏰ Class Starting in 15 mins: ${classData.title}`
      return `📅 New Class Scheduled: ${classData.title}`
    }

    const getMessage = (name: string, recipientType: string) => {
      if (type === 'demo_class') {
        return `Hi ${name},

We're excited to invite you to a FREE Demo Class!

🎓 Course: ${classData.title}
📅 Date: ${new Date(classData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Time: ${classData.time}
💻 Platform: ${classData.platform}
🔗 Join Link: ${classData.meeting_link}

${classData.description ? `📝 About: ${classData.description}` : ''}

This is a FREE session — no registration required!
Just click the link above at the scheduled time.

See you there! 🚀

Best regards,
EduNexus Team`
      }

      if (type === 'reminder') {
        return `Hi ${name},

⏰ Your class starts in 15 minutes!

🎓 Class: ${classData.title}
📅 Date: ${new Date(classData.date).toLocaleDateString()}
⏰ Time: ${classData.time}
💻 Platform: ${classData.platform}
🔗 Join Now: ${classData.meeting_link}

Please join on time. See you in 15 minutes!

EduNexus Team`
      }

      return `Hi ${name},

A new class has been scheduled for you!

🎓 Class: ${classData.title}
📅 Date: ${new Date(classData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Time: ${classData.time}
💻 Platform: ${classData.platform}
🔗 Join Link: ${classData.meeting_link}
👥 Batch: ${classData.batch}

${classData.description ? `📝 About: ${classData.description}` : ''}

Mark your calendar! See you there.

Best regards,
EduNexus Team`
    }

    // Send emails using EmailJS REST API
    const emailPromises = recipients.map(async (recipient) => {
      try {
        const response = await fetch(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
              template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
              user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
              template_params: {
                to_email: recipient.email,
                to_name: recipient.name,
                subject: getSubject(),
                message: getMessage(recipient.name, recipient.type),
                from_name: 'EduNexus CRM',
                reply_to: 'noreply@edunexus.com',
              }
            })
          }
        )
        return { success: true, email: recipient.email }
      } catch (err) {
        return { success: false, email: recipient.email, error: err }
      }
    })

    const emailResults = await Promise.allSettled(emailPromises)
    const succeeded = emailResults.filter(r => r.status === 'fulfilled').length
    const failed = emailResults.filter(r => r.status === 'rejected').length

    // Log notification in supabase
    try {
        await supabase.from('notifications').insert([{
          type: 'class_notification',
          message: `${type === 'demo_class' ? 'Demo class' : 'New class'} notification sent for "${classData.title}" to ${succeeded} recipients`,
          class_id: classId,
          sent_count: succeeded,
          failed_count: failed,
          created_at: new Date().toISOString()
        }])
      } catch (_) {}

    return NextResponse.json({
      success: true,
      sent: succeeded,
      failed,
      total: recipients.length,
      students: students?.length || 0,
      leads: leads.length,
      type
    })

  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications: ' + String(error) },
      { status: 500 }
    )
  }
}