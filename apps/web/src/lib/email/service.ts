import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface BookingDetails {
  id?: string;
  name: string;
  email: string;
  date: string; // e.g. "Wednesday, October 28th, 2026"
  time: string; // e.g. "14:00" or "02:00 PM"
  timezone: string; // e.g. "Africa/Addis_Ababa"
  notes?: string;
  createdAt?: string;
}

export interface SendBookingEmailResult {
  success: boolean;
  provider: "resend" | "smtp" | "none";
  hostSent: boolean;
  attendeeSent: boolean;
  error?: string;
}

const DEFAULT_HOST_EMAIL = "robelgudissa0000@gmail.com";
const DEFAULT_HOST_NAME = "design robel";

/**
 * Resolves the host recipient email from environment variables or fallback to portfolio contact email.
 */
export function getHostNotificationEmail(): string {
  return (
    process.env.MEETING_NOTIFICATION_EMAIL?.trim() ||
    process.env.SUPPORT_EMAIL?.trim() ||
    DEFAULT_HOST_EMAIL
  );
}

/**
 * Builds the HTML content for host notification email.
 */
function buildHostEmailHtml(details: BookingDetails): string {
  const cleanNotes = details.notes?.trim() ? details.notes.trim() : "No additional notes provided.";
  const mailtoLink = `mailto:${encodeURIComponent(details.email)}?subject=${encodeURIComponent(
    `Re: 15 Min Meeting on ${details.date} at ${details.time}`
  )}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Meeting Scheduled: ${escapeHtml(details.name)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E4E4E7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #161616; padding: 28px 32px; color: #FFFFFF;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #E4E4E7;">
                      Portfolio Scheduler
                    </span>
                    <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.25;">
                      New Meeting Scheduled!
                    </h1>
                    <p style="margin: 0; font-size: 13px; color: #A1A1AA;">
                      ${escapeHtml(details.name)} booked a 15-minute introductory session with you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meeting Summary Card -->
          <tr>
            <td style="padding: 28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA; border-radius: 12px; border: 1px solid #EAEAEA; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 14px; border-bottom: 1px solid #EFEFEF;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717A;">
                      Scheduled Date & Time
                    </span>
                    <div style="font-size: 17px; font-weight: 700; color: #161616; margin-top: 4px;">
                      ${escapeHtml(details.date)} at ${escapeHtml(details.time)}
                    </div>
                    <div style="font-size: 12px; color: #71717A; margin-top: 2px;">
                      Timezone: <strong style="color: #161616;">${escapeHtml(details.timezone)}</strong> (15 Min Call · Cal Video)
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 8px;">
                          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #71717A;">Attendee</span>
                          <div style="font-size: 14px; font-weight: 600; color: #161616; margin-top: 2px;">
                            ${escapeHtml(details.name)}
                          </div>
                        </td>
                        <td width="50%" style="vertical-align: top; padding-left: 8px;">
                          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #71717A;">Email</span>
                          <div style="font-size: 14px; font-weight: 600; color: #161616; margin-top: 2px;">
                            <a href="${mailtoLink}" style="color: #2563EB; text-decoration: none;">
                              ${escapeHtml(details.email)}
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project Notes / Purpose -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717A;">
                  Meeting Purpose & Project Goals
                </span>
                <div style="margin-top: 8px; padding: 14px 16px; background-color: #FFFFFF; border-left: 3px solid #161616; border: 1px solid #E4E4E7; border-left-width: 4px; border-radius: 8px; font-size: 14px; line-height: 1.5; color: #27272A; white-space: pre-wrap;">
                  ${escapeHtml(cleanNotes)}
                </div>
              </div>

              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left">
                    <a href="${mailtoLink}" style="display: inline-block; background-color: #161616; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 9999px; margin-right: 8px;">
                      Reply to ${escapeHtml(details.name.split(" ")[0])}
                    </a>
                    <a href="https://wa.me/251930129953" style="display: inline-block; background-color: #F4F4F5; color: #161616; border: 1px solid #E4E4E7; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 9999px;">
                      WhatsApp Robel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px 24px 32px; background-color: #FAFAFA; border-top: 1px solid #EAEAEA; font-size: 11px; color: #8A8A8E; text-align: center;">
              This notification was generated automatically by your portfolio booking system (<a href="https://robelgudissa.com" style="color: #71717A;">design robel</a>).
              ${details.id ? `<br>Booking Reference ID: ${details.id}` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Builds the HTML content for attendee confirmation email.
 */
function buildAttendeeEmailHtml(details: BookingDetails): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Confirmed: 15 Min Meeting with ${DEFAULT_HOST_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E4E4E7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #161616; padding: 28px 32px; color: #FFFFFF;">
              <span style="display: inline-block; background-color: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #86EFAC;">
                Booking Confirmed
              </span>
              <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.25;">
                We're scheduled, ${escapeHtml(details.name.split(" ")[0])}!
              </h1>
              <p style="margin: 0; font-size: 13px; color: #A1A1AA;">
                Your introductory call with <strong>${DEFAULT_HOST_NAME}</strong> has been confirmed.
              </p>
            </td>
          </tr>

          <!-- Card Content -->
          <tr>
            <td style="padding: 28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA; border-radius: 12px; border: 1px solid #EAEAEA; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717A;">
                      Confirmed Meeting Slot
                    </span>
                    <div style="font-size: 17px; font-weight: 700; color: #161616; margin-top: 4px;">
                      ${escapeHtml(details.date)} at ${escapeHtml(details.time)}
                    </div>
                    <div style="font-size: 13px; color: #52525B; margin-top: 4px;">
                      Duration: <strong>15 Minutes</strong> · Timezone: <strong>${escapeHtml(details.timezone)}</strong>
                    </div>
                    <div style="font-size: 12px; color: #71717A; margin-top: 6px;">
                      Location: Cal Video / Google Meet (access link shared prior to call)
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.6; color: #3F3F46; margin: 0 0 16px 0;">
                Looking forward to discussing your product vision, timeline, and design scope.
                If you need to make any changes or share additional materials before our call, feel free to reply directly to this email or reach out on WhatsApp/Telegram.
              </p>

              <!-- Channels -->
              <div style="padding-top: 16px; border-top: 1px solid #EFEFEF; margin-top: 20px;">
                <div style="font-size: 12px; font-weight: 600; color: #71717A; margin-bottom: 10px;">
                  Direct Contact Options:
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <a href="https://wa.me/251930129953" style="display: inline-block; background-color: #F4F4F5; color: #161616; border: 1px solid #E4E4E7; font-size: 12px; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 9999px; margin-right: 6px; margin-bottom: 6px;">
                        WhatsApp (+251 930 129 953)
                      </a>
                      <a href="https://t.me/ReubenMarsian" style="display: inline-block; background-color: #F4F4F5; color: #161616; border: 1px solid #E4E4E7; font-size: 12px; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 9999px; margin-bottom: 6px;">
                        Telegram (@ReubenMarsian)
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px 24px 32px; background-color: #FAFAFA; border-top: 1px solid #EAEAEA; font-size: 11px; color: #8A8A8E; text-align: center;">
              Sent by ${DEFAULT_HOST_NAME} · Addis Ababa, Ethiopia · robelgudissa0000@gmail.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Dispatch booking emails using either Resend or Nodemailer (SMTP).
 */
export async function sendMeetingBookingEmails(
  details: BookingDetails
): Promise<SendBookingEmailResult> {
  const hostEmail = getHostNotificationEmail();
  const hostSubject = `🗓️ New Meeting: ${details.name} - ${details.date} at ${details.time} (${details.timezone})`;
  const attendeeSubject = `Confirmed: 15 Min Meeting with ${DEFAULT_HOST_NAME}`;

  const hostHtml = buildHostEmailHtml(details);
  const attendeeHtml = buildAttendeeEmailHtml(details);

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  // 1. Try Resend if RESEND_API_KEY is configured
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const rawFrom = process.env.RESEND_FROM_EMAIL?.trim() || "Batman <onboarding@resend.dev>";
      const from =
        rawFrom.includes("yourdomain.com")
          ? "Batman <onboarding@resend.dev>"
          : rawFrom;

      // Send email to host
      const hostRes = await resend.emails.send({
        from,
        to: hostEmail,
        subject: hostSubject,
        html: hostHtml,
      });

      if (hostRes.error) {
        console.error("[EmailService] Resend host email error:", hostRes.error);
        return {
          success: false,
          provider: "resend",
          hostSent: false,
          attendeeSent: false,
          error: `Resend error: ${hostRes.error.message || JSON.stringify(hostRes.error)}`,
        };
      }

      // Try sending confirmation email to attendee
      let attendeeSent = false;
      try {
        const attendeeRes = await resend.emails.send({
          from,
          to: details.email,
          subject: attendeeSubject,
          html: attendeeHtml,
        });
        if (!attendeeRes.error) {
          attendeeSent = true;
        } else {
          console.warn("[EmailService] Resend attendee email warning:", attendeeRes.error.message);
        }
      } catch (attErr) {
        console.warn("[EmailService] Could not send attendee confirmation email:", attErr);
      }

      return {
        success: true,
        provider: "resend",
        hostSent: true,
        attendeeSent,
      };
    } catch (err: any) {
      console.error("[EmailService] Resend dispatch exception:", err);
      return {
        success: false,
        provider: "resend",
        hostSent: false,
        attendeeSent: false,
        error: err.message || "Failed to dispatch email via Resend",
      };
    }
  }

  // 2. Try SMTP if SMTP credentials are provided
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 587 ? false : true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const smtpFrom = process.env.SMTP_FROM?.trim() || `"${DEFAULT_HOST_NAME}" <${smtpUser}>`;

      // Dispatch host notification and attendee confirmation concurrently
      const isSameRecipient = details.email.toLowerCase() === hostEmail.toLowerCase();
      const sendHostPromise = transporter.sendMail({
        from: smtpFrom,
        to: hostEmail,
        subject: hostSubject,
        html: hostHtml,
      });

      const sendAttendeePromise = !isSameRecipient
        ? transporter.sendMail({
            from: smtpFrom,
            to: details.email,
            subject: attendeeSubject,
            html: attendeeHtml,
          })
        : Promise.resolve({ messageId: "same_as_host" });

      const [hostResult, attendeeResult] = await Promise.allSettled([
        sendHostPromise,
        sendAttendeePromise,
      ]);

      if (hostResult.status === "rejected") {
        console.error("[EmailService] SMTP host dispatch error:", hostResult.reason);
        return {
          success: false,
          provider: "smtp",
          hostSent: false,
          attendeeSent: false,
          error: hostResult.reason?.message || "Failed to deliver email via SMTP",
        };
      }

      const attendeeSent = attendeeResult.status === "fulfilled";
      if (attendeeResult.status === "rejected") {
        console.warn("[EmailService] SMTP attendee dispatch warning:", attendeeResult.reason);
      }

      return {
        success: true,
        provider: "smtp",
        hostSent: true,
        attendeeSent,
      };
    } catch (err: any) {
      console.error("[EmailService] SMTP dispatch exception:", err);
      return {
        success: false,
        provider: "smtp",
        hostSent: false,
        attendeeSent: false,
        error: err.message || "Failed to dispatch email via SMTP",
      };
    }
  }

  // 3. No email service configured
  const errorMsg =
    "Email service credentials are not configured on the server. Please set RESEND_API_KEY or SMTP credentials (SMTP_USER & SMTP_PASS) in your environment variables.";
  console.error(`[EmailService] ${errorMsg}`);

  return {
    success: false,
    provider: "none",
    hostSent: false,
    attendeeSent: false,
    error: errorMsg,
  };
}
