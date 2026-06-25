import type { LiveTrade } from '@/lib/data/live-trades';

export function TxCard({ trade, compact = false }: { trade: LiveTrade; compact?: boolean }) {
  const t = trade;
  return (
    <div className={`fr-tx-card fr-tx-card--${t.color}${compact ? ' fr-tx-card--compact' : ''}`}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '8px 8px', borderRadius: 'inherit', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, background: 'var(--fr-lime)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: '-0.02em' }}>SI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3.5" stroke="#4ADE80" strokeWidth="1.2"/><path d="M2 4L3.5 5.5L6 3" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#4ADE80', letterSpacing: '0.08em' }}>VERIFIED</span>
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.nameColor, marginBottom: 6 }}>{t.name}</div>
        <div style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--fr-lime)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 10 }}>{t.amount}</div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>TXN</div>
            <div style={{ fontSize: 9, fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-text-secondary)' }}>{t.txid}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.04em', marginBottom: 2 }}>{t.network}</div>
            <div style={{ fontSize: 9, color: 'var(--fr-text-tertiary)' }}>{t.time}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
