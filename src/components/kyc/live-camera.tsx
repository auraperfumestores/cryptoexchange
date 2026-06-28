'use client';

import { useEffect, useRef, useState } from 'react';
import { captureVideoFrame } from '@/lib/kyc/client-image';

const C = {
  lime: '#CCFF00',
  danger: '#F87171',
  sub: 'rgba(255,255,255,0.52)',
  dim: 'rgba(255,255,255,0.30)',
};

type Pose = 'front' | 'right' | 'left';
const POSES: Pose[] = ['front', 'right', 'left'];
const POSE_COPY: Record<Pose, { instruction: string; tilt: number }> = {
  front: { instruction: 'Look straight ahead', tilt: 0 },
  right: { instruction: 'Slowly turn your head to your right', tilt: -18 },
  left: { instruction: 'Slowly turn your head to your left', tilt: 18 },
};

export interface LiveFaceCapture { front: string; right: string; left: string }

interface LiveCameraProps {
  onCapture: (images: LiveFaceCapture) => void;
}

/** Front-camera live preview with an oval face guide, used only for the face
 *  verification step — document photos are collected via file/camera input
 *  instead so PC users can hand off to a phone via QR. Walks the user through
 *  three poses (front, right, left) for a basic liveness check. */
export function LiveCamera({ onCapture }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [poseIndex, setPoseIndex] = useState(0);
  const [captured, setCaptured] = useState<Partial<LiveFaceCapture>>({});
  const [justCaptured, setJustCaptured] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        setError('Camera access was blocked. Allow camera permission in your browser settings and reload this page.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  function handleCapture() {
    if (!videoRef.current || justCaptured) return;
    const pose = POSES[poseIndex];
    const frame = captureVideoFrame(videoRef.current);
    const next = { ...captured, [pose]: frame };
    setCaptured(next);
    setJustCaptured(true);

    setTimeout(() => {
      if (poseIndex < POSES.length - 1) {
        setPoseIndex(i => i + 1);
        setJustCaptured(false);
      } else {
        onCapture(next as LiveFaceCapture);
      }
    }, 700);
  }

  if (error) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 16 }}>
        <p style={{ fontSize: 13, color: C.danger, margin: 0, lineHeight: 1.6 }}>{error}</p>
      </div>
    );
  }

  const pose = POSES[poseIndex];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        {POSES.map((p, i) => (
          <div
            key={p}
            style={{
              width: 26, height: 3, borderRadius: 99,
              background: i < poseIndex || (i === poseIndex && justCaptured) ? C.lime : i === poseIndex ? 'rgba(204,255,0,0.35)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1 / 1', margin: '0 auto', borderRadius: 20, overflow: 'hidden', background: '#000' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <mask id="lc-mask">
              <rect width="300" height="300" fill="#fff" />
              <ellipse cx="150" cy="155" rx="92" ry="120" fill="#000" />
            </mask>
          </defs>
          <rect width="300" height="300" fill="rgba(0,0,0,0.45)" mask="url(#lc-mask)" />
          <ellipse
            cx="150" cy="155" rx="92" ry="120" fill="none"
            stroke={justCaptured ? '#00E5A0' : ready ? C.lime : 'rgba(255,255,255,0.3)'}
            strokeWidth="2.5" strokeDasharray="8 6"
            style={{ transition: 'stroke 0.25s' }}
          />
        </svg>
        {justCaptured && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#00E5A0" /><path d="M7 12.5L10.3 16L17 8.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.15)', borderTopColor: C.lime, borderRadius: '50%', animation: 'kyc-spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.lime, margin: '18px 0 6px' }}>
        Pose {poseIndex + 1} of {POSES.length}
      </p>
      <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>
        {justCaptured ? 'Got it — hold on…' : POSE_COPY[pose].instruction}
      </p>

      <button
        onClick={handleCapture}
        disabled={!ready || justCaptured}
        style={{ display: 'block', margin: '0 auto', width: 64, height: 64, borderRadius: '50%', background: ready && !justCaptured ? C.lime : 'rgba(255,255,255,0.08)', border: `3px solid ${ready && !justCaptured ? 'rgba(204,255,0,0.35)' : 'rgba(255,255,255,0.1)'}`, cursor: ready && !justCaptured ? 'pointer' : 'not-allowed' }}
        aria-label="Capture photo"
      />
      <p style={{ textAlign: 'center', fontSize: 12, color: C.dim, margin: '20px 0 0', lineHeight: 1.6 }}>
        We'll ask for three quick angles — front, right, then left — to confirm this is a live person.
      </p>

      <style>{`@keyframes kyc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
