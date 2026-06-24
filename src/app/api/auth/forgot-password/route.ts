import { NextResponse }                     from 'next/server';
import crypto                               from 'crypto';
import { connectToDatabase, User }          from '@/lib/db';
import { sendPasswordResetEmail }           from '@/lib/email';

export const dynamic = 'force-dynamic';

/** POST /api/auth/forgot-password
 *  Sends a password reset email. Always returns 200 to prevent email enumeration. */
export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email) return NextResponse.json({ success: true }); // silent

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      const token     = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      await User.updateOne({ _id: user._id }, {
        $set: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
      });

      // Awaited — fire-and-forget calls get killed mid-flight when Vercel
      // freezes the function right after the response is sent.
      try {
        await sendPasswordResetEmail(user.email, user.name, token);
      } catch (err) {
        console.error('[forgot-password] email send failed:', err);
      }
    }

    // Always 200 — don't reveal whether the email exists
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ success: true }); // still 200
  }
}
