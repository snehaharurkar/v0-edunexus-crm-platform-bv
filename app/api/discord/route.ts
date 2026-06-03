import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { title, message, type } = await request.json()

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Discord webhook not configured' },
        { status: 500 }
      )
    }

    const getColor = (type: string) => {
      switch(type) {
        case 'class': return 0x6366f1
        case 'assignment': return 0x10b981
        case 'urgent': return 0xf43f5e
        case 'announcement': return 0xf59e0b
        default: return 0x6366f1
      }
    }

    const getEmoji = (type: string) => {
      switch(type) {
        case 'class': return '📚'
        case 'assignment': return '📝'
        case 'urgent': return '🚨'
        case 'announcement': return '📢'
        default: return '📢'
      }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'EduNexus CRM',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/2721/2721287.png',
        embeds: [{
          title: `${getEmoji(type)} ${title}`,
          description: message,
          color: getColor(type),
          footer: {
            text: 'EduNexus CRM • ' + new Date().toLocaleString()
          },
          thumbnail: {
            url: 'https://cdn-icons-png.flaticon.com/512/2721/2721287.png'
          }
        }]
      })
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Discord error: ' + error },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Discord error:', error)
    return NextResponse.json(
      { error: 'Failed to send Discord message' },
      { status: 500 }
    )
  }
}