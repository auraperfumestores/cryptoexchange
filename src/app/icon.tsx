import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#CCFF00',
          borderRadius: 7,
          fontFamily: 'sans-serif',
          fontWeight: 900,
          fontSize: 20,
          color: '#000',
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}
