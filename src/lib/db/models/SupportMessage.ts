import { Schema, model, models, type Model } from 'mongoose';

export type SupportMessageRole = 'user' | 'agent' | 'system';

export interface SupportMessageAttrs {
  chatId: string;
  role: SupportMessageRole;
  text?: string;
  imageUrls?: string[];
  telegramMessageId?: number;
}

const SupportMessageSchema = new Schema<SupportMessageAttrs>(
  {
    chatId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'agent', 'system'], required: true },
    text: { type: String, trim: true, maxlength: 4000 },
    imageUrls: { type: [String], default: [] },
    telegramMessageId: { type: Number },
  },
  { timestamps: true },
);

export const SupportMessage: Model<SupportMessageAttrs> =
  (models.SupportMessage as Model<SupportMessageAttrs>) || model<SupportMessageAttrs>('SupportMessage', SupportMessageSchema);

export function supportMessageToDocument(doc: any) {
  return {
    _id: String(doc._id),
    chatId: String(doc.chatId),
    role: doc.role,
    text: doc.text ?? '',
    imageUrls: doc.imageUrls ?? [],
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
  };
}
