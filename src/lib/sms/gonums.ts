/**
 * Gonums (Bulk9) SMS — OTP route.
 * Set GONUMS_AUTH_KEY in .env.local to enable real SMS.
 * Without it, OTP is logged to console (dev/test mode).
 *
 * Gonums' OTP route (`route: 'otp'`) is a plain SMS transport, not a hosted
 * OTP service — we generate/hash/verify the code ourselves (see OtpCode model)
 * and only use Gonums to deliver the text. This route is exempt from India's
 * DLT sender-ID requirement (unlike the `dlt` route), but the account must
 * have completed KYC first or sends fail with error 996.
 */

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const authKey = process.env.GONUMS_AUTH_KEY;

  if (!authKey) {
    console.log(`[OTP DEV] To +91${phone}: ${otp} is your SwapINR verification code.`);
    return;
  }

  const res = await fetch('https://my.gonums.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route:            'otp',
      variables_values: otp,
      numbers:          phone,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.return !== true) {
    console.error('[OTP] Gonums send failed:', data);
    throw new Error(data?.message?.[0] || 'Failed to send OTP. Please try again.');
  }
}
