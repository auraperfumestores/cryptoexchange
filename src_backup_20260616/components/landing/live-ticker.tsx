'use client';

import { useEffect, useState } from 'react';

interface TickerItem {
  symbol: string;
  rate: number;
  change: number;
}

const PAIRS = [
  { symbol: 'USDT/INR', base: 83.5 },
  { symbol: 'BTC/INR', base: 5800000 },
  { symbol: 'ETH/INR', base: 310000 },
  { symbol: 'USDT/USD', base: 1.0 },
  { symbol: 'EUR/INR', base: 91 },
  { symbol: 'GBP/INR', base: 106 },
];

function randomWalk(base: number, volatility: number) {
  const change = (Math.random() - 0.48) * volatility;
  return Math.max(0, base + change);
}

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(
    () => PAIRS.map(p => ({ symbol: p.symbol, rate: p.base, change: 0 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev =>
        prev.map((item, i) => {
          const pair = PAIRS[i];
          const vol = pair.base * 0.0008;
          const newRate = randomWalk(item.rate, vol);
          const change = ((newRate - pair.base) / pair.base) * 100;
          return { ...item, rate: newRate, change };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const allItems = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-3"
      style={{
        background: 'var(--color-surface-dark)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="ticker-scroll">
        {allItems.map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-3 px-6">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{item.symbol}</span>
            <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {item.rate >= 1000
                ? item.rate.toLocaleString('en-IN', { maximumFractionDigits: 0 })
                : item.rate.toFixed(item.rate < 10 ? 4 : 2)}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: item.change >= 0 ? '#10B981' : '#EF4444' }}
            >
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            <span className="h-3 w-px" style={{ background: 'var(--color-border)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}