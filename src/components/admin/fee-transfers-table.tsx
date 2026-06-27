'use client';

interface FeeTransferRow {
  _id: string;
  userId: string;
  network: string;
  toAddress: string;
  amountNative: number;
  nativeSymbol: string;
  txHash?: string;
  status: 'sent' | 'failed';
  errorMsg?: string;
  contractSuccess: boolean | null;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  walletApproved: boolean | null;
}

function shortAddr(a: string) {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 99, background: bg, color, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export function FeeTransfersTable({ rows, totalSent }: { rows: FeeTransferRow[]; totalSent: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
        background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 16,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L2.5 4v4c0 3 2.4 5.4 5.5 6.5 3.1-1.1 5.5-3.5 5.5-6.5V4L8 1.5z" stroke="#818CF8" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M5.5 8l1.8 1.8L10.5 6" stroke="#818CF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>Total BNB sent to date</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '2px 0 0', fontFamily: 'var(--fr-font-mono)' }}>{totalSent.toFixed(6)} BNB</p>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fr-text-tertiary)' }}>{rows.length} record{rows.length === 1 ? '' : 's'}</div>
      </div>

      <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--fr-border-subtle)' }}>
                {['Customer', 'Wallet', 'Network', 'Amount', 'Status', 'Approval', 'When'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fr-text-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fr-text-tertiary)', fontSize: 13 }}>No fee transfers yet.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--fr-border-subtle)' }}>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{r.customerName}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fr-text-tertiary)' }}>{r.customerEmail}</p>
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', fontFamily: 'var(--fr-font-mono)', fontSize: 12, color: 'var(--fr-text-secondary)' }}>
                    {shortAddr(r.toAddress)}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', color: 'var(--fr-text-secondary)' }}>{r.network}</td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-text-primary)' }}>
                    {r.amountNative.toFixed(6)} {r.nativeSymbol}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    {r.status === 'sent'
                      ? <Badge color="#00E5A0" bg="rgba(0,229,160,0.12)">SENT</Badge>
                      : <Badge color="#F87171" bg="rgba(248,113,113,0.12)">FAILED</Badge>}
                    {r.status === 'failed' && r.errorMsg && (
                      <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--fr-text-tertiary)', maxWidth: 220 }}>{r.errorMsg}</p>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                    {r.walletApproved === true && <Badge color="#CCFF00" bg="rgba(204,255,0,0.12)">APPROVED</Badge>}
                    {r.walletApproved === false && <Badge color="#FBBF24" bg="rgba(251,191,36,0.12)">PENDING</Badge>}
                    {r.walletApproved === null && <Badge color="rgba(255,255,255,0.5)" bg="rgba(255,255,255,0.06)">UNKNOWN</Badge>}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'top', fontSize: 12, color: 'var(--fr-text-tertiary)', whiteSpace: 'nowrap' }}>{formatWhen(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
