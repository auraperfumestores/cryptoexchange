import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#CCFF00',
            borderRadius: 30,
            fontWeight: 900,
            fontSize: 76,
            color: '#000',
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size },
  );
}
