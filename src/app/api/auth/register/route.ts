import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase, User, userToDocument, generateUsername } from '@/lib/db';
import { registerSchema } from '@/lib/validators/schemas';
import { errorResponse } from '@/lib/utils/errors';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { name, email, password, phone } = parsed.data;

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 h from now (Unix ms)

    const username = generateUsername(name);
    const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a3fff,6b21ff,00e5a0&fontFamily=Arial&fontSize=40`;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      username,
      avatarUrl: defaultAvatar,
      role: 'client',
      emailVerified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpiresAt: verifyExpiresAt,
      verifyEmailLastSentAt: Date.now(),
      // Only accounts created from this point on are eligible for the $5
      // phone-verification signup bonus — pre-existing users never get this field.
      eligibleForSignupBonus: true,
    });

    // Must be awaited — on serverless (Vercel) the function execution is frozen
    // right after the response is sent, which silently kills any in-flight
    // fire-and-forget network call before it reaches Resend. A failed send
    // is logged but never blocks account creation from succeeding.
    try {
      await sendVerificationEmail(email, name, verifyToken);
    } catch (err) {
      console.error('[register] email send failed:', err);
    }

    return NextResponse.json(
      { success: true, data: userToDocument(user) },
      { status: 201 },
    );
  } catch (err) {
    return errorResponse(err);
  }
}
