import nodemailer from 'nodemailer';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === '1';

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure,
    auth: { user, pass },
    // Gmail requires STARTTLS on port 587
    requireTLS: !secure,
  });
}

const FROM = process.env.SMTP_FROM ?? 'noreply@swapinr.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${token}`;
  const transport = createTransport();

  if (!transport) {
    console.log(`[email] Verification link for ${email}: ${link}`);
    return;
  }

  await transport.sendMail({
    from: `"SwapINR" <${FROM}>`,
    to: email,
    subject: 'Verify your SwapINR email address',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#050A2E;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050A2E;padding:40px 16px">
  <tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%">

      <!-- Logo -->
      <tr><td align="center" style="padding-bottom:28px">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:40px;height:40px;background:linear-gradient(135deg,#1A3FFF,#6B21FF);border-radius:12px;text-align:center;vertical-align:middle">
              <span style="color:#fff;font-size:18px;font-weight:900;line-height:40px">S</span>
            </td>
            <td style="padding-left:10px;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.03em">
              Swap<span style="background:linear-gradient(135deg,#4D9FFF,#00D4FF);-webkit-background-clip:text;color:#4D9FFF">INR</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden">

        <!-- Header gradient -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:linear-gradient(135deg,#0A1A6E 0%,#2A0A6E 100%);padding:32px;text-align:center">
            <div style="width:64px;height:64px;background:rgba(0,229,160,0.15);border:2px solid rgba(0,229,160,0.35);border-radius:50%;margin:0 auto 16px;display:inline-flex;align-items:center;justify-content:center">
              <span style="font-size:28px;line-height:1">✉</span>
            </div>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em">Verify your email</h1>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.55)">One click to activate your SwapINR account</p>
          </td></tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:32px">
            <p style="font-size:16px;font-weight:600;color:#fff;margin:0 0 8px">Hello, ${name} 👋</p>
            <p style="font-size:14px;line-height:1.7;color:rgba(148,163,184,0.75);margin:0 0 28px">
              Thanks for joining SwapINR — India's fastest USDT to INR exchange. Click the button below to verify your email. This link expires in <strong style="color:#fff">24 hours</strong>.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:28px">
                <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#1A3FFF 0%,#6B21FF 100%);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 48px;border-radius:50px;letter-spacing:-0.01em">
                  Verify Email Address →
                </a>
              </td></tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px">
                <p style="font-size:12px;color:rgba(100,116,139,0.7);margin:0 0 6px">Or copy this link into your browser:</p>
                <p style="font-size:11px;word-break:break-all;color:#4D9FFF;margin:0">
                  <a href="${link}" style="color:#4D9FFF">${link}</a>
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:rgba(0,0,0,0.2);padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="font-size:12px;color:rgba(100,116,139,0.6);margin:0;text-align:center">
              If you didn't create a SwapINR account, you can safely ignore this email.
            </p>
          </td></tr>
        </table>

      </td></tr>

      <!-- Bottom note -->
      <tr><td align="center" style="padding-top:24px">
        <p style="font-size:12px;color:rgba(100,116,139,0.4);margin:0">© 2025 SwapINR · USDT ↔ INR Exchange</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
    `,
  });
}
