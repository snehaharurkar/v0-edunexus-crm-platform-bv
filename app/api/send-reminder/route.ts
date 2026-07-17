import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { classData, trainerName } = await request.json()

    // Fetch all students in this batch
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('batch', classData.batch)
      .eq('status', 'Active')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    const results = { whatsapp: 0, failed: 0, total: students?.length || 0 }

    // Send WhatsApp to each student
    if (students && students.length > 0) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      )

      for (const student of students) {
        if (student.phone) {
          try {
            await client.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: `whatsapp:+91${student.phone.replace(/\D/g, '').slice(-10)}`,
              body: `📚 *Class Reminder!*\n\nHi ${student.name},\n\nYour class *${classData.title}* is scheduled!\n\n📅 Date: ${classData.date}\n⏰ Time: ${classData.time}\n📱 Platform: ${classData.platform}\n🔗 Join: ${classData.meeting_link}\n\nTrainer: ${trainerName}\n\n_EduNexus CRM_`,
            })
            results.whatsapp++
          } catch (e) {
            results.failed++
          }
        }
      }
    }

    // Save notification to DB so admin can see it
    await supabase.from('notifications').insert([{
      type: 'class',
      title: `Class Reminder: ${classData.title}`,
      message: `Reminder sent for ${classData.title} (${classData.batch}) on ${classData.date} at ${classData.time}`,
      sent_by: trainerName,
      sent_to: classData.batch,
      class_id: classData.id,
      batch: classData.batch,
      status: 'sent',
    }])

    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${results.whatsapp} students`,
      results,
    })

  } catch (error: any) {
    console.error('Send reminder error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}