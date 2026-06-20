'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import type { KycStatus } from '@/types';
import { PhoneVerifyModal } from '@/components/ui/phone-verify-modal';

interface ProfileUser {
  id: string; name: string; email: string; phone?: string;
  username?: string; avatarUrl?: string; kycStatus?: KycStatus;
  emailVerified?: boolean; phoneVerified?: boolean; role?: string; createdAt?: string;
}

interface Limits { perTransaction: number; daily: number; monthly: number }

/* ── helpers ── */
function fmt(n: number) {
  if (n >= 100_00_000) return `₹${(n / 100_00_000).toFixed(0)} Cr`;
  if (n >= 1_00_000)   return `₹${(n / 1_00_000).toFixed(0)} L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}
function dicebear(name: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a3fff,6b21ff,00e5a0&fontFamily=Arial&fontSize=40`;
}

/* ── KYC badge config ── */
const KYC_CFG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  unverified: { label: 'Not Verified', color: '#F87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', dot: '#F87171' },
  pending:    { label: 'Pending',      color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',  dot: '#FBBF24' },
  verified:   { label: 'Verified',     color: '#00E5A0', bg: 'rgba(0,229,160,0.1)',    border: 'rgba(0,229,160,0.25)',   dot: '#00E5A0' },
  rejected:   { label: 'Rejected',     color: '#F87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', dot: '#F87171' },
};

