import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase, User, userToDocument } from '@/lib/db';
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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'client',
      emailVerified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpiresAt: verifyExpiresAt,
    });

    // Fire-and-forget — don't block registration if mail fails
    sendVerificationEmail(email, name, verifyToken).catch((err) =>
      console.error('[register] email send failed:', err),
    );

    return NextResponse.json(
      { success: true, data: userToDocument(user) },
      { status: 201 },
    );
  } catch (err) {
    return errorResponse(err);
  }
}
