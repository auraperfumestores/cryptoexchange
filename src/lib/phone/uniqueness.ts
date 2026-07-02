import { User } from '@/lib/db';

/**
 * Phone numbers in ADMIN_BYPASS_PHONES (comma-separated in env) are exempt from
 * uniqueness enforcement — they can be verified across multiple accounts.
 * Example: ADMIN_BYPASS_PHONES=9721648237
 */
const BYPASS_PHONES: Set<string> = new Set(
  (process.env.ADMIN_BYPASS_PHONES ?? '')
    .split(',')
    .map(p => p.replace(/\D/g, ''))
    .filter(Boolean),
);

/**
 * Returns `true` when the given phone number is already verified on a DIFFERENT account.
 *
 * @param phone      10-digit Indian mobile (digits only, no +91 prefix)
 * @param ownUserId  The calling user's own MongoDB _id string. Excluded from the
 *                   lookup so a user can re-verify their OWN number without being blocked.
 */
export async function isPhoneAlreadyVerified(
  phone: string,
  ownUserId?: string,
): Promise<boolean> {
  if (BYPASS_PHONES.has(phone)) return false;

  const query: Record<string, unknown> = { phone, phoneVerified: true };
  if (ownUserId) query._id = { $ne: ownUserId };

  return (await User.countDocuments(query)) > 0;
}
