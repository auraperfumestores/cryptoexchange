/**
 * Spin & Win prize wheel — the single source of truth for segment order,
 * labels, weights and colours. Imported by BOTH the API (to pick an outcome
 * server-side) and the wheel component (to draw the same segments), so the
 * two can never disagree about which slice means what.
 *
 * Order is the clockwise order on the wheel starting at 12 o'clock. Big and
 * small prizes are interleaved on purpose so the wheel reads as exciting
 * rather than as a sorted list.
 */
export type WedgeTone = 'small' | 'smallAlt' | 'none' | 'mid' | 'big' | 'jackpot';

export interface SpinPrize {
  usdt:   number;   // 0 = no prize
  label:  string;   // text drawn on the wedge
  weight: number;   // relative probability — may be fractional
  tone:   WedgeTone;
}

export const SPIN_PRIZES: readonly SpinPrize[] = [
  { usdt: 0.05, label: '0.05',    weight: 28,  tone: 'small'    },
  { usdt: 1,    label: '1',       weight: 15,  tone: 'smallAlt' },
  { usdt: 0,    label: 'Nothing', weight: 18,  tone: 'none'     },
  { usdt: 5,    label: '5',       weight: 10,  tone: 'mid'      },
  { usdt: 0.5,  label: '0.50',    weight: 22,  tone: 'small'    },
  { usdt: 50,   label: '50',      weight: 1.5, tone: 'big'      },
  { usdt: 10,   label: '10',      weight: 5,   tone: 'mid'      },
  { usdt: 100,  label: '100',     weight: 0.5, tone: 'jackpot'  },
];

export const SEGMENT_COUNT = SPIN_PRIZES.length;
export const SEGMENT_DEG   = 360 / SEGMENT_COUNT;

/** Centre angle of segment i, degrees clockwise from 12 o'clock. */
export function segmentCenterDeg(i: number): number {
  return i * SEGMENT_DEG + SEGMENT_DEG / 2;
}
