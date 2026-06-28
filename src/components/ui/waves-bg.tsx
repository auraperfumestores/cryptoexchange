'use client';

// Recreates the "Waves.svg" background motion (horizontal linear drift) from the
// reference Jitter export, re-themed from #b7ee8c → SwappINR lime, and darkened
// since this sits behind UI text rather than as a standalone visual.
function waveDataUri(fillColor: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' preserveAspectRatio='none'><path d='M0,130 C50,70 100,190 150,130 C200,70 250,190 300,130 C350,70 400,190 400,130 L400,200 L0,200 Z' fill='${fillColor}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function WavesBg({ angle = 0 }: { angle?: number }) {
  // angle === 0 (promo banner): simple horizontal wave-silhouette drift, unchanged.
  if (!angle) {
    return (
      <>
        <style>{`
          @keyframes wb-drift-1 { from { background-position-x: 0; } to { background-position-x: -400px; } }
          @keyframes wb-drift-2 { from { background-position-x: 0; } to { background-position-x: 320px; } }
        `}</style>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none', background: '#050505' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: waveDataUri('#CCFF00'),
            backgroundRepeat: 'repeat-x',
            backgroundSize: '400px 100%',
            opacity: 0.07,
            animation: 'wb-drift-1 14s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '10% 0 -10% 0',
            backgroundImage: waveDataUri('#A8D400'),
            backgroundRepeat: 'repeat-x',
            backgroundSize: '320px 100%',
            opacity: 0.05,
            animation: 'wb-drift-2 20s linear infinite',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        </div>
      </>
    );
  }

  // angle !== 0 (e.g. exchange widget): a proper seamless sine-pattern, rotated via
  // patternTransform — tiles cleanly in both axes at any angle, no stretch-induced
  // spikes and no mismatched-tiling blotches.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 800"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 'inherit', pointerEvents: 'none' }}
    >
      <style>{`
        @keyframes wv-drift { from { transform: translateX(0); } to { transform: translateX(-64px); } }
        .wv-drift-g { animation: wv-drift 11s linear infinite; }
      `}</style>
      <defs>
        <pattern id="wv-pattern" patternUnits="userSpaceOnUse" width="64" height="32" patternTransform={`rotate(${angle})`}>
          <rect width="64" height="32" fill="#050505" />
          <path d="M0,16 Q16,4 32,16 T64,16 L64,32 L0,32 Z" fill="#CCFF00" opacity="0.12" />
          <path d="M0,16 Q16,4 32,16 T64,16 L64,0 L0,0 Z" fill="#A8D400" opacity="0.16" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="600" height="800" fill="#050505" />
      <g className="wv-drift-g">
        <rect x="-300" y="-300" width="1200" height="1400" fill="url(#wv-pattern)" />
      </g>
      <rect x="0" y="0" width="600" height="800" fill="#000000" opacity="0.4" />
    </svg>
  );
}
