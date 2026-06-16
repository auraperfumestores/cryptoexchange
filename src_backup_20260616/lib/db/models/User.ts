import mongoose, { Schema, model, models, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserDocument, UserRole, KycStatus } from '@/types';

export interface UserAttrs {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  kycStatus?: KycStatus;
  isActive?: boolean;
  emailVerified?: boolean;
  emailVerifyToken?: string;
  emailVerifyExpiresAt?: number;
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
    role: doc.role,
    kycStatus: doc.kycStatus,
    isActive: doc.isActive,
    emailVerified: doc.emailVerified ?? false,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
    updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
  };
}
