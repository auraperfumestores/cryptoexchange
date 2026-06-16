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

// SMTP_FROM is already in "Name <email>" format — use as-is
const FROM = process.env.SMTP_FROM ?? 'noreply@swapinr.com';

// Resolve app URL: explicit env → VERCEL_URL (auto-set by Vercel) → localhost
function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url && !url.startsWith('http://localhost')) return url;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return url ?? 'http://localhost:3000';
}
const APP_URL = getAppUrl();

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${token}`;
  const transport = createTransport();

  if (!transport) {
    console.log(`[email] Verification link for ${email}: ${link}`);
    return;
  }

  await transport.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your SwapINR email address',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email — SwapINR</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%">

  <!-- Logo -->
  <tr><td align="center" style="padding-bottom:36px">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:40px;height:40px;background:#CCFF00;border-radius:10px;text-align:center;vertical-align:middle;line-height:40px">
        <span style="color:#000;font-size:18px;font-weight:900">S</span>
      </td>
      <td style="padding-left:10px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;vertical-align:middle">
        Swap<span style="color:#CCFF00">INR</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#111111;border:1px solid rgba(204,255,0,0.14);border-radius:20px;overflow:hidden">

    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(180deg,rgba(204,255,0,0.07) 0%,rgba(204,255,0,0.02) 100%);border-bottom:1px solid rgba(204,255,0,0.10);padding:44px 32px 36px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>
          <td style="width:72px;height:72px;background:rgba(204,255,0,0.08);border:1px solid rgba(204,255,0,0.22);border-radius:50%;text-align:center;vertical-align:middle;line-height:72px">
            <span style="font-size:30px;line-height:72px;display:inline-block">🔐</span>
          </td>
        </tr></table>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.025em">Verify your email</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.4);letter-spacing:0.01em">One click to activate your SwapINR account</p>
      </td></tr>
    </table>

    <!-- Body -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 36px">

        <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#ffffff">Hello, ${name} 👋</p>
        <p style="margin:0 0 36px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.48)">
          Thanks for joining SwapINR — India's fastest USDT&nbsp;&#8596;&nbsp;INR exchange.<br>
          Click the button below to verify your email address and activate your account.<br><br>
          This verification link expires in <strong style="color:#ffffff;font-weight:700">24 hours</strong>.
        </p>

        <!-- CTA button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:40px">
            <a href="${link}" style="display:inline-block;background:#CCFF00;color:#000000;text-decoration:none;font-weight:800;font-size:16px;padding:17px 52px;border-radius:12px;letter-spacing:-0.01em;mso-padding-alt:17px 52px">
              Verify Email Address &rarr;
            </a>
          </td></tr>
        </table>

        <!-- 3 feature badges -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px">
          <tr>
            <td width="33%" style="padding:0 6px 0 0;vertical-align:top">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 8px;text-align:center">
                  <div style="font-size:20px;margin-bottom:8px">&#9889;</div>
                  <div style="font-size:11px;font-weight:700;color:#CCFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Instant</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.35)">Under 15 min</div>
                </td></tr>
              </table>
            </td>
            <td width="33%" style="padding:0 3px;vertical-align:top">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 8px;text-align:center">
                  <div style="font-size:20px;margin-bottom:8px">&#128274;</div>
                  <div style="font-size:11px;font-weight:700;color:#CCFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Secure</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.35)">AES-256</div>
                </td></tr>
              </table>
            </td>
            <td width="33%" style="padding:0 0 0 6px;vertical-align:top">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 8px;text-align:center">
                  <div style="font-size:20px;margin-bottom:8px">&#8377;</div>
                  <div style="font-size:11px;font-weight:700;color:#CCFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Best Rate</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.35)">Zero hidden fees</div>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Fallback link -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:24px">
            <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0 0 8px">Button not working? Copy this link into your browser:</p>
            <p style="font-size:11px;word-break:break-all;margin:0">
              <a href="${link}" style="color:#CCFF00;text-decoration:none">${link}</a>
            </p>
          </td></tr>
        </table>

      </td></tr>
    </table>

    <!-- Card footer -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:rgba(0,0,0,0.35);border-top:1px solid rgba(255,255,255,0.05);padding:18px 36px;text-align:center">
        <p style="font-size:12px;color:rgba(255,255,255,0.22);margin:0">
          If you didn't create a SwapINR account, you can safely ignore this email.
        </p>
      </td></tr>
    </table>

  </td></tr>

  <!-- Bottom copyright -->
  <tr><td align="center" style="padding-top:28px">
    <p style="font-size:12px;color:rgba(255,255,255,0.18);margin:0 0 4px">&#169; 2025 SwapINR &middot; USDT &#8596; INR Exchange</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.10);margin:0">India&rsquo;s fastest crypto-to-INR settlement platform</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  });
}
