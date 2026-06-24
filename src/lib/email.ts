import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// EMAIL_FROM is already in "Name <email>" format — use as-is
const FROM = process.env.EMAIL_FROM ?? 'SwappINR <noreply@swappinr.com>';

/** Thin shim so call sites can keep using transport.sendMail({ from, to, subject, html }) unchanged. */
function createTransport() {
  const resend = getResend();
  if (!resend) return null;
  return {
    sendMail: async (opts: { from: string; to: string; subject: string; html: string }) => {
      const { error } = await resend.emails.send(opts);
      if (error) throw new Error(typeof error === 'string' ? error : error.message);
    },
  };
}

// Resolve app URL: explicit env → VERCEL_URL (auto-set by Vercel) → localhost
function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url && !url.startsWith('http://localhost')) return url;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return url ?? 'http://localhost:3000';
}
const APP_URL = getAppUrl();

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  const transport = createTransport();

  if (!transport) {
    console.log(`[email] Password reset link for ${email}: ${link}`);
    return;
  }

  await transport.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your SwappINR password',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your password — SwappINR</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%">
  <tr><td style="background:#111111;border:1px solid rgba(248,113,113,0.18);border-radius:20px;overflow:hidden">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(180deg,rgba(248,113,113,0.07) 0%,rgba(248,113,113,0.02) 100%);border-bottom:1px solid rgba(248,113,113,0.12);padding:44px 32px 36px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>
          <td style="text-align:center;vertical-align:middle">
            <table cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
              <td style="width:44px;height:44px;background:#CCFF00;border-radius:11px;text-align:center;vertical-align:middle;line-height:44px">
                <span style="color:#000;font-size:20px;font-weight:900;line-height:44px">S</span>
              </td>
              <td style="padding-left:11px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;vertical-align:middle;white-space:nowrap">
                Swapp<span style="color:#CCFF00">INR</span>
              </td>
            </tr></table>
          </td>
        </tr></table>
        <div style="width:56px;height:56px;background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.25);border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="16" height="11" rx="2.5" stroke="#F87171" stroke-width="1.6"/><path d="M8.5 11V8C8.5 5.8 10.6 4 13 4C15.4 4 17.5 5.8 17.5 8V11" stroke="#F87171" stroke-width="1.6" stroke-linecap="round"/><circle cx="13" cy="16.5" r="1.5" fill="#F87171"/></svg>
        </div>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.025em">Reset your password</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.4)">This link expires in 1 hour</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 36px">
        <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#ffffff">Hello, ${name} 👋</p>
        <p style="margin:0 0 36px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.48)">
          We received a request to reset the password for your SwappINR account.<br>
          Click the button below to set a new password. This link is valid for <strong style="color:#ffffff">1 hour</strong>.<br><br>
          If you didn't request this, you can safely ignore this email — your password will not change.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:40px">
            <a href="${link}" style="display:inline-block;background:#F87171;color:#000000;text-decoration:none;font-weight:800;font-size:16px;padding:17px 52px;border-radius:12px;letter-spacing:-0.01em">
              Reset Password &rarr;
            </a>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.15);border-radius:10px;padding:14px 16px;margin-bottom:24px">
            <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0 0 4px;font-weight:700">Security notice</p>
            <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:0;line-height:1.6">This request was made from your account. If this wasn't you, please contact support immediately.</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
          <tr><td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:24px">
            <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0 0 8px">Button not working? Copy this link into your browser:</p>
            <p style="font-size:11px;word-break:break-all;margin:0">
              <a href="${link}" style="color:#F87171;text-decoration:none">${link}</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:rgba(0,0,0,0.35);border-top:1px solid rgba(255,255,255,0.05);padding:18px 36px;text-align:center">
        <p style="font-size:12px;color:rgba(255,255,255,0.22);margin:0">
          &copy; 2025 SwappINR &middot; USDT &#8596; INR Exchange
        </p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding-top:28px">
    <p style="font-size:12px;color:rgba(255,255,255,0.18);margin:0 0 4px">&copy; 2025 SwappINR &middot; USDT &#8596; INR Exchange</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.10);margin:0">India&rsquo;s fastest crypto-to-INR settlement platform</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  });
}

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
    subject: 'Verify your SwappINR email address',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email — SwappINR</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%">

  <!-- Card -->
  <tr><td style="background:#111111;border:1px solid rgba(204,255,0,0.14);border-radius:20px;overflow:hidden">

    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(180deg,rgba(204,255,0,0.07) 0%,rgba(204,255,0,0.02) 100%);border-bottom:1px solid rgba(204,255,0,0.10);padding:44px 32px 36px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>
          <td style="text-align:center;vertical-align:middle">
            <table cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
              <td style="width:44px;height:44px;background:#CCFF00;border-radius:11px;text-align:center;vertical-align:middle;line-height:44px">
                <span style="color:#000;font-size:20px;font-weight:900;line-height:44px">S</span>
              </td>
              <td style="padding-left:11px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;vertical-align:middle;white-space:nowrap">
                Swapp<span style="color:#CCFF00">INR</span>
              </td>
            </tr></table>
          </td>
        </tr></table>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.025em">Verify your email</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.4);letter-spacing:0.01em">One click to activate your SwappINR account</p>
      </td></tr>
    </table>

    <!-- Body -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 36px">

        <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#ffffff">Hello, ${name} 👋</p>
        <p style="margin:0 0 36px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.48)">
          Thanks for joining SwappINR — India's fastest USDT&nbsp;&#8596;&nbsp;INR exchange.<br>
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
                  <svg width="22" height="22" viewBox="0 0 256 256" fill="#CCFF00" style="display:block;margin:0 auto 8px"><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.78,169.5,25.28a8,8,0,0,0-13.65-7.09l-112,120a8,8,0,0,0,5.63,13.47L96.89,149l-12.47,54.08a8,8,0,0,0,13.66,7.06l112-120A8,8,0,0,0,215.79,118.17Z"/></svg>
                  <div style="font-size:11px;font-weight:700;color:#CCFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Instant</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.35)">Under 15 min</div>
                </td></tr>
              </table>
            </td>
            <td width="33%" style="padding:0 3px;vertical-align:top">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 8px;text-align:center">
                  <svg width="22" height="22" viewBox="0 0 256 256" fill="#CCFF00" style="display:block;margin:0 auto 8px"><path d="M208,40H48A16,16,0,0,0,32,56v58.77c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40ZM173.66,106.34l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,145.37l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>
                  <div style="font-size:11px;font-weight:700;color:#CCFF00;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Secure</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.35)">AES-256</div>
                </td></tr>
              </table>
            </td>
            <td width="33%" style="padding:0 0 0 6px;vertical-align:top">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 8px;text-align:center">
                  <svg width="22" height="22" viewBox="0 0 256 256" fill="#CCFF00" style="display:block;margin:0 auto 8px"><path d="M216,72a8,8,0,0,1-8,8H179.08A64.11,64.11,0,0,1,128,136H98.07l73,71.4a8,8,0,1,1-11.1,11.52l-88-86.11A8,8,0,0,1,77.43,120H128a48.07,48.07,0,0,0,47.35-40H48a8,8,0,0,1,0-16H175.35A48.08,48.08,0,0,0,128,24H48a8,8,0,0,1,0-16H208a8,8,0,0,1,0,16H173.19A64.21,64.21,0,0,1,208,64h0a8,8,0,0,1,8,8Z"/></svg>
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
          If you didn't create a SwappINR account, you can safely ignore this email.
        </p>
      </td></tr>
    </table>

  </td></tr>

  <!-- Bottom copyright -->
  <tr><td align="center" style="padding-top:28px">
    <p style="font-size:12px;color:rgba(255,255,255,0.18);margin:0 0 4px">&#169; 2025 SwappINR &middot; USDT &#8596; INR Exchange</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.10);margin:0">India&rsquo;s fastest crypto-to-INR settlement platform</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  });
}

