'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { compressImageFile } from '@/lib/kyc/client-image';
import { LiveCamera, type LiveFaceCapture } from './live-camera';
import type { KycDocType } from '@/types';

const C = {
  bg:       '#050505',
  card:     '#0d0d0f',
  card2:    '#111113',
  lime:     '#CCFF00',
  text:     '#FFFFFF',
  sub:      'rgba(255,255,255,0.52)',
  dim:      'rgba(255,255,255,0.30)',
  faint:    'rgba(255,255,255,0.08)',
  border:   'rgba(255,255,255,0.09)',
  borderMd: 'rgba(255,255,255,0.16)',
  success:  '#00E5A0',
  danger:   '#F87171',
  warn:     '#FBBF24',
};

type Step =
  | 'loading' | 'intro'
  | 'frontCapture' | 'backCapture'
  | 'faceIntro' | 'faceCapture' | 'processingFace'
  | 'review' | 'submitting'
  | 'pending' | 'verified' | 'rejected' | 'error';

interface Submission {
  docType?: KycDocType;
  frontImageUrl?: string;
  backImageUrl?: string;
  faceImageUrl?: string;
  faceImageUrlRight?: string;
  faceImageUrlLeft?: string;
  status: string;
  rejectionReason?: string;
}

const DOC_OPTIONS: { value: KycDocType; label: string; desc: string }[] = [
  { value: 'aadhaar', label: 'Aadhaar Card', desc: 'Issued by UIDAI · 12-digit number' },
  { value: 'pan', label: 'PAN Card', desc: 'Issued by Income Tax Department' },
  { value: 'driving_license', label: "Driving Licence", desc: 'Issued by State Transport Authority' },
];

const STEP_ORDER: Step[] = ['intro', 'frontCapture', 'backCapture', 'faceIntro', 'review'];
const STEP_LABELS: Record<string, string> = {
  intro: 'Document', frontCapture: 'Front', backCapture: 'Back', faceIntro: 'Face', review: 'Review',
};

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init ? { headers: { 'Content-Type': 'application/json' }, ...init } : undefined);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || 'Something went wrong. Please try again.');
  return json;
}

