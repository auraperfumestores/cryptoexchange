import { connectToDatabase, User } from '@/lib/db';

/**
 * Admin-controlled, per-account OTP bypass.
 *
 * Returns true ONLY when an admin has explicitly enabled the phone bypass for this
 * account AND turned on the "skip all OTP" sub-option. Both switches are off (and
 * the field is absent entirely) on every normal account, so this returns false and
 * every OTP flow behaves exactly as it always has.
 *
 * Single source of truth — every OTP gate calls this rather than reading the flags
 * itself, so the bypass can never be partially applied across the flows.
 *
 * Never throws: a lookup failure resolves to false, i.e. fail closed and keep the
 * OTP requirement in place rather than silently dropping a security control.
 */
export async function isOtpBypassed(userId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId)
      .select('phoneBypass')
      .lean<{ phoneBypass?: { enabled?: boolean; skipAllOtp?: boolean } }>();

    const pb = user?.phoneBypass;
    return pb?.enabled === true && pb?.skipAllOtp === true;
  } catch (err) {
    console.error('[otp-bypass] lookup failed, keeping OTP required:', err);
    return false;
  }
}
