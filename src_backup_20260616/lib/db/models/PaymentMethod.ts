import mongoose, { Schema, model, models } from 'mongoose';
import type { PaymentMethodDocument, PaymentMethodType, UpiDetails, BankDetails, CashDetails } from '@/types';

interface PaymentMethodAttrs {
  type: PaymentMethodType;
  label: string;
  isActive: boolean;
  displayOrder: number;
  // Storing as mixed; we validate per type in the API layer.
  details: UpiDetails | BankDetails | CashDetails;
}

const PaymentMethodSchema = new Schema<PaymentMethodAttrs>(
  {
    type: { type: String, enum: ['upi', 'bank_transfer', 'cash'], required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    details: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const PaymentMethod =
  (models.PaymentMethod as mongoose.Model<PaymentMethodAttrs>) ||
  model<PaymentMethodAttrs>('PaymentMethod', PaymentMethodSchema);

export function paymentMethodToDocument(doc: any): PaymentMethodDocument {
  const d = doc.details || {};
  return {
    _id: String(doc._id),
    type: doc.type,
    label: doc.label,
    isActive: !!doc.isActive,
    displayOrder: doc.displayOrder || 0,
    // Flatten the type-specific fields onto the surface for client convenience.
    upiId: d.upiId,
    upiQrImageUrl: d.qrImageUrl,
    bankName: d.bankName,
    accountNumber: d.accountNumber,
    ifscCode: d.ifscCode,
    accountHolder: d.accountHolder,
    branch: d.branch,
    location: d.location,
    meetingInstructions: d.meetingInstructions,
    contactNumber: d.contactNumber,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
    updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
  };
}
