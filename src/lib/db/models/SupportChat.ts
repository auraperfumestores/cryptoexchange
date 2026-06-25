import { Schema, model, models, type Model } from 'mongoose';

export type SupportChatStatus = 'open' | 'resolved';
export type LastSenderRole = 'user' | 'agent';

export interface SupportChatAttrs {
  userId?: string;
  name: string;
  email: string;
  reason: string;
  status: SupportChatStatus;
  urgent: boolean;
  telegramTopicId?: number;
  lastMessageAt: number;
  lastSenderRole: LastSenderRole;
  reminderSentAt?: number;
}

const SupportChatSchema = new Schema<SupportChatAttrs>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    reason: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
    urgent: { type: Boolean, default: false },
    telegramTopicId: { type: Number, index: true },
    lastMessageAt: { type: Number, default: () => Date.now(), index: true },
    lastSenderRole: { type: String, enum: ['user', 'agent'], default: 'user' },
    reminderSentAt: { type: Number },
  },
  { timestamps: true },
);

export const SupportChat: Model<SupportChatAttrs> =
  (models.SupportChat as Model<SupportChatAttrs>) || model<SupportChatAttrs>('SupportChat', SupportChatSchema);

export function supportChatToDocument(doc: any) {
  return {
    _id: String(doc._id),
    userId: doc.userId,
    name: doc.name,
    email: doc.email,
    reason: doc.reason,
    status: doc.status,
    urgent: !!doc.urgent,
    lastMessageAt: doc.lastMessageAt,
    lastSenderRole: doc.lastSenderRole,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
  };
}
