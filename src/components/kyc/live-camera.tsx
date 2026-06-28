'use client';

import { useEffect, useRef, useState } from 'react';
import { captureVideoFrame } from '@/lib/kyc/client-image';

const C = {
  lime: '#CCFF00',
  danger: '#F87171',
};

interface LiveCameraProps {
  onCapture: (dataUrl: string) => void;
}

/** Front-camera live preview with an oval face guide, used only for the face
 *  verification step — document photos are collected via file/camera input
 *  instead so PC users can hand off to a phone via QR. */
export function LiveCamera({ onCapture }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

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
    if (!videoRef.current) return;
    onCapture(captureVideoFrame(videoRef.current));
  }

  if (error) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 16 }}>
        <p style={{ fontSize: 13, color: C.danger, margin: 0, lineHeight: 1.6 }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1 / 1', margin: '0 auto', borderRadius: 20, overflow: 'hidden', background: '#000' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        {/* Oval face guide */}
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <mask id="lc-mask">
              <rect width="300" height="300" fill="#fff" />
              <ellipse cx="150" cy="155" rx="92" ry="120" fill="#000" />
            </mask>
          </defs>
          <rect width="300" height="300" fill="rgba(0,0,0,0.45)" mask="url(#lc-mask)" />
          <ellipse cx="150" cy="155" rx="92" ry="120" fill="none" stroke={ready ? C.lime : 'rgba(255,255,255,0.3)'} strokeWidth="2.5" strokeDasharray="8 6" />
        </svg>
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.15)', borderTopColor: C.lime, borderRadius: '50%', animation: 'kyc-spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: '16px 0 20px', lineHeight: 1.6 }}>
        Position your face inside the outline. Make sure you're in a well-lit room and looking directly at the camera.
      </p>

      <button
        onClick={handleCapture}
        disabled={!ready}
        style={{ display: 'block', margin: '0 auto', width: 64, height: 64, borderRadius: '50%', background: ready ? C.lime : 'rgba(255,255,255,0.08)', border: `3px solid ${ready ? 'rgba(204,255,0,0.35)' : 'rgba(255,255,255,0.1)'}`, cursor: ready ? 'pointer' : 'not-allowed' }}
        aria-label="Capture photo"
      />

      <style>{`@keyframes kyc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