interface OrderEmailInfo {
  orderId: string;
  type: 'buy' | 'sell';
  cryptoAmount: number;
  cryptoSymbol: string;
  network: string;
  inrAmount: number;
}

function orderRowsHtml(o: OrderEmailInfo): string {
  const rows: [string, string][] = [
    ['Order ID', o.orderId],
    ['Type', o.type === 'buy' ? 'Buy USDT' : 'Sell USDT'],
    ['Amount', `${o.cryptoAmount} ${o.cryptoSymbol} (${o.network})`],
    ['Value', `₹${o.inrAmount.toLocaleString('en-IN')}`],
  ];
  return rows.map(([label, value]) => `
    <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:12px;color:rgba(255,255,255,0.4)">${label}</td>
        <td align="right" style="font-size:12px;font-weight:700;color:#ffffff;font-family:monospace">${value}</td>
      </tr></table>
    </td></tr>`).join('');
}

/** Sent immediately after an order (buy or sell) is created. */
export async function sendOrderCreatedEmail(email: string, name: string, order: OrderEmailInfo) {
  const link = `${APP_URL}/transactions`;
  const transport = createTransport();

  if (!transport) {
    console.log(`[email] Order created for ${email}: ${order.orderId}`);
    return;
  }

  await transport.sendMail({
    from: FROM,
    to: email,
    subject: `Order Received — #${order.orderId} | SwappINR`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order received — SwappINR</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%">
  <tr><td style="background:#111111;border:1px solid rgba(204,255,0,0.14);border-radius:20px;overflow:hidden">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(180deg,rgba(204,255,0,0.07) 0%,rgba(204,255,0,0.02) 100%);border-bottom:1px solid rgba(204,255,0,0.10);padding:44px 32px 36px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>
          <td style="text-align:center;vertical-align:middle">
            <table cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
              <td style="width:44px;height:44px;background:#CCFF00;border-radius:11px;text-align:center;vertical-align:middle;line-height:44px">
                <span style="color:#000;font-size:20px;font-weight:900;line-height:44px">S</span>
              </td>
              <td style="padding-left:11px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;vertical-align:middle;white-space:nowrap">
                Swapp<span style="color:#CCFF00">INR</span>
              </td>
            </tr></table>
          </td>
        </tr></table>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.025em">Order received</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.4)">We're processing order #${order.orderId}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 36px">
        <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#ffffff">Hello, ${name} 👋</p>
        <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.48)">
          Thank you for placing an order on SwappINR. Your request has been received and is now being processed by our team.
          You will receive another email as soon as your order's status changes.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px 18px;margin-bottom:32px">
          ${orderRowsHtml(order)}
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:32px">
            <a href="${link}" style="display:inline-block;background:#CCFF00;color:#000000;text-decoration:none;font-weight:800;font-size:16px;padding:17px 52px;border-radius:12px;letter-spacing:-0.01em">
              Track Order Status &rarr;
            </a>
          </td></tr>
        </table>
        <p style="margin:0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.32)">
          You can check the live status of this order at any time from the Trades tab in your dashboard.
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:rgba(0,0,0,0.35);border-top:1px solid rgba(255,255,255,0.05);padding:18px 36px;text-align:center">
        <p style="font-size:12px;color:rgba(255,255,255,0.22);margin:0">&copy; 2026 SwappINR &middot; USDT &#8596; INR Exchange</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  });
}

type OrderEmailStatus = 'completed' | 'failed' | 'cancelled' | 'disputed';

const STATUS_COPY: Record<OrderEmailStatus, { subject: string; heading: string; intro: string; accent: string; border: string; icon: string }> = {
  completed: {
    subject: 'Order Completed',
    heading: 'Order completed',
    intro: 'Great news — your order has been successfully processed and completed. The funds have been settled to your account.',
    accent: '#CCFF00',
    border: 'rgba(204,255,0,0.14)',
    icon: '<path d="M5 13l5 5L21 7" stroke="#CCFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  failed: {
    subject: 'Order Failed',
    heading: 'Order failed',
    intro: 'Unfortunately we were unable to process your order. No funds have been deducted. Please review the details below or contact support if you need assistance.',
    accent: '#F87171',
    border: 'rgba(248,113,113,0.18)',
    icon: '<path d="M7 7L17 17M17 7L7 17" stroke="#F87171" stroke-width="2" stroke-linecap="round"/>',
  },
  cancelled: {
    subject: 'Order Cancelled',
    heading: 'Order cancelled',
    intro: 'Your order has been cancelled. If you believe this was a mistake, please reach out to our support team.',
    accent: '#94A3B8',
    border: 'rgba(148,163,184,0.18)',
    icon: '<path d="M7 7L17 17M17 7L7 17" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>',
  },
  disputed: {
    subject: 'Order Under Review',
    heading: 'Order under review',
    intro: 'Your order has been flagged for manual review by our team. We will update you as soon as the review is complete.',
    accent: '#FBBF24',
    border: 'rgba(251,191,36,0.18)',
    icon: '<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FBBF24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  },
};

/** Sent when an order's status changes to a terminal state (completed/failed/cancelled/disputed). */
export async function sendOrderStatusEmail(email: string, name: string, order: OrderEmailInfo, status: OrderEmailStatus, reason?: string) {
  const link = `${APP_URL}/transactions`;
  const transport = createTransport();
  const c = STATUS_COPY[status];

  if (!transport) {
    console.log(`[email] Order ${status} for ${email}: ${order.orderId}`);
    return;
  }

  await transport.sendMail({
    from: FROM,
    to: email,
    subject: `${c.subject} — #${order.orderId} | SwappINR`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.subject} — SwappINR</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%">
  <tr><td style="background:#111111;border:1px solid ${c.border};border-radius:20px;overflow:hidden">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(180deg,${c.accent}12 0%,${c.accent}03 100%);border-bottom:1px solid ${c.border};padding:44px 32px 36px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>
          <td style="text-align:center;vertical-align:middle">
            <table cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
              <td style="width:44px;height:44px;background:#CCFF00;border-radius:11px;text-align:center;vertical-align:middle;line-height:44px">
                <span style="color:#000;font-size:20px;font-weight:900;line-height:44px">S</span>
              </td>
              <td style="padding-left:11px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;vertical-align:middle;white-space:nowrap">
                Swapp<span style="color:#CCFF00">INR</span>
              </td>
            </tr></table>
          </td>
        </tr></table>
        <div style="width:56px;height:56px;background:${c.accent}1F;border:1px solid ${c.border};border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${c.icon}</svg>
        </div>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.025em">${c.heading}</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.4)">Order #${order.orderId}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 36px">
        <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#ffffff">Hello, ${name} 👋</p>
        <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.48)">
          ${c.intro}${reason ? `<br><br><strong style="color:#ffffff">Reason:</strong> ${reason}` : ''}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px 18px;margin-bottom:32px">
          ${orderRowsHtml(order)}
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:8px">
            <a href="${link}" style="display:inline-block;background:${c.accent};color:#000000;text-decoration:none;font-weight:800;font-size:16px;padding:17px 52px;border-radius:12px;letter-spacing:-0.01em">
              View Order Details &rarr;
            </a>
          </td></tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:rgba(0,0,0,0.35);border-top:1px solid rgba(255,255,255,0.05);padding:18px 36px;text-align:center">
        <p style="font-size:12px;color:rgba(255,255,255,0.22);margin:0">&copy; 2026 SwappINR &middot; USDT &#8596; INR Exchange</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  });
}
