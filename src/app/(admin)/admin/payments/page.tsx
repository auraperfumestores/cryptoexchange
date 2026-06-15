import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, PaymentMethod, rateToDocument, paymentMethodToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { PaymentEditor } from '@/components/admin/payment-editor';
import { PaymentCreator } from '@/components/admin/payment-creator';
import type { RateDocument, PaymentMethodDocument } from '@/types';

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();

  const [rates, methods] = await Promise.all([
    Rate.find({}).sort({ symbol: 1, network: 1 }).lean(),
    PaymentMethod.find({}).sort({ displayOrder: 1 }).lean(),
  ]);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary">Payment methods</h1>
            <p className="text-sm text-muted">Configure how clients pay or receive INR — UPI, bank transfer, or cash.</p>
          </div>
          <PaymentCreator />
        </div>
        <PaymentEditor methods={methods.map(paymentMethodToDocument) as PaymentMethodDocument[]} />
      </div>
    </ClientShell>
  );
}