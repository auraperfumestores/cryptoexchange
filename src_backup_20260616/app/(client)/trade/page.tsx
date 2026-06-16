import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, PaymentMethod, Wallet, rateToDocument, paymentMethodToDocument, walletToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { TradeForm } from '@/components/client/trade-form';
import type { RateDocument, PaymentMethodDocument, WalletDocument } from '@/types';

export default async function TradePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  await connectToDatabase();

  const [rates, paymentMethods, wallets] = await Promise.all([
    Rate.find({ isActive: true }).sort({ symbol: 1, network: 1 }).lean(),
    PaymentMethod.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    Wallet.find({ userId: session.user.id }).lean(),
  ]);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-secondary">Trade</h1>
        <TradeForm
          type="sell"
          rates={rates.map(rateToDocument) as RateDocument[]}
          paymentMethods={paymentMethods.map(paymentMethodToDocument) as PaymentMethodDocument[]}
          wallets={wallets.map(walletToDocument) as WalletDocument[]}
        />
      </div>
    </ClientShell>
  );
}