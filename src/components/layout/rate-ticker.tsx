'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Pulse } from '@phosphor-icons/react';
import { formatRate } from '@/lib/utils';
import type { RateDocument } from '@/types';

function TickerItem({ label, value, previousValue }: { label: string; value: number; previousValue?: number }) {
  const changed = previousValue !== undefined && previousValue !== value;
  const up = previousValue !== undefined ? previousValue <= value : true;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Pulse className="h-3 w-3 text-blue-400 animate-pulse" />
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-bold text-white font-mono">₹{formatRate(value)}</span>
      {changed && (up
        ? <ArrowUp className="h-3 w-3 text-emerald-400" />
        : <ArrowDown className="h-3 w-3 text-red-400" />
      )}
    </span>
  );
}

export function RateTicker({ rates }: { rates: RateDocument[] }) {
  const [prev, setPrev] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!rates?.length) return;
    const next: Record<string, number> = {};
    rates.forEach((r) => { next[`${r.symbol}-${r.network}`] = r.buyRate; });
    setPrev(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.length]);

  if (!rates?.length) return null;

  const items = rates.flatMap((r) => [
    <TickerItem key={r._id + 'b'} label={`${r.symbol}/${r.network} BUY`} value={r.buyRate} previousValue={prev[`${r.symbol}-${r.network}`]} />,
    <span key={r._id + 'sep'} className="h-3 w-px flex-shrink-0 bg-white/10" />,
    <TickerItem key={r._id + 's'} label={`${r.symbol}/${r.network} SELL`} value={r.sellRate} />,
    <span key={r._id + 'sep2'} className="mx-2 h-3 w-px flex-shrink-0 bg-white/10" />,
  ]);

  return (
    <div className="relative overflow-hidden border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,18,41,0.9)' }}>
      <div className="absolute inset-y-0 left-0 w-12 z-10" style={{ background: 'linear-gradient(to right, rgba(13,18,41,1), transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-12 z-10" style={{ background: 'linear-gradient(to left, rgba(13,18,41,1), transparent)' }} />
      <div className="flex items-center gap-6 overflow-hidden py-2 px-4">
        <div className="ticker-scroll flex gap-8">
          {items}{items}
        </div>
      </div>
    </div>
  );
}
