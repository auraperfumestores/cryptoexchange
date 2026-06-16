'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Receipt, MagnifyingGlass } from '@phosphor-icons/react';
import { formatINR, formatCrypto, timeAgo, shortenAddress, getNetworkConfig } from '@/lib/utils';
import type { TransactionDocument } from '@/types';

interface TransactionListProps {
  transactions: TransactionDocument[];
  isAdmin?: boolean;
}

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' }> = {
  awaiting_crypto: { label: 'Awaiting crypto', variant: 'warning' },
  awaiting_payment: { label: 'Awaiting payment', variant: 'info' },
  confirming: { label: 'Confirming', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  disputed: { label: 'Disputed', variant: 'error' },
};

export function TransactionList({ transactions, isAdmin = false }: TransactionListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.orderId.toLowerCase().includes(q) ||
        tx.userName.toLowerCase().includes(q) ||
        tx.userEmail.toLowerCase().includes(q) ||
        tx.txHash?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-16 w-16" />}
        title="No transactions yet"
        description="Your trade history will appear here once you place an order."
        action={<Link href="/trade"><Button>Start trading</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID, user, or tx hash"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftAddon={<MagnifyingGlass className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-lg border border-mist bg-cloud px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="awaiting_crypto">Awaiting crypto</option>
              <option value="awaiting_payment">Awaiting payment</option>
              <option value="confirming">Confirming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-lg border border-mist bg-cloud px-3 text-sm"
            >
              <option value="all">All types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search or filter." />
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-mist">
            {filtered.map((tx) => {
              const s = STATUS_LABEL[tx.status];
              return (
                <li key={tx._id}>
                  <Link
                    href={`/transactions/${tx._id}`}
                    className="block px-5 py-4 hover:bg-mist/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tx.type === 'buy' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary'}`}>
                          {tx.type === 'buy' ? '↓' : '↑'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono-crypto text-sm font-semibold text-secondary">{tx.orderId}</p>
                            <Badge variant={tx.type === 'buy' ? 'success' : 'primary'} size="sm">
                              {tx.type === 'buy' ? 'Buy' : 'Sell'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted mt-0.5">
                            {tx.cryptoSymbol} · {getNetworkConfig(tx.network).label}
                            {isAdmin && ` · ${tx.userName}`}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:block text-right shrink-0">
                        <p className="font-mono-crypto text-sm font-semibold text-secondary">
                          {formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)}
                        </p>
                        <p className="text-xs text-muted">{formatINR(tx.inrAmount)}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge variant={s.variant} dot size="sm">{s.label}</Badge>
                        <p className="text-xs text-muted mt-1">{timeAgo(tx.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}