export function KycFlow({ token }: { token: string }) {
  const [step, setStep] = useState<Step>('loading');
  const [docType, setDocType] = useState<KycDocType | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const pollRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 880);
    loadStatus();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resumeFrom(sub: Submission | null) {
    if (!sub) { setStep('intro'); return; }
    if (sub.status === 'pending_review') { setStep('pending'); return; }
    if (sub.status === 'verified') { setStep('verified'); return; }
    if (sub.status === 'rejected') { setStep('rejected'); return; }
    if (!sub.docType) { setStep('intro'); return; }
    setDocType(sub.docType);
    if (!sub.frontImageUrl) { setStep('frontCapture'); return; }
    if (!sub.backImageUrl) { setStep('backCapture'); return; }
    if (!sub.faceImageUrl || !sub.faceImageUrlRight || !sub.faceImageUrlLeft) { setStep('faceIntro'); return; }
    setStep('review');
  }

  async function loadStatus() {
    try {
      const json = await api('/api/kyc/status');
      setSubmission(json.data.submission);
      resumeFrom(json.data.submission);
    } catch {
      setStep('error');
    }
  }

  function stopPolling() {
    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = undefined; }
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const json = await api('/api/kyc/status');
        const sub: Submission = json.data.submission;
        setSubmission(sub);
        if (sub?.backImageUrl) {
          stopPolling();
          setQrOpen(false);
          setStep(sub.faceImageUrl && sub.faceImageUrlRight && sub.faceImageUrlLeft ? 'review' : 'faceIntro');
        } else if (sub?.frontImageUrl) {
          setStep('backCapture');
        }
      } catch { /* keep polling silently */ }
    }, 3000);
  }

  async function selectDocType(dt: KycDocType) {
    setBusy(true); setBusyMessage('Preparing your verification session…'); setError('');
    try {
      await wait(500);
      const json = await api('/api/kyc/start', { method: 'POST', body: JSON.stringify({ docType: dt }) });
      setDocType(dt);
      setSubmission(json.data);
      setStep('frontCapture');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false); setBusyMessage('');
    }
  }

  async function uploadSide(side: 'front' | 'back', file: File) {
    setBusy(true); setError('');
    try {
      setBusyMessage('Analyzing image quality…');
      const dataUrl = await compressImageFile(file);
      await wait(900);
      setBusyMessage('Uploading securely…');
      const json = await api('/api/kyc/upload', { method: 'POST', body: JSON.stringify({ side, imageDataUrl: dataUrl }) });
      await wait(500);
      setSubmission(json.data);
      setStep(side === 'front' ? 'backCapture' : 'faceIntro');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false); setBusyMessage('');
    }
  }

  async function handleFaceCapture(images: LiveFaceCapture) {
    setStep('processingFace'); setError('');
    setBusyMessage('Checking liveness…');
    try {
      await wait(1100);
      setBusyMessage('Matching face to document photo…');
      await wait(1000);
      const json = await api('/api/kyc/upload', {
        method: 'POST',
        body: JSON.stringify({ side: 'face', imageDataUrl: images.front, imageDataUrlRight: images.right, imageDataUrlLeft: images.left }),
      });
      setSubmission(json.data);
      setStep('review');
    } catch (e: any) {
      setError(e.message);
      setStep('faceCapture');
    } finally {
      setBusyMessage('');
    }
  }

  async function handleSubmit() {
    setStep('submitting'); setError('');
    try {
      await wait(1500);
      const json = await api('/api/kyc/submit', { method: 'POST' });
      setSubmission(json.data);
      setStep('pending');
    } catch (e: any) {
      setError(e.message);
      setStep('review');
    }
  }

  async function openMobileQr() {
    setError('');
    try {
      const json = await api('/api/kyc/mobile-token', { method: 'POST' });
      setQrUrl(`${window.location.origin}${json.data.path}`);
      setQrOpen(true);
      startPolling();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function closeQr() {
    setQrOpen(false);
    stopPolling();
  }

  const stepIndex = STEP_ORDER.indexOf(
    (['frontCapture', 'backCapture'].includes(step) ? step
      : step === 'faceIntro' || step === 'faceCapture' || step === 'processingFace' ? 'faceIntro'
      : step === 'review' || step === 'submitting' ? 'review'
      : 'intro') as Step,
  );

  const showProgress = ['intro', 'frontCapture', 'backCapture', 'faceIntro', 'faceCapture', 'processingFace', 'review', 'submitting'].includes(step);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 60px' }}>
      <Header />

      {showProgress && (
        <div style={{ width: '100%', maxWidth: 560, margin: '28px 0 8px' }}>
          <ProgressBar current={stepIndex} />
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 560, marginTop: showProgress ? 24 : 60 }}>
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: C.danger }}>
            {error}
          </div>
        )}

        <Card>
          {step === 'loading' && <CenteredSpinner label="Loading your verification status…" />}
          {step === 'error' && <ErrorState onRetry={loadStatus} />}
          {step === 'intro' && <IntroStep busy={busy} busyMessage={busyMessage} onSelect={selectDocType} />}
          {(step === 'frontCapture' || step === 'backCapture') && (
            <DocCaptureStep
              side={step === 'frontCapture' ? 'front' : 'back'}
              docType={docType}
              busy={busy}
              busyMessage={busyMessage}
              isDesktop={isDesktop}
              onFile={file => uploadSide(step === 'frontCapture' ? 'front' : 'back', file)}
              onOpenQr={openMobileQr}
              onBack={() => setStep(step === 'frontCapture' ? 'intro' : 'frontCapture')}
              backLabel={step === 'frontCapture' ? '← Change document type' : '← Retake front photo'}
            />
          )}
          {step === 'faceIntro' && <FaceIntroStep onStart={() => setStep('faceCapture')} />}
          {step === 'faceCapture' && <LiveCamera onCapture={handleFaceCapture} />}
          {step === 'processingFace' && <CenteredSpinner label={busyMessage || 'Processing…'} />}
          {step === 'review' && submission && <ReviewStep docType={docType} submission={submission} onSubmit={handleSubmit} />}
          {step === 'submitting' && <CenteredSpinner label="Submitting your application…" />}
          {step === 'pending' && <PendingStep />}
          {step === 'verified' && <VerifiedStep />}
          {step === 'rejected' && <RejectedStep reason={submission?.rejectionReason} />}
        </Card>
      </div>

      {qrOpen && (
        <QrModal url={qrUrl} onClose={closeQr} />
      )}

      <style>{`
        @keyframes kyc-spin { to { transform: rotate(360deg); } }
        @keyframes kyc-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ───────────────────────── shared chrome ───────────────────────── */

function Header() {
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(204,255,0,0.3)' }}>
          <span style={{ color: '#000', fontSize: 14, fontWeight: 900 }}>S</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          Swapp<span style={{ color: C.lime }}>INR</span>
        </span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Identity Verification
      </span>
    </div>
  );
}

function ProgressBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {STEP_ORDER.map((s, i) => (
        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 3, borderRadius: 99, background: i <= current ? C.lime : C.faint, transition: 'background 0.3s' }} />
          <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: i <= current ? C.lime : C.dim, textAlign: i === 0 ? 'left' : i === STEP_ORDER.length - 1 ? 'right' : 'center' }}>
            {STEP_LABELS[s]}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.5)', animation: 'kyc-fade-in 0.35s ease' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(204,255,0,0.25),#CCFF00,rgba(204,255,0,0.25))' }} />
      <div style={{ padding: '32px 30px' }}>{children}</div>
    </div>
  );
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '30px 0' }}>
      <div style={{ width: 32, height: 32, margin: '0 auto 18px', border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: C.lime, borderRadius: '50%', animation: 'kyc-spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13.5, color: C.sub, margin: 0 }}>{label}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <p style={{ fontSize: 14, color: C.danger, fontWeight: 700, margin: '0 0 8px' }}>Couldn't load your verification status</p>
      <p style={{ fontSize: 13, color: C.sub, margin: '0 0 20px' }}>Please check your connection and try again.</p>
      <PrimaryButton label="Retry" onClick={onRetry} />
    </div>
  );
}

function PrimaryButton({ label, onClick, disabled, loading, loadingLabel }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean; loadingLabel?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%', padding: '14px', borderRadius: 13, fontSize: 14.5, fontWeight: 800, border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        background: disabled || loading ? 'rgba(255,255,255,0.07)' : C.lime,
        color: disabled || loading ? 'rgba(255,255,255,0.3)' : '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, letterSpacing: '-0.01em',
      }}
    >
      {loading
        ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'kyc-spin 0.7s linear infinite', display: 'inline-block' }} />{loadingLabel || 'Please wait…'}</>
        : label}
    </button>
  );
}

/* ───────────────────────── intro / doc select ───────────────────────── */

function IntroStep({ busy, busyMessage, onSelect }: { busy: boolean; busyMessage: string; onSelect: (dt: KycDocType) => void }) {
  if (busy) return <CenteredSpinner label={busyMessage || 'Preparing…'} />;
  return (
    <div>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(204,255,0,0.08)', border: `1px solid rgba(204,255,0,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7V13C3 18.5 7.2 23.3 12 24C16.8 23.3 21 18.5 21 13V7L12 2Z" stroke={C.lime} strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 12L10.5 14.5L16 9" stroke={C.lime} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h1 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Verify your identity</h1>
      <p style={{ fontSize: 13.5, color: C.sub, margin: '0 0 26px', lineHeight: 1.65 }}>
        To comply with regulatory requirements and keep SwappINR secure for everyone, we need to confirm who you are.
        This takes about 3 minutes — you'll submit one government ID and a quick live photo for identity matching.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {[
          'Government-issued photo ID (front & back)',
          'A short live face capture to confirm it’s you',
          'Reviewed by our compliance team, usually within hours',
        ].map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: C.sub }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,229,160,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke={C.success} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            {t}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.dim, margin: '0 0 12px' }}>Choose a document to continue</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DOC_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '15px 16px', borderRadius: 14, background: C.card2, border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,255,0,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>{opt.label}</p>
              <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>{opt.desc}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}><path d="M5 2L11 7L5 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, color: C.dim, margin: '22px 0 0', lineHeight: 1.6, textAlign: 'center' }}>
        Your documents are encrypted in transit and only visible to our compliance team.
      </p>
    </div>
  );
}

