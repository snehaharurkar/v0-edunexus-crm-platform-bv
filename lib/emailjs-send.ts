import emailjs from '@emailjs/browser';
import {
  assertEmailjsConfigured,
  EMAILJS_FROM_NAME,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_REPLY_TO,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
} from '@/lib/emailjs-config';

export interface SendLeadEmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
}

let emailjsInitialized = false;

function ensureEmailjsInit(): void {
  assertEmailjsConfigured();
  if (!emailjsInitialized) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    emailjsInitialized = true;
  }
}

/** Build template params with common EmailJS variable name aliases */
function buildTemplateParams({
  to_email,
  to_name,
  subject,
  message,
}: SendLeadEmailParams): Record<string, string> {
  return {
    to_email,
    to_name,
    subject,
    message,
    from_name: EMAILJS_FROM_NAME,
    reply_to: EMAILJS_REPLY_TO,
    // Aliases used by many EmailJS default templates
    user_email: to_email,
    user_name: to_name,
    name: to_name,
    email: to_email,
    body: message,
  };
}

export async function sendLeadEmail(params: SendLeadEmailParams): Promise<void> {
  ensureEmailjsInit();

  const result = await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    buildTemplateParams(params),
    { publicKey: EMAILJS_PUBLIC_KEY }
  );

  if (result.status !== 200) {
    throw new Error(result.text || `EmailJS returned status ${result.status}`);
  }
}

export function personalizeEmailContent(
  template: string,
  vars: { name: string; course?: string; courseInterest?: string }
): string {
  const course = vars.courseInterest ?? vars.course ?? '';
  return template
    .replace(/\{name\}/g, vars.name)
    .replace(/\{course\}/g, course)
    .replace(/\{bde_name\}/g, 'Rahul Sharma');
}

export { getEmailjsErrorMessage } from '@/lib/emailjs-config';
