import type { Lead } from '@/lib/mock-data';

export function getDaysInactive(lastContact: string): number {
  const today = new Date();
  const last = new Date(lastContact);
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatPhoneForTel(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}

export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildEmailSubject(lead: Pick<Lead, 'courseInterest'>): string {
  return `Following up on your interest in ${lead.courseInterest}`;
}

export function buildEmailBody(
  lead: Pick<Lead, 'name' | 'courseInterest'>,
  customBody?: string
): string {
  if (customBody) return customBody;
  return `Dear ${lead.name},

Thank you for your interest in the ${lead.courseInterest} program at EduNexus.

I wanted to follow up and see if you have any questions about the curriculum, batch schedules, or placement support we offer.

Please feel free to reply to this email or call me at your convenience.

Best regards,
Rahul Sharma
Business Development Executive
EduNexus`;
}

export function buildWhatsAppMessage(
  lead: Pick<Lead, 'name' | 'courseInterest'>
): string {
  return `Hi ${lead.name}, following up on your interest in ${lead.courseInterest} at EduNexus. I'd love to help you with the next steps — batch details, fees, or a quick demo. When would be a good time to chat?`;
}

export function needsFollowUp(lead: Lead): boolean {
  return (
    getDaysInactive(lead.lastContact) >= 3 &&
    lead.status !== 'Converted' &&
    lead.status !== 'Lost'
  );
}
