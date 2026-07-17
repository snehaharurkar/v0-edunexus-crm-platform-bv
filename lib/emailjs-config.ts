/** EmailJS credentials — loaded from .env.local at build time */
export const EMAILJS_SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() ?? '';
export const EMAILJS_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() ?? '';
export const EMAILJS_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() ?? '';

export const EMAILJS_FROM_NAME = 'Rahul Sharma - EduNexus';
export const EMAILJS_REPLY_TO = 'harurkar.6719@gmail.com';

export function assertEmailjsConfigured(): void {
  const missing: string[] = [];
  if (!EMAILJS_SERVICE_ID) missing.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID');
  if (!EMAILJS_TEMPLATE_ID) missing.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID');
  if (!EMAILJS_PUBLIC_KEY) missing.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');

  if (missing.length > 0) {
    throw new Error(
      `EmailJS not configured. Missing: ${missing.join(', ')}. Add them to .env.local and restart the dev server.`
    );
  }
}

export function getEmailjsErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as { text?: string; status?: number; message?: string };
    if (err.text) return err.text;
    if (err.message) return err.message;
  }
  if (typeof error === 'string') return error;
  return 'Failed to send email. Check EmailJS dashboard settings.';
}
