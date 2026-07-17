import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    // Debug — log what env vars are loaded
    console.log('SID:', process.env.TWILIO_ACCOUNT_SID)
    console.log('TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'exists' : 'MISSING')
    console.log('FROM:', process.env.TWILIO_WHATSAPP_FROM)

    const { to, message } = await request.json()

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+91${to.replace(/\D/g, '').slice(-10)}`,
      body: message,
    })

    return NextResponse.json({ success: true, messageSid: result.sid })

  } catch (error: any) {
    console.error('WhatsApp error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed' },
      { status: 500 }
    )
  }
}