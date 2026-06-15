import { NextResponse } from 'next/server';
import { connectToDatabase, User } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/seed
 *
 * Seeds an initial admin user from env vars.
 * - If no admin exists with this email, creates one.
 * - If an admin exists but the password hash does not match the
 *   current ADMIN_SEED_PASSWORD, updates the hash and reports it.
 *   This makes the endpoint safe to call again after env changes.
 * - Refuses to run in production unless explicitly allowed
 *   (set ALLOW_SEED_IN_PRODUCTION=1 to override).
 */
export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED_IN_PRODUCTION !== '1') {
      return NextResponse.json(
        { error: 'Seeding disabled in production. Set ALLOW_SEED_IN_PRODUCTION=1 to override.' },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const email = (process.env.ADMIN_SEED_EMAIL || 'admin@cryptoexchange.in').toLowerCase();
    const password = process.env.ADMIN_SEED_PASSWORD;
    if (!password) {
      return NextResponse.json({ error: 'ADMIN_SEED_PASSWORD env var not set' }, { status: 500 });
    }

    const existing = await User.findOne({ email }).select('+password');
    if (existing) {
      const matches = existing.password && (await bcrypt.compare(password, existing.password));
      if (matches) {
        return NextResponse.json({
          success: true,
          message: 'Admin user already exists with matching password',
          data: { email: existing.email, role: existing.role, passwordUpdated: false },
        });
      }
      // Password mismatch — reset it
      existing.password = password; // pre-save hook will hash
      if (existing.role !== 'admin') existing.role = 'admin';
      existing.isActive = true;
      existing.emailVerified = true;
      await existing.save();
      return NextResponse.json({
        success: true,
        message: 'Admin user password reset to match current env vars',
        data: { email: existing.email, role: existing.role, passwordUpdated: true },
      });
    }

    const admin = await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
      isActive: true,
      emailVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user seeded',
      data: { email: admin.email, role: admin.role, passwordUpdated: false },
    }, { status: 201 });
  } catch (err) {
    console.error('[seed]', err);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}