/* ── Change Password Modal ── */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [cur,     setCur]     = useState('');
  const [next,    setNext]    = useState('');
  const [confirm, setConfirm] = useState('');
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(next)).length;
  const strengthColor = ['', '#F87171', '#FBBF24', '#60A5FA', '#00E5A0'][score];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8)     { setError('New password must be at least 8 characters.'); return; }
    if (next !== confirm)    { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/user/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.3),#CCFF00,rgba(204,255,0,0.3))' }} />
        <div style={{ padding: '24px 24px 28px' }}>
          {!done ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>Change Password</h3>
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>

              {error && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#F87171' }}>{error}</div>}

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Current password', val: cur, set: setCur },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>
                    <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} required
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={show ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} required minLength={8} placeholder="Min. 8 characters"
                      style={{ width: '100%', padding: '12px 44px 12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </button>
                  </div>
                  {next && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                        {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? strengthColor : 'rgba(255,255,255,0.08)', transition: 'all 0.2s' }} />)}
                      </div>
                      <span style={{ fontSize: 11, color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Confirm new password</label>
                  <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${confirm && next !== confirm ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  {confirm && next !== confirm && <p style={{ fontSize: 11, color: '#F87171', margin: '5px 0 0' }}>Passwords don't match</p>}
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: loading ? 'rgba(255,255,255,0.3)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  {loading ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Updating…</> : 'Update Password →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,229,160,0.08)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12L9.5 18.5L21 7" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Password updated!</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 22px', lineHeight: 1.6 }}>Your password has been changed successfully.</p>
              <button onClick={onClose} style={{ padding: '11px 24px', borderRadius: 11, background: '#CCFF00', color: '#000', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer' }}>Done →</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Avatar upload button ── */
function AvatarUpload({ current, name, onSave }: { current: string; name: string; onSave: (url: string) => void }) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(current);
  const [loading, setLoading] = useState(false);

  // Sync preview when parent loads fresh data from DB
  useEffect(() => { if (current) setPreview(current); }, [current]);

  const displaySrc = preview || dicebear(name);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const raw = ev.target?.result as string;
      // Compress to max 200×200 JPEG before saving (keeps payload under ~30KB)
      const img = new Image();
      img.onload = async () => {
        const MAX = 200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const url = canvas.toDataURL('image/jpeg', 0.82);
        setPreview(url);
        setLoading(true);
        try {
          const res = await fetch('/api/user/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: url }),
          });
          if (!res.ok) throw new Error('Save failed');
          onSave(url);
        } catch { alert('Failed to save avatar. Please try again.'); setPreview(current); }
        finally { setLoading(false); }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} onClick={() => inputRef.current?.click()}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(204,255,0,0.3)', boxShadow: '0 0 0 1px rgba(204,255,0,0.1)', cursor: 'pointer', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={displaySrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).src = dicebear(name); }} />
      </div>
      {/* Camera overlay */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#CCFF00', border: '2px solid #080808', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        {loading
          ? <div style={{ width: 12, height: 12, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" stroke="#000" strokeWidth="2"/></svg>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

export function ProfileContent({ user: initialUser }: { user: { name: string; email: string; role: string; phone?: string; createdAt?: string; kycStatus?: string; username?: string; avatarUrl?: string; emailVerified?: boolean; phoneVerified?: boolean } }) {
  const [user,         setUser]         = useState<ProfileUser | null>(null);
  const [limits,       setLimits]       = useState<Limits | null>(null);
  const [editName,     setEditName]     = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [nameVal,      setNameVal]      = useState('');
  const [usernameVal,  setUsernameVal]  = useState('');
  const [saving,       setSaving]       = useState(false);
  const [showPassModal,setShowPassModal]= useState(false);
  const [showPhoneModal,setShowPhoneModal]= useState(false);
  const [toast,        setToast]        = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => {
      if (d.success) { setUser({ ...d.data, phoneVerified: d.data.phoneVerified ?? false }); setNameVal(d.data.name); setUsernameVal(d.data.username ?? ''); }
    });
    fetch('/api/exchange-limits').then(r => r.json()).then(d => { if (d.success) setLimits(d.limits); });
  }, []);

  async function saveName() {
    if (!nameVal.trim() || !user) return;
    setSaving(true);
    try {
      await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameVal }) });
      setUser(u => u ? { ...u, name: nameVal } : u);
      setEditName(false);
      showToast('Name updated');
    } catch {} finally { setSaving(false); }
  }

  async function saveUsername() {
    if (!user) return;
    setSaving(true);
    try {
      await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usernameVal }) });
      setUser(u => u ? { ...u, username: usernameVal } : u);
      setEditUsername(false);
      showToast('Username updated');
    } catch {} finally { setSaving(false); }
  }

  const profile = user ?? { ...initialUser, kycStatus: (initialUser.kycStatus ?? 'unverified') as KycStatus };
  const kyc     = KYC_CFG[profile.kycStatus ?? 'unverified'] ?? KYC_CFG.unverified;
  const avatarUrl = profile.avatarUrl ?? '';

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#00E5A0', color: '#000', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,229,160,0.3)', animation: 'fadein 0.2s ease' }}>
          ✓ {toast}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Profile</h1>
        <p style={{ margin: '5px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.38)' }}>Manage your account and preferences</p>
      </div>

      {/* ── Hero avatar card ── */}
      <div style={{
        background: '#111111',
        border: '1px solid rgba(204,255,0,0.12)',
        borderRadius: 20, overflow: 'hidden',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#CCFF00,transparent)' }} />
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <AvatarUpload
          current={avatarUrl}
          name={profile.name}
          onSave={url => setUser(u => u ? { ...u, avatarUrl: url } : u)}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          {editName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <input value={nameVal} onChange={e => setNameVal(e.target.value)} maxLength={80} autoFocus
                style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(204,255,0,0.3)', borderRadius: 10, fontSize: 18, fontWeight: 900, color: '#fff', outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.02em', minWidth: 0 }} />
              <button onClick={saveName} disabled={saving} style={{ padding: '8px 14px', borderRadius: 9, background: '#CCFF00', color: '#000', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', flexShrink: 0 }}>Save</button>
              <button onClick={() => { setEditName(false); setNameVal(profile.name); }} style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', flexShrink: 0 }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</h2>
              <button onClick={() => setEditName(true)} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}

          {/* Username */}
          {editUsername ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>@</span>
              <input value={usernameVal} onChange={e => setUsernameVal(e.target.value)} maxLength={30} autoFocus
                style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(204,255,0,0.25)', borderRadius: 8, fontSize: 13, color: '#CCFF00', outline: 'none', fontFamily: 'inherit', minWidth: 0 }} />
              <button onClick={saveUsername} disabled={saving} style={{ padding: '6px 12px', borderRadius: 7, background: '#CCFF00', color: '#000', fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer' }}>Save</button>
              <button onClick={() => { setEditUsername(false); setUsernameVal(profile.username ?? ''); }} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>@{profile.username || 'set_username'}</span>
              <button onClick={() => setEditUsername(true)} style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* KYC Badge */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: kyc.bg, color: kyc.color, border: `1px solid ${kyc.border}` }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: kyc.dot, flexShrink: 0 }} />
              KYC: {kyc.label}
            </span>
            {/* Role Badge */}
            {profile.role === 'admin' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
                ⚙ Admin
              </span>
            )}
            {/* Email verified */}
            {profile.emailVerified && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(0,229,160,0.08)', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.2)' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5L3.5 7.5L9 2.5" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Email verified
              </span>
            )}
            {/* Phone verified / verify button */}
            {profile.phoneVerified && profile.phone ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(0,229,160,0.08)', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.2)' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5L3.5 7.5L9 2.5" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                +91 {profile.phone} verified
              </span>
            ) : (
              <button onClick={() => setShowPhoneModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(248,113,113,0.08)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8a15.4 15.4 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Verify mobile
              </button>
            )}
            {memberSince && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 600 }}>Member since {memberSince}</span>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* ── Account Details ── */}
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#CCFF00" strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#CCFF00" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Account Details</h2>
        </div>
        <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {[
            { label: 'Full Name',  value: profile.name, mono: false },
            { label: 'Email',      value: profile.email, mono: true  },
            { label: 'Phone', value: profile.phone ? `+91 ${profile.phone}${profile.phoneVerified ? ' ✓' : ' (unverified)'}` : '—', mono: false },
            { label: 'Account type', value: 'Individual', mono: false },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── KYC Status ── */}
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7V13C3 18.5 7.2 23.3 12 24C16.8 23.3 21 18.5 21 13V7L12 2Z" stroke={kyc.color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 12L10.5 14.5L16 9" stroke={kyc.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>KYC Verification</h2>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: kyc.bg, color: kyc.color, border: `1px solid ${kyc.border}` }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: kyc.dot }} />
            {kyc.label}
          </span>
        </div>
        <div style={{ padding: '16px 22px' }}>
          {profile.kycStatus === 'unverified' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#F87171', margin: '0 0 4px' }}>KYC verification required</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>Complete KYC to unlock higher transaction limits and full account access.</p>
              </div>
              <button style={{ padding: '9px 20px', borderRadius: 10, background: '#CCFF00', color: '#000', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                Start KYC →
              </button>
            </div>
          )}
          {profile.kycStatus === 'pending' && (
            <p style={{ fontSize: 13, color: '#FBBF24', margin: 0, lineHeight: 1.6 }}>Your KYC documents are under review. This typically takes 1–2 business days.</p>
          )}
          {profile.kycStatus === 'verified' && (
            <p style={{ fontSize: 13, color: '#00E5A0', margin: 0, lineHeight: 1.6 }}>✓ Identity verified — you have access to all transaction limits.</p>
          )}
          {profile.kycStatus === 'rejected' && (
            <div>
              <p style={{ fontSize: 13, color: '#F87171', margin: '0 0 8px', fontWeight: 700 }}>KYC verification was rejected.</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', lineHeight: 1.6 }}>Please contact support or resubmit with valid documents.</p>
              <button style={{ padding: '9px 20px', borderRadius: 10, background: '#CCFF00', color: '#000', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}>Resubmit KYC →</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Exchange Limits ── */}
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="#CCFF00" strokeWidth="1.5"/><path d="M3 10H21M8 14H10M14 14H16" stroke="#CCFF00" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Exchange Limits</h2>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            {profile.kycStatus === 'verified' ? 'Verified tier' : profile.kycStatus === 'pending' ? 'Pending tier' : 'Unverified tier'}
          </span>
        </div>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Per transaction', value: limits?.perTransaction, sub: 'Max per single order',    accent: '#CCFF00' },
            { label: 'Daily limit',     value: limits?.daily,          sub: 'Rolling 24-hour window',  accent: '#CCFF00' },
            { label: 'Monthly limit',   value: limits?.monthly,        sub: 'Calendar month total',    accent: '#CCFF00' },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{sub}</p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: accent, fontFamily: 'monospace' }}>
                {value != null ? fmt(value) : '—'}
              </span>
            </div>
          ))}
          {profile.kycStatus !== 'verified' && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0', lineHeight: 1.6 }}>
              Complete KYC verification to unlock higher limits — up to ₹10L per transaction.
            </p>
          )}
        </div>
      </div>

      {/* ── Security ── */}
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7V13C3 18.5 7.2 23.3 12 24C16.8 23.3 21 18.5 21 13V7L12 2Z" stroke="#CCFF00" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Security</h2>
        </div>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Email verified */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" stroke="#CCFF00" strokeWidth="1.5"/><path d="M2 6L12 13L22 6" stroke="#CCFF00" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Email verification</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Your email is verified and active</p>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#CCFF00', background: 'rgba(204,255,0,0.08)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(204,255,0,0.2)' }}>Active</span>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#CCFF00" strokeWidth="1.5"/><path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" stroke="#CCFF00" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="#CCFF00"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Password</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Keep a strong, unique password</p>
              </div>
            </div>
            <button onClick={() => setShowPassModal(true)} style={{ fontSize: 12, fontWeight: 800, color: '#000', background: '#CCFF00', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
              Change →
            </button>
          </div>
        </div>
      </div>

      {/* ── Sign out ── */}
      <div style={{ background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F87171', margin: 0 }}>Sign out</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '3px 0 0' }}>You'll need to log in again to access your account.</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Sign out →
        </button>
      </div>

      {showPassModal && <ChangePasswordModal onClose={() => setShowPassModal(false)} />}

      {showPhoneModal && (
        <PhoneVerifyModal
          currentPhone={profile.phone ?? ''}
          onVerified={phone => {
            setUser(u => u ? { ...u, phone, phoneVerified: true } : u);
            setShowPhoneModal(false);
            showToast('Mobile number verified!');
          }}
          onClose={() => setShowPhoneModal(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadein { from { opacity:0;transform:translateY(6px) } to { opacity:1;transform:none } }
      `}</style>
    </div>
  );
}
