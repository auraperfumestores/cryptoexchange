import mongoose, { Schema, model, models, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserDocument, UserRole, KycStatus } from '@/types';

export interface ProStatus {
  active: boolean;
  activatedAt: Date | null;
  expiresAt: Date | null;
  paymentId: string | null;
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
    proStatus: {
      active:      { type: Boolean, default: false },
      activatedAt: { type: Date,    default: null  },
      expiresAt:   { type: Date,    default: null  },
      paymentId:   { type: String,  default: null  },
    },
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
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
    updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
  };
}

export function generateUsername(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'trader';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}_${suffix}`;
}
