import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(204,255,0,0.16) 0%, transparent 70%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#CCFF00',
              borderRadius: 18,
              fontWeight: 900,
              fontSize: 40,
              color: '#000',
            }}
          >
            S
          </div>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Swapp<span style={{ color: '#CCFF00' }}>INR</span>
          </div>
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', textAlign: 'center', maxWidth: 880, lineHeight: 1.3 }}>
          Sell USDT. Get INR. In Under 15 Minutes.
        </div>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
          India&apos;s most trusted USDT ↔ INR exchange
        </div>
      </div>
    ),
    { ...size },
  );
}