/* ───────────────────────── front / back capture ───────────────────────── */

const DOC_LABEL: Record<KycDocType, string> = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', driving_license: 'Driving Licence' };

const BAD_EXAMPLES = [
  { slug: 'blurry', label: 'Blurry' },
  { slug: 'glare', label: 'Glare or reflection' },
  { slug: 'cropped', label: 'Cropped / cut off' },
  { slug: 'screenshot', label: 'Screenshot or photocopy' },
];

function ExampleThumb({ slug, label, kind }: { slug: string; label: string; kind: 'good' | 'bad' }) {
  const [broken, setBroken] = useState(false);
  const accent = kind === 'good' ? C.success : C.danger;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', background: C.card2, border: `1px solid ${kind === 'good' ? 'rgba(0,229,160,0.35)' : C.border}`, marginBottom: 6 }}>
        {!broken && (
          <img
            src={`/kyc-examples/${slug}.png`}
            alt={label}
            onError={() => setBroken(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: kind === 'good' ? 1 : 0.85 }}
          />
        )}
        <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {kind === 'good'
            ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 4.5L3.2 6.7L8 2" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 1L8 8M8 1L1 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        </div>
      </div>
      <span style={{ fontSize: 10.5, color: kind === 'good' ? C.success : C.dim, fontWeight: kind === 'good' ? 700 : 400 }}>{label}</span>
    </div>
  );
}

