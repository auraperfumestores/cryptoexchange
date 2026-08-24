import mongoose, { Schema, model, models, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { UserDocument, UserRole, KycStatus } from '@/types';

export interface ProStatus {
  active: boolean;
  activatedAt: Date | null;
  expiresAt: Date | null;
  paymentId: string | null;
}

export interface CustomLimits {
  enabled:     boolean;
  minBuyUsdt:  number;
  minSellUsdt: number;
}

export interface UserAttrs {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  username?: string;
  avatarUrl?: string;
  role?: UserRole;
  kycStatus?: KycStatus;
  isActive?: boolean;
  emailVerified?: boolean;
  emailVerifyToken?: string;
  emailVerifyExpiresAt?: number;
  verifyEmailLastSentAt?: number;
  passwordResetToken?: string;
  passwordResetExpiresAt?: number;
  phoneVerified?: boolean;
  proStatus?: ProStatus;
  eligibleForSignupBonus?: boolean;
  signupBonusGranted?: boolean;
  kycLinkToken?: string;
  /** When true, sell orders can fall back to the user's PlatformWallet balance
   *  if their connected on-chain wallet has insufficient USDT. Disabled by default;
   *  admin-controlled per user. */
  platformWalletFallback?: boolean;
  /** Admin-set per-user overrides for the widget's buy/sell minimums.
   *  When enabled, these replace the global WidgetLimits for this user only. */
  customLimits?: CustomLimits;
  /** When false, this user's wallets are excluded from the automated balance monitoring
   *  cron job. Defaults to true — all users are monitored unless explicitly disabled. */
  walletMonitoring?: boolean;
  /** Permanent, unique shareable code — generated once at signup, never rotated. */
  referralCode?: string;
  /** Set once at signup if the user registered via another user's referral link.
   *  Never changes afterward — a user can only ever have been referred by one person. */
  referredBy?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<UserAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false, minlength: 8 },
    phone: { type: String, trim: true, default: '' },
    username: { type: String, trim: true, maxlength: 30, sparse: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['client', 'admin'], default: 'client', index: true },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpiresAt: { type: Number, select: false },
    verifyEmailLastSentAt: { type: Number, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiresAt: { type: Number, select: false },
    phoneVerified: { type: Boolean, default: false },
    // Generated once on first use and never rotated — this is the user's permanent
    // KYC verification link. Admins can reset the *submission* (see KycSubmission)
    // without ever changing this token, so a bookmarked/shared link keeps working.
    kycLinkToken: { type: String, unique: true, sparse: true, index: true },
    // Set true only at signup time (see /api/auth/register) — existing users created
    // before this feature shipped never get this field, so they're correctly excluded
    // from the $5 phone-verification signup bonus.
    eligibleForSignupBonus: { type: Boolean, default: false },
    signupBonusGranted:     { type: Boolean, default: false },
    proStatus: {
      active:      { type: Boolean, default: false },
      activatedAt: { type: Date,    default: null  },
      expiresAt:   { type: Date,    default: null  },
      paymentId:   { type: String,  default: null  },
    },
    platformWalletFallback: { type: Boolean, default: false },
    walletMonitoring:       { type: Boolean, default: true  },
    customLimits: {
      enabled:     { type: Boolean, default: false },
      minBuyUsdt:  { type: Number,  default: 10    },
      minSellUsdt: { type: Number,  default: 10    },
    },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password || '');
};

export const User: Model<UserAttrs> =
  (models.User as Model<UserAttrs>) || model<UserAttrs>('User', UserSchema);

export function userToDocument(doc: any): UserDocument {
  return {
    _id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    username: doc.username,
    avatarUrl: doc.avatarUrl,
    role: doc.role,
    kycStatus: doc.kycStatus,
    isActive: doc.isActive,
    emailVerified: doc.emailVerified ?? false,
    phoneVerified: doc.phoneVerified ?? false,
    proStatus: doc.proStatus ? {
      active:      !!doc.proStatus.active,
      activatedAt: doc.proStatus.activatedAt ? new Date(doc.proStatus.activatedAt).toISOString() : null,
      expiresAt:   doc.proStatus.expiresAt   ? new Date(doc.proStatus.expiresAt).toISOString()   : null,
    } : undefined,
    platformWalletFallback: doc.platformWalletFallback ?? false,
    walletMonitoring:       doc.walletMonitoring !== false, // missing field → true (default enabled)
    customLimits: doc.customLimits ? {
      enabled:     !!doc.customLimits.enabled,
      minBuyUsdt:  doc.customLimits.minBuyUsdt  ?? 10,
      minSellUsdt: doc.customLimits.minSellUsdt ?? 10,
    } : undefined,
    referralCode: doc.referralCode,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
    updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
  };
}

/** Returns the user's permanent KYC link token, generating + persisting one
 *  on first call. Safe to call repeatedly — idempotent once a token exists. */
export async function ensureKycLinkToken(userId: string): Promise<string> {
  const existing = await User.findById(userId).select('kycLinkToken').lean<{ kycLinkToken?: string }>();
  if (existing?.kycLinkToken) return existing.kycLinkToken;

  const token = crypto.randomBytes(24).toString('hex');
  await User.findByIdAndUpdate(userId, { kycLinkToken: token });
  return token;
}

export function generateUsername(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'trader';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}_${suffix}`;
}

/** Returns the user's permanent referral code, generating + persisting one on
 *  first call. Idempotent — accounts created before the referral program shipped
 *  get theirs backfilled the first time they open the Refer & Earn panel. */
export async function ensureReferralCode(userId: string, name: string): Promise<string | null> {
  const existing = await User.findById(userId).select('referralCode name').lean<{ referralCode?: string; name?: string }>();
  if (existing?.referralCode) return existing.referralCode;

  // Backfill for accounts created before the referral program shipped. Retries on
  // the (vanishingly rare) unique-index collision rather than failing the request.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode(existing?.name ?? name);
    try {
      await User.findByIdAndUpdate(userId, { referralCode: code });
      return code;
    } catch {
      // duplicate key — regenerate and retry
    }
  }
  console.error('[referral] could not generate a unique referral code for', userId);
  return null;
}

/** Short, shareable referral code — e.g. "RAMAN4F2Q". Not guaranteed globally
 *  unique by construction, but collision odds are negligible (36^6 combos per
 *  name prefix); the unique index on User.referralCode is the real guarantee. */
export function generateReferralCode(name: string): string {
  const base = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'USER';
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `${base}${suffix}`;
}
