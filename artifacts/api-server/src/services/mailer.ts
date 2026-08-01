import { logger } from "../lib/logger.js";

/**
 * Optional admin email notifications. Fully gated on SMTP env vars, and the
 * nodemailer module is loaded lazily — if it isn't installed or SMTP isn't
 * configured, this quietly no-ops so the API always runs.
 *
 * To enable, set on the server:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional:
 *   SMTP_FROM            (defaults to SMTP_USER)
 *   ADMIN_NOTIFY_EMAIL   (recipient; defaults to SMTP_USER)
 * ...then run "npm install" on the app so nodemailer is available.
 */

// `any` avoids a hard type dependency on nodemailer (it's an optional module).
let transporter: any | null | undefined;

async function getTransporter(): Promise<any | null> {
  if (transporter !== undefined) return transporter;

  const host = process.env["SMTP_HOST"];
  const port = process.env["SMTP_PORT"];
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!host || !port || !user || !pass) {
    transporter = null; // SMTP not configured — notifications disabled
    return null;
  }

  try {
    const nodemailer = (await import("nodemailer")).default;
    const portNum = Number(port);
    transporter = nodemailer.createTransport({
      host,
      port: portNum,
      secure: portNum === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user, pass },
    });
  } catch (err) {
    logger.warn({ err }, "nodemailer unavailable — email notifications disabled");
    transporter = null;
  }
  return transporter;
}

/**
 * Send a plain-text notification to the admin inbox. Never throws — failures
 * are logged and swallowed so they can't break the request that triggered them.
 */
export async function sendAdminNotification(subject: string, text: string): Promise<void> {
  const tx = await getTransporter();
  if (!tx) return;
  const from = process.env["SMTP_FROM"] || process.env["SMTP_USER"]!;
  const to = process.env["ADMIN_NOTIFY_EMAIL"] || process.env["SMTP_USER"]!;
  try {
    await tx.sendMail({ from, to, subject, text });
    logger.info({ subject }, "Admin notification email sent");
  } catch (err) {
    logger.error({ err, subject }, "Failed to send admin notification email");
  }
}
