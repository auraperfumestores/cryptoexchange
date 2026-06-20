import { NextResponse }             from 'next/server';
import bcrypt                        from 'bcryptjs';
import { connectToDatabase, User }   from '@/lib/db';

export const dynamic = 'force-dynamic';

/** POST /api/auth/reset-password — validate token and set new password */
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json() as { token?: string; password?: string };

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      passwordResetToken:     token,
      passwordResetExpiresAt: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpiresAt');

    if (!user) {
      return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: user._id }, {
      $set:   { password: hashed },
      $unset: { passwordResetToken: '', passwordResetExpiresAt: '' },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** GET /api/auth/reset-password?token=… — validate token without consuming it */
export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ valid: false });

    await connectToDatabase();
    const user = await User.findOne({
      passwordResetToken:     token,
      passwordResetExpiresAt: { $gt: Date.now() },
    }).select('_id').lean();

    return NextResponse.json({ valid: !!user });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