function DocCaptureStep({
  side, docType, busy, busyMessage, isDesktop, onFile, onOpenQr, onBack, backLabel,
}: {
  side: 'front' | 'back';
  docType: KycDocType | null;
  busy: boolean;
  busyMessage: string;
  isDesktop: boolean;
  onFile: (file: File) => void;
  onOpenQr: () => void;
  onBack: () => void;
  backLabel: string;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docLabel = docType ? DOC_LABEL[docType] : 'document';

  if (busy) return <CenteredSpinner label={busyMessage || 'Processing…'} />;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: C.dim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 14 }}
        onMouseEnter={e => { e.currentTarget.style.color = C.sub; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.dim; }}
      >
        {backLabel}
      </button>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.lime, margin: '0 0 8px' }}>
        Step {side === 'front' ? '2' : '3'} of 5
      </p>
      <h2 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
        {side === 'front' ? `Photograph the front of your ${docLabel}` : `Now the back of your ${docLabel}`}
      </h2>
      <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.6 }}>
        Place the document on a flat, well-lit surface. Make sure all four corners are visible and the text is sharp and readable.
      </p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ width: 130, margin: '0 auto' }}>
          <ExampleThumb slug="good" label="Accepted" kind="good" />
        </div>
      </div>

      <p style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.dim, margin: '0 0 8px', textAlign: 'center' }}>
        Avoid these common mistakes
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
        {BAD_EXAMPLES.map(ex => <ExampleThumb key={ex.slug} {...ex} kind="bad" />)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton label="Take a Photo" onClick={() => cameraInputRef.current?.click()} />
        <SecondaryButton label="Upload from Device" onClick={() => fileInputRef.current?.click()} />
        {isDesktop && (
          <SecondaryButton label="Continue on Phone Instead →" onClick={onOpenQr} />
        )}
      </div>

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleChange} style={{ display: 'none' }} />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
    </div>
  );
}

function SecondaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 13.5, fontWeight: 700, border: `1px solid ${C.borderMd}`, background: 'transparent', color: '#fff', cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}

/* ───────────────────────── face capture ───────────────────────── */

function FaceIntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.lime, margin: '0 0 8px' }}>Step 4 of 5</p>
      <h2 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Live face verification</h2>
      <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.65 }}>
        We'll open your camera and guide you through three quick poses — front, right, and left — to confirm a real person matches your ID. This step can't be done with an uploaded photo.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
        {['Find a well-lit space and face the camera directly', 'Remove sunglasses, masks, or hats', 'Follow the on-screen prompt and turn your head when asked'].map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: C.sub }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(204,255,0,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, color: C.lime, fontSize: 9, fontWeight: 800 }}>•</span>
            {t}
          </div>
        ))}
      </div>
      <PrimaryButton label="Enable Camera & Continue →" onClick={onStart} />
    </div>
  );
}

/* ───────────────────────── review ───────────────────────── */

