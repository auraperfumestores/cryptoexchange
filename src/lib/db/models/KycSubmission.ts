import mongoose, { Schema, model, models, type Model } from 'mongoose';

export type KycDocType = 'aadhaar' | 'pan' | 'driving_license';
export type KycSubmissionStatus = 'collecting' | 'pending_review' | 'verified' | 'rejected';

export interface KycSubmissionAttrs {
  userId: mongoose.Schema.Types.ObjectId | string;
  docType?: KycDocType;
  frontImageUrl?: string;
  backImageUrl?: string;
  faceImageUrl?: string;
  status: KycSubmissionStatus;
  rejectionReason?: string;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  reviewedBy?: string;
  reviewedByName?: string;
  resetCount: number;
  mobileContinueToken?: string;
  mobileContinueExpiresAt?: Date | null;
}

const KycSubmissionSchema = new Schema<KycSubmissionAttrs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    docType: { type: String, enum: ['aadhaar', 'pan', 'driving_license'] },
    frontImageUrl: { type: String },
    backImageUrl: { type: String },
    faceImageUrl: { type: String },
    status: {
      type: String,
      enum: ['collecting', 'pending_review', 'verified', 'rejected'],
      default: 'collecting',
      index: true,
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String },
    reviewedByName: { type: String },
    resetCount: { type: Number, default: 0 },
    mobileContinueToken: { type: String, index: true },
    mobileContinueExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const KycSubmission: Model<KycSubmissionAttrs> =
  (models.KycSubmission as Model<KycSubmissionAttrs>) || model<KycSubmissionAttrs>('KycSubmission', KycSubmissionSchema);

export interface KycSubmissionDocument {
  _id: string;
  userId: string;
  docType?: KycDocType;
  frontImageUrl?: string;
  backImageUrl?: string;
  faceImageUrl?: string;
  status: KycSubmissionStatus;
  rejectionReason?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string;
  resetCount: number;
  createdAt: string;
  updatedAt: string;
}

export function kycSubmissionToDocument(doc: any): KycSubmissionDocument {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    docType: doc.docType,
    frontImageUrl: doc.frontImageUrl,
    backImageUrl: doc.backImageUrl,
    faceImageUrl: doc.faceImageUrl,
    status: doc.status,
    rejectionReason: doc.rejectionReason,
    submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toISOString() : null,
    reviewedAt: doc.reviewedAt ? new Date(doc.reviewedAt).toISOString() : null,
    reviewedByName: doc.reviewedByName,
    resetCount: doc.resetCount ?? 0,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
    updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
  };
}
