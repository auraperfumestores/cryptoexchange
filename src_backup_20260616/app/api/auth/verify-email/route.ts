import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Find user with this token — check expiry for fresh verifications
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpiresAt: { $gt: Date.now() },
    }).select('+emailVerifyToken +emailVerifyExpiresAt');

    if (!user) {
      // Token expired or not found — check if it was already successfully consumed
      // We keep the token in DB (just clear expiry) so this lookup still works
      const already = await User.findOne({
        emailVerifyToken: token,
        emailVerified: true,
      }).select('+emailVerifyToken _id');

      if (already) {
        return NextResponse.json({ success: true, alreadyVerified: true });
      }
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
    }

    // Mark verified — clear expiry but KEEP the token so repeat calls are caught above
    user.emailVerified = true;
    user.emailVerifyExpiresAt = undefined;
    await user.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
