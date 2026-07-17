export async function sendWhatsApp(to: string, message: string) {
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      })
      const data = await res.json()
      return data
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return { error: 'Failed to send' }
    }
  }
  
  // Message templates
  export const messages = {
    paymentConfirmed: (studentName: string, course: string, amount: number) =>
      `✅ *Payment Confirmed!*\n\nHi ${studentName},\n\nYour payment of ₹${amount.toLocaleString()} for *${course}* has been received successfully.\n\nWelcome to EduNexus! 🎓\n\nFor any queries, contact us at support@edunexus.com`,
  
    newEnrollment: (studentName: string, course: string, amount: number) =>
      `🎉 *New Enrollment Alert!*\n\nStudent: *${studentName}*\nCourse: *${course}*\nAmount: ₹${amount.toLocaleString()}\n\nLogin to admin dashboard to view details.`,
  
    classReminder: (trainerName: string, className: string, time: string, meetLink: string) =>
      `📚 *Class Reminder!*\n\nHi ${trainerName},\n\nYour class *${className}* starts at *${time}*.\n\n🔗 Meeting Link: ${meetLink}\n\nBe ready 5 minutes early! ✨`,
  
    studentClassReminder: (studentName: string, className: string, time: string, meetLink: string) =>
      `📚 *Class Starting Soon!*\n\nHi ${studentName},\n\nYour class *${className}* starts at *${time}*.\n\n🔗 Join here: ${meetLink}\n\nDon't be late! 🚀`,
  }