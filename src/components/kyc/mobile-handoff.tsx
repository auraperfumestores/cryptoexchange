'use client';

import { useEffect, useRef, useState } from 'react';
import { compressImageFile } from '@/lib/kyc/client-image';

const C = {
  bg: '#050505', card: '#0d0d0f', card2: '#111113', lime: '#CCFF00',
  sub: 'rgba(255,255,255,0.52)', dim: 'rgba(255,255,255,0.30)',
  border: 'rgba(255,255,255,0.09)', danger: '#F87171', success: '#00E5A0',
};

type Phase = 'loading' | 'front' | 'back' | 'done' | 'expired' | 'busy';

export function MobileHandoff({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [busyLabel, setBusyLabel] = useState('');
  const [error, setError] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch(`/api/kyc/mobile/${token}`);
      const json = await res.json();
      if (!res.ok) { setPhase('expired'); return; }
      setPhase(!json.data.hasFront ? 'front' : !json.data.hasBack ? 'back' : 'done');
    } catch {
      setPhase('expired');
    }
  }

  async function handleFile(file: File) {
    const side = phase === 'front' ? 'front' : 'back';
    setPhase('busy'); setError('');
    try {
      setBusyLabel('Analyzing image quality…');
      const dataUrl = await compressImageFile(file);
      await new Promise(r => setTimeout(r, 700));
      setBusyLabel('Uploading securely…');
      const res = await fetch(`/api/kyc/mobile/${token}/upload`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, imageDataUrl: dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setPhase(side === 'front' ? 'back' : 'done');
    } catch (e: any) {
      setError(e.message);
      setPhase(side === 'front' ? 'front' : 'back');
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.5)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.25),#CCFF00,rgba(204,255,0,0.25))' }} />
        <div style={{ padding: '30px 26px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 22 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontSize: 12, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Swapp<span style={{ color: C.lime }}>INR</span></span>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: C.danger }}>{error}</div>
          )}

          {phase === 'loading' && (
            <Spinner label="Connecting to your session…" />
          )}
          {phase === 'busy' && (
            <Spinner label={busyLabel} />
          )}
          {phase === 'expired' && (
            <>
              <Icon stroke={C.danger} path="warn" />
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '14px 0 8px' }}>This link has expired</h2>
              <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, margin: 0 }}>Go back to your computer and generate a new QR code to continue.</p>
            </>
          )}
          {(phase === 'front' || phase === 'back') && (
            <>
              <Icon stroke={C.lime} path="doc" />
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '14px 0 8px' }}>
                Capture the {phase === 'front' ? 'front' : 'back'} of your ID
              </h2>
              <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, margin: '0 0 22px' }}>
                Make sure it's flat, well-lit, and all four corners are visible.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => cameraInputRef.current?.click()} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 800, border: 'none', background: C.lime, color: '#000', cursor: 'pointer' }}>
                  Take a Photo
                </button>
                <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 13.5, fontWeight: 700, border: '1px solid rgba(255,255,255,0.16)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                  Upload from Gallery
                </button>
              </div>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={onChange} style={{ display: 'none' }} />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
            </>
          )}
          {phase === 'done' && (
            <>
              <Icon stroke={C.success} path="check" />
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '14px 0 8px' }}>All set!</h2>
              <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, margin: 0 }}>
                Both photos were uploaded. Head back to your computer — the verification flow will continue automatically.
              </p>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes mh-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ padding: '14px 0' }}>
      <div style={{ width: 30, height: 30, margin: '0 auto 16px', border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: C.lime, borderRadius: '50%', animation: 'mh-spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>{label}</p>
    </div>
  );
}

function Icon({ stroke, path }: { stroke: string; path: 'warn' | 'doc' | 'check' }) {
  const common = { width: 44, height: 44, viewBox: '0 0 24 24', fill: 'none', style: { margin: '0 auto', display: 'block' } } as const;
  if (path === 'warn') return <svg {...common}><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6"/><path d="M12 8V12M12 16h.01" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (path === 'check') return <svg {...common}><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6"/><path d="M8 12.5L10.8 15L16 9" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" stroke={stroke} strokeWidth="1.6"/><circle cx="8.5" cy="10.5" r="1.6" stroke={stroke} strokeWidth="1.4"/><path d="M5 16.5L9 13L11.5 15L15.5 11.5L19 15" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
