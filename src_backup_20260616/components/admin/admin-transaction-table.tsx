'use client';

import { TransactionList } from '@/components/client/transaction-list';
import type { TransactionDocument } from '@/types';

export function AdminTransactionTable({ transactions }: { transactions: TransactionDocument[] }) {
  return <TransactionList transactions={transactions} isAdmin />;
}