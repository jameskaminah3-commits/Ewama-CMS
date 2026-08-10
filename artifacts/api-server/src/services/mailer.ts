import { logger } from "../lib/logger.js";

/**
 * Email via Resend's HTTPS API (https://resend.com). Chosen over SMTP because
 * it needs only outbound HTTPS — no mail ports, no native modules — which suits
 * shared hosting. Fully gated on env vars; if unset, every send quietly no-ops
 * so the app runs fine without email.
 *
 * To enable, set on the server:
 *   RESEND_API_KEY        e.g. re_xxxxxxxx
 *   RESEND_FROM           e.g. "EWAMA Properties <info@ewamaproperties.com>"
 * Optional:
 *   ADMIN_NOTIFY_EMAIL    who receives booking/enquiry alerts (defaults to RESEND_FROM address)
 */

function fromAddress(): string | null {
  return process.env["RESEND_FROM"] || null;
}

function bareEmail(addr: string): string {
  const m = addr.match(/<([^>]+)>/);
  return m ? m[1]! : addr.trim();
}

/** Low-level send. Returns true on success, never throws. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = fromAddress();
  if (!apiKey || !from) return false; // email not configured — no-op
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      logger.error({ status: res.status, detail: detail.slice(0, 300) }, "Resend email failed");
      return false;
    }
    logger.info({ subject }, "Email sent via Resend");
    return true;
  } catch (err) {
    logger.error({ err }, "Resend email request threw");
    return false;
  }
}

/** Alert the admin inbox (bookings, enquiries). */
export async function sendAdminNotification(subject: string, text: string): Promise<void> {
  const from = fromAddress();
  const to = process.env["ADMIN_NOTIFY_EMAIL"] || (from ? bareEmail(from) : "");
  if (!to) return;
  await sendEmail(to, subject, text);
}

/** Send a password-reset verification code to a specific admin. */
export async function sendVerificationCode(to: string, code: string): Promise<boolean> {
  const text = [
    `Your EWAMA Properties admin verification code is:`,
    ``,
    `    ${code}`,
    ``,
    `Enter this code to set a new password. It expires in 15 minutes.`,
    `If you didn't request this, you can safely ignore this email.`,
  ].join("\n");
  return sendEmail(to, `Your EWAMA admin verification code: ${code}`, text);
}
