import { z } from 'zod';

const upiDetails = z.object({
  upiId: z.string().trim().regex(/^[\w.-]{3,}@[a-zA-Z]{2,}$/, 'Enter a valid UPI ID like name@bank'),
  qrImageUrl: z.string().url().optional().or(z.literal('')),
});

const bankDetails = z.object({
  bankName: z.string().trim().min(2, 'Bank name is required').max(80),
  accountNumber: z.string().trim().regex(/^\d{9,20}$/, 'Enter a valid account number'),
  ifscCode: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
  accountHolder: z.string().trim().min(2, 'Account holder name is required').max(80),
  branch: z.string().trim().max(80).optional(),
});

const cashDetails = z.object({
  location: z.string().trim().min(3, 'Location is required').max(200),
  meetingInstructions: z.string().trim().min(3, 'Meeting instructions are required').max(500),
  contactNumber: z
    .string()
    .trim()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid contact number')
    .optional()
    .or(z.literal('')),
});

export const paymentMethodSchema = z
  .object({
    type: z.enum(['upi', 'bank_transfer', 'cash']),
    label: z.string().trim().min(2, 'Label is required').max(80),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().int().min(0).max(999).optional().default(0),
    details: z.union([upiDetails, bankDetails, cashDetails]),
  })
  .superRefine((val, ctx) => {
    const isUpi = val.type === 'upi';
    const isBank = val.type === 'bank_transfer';
    const isCash = val.type === 'cash';
    const d: any = val.details;
    if (isUpi && !d.upiId) {
      ctx.addIssue({ code: 'custom', path: ['details', 'upiId'], message: 'UPI ID is required' });
    }
    if (isBank) {
      if (!d.bankName) ctx.addIssue({ code: 'custom', path: ['details', 'bankName'], message: 'Bank name is required' });
      if (!d.accountNumber) ctx.addIssue({ code: 'custom', path: ['details', 'accountNumber'], message: 'Account number is required' });
      if (!d.ifscCode) ctx.addIssue({ code: 'custom', path: ['details', 'ifscCode'], message: 'IFSC is required' });
      if (!d.accountHolder) ctx.addIssue({ code: 'custom', path: ['details', 'accountHolder'], message: 'Account holder is required' });
    }
    if (isCash) {
      if (!d.location) ctx.addIssue({ code: 'custom', path: ['details', 'location'], message: 'Location is required' });
      if (!d.meetingInstructions) ctx.addIssue({ code: 'custom', path: ['details', 'meetingInstructions'], message: 'Instructions are required' });
    }
  });

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