function ReviewStep({ docType, submission, onSubmit }: { docType: KycDocType | null; submission: Submission; onSubmit: () => void }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.lime, margin: '0 0 8px' }}>Step 5 of 5</p>
      <h2 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Review &amp; submit</h2>
      <p style={{ fontSize: 13, color: C.sub, margin: '0 0 22px', lineHeight: 1.6 }}>
        Confirm everything looks clear before sending this to our compliance team for review.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { url: submission.frontImageUrl, label: 'Document — Front' },
          { url: submission.backImageUrl, label: 'Document — Back' },
        ].map(({ url, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', background: '#000', border: `1px solid ${C.border}`, marginBottom: 6 }}>
              {url && <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <span style={{ fontSize: 10.5, color: C.dim }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
          { url: submission.faceImageUrl, label: 'Face — Center' },
          { url: submission.faceImageUrlRight, label: 'Face — Right' },
          { url: submission.faceImageUrlLeft, label: 'Face — Left' },
        ].map(({ url, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', background: '#000', border: `1px solid ${C.border}`, marginBottom: 6 }}>
              {url && <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <span style={{ fontSize: 10.5, color: C.dim }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: C.dim }}>Document type</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{docType ? DOC_LABEL[docType] : '—'}</span>
      </div>

      <PrimaryButton label="Submit for Review →" onClick={onSubmit} />
      <p style={{ fontSize: 11, color: C.dim, margin: '14px 0 0', lineHeight: 1.6, textAlign: 'center' }}>
        Once submitted, you won't be able to change these documents unless our team requests a resubmission.
      </p>
    </div>
  );
}

/* ───────────────────────── terminal states ───────────────────────── */

function PendingStep() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.warn, margin: '0 0 10px' }}>Under review</p>
      <h2 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
        Your application is with our compliance team
      </h2>
      <p style={{ fontSize: 13.5, color: C.sub, margin: '0 0 16px', lineHeight: 1.7 }}>
        We've received your documents and live photos, and your verification has entered our review queue. Most applications
        are reviewed within a few hours, and almost always within 24 hours.
      </p>
      <p style={{ fontSize: 13, color: C.dim, margin: 0, lineHeight: 1.7 }}>
        We'll email you the moment a decision is made. There's nothing further to do here — feel free to close this tab.
      </p>
    </div>
  );
}

function VerifiedStep() {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.success, margin: '0 0 10px' }}>Verification complete</p>
      <h2 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
        Your identity has been verified
      </h2>
      <p style={{ fontSize: 13.5, color: C.sub, margin: '0 0 16px', lineHeight: 1.7 }}>
        Thank you for completing identity verification. Your account now has full verified-tier access, including higher
        transaction limits and faster settlement on every order.
      </p>
      <p style={{ fontSize: 13, color: C.dim, margin: 0, lineHeight: 1.7 }}>
        You can close this tab and return to your SwappINR dashboard to continue trading.
      </p>
    </div>
  );
}

function RejectedStep({ reason }: { reason?: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.danger, margin: '0 0 10px' }}>Not approved</p>
      <h2 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
        We couldn't approve this submission
      </h2>
      <p style={{ fontSize: 13.5, color: C.sub, margin: '0 0 18px', lineHeight: 1.7 }}>
        Our compliance team reviewed your documents and live photos but wasn't able to approve them this time.
      </p>
      {reason && (
        <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Reviewer note</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.65 }}>{reason}</p>
        </div>
      )}
      <p style={{ fontSize: 13, color: C.dim, margin: 0, lineHeight: 1.7 }}>
        Please reach out to our support team to request a resubmission. Once your application is reopened, this same link
        will let you submit fresh documents.
      </p>
    </div>
  );
}

/* ───────────────────────── QR handoff modal ───────────────────────── */

function QrModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div style={{ width: '100%', maxWidth: 360, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px 26px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Scan with your phone</h3>
        <p style={{ fontSize: 12.5, color: C.sub, margin: '0 0 20px', lineHeight: 1.6 }}>
          Use your phone's camera app to scan this code, then take your document photos there. This page will continue automatically.
        </p>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, display: 'inline-block', marginBottom: 18 }}>
          <QRCodeSVG value={url} size={180} level="M" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18, fontSize: 12, color: C.dim }}>
          <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: C.lime, borderRadius: '50%', animation: 'kyc-spin 0.8s linear infinite', display: 'inline-block' }} />
          Waiting for photos from your phone…
        </div>
        <SecondaryButton label="Cancel" onClick={onClose} />
      </div>
    </div>
  );
}
