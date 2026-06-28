'use client';

interface PressLogoProps {
  name: string;
  fontFamily: string;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontStyle?: 'normal' | 'italic';
}

/** Text-only wordmark approximating each outlet's real logo typeface/case,
 *  kept to a fixed line-height so spacing stays consistent across the strip. */
export function PressLogo({ name, fontFamily, fontWeight, letterSpacing = '0', textTransform = 'none', fontStyle = 'normal' }: PressLogoProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      fontSize: 18,
      fontFamily,
      fontWeight,
      letterSpacing,
      textTransform,
      fontStyle,
      color: 'rgba(255,255,255,0.32)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {name}
    </span>
  );
}
