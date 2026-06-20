/**
 * SMS provider abstraction.
 * Set FAST2SMS_API_KEY in .env.local to enable real SMS.
 * Without it, OTP is logged to console (dev/test mode).
 */

export async function sendSms(phone: string, message: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    /* Dev mode — log to server console instead of sending SMS */
    console.log(`[SMS DEV] To +91${phone}: ${message}`);
    return;
  }

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route:            'otp',
      variables_values: message,
      numbers:          phone,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`SMS send failed (${res.status}): ${body}`);
  }
}

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  await sendSms(phone, `${otp} is your SwapINR verification OTP. Valid for 10 minutes. Do not share with anyone.`);
}
