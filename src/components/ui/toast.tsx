'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';
type ToastPosition = 'top-right' | 'top-center';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  position?: ToastPosition;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, duration?: number, position?: ToastPosition) => useToastStore.getState().add({ message, variant: 'success', duration, position }),
  error:   (message: string, duration?: number, position?: ToastPosition) => useToastStore.getState().add({ message, variant: 'error',   duration, position }),
  info:    (message: string, duration?: number, position?: ToastPosition) => useToastStore.getState().add({ message, variant: 'info',    duration, position }),
  warning: (message: string, duration?: number, position?: ToastPosition) => useToastStore.getState().add({ message, variant: 'warning', duration, position }),
};

const THEME: Record<ToastVariant, { bg: string; border: string; icon: string; accent: string }> = {
  success: { bg: 'rgba(10,26,18,0.97)',  border: 'rgba(0,229,160,0.28)',  icon: '#00E5A0', accent: '#00E5A0' },
  error:   { bg: 'rgba(26,10,14,0.97)',  border: 'rgba(255,92,124,0.28)', icon: '#FF5C7C', accent: '#FF5C7C' },
  info:    { bg: 'rgba(10,15,30,0.97)',  border: 'rgba(77,121,255,0.28)', icon: '#4D79FF', accent: '#4D79FF' },
  warning: { bg: 'rgba(26,20,10,0.97)',  border: 'rgba(243,186,47,0.28)', icon: '#F3BA2F', accent: '#F3BA2F' },
};

function CheckIcon({ color }: { color: string }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 8L6 11.5L13.5 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function XCircleIcon({ color }: { color: string }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function InfoIcon({ color }: { color: string }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5"/><path d="M8 7v5M8 5v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function WarnIcon({ color }: { color: string }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14.5 13.5H1.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

function ToastIcon({ variant, color }: { variant: ToastVariant; color: string }) {
  if (variant === 'success') return <CheckIcon color={color} />;
  if (variant === 'error')   return <XCircleIcon color={color} />;
  if (variant === 'warning') return <WarnIcon color={color} />;
  return <InfoIcon color={color} />;
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove  = useToastStore((s) => s.remove);

  const rightToasts  = toasts.filter((t) => (t.position ?? 'top-right') === 'top-right');
  const centerToasts = toasts.filter((t) => t.position === 'top-center');

  return (
    <>
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 360, width: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}>
        {rightToasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
      <div style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        maxWidth: 420, width: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}>
        {centerToasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </>
  );
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(true);
  const theme = THEME[t.variant];
  const dur = t.duration ?? 4000;

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), dur - 300);
    const rem  = setTimeout(onClose, dur);
    return () => { clearTimeout(hide); clearTimeout(rem); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dur]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px',
      background: theme.bg,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      pointerEvents: 'auto',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-6px)',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    }}>
      {/* Accent left strip */}
      <div style={{ width: 3, height: 32, borderRadius: 99, background: theme.accent, flexShrink: 0 }} />

      <ToastIcon variant={t.variant} color={theme.icon} />

      <p style={{
        flex: 1, margin: 0,
        fontSize: 13, fontWeight: 600, lineHeight: 1.4,
        color: '#ffffff',
      }}>
        {t.message}
      </p>

      <button
        onClick={onClose}
        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(255,255,255,0.4)', lineHeight: 0 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}
