import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase, User } from '@/lib/db';
import type { SessionUser } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'client' | 'admin';
    kycStatus?: string;
    username?: string;
    avatarUrl?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'client' | 'admin';
    kycStatus?: string;
    username?: string;
    avatarUrl?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Scope the cookie to the whole domain so it's valid on both swappinr.com and
        // www.swappinr.com — without this, a session set on one host isn't sent on the other.
        domain: process.env.NODE_ENV === 'production' ? '.swappinr.com' : undefined,
      },
    },
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectToDatabase();

        // Use the Mongoose model directly (not .lean()) so that .select('+password')
        // works as expected against the schema's `select: false` setting.
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        if (!user.isActive) return null;
        // Admins bypass email verification; regular users must verify
        if (user.role !== 'admin' && !user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role as 'client' | 'admin',
          kycStatus: user.kycStatus,
          username: user.username,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
        token.kycStatus = user.kycStatus;
        token.username  = user.username;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id        = token.id;
        session.user.role      = token.role;
        session.user.kycStatus = token.kycStatus as any;
        session.user.username  = token.username;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
};