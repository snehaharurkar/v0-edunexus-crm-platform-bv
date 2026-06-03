import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, title } = body

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    console.log('Bot token exists:', !!botToken)
    console.log('Chat ID exists:', !!chatId)

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram not configured. Check .env.local' },
        { status: 500 }
      )
    }

    const text = `📢 *${title}*\n\n${message}\n\n_Sent from EduNexus CRM_`

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    console.log('Sending to URL:', url)
    console.log('Chat ID:', chatId)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    })

    const data = await response.json()
    
    console.log('Telegram response:', data)

    if (!data.ok) {
      return NextResponse.json(
        { error: data.description || 'Telegram API error' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      messageId: data.result?.message_id
    })

  } catch (error) {
    console.error('Telegram route error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + String(error) },
      { status: 500 }
    )
  }
}