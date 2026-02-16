import { EmailResult } from 'shared-types';

export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<EmailResult> {
  console.log('[MOCK EMAIL] Sending email:', {
    to: params.to,
    subject: params.subject,
    body: params.body,
  });

  const result: EmailResult = {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
  };

  console.log('[MOCK EMAIL] Email sent successfully:', result);

  return result;
}
