/**
 * Gonums (Bulk9) SMS — manual DLT route, using Gonums' own shared DLT entity.
 * Set GONUMS_AUTH_KEY in .env.local to enable real SMS.
 * Without it, OTP is logged to console (dev/test mode).
 * (deploy trigger)
 *
 * Gonums has no hosted OTP/verify service — we generate/hash/verify the code
 * ourselves (see OtpCode model) and only use Gonums to deliver the text.
 * Their dedicated `route: 'otp'` is locked behind account KYC (error 996) and
 * currently unavailable on this account, so this instead uses `dlt_manual`
 * with Gonums' own pre-registered shared sender/entity/template — confirmed
 * working by live test (real SMS received, custom brand text included).
 * The sender_id/entity_id/template_id below are NOT ours; they belong to
 * Gonums' shared demo entity, which is why no DLT registration of our own
 * was needed for this to work.
 */

const SENDER_ID   = 'CHORHA';
const ENTITY_ID   = '1601461177122457427';
const TEMPLATE_ID = '1607100000000380703';

// Gonums' shared DLT template is registered for this exact wording only — any other
// text returns TEMPLATE_NOT_MATCHED and the SMS is never delivered. So every purpose
// (login phone-verify, wallet-verify, etc.) must reuse the same approved message.
const APPROVED_TEMPLATE = (otp: string) => `Hello, ${otp} is the OTP for SwapINR login using your phone number. Do not share it to anyone.`;

const MESSAGE_TEMPLATES: Record<string, (otp: string) => string> = {
  'phone-verify':  APPROVED_TEMPLATE,
  'wallet-verify': APPROVED_TEMPLATE,
};

export async function sendOtpSms(phone: string, otp: string, purpose: string = 'phone-verify'): Promise<void> {
  const authKey = process.env.GONUMS_AUTH_KEY;
  const buildMessage = MESSAGE_TEMPLATES[purpose] ?? MESSAGE_TEMPLATES['phone-verify'];

  if (!authKey) {
    console.log(`[OTP DEV] To +91${phone}: ${buildMessage(otp)}`);
    return;
  }

  const message = buildMessage(otp);

  const res = await fetch('https://my.gonums.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route:       'dlt_manual',
      sender_id:   SENDER_ID,
      entity_id:   ENTITY_ID,
      template_id: TEMPLATE_ID,
      message,
      numbers:     `91${phone}`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.return !== true) {
    console.error('[OTP] Gonums send failed:', data);
    throw new Error(data?.message?.[0] || 'Failed to send OTP. Please try again.');
  }
}
