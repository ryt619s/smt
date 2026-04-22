import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ─── Config ───────────────────────────────────────────────────────────────────
// SMTP auth (Brevo login — NOT used as sender)
const SMTP_HOST   = process.env.BREVO_SMTP_HOST  || 'smtp-relay.brevo.com';
const SMTP_PORT   = parseInt(process.env.BREVO_SMTP_PORT || '587');
const SMTP_USER   = process.env.BREVO_SMTP_USER!;  // SMTP login only
const SMTP_PASS   = process.env.BREVO_SMTP_PASS!;  // SMTP key only

// Verified sender (must be verified inside Brevo Dashboard → Senders & IP → Senders)
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL!;
const SENDER_NAME  = process.env.BREVO_SENDER_NAME || 'SMT Ecosystem';

// Validate on startup
if (!SMTP_USER || !SMTP_PASS) {
  console.error('[EMAIL] ❌ BREVO_SMTP_USER or BREVO_SMTP_PASS missing in .env');
}
if (!SENDER_EMAIL || SENDER_EMAIL === 'your_verified_email@gmail.com') {
  console.error('[EMAIL] ❌ BREVO_SENDER_EMAIL is not set to a real verified email!');
  console.error('[EMAIL]    Go to: Brevo Dashboard → Senders & IP → Senders → Add & verify your email');
  console.error('[EMAIL]    Then update BREVO_SENDER_EMAIL in .env and restart the server.');
}

// ─── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,     // MUST be false for port 587 (STARTTLS)
  requireTLS: true,  // Force TLS upgrade
  auth: {
    user: SMTP_USER,  // Brevo SMTP login
    pass: SMTP_PASS,  // Brevo SMTP key (not API key)
  },
});

// ─── Verify connection on startup ─────────────────────────────────────────────
transporter.verify((error) => {
  if (error) {
    console.error('[EMAIL] ❌ SMTP verify failed:', error.message);
  } else {
    console.log('[EMAIL] ✅ Brevo SMTP ready');
    console.log('[EMAIL]    Auth user :', SMTP_USER);
    console.log('[EMAIL]    From      :', `${SENDER_NAME} <${SENDER_EMAIL}>`);
  }
});

// ─── HTML Template ────────────────────────────────────────────────────────────
const buildOTPEmail = (otp: string, purpose: string): string => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#0f172a;border-radius:16px;border:1px solid #1e293b;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);
                     padding:32px;text-align:center;border-radius:16px 16px 0 0;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;">⚡ SMT ECOSYSTEM</h1>
            <p style="margin:8px 0 0;color:#c4b5fd;font-size:13px;">Security Verification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <p style="color:#94a3b8;font-size:15px;margin:0 0 8px;">Hello,</p>
            <p style="color:#e2e8f0;font-size:15px;margin:0 0 28px;">
              Your one-time code for
              <strong style="color:#a78bfa;">${purpose}</strong> is:
            </p>
            <!-- OTP Box -->
            <div style="background:#1e293b;border:2px dashed #7c3aed;
                        border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
              <span style="font-size:44px;font-weight:bold;letter-spacing:14px;
                           color:#10b981;font-family:monospace;">${otp}</span>
            </div>
            <p style="color:#475569;font-size:13px;margin:0;">
              ⏱ Expires in <strong>10 minutes</strong>.
              If you did not request this, safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0b1120;padding:18px 32px;text-align:center;
                     border-radius:0 0 16px 16px;">
            <p style="color:#334155;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} SMT Ecosystem · Automated security alert
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Send OTP Email ───────────────────────────────────────────────────────────
export const sendOTPEmail = async (
  to: string,
  otp: string,
  purpose: 'Registration' | 'Password Reset' | 'Withdrawal'
): Promise<void> => {

  console.log(`\n[EMAIL] ── Sending ${purpose} OTP ─────────────────────────`);
  console.log(`[EMAIL] To   : ${to}`);
  console.log(`[EMAIL] OTP  : ${otp}`);
  console.log(`[EMAIL] From : ${SENDER_NAME} <${SENDER_EMAIL}>`);

  try {
    const info = await transporter.sendMail({
      // ✅ Verified sender — separate from SMTP auth credentials
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject: `Your SMT ${purpose} code: ${otp}`,
      html: buildOTPEmail(otp, purpose),
      text: `Your SMT ${purpose} OTP is: ${otp}. It expires in 10 minutes.`,
    });

    console.log(`[EMAIL] messageId : ${info.messageId}`);
    console.log(`[EMAIL] response  : ${info.response}`);
    console.log(`[EMAIL] accepted  :`, info.accepted);
    console.log(`[EMAIL] rejected  :`, info.rejected);

    if (info.rejected && info.rejected.length > 0) {
      throw new Error(`Brevo rejected delivery to: ${info.rejected.join(', ')}`);
    }

    console.log(`[EMAIL] ✅ Accepted for delivery\n`);

  } catch (error: any) {
    console.error('\n[EMAIL] ❌ sendMail error:');
    console.error('[EMAIL] Code   :', error.code);
    console.error('[EMAIL] Message:', error.message);
    // Do not rethrow — email failure should not crash registration
  }
};
