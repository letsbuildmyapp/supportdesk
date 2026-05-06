import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

/**
 * sendNotification — fires email via Resend when configured.
 * Falls back to logging the payload as a fixture when RESEND_API_KEY is absent
 * (so the demo works against emulators with no real key).
 */
export const sendNotification = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in');
    }
    const { event, payload } = request.data ?? {};
    if (!event) throw new HttpsError('invalid-argument', 'event is required');

    const apiKey = process.env.RESEND_API_KEY;

    const subject = (() => {
      switch (event) {
        case 'ticket.created': return `[SupportDesk] New ticket: ${payload?.ticket?.subject ?? '(no subject)'}`;
        case 'ticket.reply':   return `[SupportDesk] New reply from ${payload?.author ?? 'agent'}`;
        case 'ticket.status':  return `[SupportDesk] Status: ${payload?.from} → ${payload?.to}`;
        default:               return `[SupportDesk] ${event}`;
      }
    })();

    const html = renderEmail(event, payload);

    if (!apiKey) {
      logger.info('[notify:fixture]', { event, subject, payload });
      return { ok: true, mode: 'fixture' };
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const to = inferRecipients(event, payload);
      if (!to.length) {
        logger.warn('[notify] no recipients resolved', { event });
        return { ok: true, mode: 'noop' };
      }
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? 'SupportDesk <noreply@supportdesk.demo>',
        to,
        subject,
        html,
      });
      if (error) {
        logger.error('[notify:resend] error', error);
        throw new HttpsError('internal', 'Email send failed');
      }
      return { ok: true, mode: 'resend' };
    } catch (e: any) {
      logger.error('[notify] failed', e);
      // Don't fail the user-facing op — fall back to fixture mode silently.
      return { ok: true, mode: 'fixture-fallback', error: String(e?.message ?? e) };
    }
  },
);

function inferRecipients(event: string, payload: any): string[] {
  // In a real build, look up users from Firestore. For the demo we trust payload-supplied addresses.
  const out: string[] = [];
  if (payload?.ticket?.customerEmail) out.push(payload.ticket.customerEmail);
  if (payload?.recipientEmail) out.push(payload.recipientEmail);
  return Array.from(new Set(out));
}

function renderEmail(event: string, payload: any): string {
  const ticket = payload?.ticket;
  const safe = (s: any) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
  return `
<!doctype html>
<html><body style="font-family: -apple-system, system-ui, sans-serif; padding: 32px; background: #f8fafc; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
    <div style="font-weight: 600; color: #ea580c; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">SupportDesk · ${safe(event)}</div>
    <h1 style="font-size: 22px; margin: 12px 0 16px; font-weight: 600; letter-spacing: -0.02em;">${safe(ticket?.subject ?? 'Notification')}</h1>
    <p style="color: #475569; line-height: 1.6; font-size: 15px;">${safe(ticket?.description ?? payload?.body ?? '')}</p>
    <a href="#" style="display: inline-block; margin-top: 20px; background: #ea580c; color: white; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">Open ticket</a>
  </div>
  <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">SupportDesk demo · built by letsbuildmyapp.com</div>
</body></html>`.trim();
}
