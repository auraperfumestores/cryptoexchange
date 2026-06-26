'use client';

import { useState } from 'react';

interface PressLogoProps {
  name: string;
  src: string;
}

/** Renders a press logo PNG; falls back to the plain text name until the
 *  matching file is dropped into /public/press. */
export function PressLogo({ name, src }: PressLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.14)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
        {name}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{ height: 22, width: 'auto', opacity: 0.4, filter: 'grayscale(1) brightness(1.6)', flexShrink: 0 }}
    />
  );
}
