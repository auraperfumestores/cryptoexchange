'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkle, Trophy, Coins, ArrowClockwise, X, ArrowUpRight, Plus } from '@phosphor-icons/react';
import { toast } from '@/components/ui/toast';
import { SPIN_PRIZES, SEGMENT_DEG, segmentCenterDeg, type WedgeTone } from '@/lib/spin/prizes';

/* ── Geometry ─────────────────────────────────────────────────────────────── */
const CX = 180, CY = 180, R = 166, LABEL_R = 114;

/** Angle in degrees clockwise from 12 o'clock → SVG point. */
function polar(angleDeg: number, radius: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
}
function wedgePath(i: number) {
  const p0 = polar(i * SEGMENT_DEG, R);
  const p1 = polar((i + 1) * SEGMENT_DEG, R);
  return `M ${CX} ${CY} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
}

const TONE: Record<WedgeTone, { fill: string; text: string; sub: string }> = {
  small:    { fill: '#111111', text: '#FFFFFF',                sub: 'rgba(255,255,255,0.35)' },
  smallAlt: { fill: '#171717', text: '#FFFFFF',                sub: 'rgba(255,255,255,0.35)' },
  none:     { fill: '#0a0a0a', text: 'rgba(255,255,255,0.32)', sub: 'rgba(255,255,255,0.18)' },
  mid:      { fill: '#1c1c1c', text: '#CCFF00',                sub: 'rgba(204,255,0,0.5)'    },
  big:      { fill: '#9B5DE5', text: '#FFFFFF',                sub: 'rgba(255,255,255,0.6)'  },
  jackpot:  { fill: '#CCFF00', text: '#000000',                sub: 'rgba(0,0,0,0.55)'       },
};

/* ── Types & constants ────────────────────────────────────────────────────── */
type Status  = 'idle' | 'spinning' | 'result';
type Network = 'BEP20' | 'ERC20' | 'TRC20';
interface Recent { _id: string; prizeUsdt: number; createdAt: string }
interface Popup  { kind: 'win' | 'lose'; spinId: string; prizeUsdt: number }

const SPIN_MS    = 7400;
const FULL_TURNS = 9;
const AUTO_APPROVE_MAX = 2;
/** Pause between the wheel settling and the result popup — lets the last tick land. */
const REVEAL_DELAY_MS = 1000;
const NETWORKS: { key: Network; label: string; sub: string }[] = [
  { key: 'BEP20', label: 'BEP20', sub: 'BNB Chain' },
  { key: 'ERC20', label: 'ERC20', sub: 'Ethereum'  },
  { key: 'TRC20', label: 'TRC20', sub: 'TRON'      },
];

/* ── Spin motion ───────────────────────────────────────────────────────────
 * Driven by requestAnimationFrame rather than a CSS transition so the exact
 * wheel angle is known every frame — that is what lets the pointer react to
 * real segment boundaries instead of wobbling on a timer.
 *
 * Easing is two-phase: a quadratic ramp-up for the first ACCEL_FRAC of the
 * time, then a quartic ease-out for the long crawl to rest. ACCEL_DIST is
 * derived so position AND velocity are continuous at the hand-off, which is
 * what makes speeding-up → slowing-down feel like one motion, not two.
 */
const ACCEL_FRAC = 0.22;
const ACCEL_DIST = (2 * ACCEL_FRAC) / (1 + ACCEL_FRAC);
function easeSpin(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < ACCEL_FRAC) { const u = t / ACCEL_FRAC; return ACCEL_DIST * u * u; }
  const u = (t - ACCEL_FRAC) / (1 - ACCEL_FRAC);
  return ACCEL_DIST + (1 - ACCEL_DIST) * (1 - Math.pow(1 - u, 4));
}
/** Degrees the pointer is knocked over when a segment edge passes under it. */
const POINTER_KICK = 16;
/** Spring-back rate: fraction of deflection left after one second (≈16% at 100 ms). */
const POINTER_DECAY = 1e-8;

/** Cells per half-track of a backdrop strip. Each cell is one Tether mark + one
 *  gift, so 14 pairs ≈ 1400px — enough to cover the rotated stage with margin. */
const STRIP_CELLS = Array.from({ length: 14 }, (_, i) => i);

/* ── Confetti (pure CSS, no dependency) ───────────────────────────────────── */
const CONFETTI_COLORS = ['#CCFF00', '#FFFFFF', '#9B5DE5', '#00D4C8', '#E5FF66'];
function Confetti({ seed }: { seed: number }) {
  const pieces = useMemo(
    () => Array.from({ length: 96 }, (_, i) => ({
      x: Math.random() * 100,
      delay: Math.random() * 1.2,
      dur: 2.6 + Math.random() * 1.2,
      rot: Math.random() * 360,
      size: 5 + Math.random() * 7,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      drift: (Math.random() - 0.5) * 160,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed],
  );
  return (
    <div className="sw-confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.x}%`, width: p.size, height: p.size * 0.55, background: p.color,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
            ['--rot' as any]: `${p.rot}deg`,
            ['--drift' as any]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Withdraw modal ───────────────────────────────────────────────────────── */
function WithdrawModal({ balance, onClose, onDone }: { balance: number; onClose: () => void; onDone: () => void }) {
  const [network, setNetwork] = useState<Network>('BEP20');
  const [amount, setAmount]   = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<{ msg: string; noWallet?: boolean } | null>(null);
  const [done, setDone]       = useState<{ autoApproved: boolean; amount: number } | null>(null);

  const amt = Math.round((parseFloat(amount) || 0) * 100) / 100;
  const valid = amt > 0 && amt <= balance;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/spin/withdraw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, network }),
      });
      const d = await res.json();
      if (!res.ok || !d?.success) {
        setError({ msg: d?.error || 'Withdrawal failed', noWallet: d?.code === 'NO_WALLET' });
        return;
      }
      setDone({ autoApproved: !!d.data.autoApproved, amount: amt });
      onDone();
    } catch {
      setError({ msg: 'Network error. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="swm-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="swm">
        <div className="swm-rule" />
        <div className="swm-body">
          <div className="swm-head">
            <div>
              <p className="swm-title">Withdraw spin funds</p>
              <p className="swm-sub">To your connected wallet · no minimum</p>
            </div>
            <button className="swm-close" onClick={onClose} aria-label="Close"><X size={14} weight="bold" /></button>
          </div>

          {done ? (
            <div className="swm-done">
              <div className="swm-done-ico"><ArrowUpRight size={22} weight="bold" /></div>
              <p className="swm-done-h">Request submitted</p>
              <p className="swm-done-amt">{done.amount.toFixed(2)} <span>USDT</span></p>
              <p className="swm-done-s">
                {done.autoApproved
                  ? 'Approved automatically — the payout is being processed.'
                  : `Amounts over ${AUTO_APPROVE_MAX} USDT are reviewed by an admin before payout.`}
              </p>
              <button className="swm-primary" onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <p className="swm-label">Network</p>
              <div className="swm-nets">
                {NETWORKS.map(n => (
                  <button key={n.key} onClick={() => { setNetwork(n.key); setError(null); }} className={`swm-net${network === n.key ? ' on' : ''}`}>
                    <span>{n.label}</span><small>{n.sub}</small>
                  </button>
                ))}
              </div>

              <p className="swm-label">Amount <span className="swm-avail">Available {balance.toFixed(2)} USDT</span></p>
              <div className="swm-amt">
                <input
                  type="number" inputMode="decimal" min={0} step="0.01" value={amount} placeholder="0.00"
                  onChange={e => { setAmount(e.target.value); setError(null); }}
                />
                <button onClick={() => setAmount(balance.toFixed(2))}>MAX</button>
                <b>USDT</b>
              </div>

              {error && (
                <div className="swm-err">
                  {error.msg}
                  {error.noWallet && <> <Link href="/wallets">Connect a wallet →</Link></>}
                </div>
              )}

              <p className="swm-note">No minimum amount. Requests over {AUTO_APPROVE_MAX} USDT are reviewed by an admin.</p>

              <button className="swm-primary" onClick={submit} disabled={!valid || busy}>
                {busy ? 'Submitting…' : 'Withdraw →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */
export function SpinWheel() {
  const [status, setStatus]         = useState<Status>('idle');
  const [spinBalance, setSpinBal]   = useState<number | null>(null);
  const [spinsLeft, setSpinsLeft]   = useState<number | null>(null);
  const [recent, setRecent]         = useState<Recent[]>([]);
  const [totals, setTotals]         = useState({ won: 0, spins: 0 });
  const [confettiSeed, setSeed]     = useState(0);
  const [withdrawOpen, setWithdraw] = useState(false);
  const [popup, setPopup]           = useState<Popup | null>(null);
  const [claiming, setClaiming]     = useState(false);
  const [meta, setMeta]             = useState<{ tier: 'free' | 'deposit'; maxWinUsdt: number; spinsPer100Usdt: number } | null>(null);
  const pendingRef  = useRef<{ spinId: string; prizeUsdt: number; spinsLeft: number } | null>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const strips      = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  const rotorRef    = useRef<SVGGElement>(null);
  const pointerRef  = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);        // current wheel angle, degrees clockwise
  const rafRef      = useRef<number | null>(null);
  const revealRef   = useRef<number | null>(null);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (revealRef.current !== null) clearTimeout(revealRef.current);
  }, []);

  async function load() {
    try {
      const d = await fetch('/api/spin').then(r => r.json());
      if (d?.success) {
        setSpinBal(d.data.spinBalance);
        setSpinsLeft(d.data.spinsLeft);
        setRecent(d.data.recent);
        setTotals({ won: d.data.totalWon, spins: d.data.totalSpins });
        setMeta({ tier: d.data.tier, maxWinUsdt: d.data.maxWinUsdt, spinsPer100Usdt: d.data.spinsPer100Usdt });
        // A prize won earlier but never claimed (tab closed, etc.) — surface it again.
        if (d.data.unclaimed) {
          setPopup(p => p ?? { kind: 'win', spinId: d.data.unclaimed.spinId, prizeUsdt: d.data.unclaimed.prizeUsdt });
        }
      }
    } catch { /* non-fatal */ }
  }
  useEffect(() => { load(); }, []);

  async function spin() {
    if (status === 'spinning') return;
    if (popup?.kind === 'win') { toast.info('Claim your prize first.'); return; }
    if (spinsLeft !== null && spinsLeft <= 0) { toast.info('You have no spins left.'); return; }
    setPopup(null);
    setStatus('spinning');
    // Bring the wheel into view — on mobile the card sits below it, so
    // "Spin again" would otherwise leave the user staring at the card.
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const res = await fetch('/api/spin', { method: 'POST' });
      const d = await res.json();
      if (!res.ok || !d?.success) {
        if (d?.code === 'NO_SPINS') setSpinsLeft(0);
        throw new Error(d?.error || 'Spin failed');
      }

      const idx: number = d.data.segmentIndex;
      pendingRef.current = { spinId: d.data.spinId, prizeUsdt: d.data.prizeUsdt, spinsLeft: d.data.spinsLeft };
      setSpinsLeft(d.data.spinsLeft);

      // Land the pointer inside the chosen segment, with a little jitter so it
      // does not hit dead-centre every time.
      const jitter = (Math.random() - 0.5) * (SEGMENT_DEG - 14);
      const want   = (((360 - segmentCenterDeg(idx) + jitter) % 360) + 360) % 360;
      const from   = rotationRef.current;
      const cur    = ((from % 360) + 360) % 360;
      const delta  = (want - cur + 360) % 360;
      runSpin(from, from + FULL_TURNS * 360 + delta);
    } catch (e: any) {
      setStatus('idle');
      toast.error(e?.message ?? 'Spin failed. Please try again.');
    }
  }

  /** Animates the wheel from → to with easeSpin, kicking the pointer each time a
   *  segment edge passes under it. Always the same direction: the wheel turns
   *  clockwise, so every edge shoves the pointer tip to the right, and it springs
   *  back on its own between hits. */
  function runSpin(from: number, to: number) {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    let lastEdge = Math.floor(from / SEGMENT_DEG);
    let lastTs   = start;
    let kick     = 0;

    const frame = (now: number) => {
      const t     = Math.min(1, (now - start) / SPIN_MS);
      const angle = from + (to - from) * easeSpin(t);
      const dt    = Math.max(0, (now - lastTs) / 1000);
      lastTs = now;

      // A kick only when a boundary has actually crossed under the pointer.
      const edge = Math.floor(angle / SEGMENT_DEG);
      if (edge > lastEdge) { kick = POINTER_KICK; lastEdge = edge; }
      kick *= Math.pow(POINTER_DECAY, dt);
      if (kick < 0.05) kick = 0;

      rotationRef.current = angle;
      if (rotorRef.current)   rotorRef.current.style.transform   = `rotate(${angle}deg)`;
      if (pointerRef.current) pointerRef.current.style.transform = `translateX(-50%) rotate(${kick}deg)`;

      if (t < 1) { rafRef.current = requestAnimationFrame(frame); return; }
      rafRef.current = null;
      if (pointerRef.current) pointerRef.current.style.transform = 'translateX(-50%)';
      finishSpin();
    };
    rafRef.current = requestAnimationFrame(frame);
  }

  /** Wheel has settled. Hold for a beat, then reveal the result over the wheel. */
  function finishSpin() {
    const p = pendingRef.current;
    pendingRef.current = null;
    setStatus('result');
    if (!p) return;

    if (revealRef.current !== null) clearTimeout(revealRef.current);
    revealRef.current = window.setTimeout(() => {
      revealRef.current = null;
      setPopup({ kind: p.prizeUsdt > 0 ? 'win' : 'lose', spinId: p.spinId, prizeUsdt: p.prizeUsdt });
      // Confetti on every win, whatever the size — only a zero-prize spin goes without.
      if (p.prizeUsdt > 0) setSeed(s => s + 1);
      load();
    }, REVEAL_DELAY_MS);
  }

  async function claim() {
    if (!popup || popup.kind !== 'win' || claiming) return;
    setClaiming(true);
    try {
      const res = await fetch('/api/spin/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spinId: popup.spinId }),
      });
      const d = await res.json();
      if (!res.ok || !d?.success) {
        // Already claimed (e.g. double-tap or a second tab) — just sync and move on.
        if (d?.code === 'ALREADY_CLAIMED') { setPopup(null); setStatus('idle'); load(); return; }
        throw new Error(d?.error || 'Claim failed');
      }
      setSpinBal(d.data.spinBalance);
      setSpinsLeft(d.data.spinsLeft);
      setPopup(null);
      setStatus('idle');
      toast.reward(`+${popup.prizeUsdt.toFixed(2)} USDT added to your spin balance`, 4500);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Claim failed. Please try again.');
    } finally {
      setClaiming(false);
    }
  }

  function dismissLose() {
    setPopup(null);
    setStatus('idle');
  }

  const spinning = status === 'spinning';
  const noSpins  = spinsLeft !== null && spinsLeft <= 0;
  const winOpen  = popup?.kind === 'win';
  const dots = useMemo(() => Array.from({ length: 24 }, (_, i) => polar(i * 15, 176)), []);

  const popTone = !popup ? '' : popup.kind === 'lose' ? ' tone-none' : popup.prizeUsdt >= 50 ? ' tone-jackpot' : popup.prizeUsdt >= 5 ? ' tone-big' : ' tone-win';

  return (
    <div className="sw">
      {/* ── Header ── */}
      <div className="sw-head">
        <div>
          <h1 className="sw-title">Spin &amp; Win</h1>
          <p className="sw-sub">Every spin lands on a prize tier. Winnings collect in your spin balance.</p>
        </div>
        <span className="sw-testing">Testing mode</span>
      </div>

      <div className="sw-grid">
        {/* ── Wheel ── */}
        <div className="sw-stage" ref={stageRef}>
          {/* Backdrop — strips of Tether marks and gift boxes at 30°, alternating direction, under a dark overlay */}
          <div className="sw-bg" aria-hidden>
            {strips.map(i => (
              <div key={i} className={`sw-strip${i % 2 ? ' rev' : ''}`}>
                <div className="sw-strip-track" style={{ animationDelay: `${-(i * 2.3)}s` }}>
                  {[0, 1].map(half =>
                    STRIP_CELLS.map(c => (
                      <Fragment key={`${half}-${c}`}>
                        <img src="/spin-tether.png" alt="" className="sw-cell" draggable={false} />
                        <svg className="sw-cell sw-gift" viewBox="0 0 24 24">
                          <rect x="3.5" y="11.6" width="17" height="9.4" rx="1.4" fill="currentColor" />
                          <rect x="2" y="7.2" width="20" height="3.9" rx="1" fill="currentColor" />
                          <path d="M12 7.2v13.8" stroke="#111111" strokeWidth="1.7" />
                          <path d="M12 7.2c-1.3-2.7-5-3.9-5.9-1.7-.7 1.7 2.8 1.7 5.9 1.7zm0 0c1.3-2.7 5-3.9 5.9-1.7.7 1.7-2.8 1.7-5.9 1.7z" fill="currentColor" stroke="#111111" strokeWidth="0.6" strokeLinejoin="round" />
                        </svg>
                      </Fragment>
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="sw-bg-dark" aria-hidden />

          {winOpen && <Confetti seed={confettiSeed} />}

          <div className={`sw-wheel-wrap${spinning ? ' is-spinning' : ''}`}>
            {/* Pointer pivots at its top; its deflection is set per-frame from the wheel angle */}
            <div className="sw-pointer" ref={pointerRef} aria-hidden>
              <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
                <path d="M17 38 L3 8 Q17 -2 31 8 Z" fill="#CCFF00" />
                <path d="M17 31 L8 10 Q17 4 26 10 Z" fill="#E5FF66" opacity="0.55" />
              </svg>
            </div>

            <svg className="sw-svg" viewBox="0 0 360 360" role="img" aria-label="Prize wheel">
              <defs>
                <filter id="sw-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.55" />
                </filter>
              </defs>

              <circle cx={CX} cy={CY} r={179} fill="#0d0d0d" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              <g className="sw-dots">
                {dots.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r="2.6" fill="#CCFF00" style={{ animationDelay: `${(i % 3) * 0.09}s` }} />
                ))}
              </g>

              <g
                ref={rotorRef}
                className="sw-rotor"
                style={{ transform: `rotate(${rotationRef.current}deg)`, transformOrigin: `${CX}px ${CY}px` }}
              >
                <circle cx={CX} cy={CY} r={R} fill="#111" filter="url(#sw-shadow)" />
                {SPIN_PRIZES.map((p, i) => {
                  const t = TONE[p.tone];
                  const centre = segmentCenterDeg(i);
                  const lp = polar(centre, LABEL_R);
                  const flip = centre > 180;
                  const rot = centre - 90 + (flip ? 180 : 0);
                  const isNone = p.usdt === 0;
                  return (
                    <g key={i}>
                      <path d={wedgePath(i)} fill={t.fill} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                      <g transform={`translate(${lp.x.toFixed(2)} ${lp.y.toFixed(2)}) rotate(${rot.toFixed(2)})`}>
                        <text
                          textAnchor="middle" dominantBaseline="middle" fill={t.text}
                          fontFamily="var(--fr-font-mono)" fontWeight={800}
                          fontSize={isNone ? 12.5 : p.usdt >= 10 ? 22 : 18} letterSpacing="-0.02em"
                        >
                          {p.label}
                        </text>
                        {!isNone && (
                          <text y="15" textAnchor="middle" dominantBaseline="middle" fill={t.sub}
                            fontFamily="var(--fr-font-sans)" fontWeight={700} fontSize={8.5} letterSpacing="0.12em">
                            USDT
                          </text>
                        )}
                      </g>
                    </g>
                  );
                })}
                <circle cx={CX} cy={CY} r={58} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              </g>

              <circle cx={CX} cy={CY} r={50} fill="#0b0b0b" stroke="rgba(204,255,0,0.35)" strokeWidth="2" />
            </svg>

            <button className={`sw-hub${spinning ? ' is-busy' : ''}`} onClick={spin} disabled={spinning || noSpins || winOpen} aria-label="Spin the wheel">
              <ArrowClockwise size={18} weight="bold" className="sw-hub-ico" />
              <span>{spinning ? '…' : 'SPIN'}</span>
            </button>
          </div>

          {/* ── Result popup — centred over the wheel ── */}
          {popup && (
            <div className="sw-pop-backdrop">
              <div className={`sw-pop${popTone}`}>
                <div className="sw-pop-rule" />
                <div className="sw-pop-body">
                  {popup.kind === 'win' ? (
                    <>
                      <div className="sw-pop-ico">
                        {popup.prizeUsdt >= 10 ? <Trophy size={24} weight="fill" /> : <Sparkle size={24} weight="fill" />}
                      </div>
                      <p className="sw-pop-h">You won</p>
                      <p className="sw-pop-amt">{popup.prizeUsdt.toFixed(2)} <span>USDT</span></p>
                      <button className="sw-pop-btn" onClick={claim} disabled={claiming}>
                        {claiming ? 'Claiming…' : `Claim ${popup.prizeUsdt.toFixed(2)} USDT →`}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="sw-pop-ico muted"><Coins size={24} weight="duotone" /></div>
                      <p className="sw-pop-h">No prize this time</p>
                      <p className="sw-pop-s">Better luck on the next spin.</p>
                      <button className="sw-pop-btn" onClick={() => { dismissLose(); if (!noSpins) spin(); }}>
                        {noSpins ? 'Close' : 'Spin again →'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        <div className="sw-side">
          {/* Merged spin block: balances + CTA + actions */}
          <div className={`sw-card${winOpen ? ' tone-win' : ''}`}>
            <div className="sw-stats">
              <div className="sw-stat">
                <span className="sw-stat-v lime">{spinBalance === null ? '…' : spinBalance.toFixed(2)}</span>
                <span className="sw-stat-l">Spin balance · USDT</span>
              </div>
              <div className="sw-stat">
                <span className="sw-stat-v">{spinsLeft === null ? '…' : spinsLeft}</span>
                <span className="sw-stat-l">Spins left</span>
              </div>
              <div className="sw-stat">
                <span className="sw-stat-v">{totals.won.toFixed(2)}</span>
                <span className="sw-stat-l">Total won</span>
              </div>
            </div>

            <button className="sw-again" onClick={spin} disabled={spinning || noSpins || winOpen}>
              {winOpen ? 'Claim your prize above' : noSpins ? 'No spins left' : spinning ? 'Spinning…' : status === 'result' ? 'Spin again →' : 'Spin now →'}
            </button>

            <div className="sw-actions">
              <Link href="/wallets" className="sw-act">
                <Plus size={14} weight="bold" /> Add funds to get more spins
              </Link>
              <button className="sw-act" onClick={() => setWithdraw(true)} disabled={!spinBalance || spinBalance <= 0}>
                <ArrowUpRight size={14} weight="bold" /> Withdraw
              </button>
            </div>
            {meta && (
              <p className="sw-meta">
                Every 100 USDT you add earns {meta.spinsPer100Usdt} spins · Max prize on your tier: {meta.maxWinUsdt.toFixed(2)} USDT
              </p>
            )}
          </div>

          <div className="sw-recent">
            <div className="sw-recent-head">Recent spins</div>
            {recent.length === 0 ? (
              <div className="sw-recent-empty">No spins yet.</div>
            ) : (
              recent.map(r => (
                <div key={r._id} className="sw-row">
                  <span className="sw-row-t">{new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`sw-row-p${r.prizeUsdt > 0 ? ' win' : ''}`}>
                    {r.prizeUsdt > 0 ? `+${r.prizeUsdt.toFixed(2)} USDT` : 'No prize'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {withdrawOpen && (
        <WithdrawModal balance={spinBalance ?? 0} onClose={() => setWithdraw(false)} onDone={load} />
      )}

      <style>{`
        .sw { display: flex; flex-direction: column; gap: 24px; }
        .sw-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .sw-title { font-size: 24px; font-weight: 800; color: var(--fr-text-primary); margin: 0 0 4px; letter-spacing: -0.03em; }
        .sw-sub { margin: 0; font-size: 14px; color: var(--fr-text-secondary); }
        .sw-testing { font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #FBBF24; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25); border-radius: var(--fr-radius-pill); padding: 6px 12px; white-space: nowrap; }

        .sw-grid { display: grid; grid-template-columns: minmax(0, 440px) 1fr; gap: 24px; align-items: start; }
        @media (max-width: 860px) { .sw-grid { grid-template-columns: 1fr; } }

        .sw-stage { background: var(--fr-dark-2); border: 1px solid var(--fr-border-default); border-radius: var(--fr-radius-2xl); padding: 26px 22px 30px; display: flex; justify-content: center; position: relative; overflow: hidden; scroll-margin-top: calc(var(--fr-nav-height, 64px) + 16px); }
        .sw-stage::before { content: ''; position: absolute; inset: -40%; z-index: 1; background: radial-gradient(circle at 50% 45%, rgba(204,255,0,0.10), transparent 55%); pointer-events: none; opacity: 0.7; transition: opacity var(--fr-ease-slow); }
        .sw-stage:has(.is-spinning)::before { opacity: 1; }

        /* Backdrop strips — Tether mark, gift, Tether mark, gift… with real spacing */
        .sw-bg { position: absolute; inset: -38%; z-index: 0; display: flex; flex-direction: column; justify-content: center; gap: 18px; transform: rotate(-30deg); pointer-events: none; }
        .sw-strip { height: 26px; width: 100%; overflow: hidden; opacity: 0.22; }
        .sw-strip-track { display: flex; align-items: center; width: max-content; animation: sw-marquee 38s linear infinite; will-change: transform; }
        .sw-strip.rev .sw-strip-track { animation-direction: reverse; }
        .sw-cell { flex: 0 0 auto; width: 26px; height: 26px; margin-right: 24px; }
        .sw-gift { color: var(--fr-lime); width: 21px; height: 21px; }
        @keyframes sw-marquee { to { transform: translateX(-50%); } }
        .sw-bg-dark { position: absolute; inset: 0; z-index: 0; pointer-events: none; background:
          radial-gradient(ellipse at 50% 45%, rgba(17,17,17,0.02) 0%, rgba(17,17,17,0.14) 60%, rgba(17,17,17,0.30) 100%); }

        .sw-wheel-wrap { position: relative; z-index: 2; width: min(100%, 380px); aspect-ratio: 1; }
        .sw-svg { width: 100%; height: 100%; display: block; }
        .sw-rotor { will-change: transform; }

        .sw-dots circle { opacity: 0.28; transition: opacity 250ms; }
        .is-spinning .sw-dots circle { animation: sw-chase 0.27s steps(1) infinite; }
        @keyframes sw-chase { 0% { opacity: 1; } 34% { opacity: 0.22; } 100% { opacity: 0.22; } }

        .sw-pointer { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); z-index: 3; filter: drop-shadow(0 4px 10px rgba(204,255,0,0.45)); transform-origin: 50% 10%; will-change: transform; }

        .sw-hub { position: absolute; top: 50%; left: 50%; width: 26.5%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; border: none; cursor: pointer; background: radial-gradient(circle at 50% 38%, #E5FF66, #CCFF00 70%); color: #000; font-weight: 900; font-size: clamp(12px, 3.6vw, 15px); letter-spacing: 0.08em; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; box-shadow: 0 0 0 6px rgba(204,255,0,0.12), 0 10px 30px rgba(204,255,0,0.35); transition: transform var(--fr-ease-bounce); animation: sw-breathe 2.6s ease-in-out infinite; z-index: 2; }
        .sw-hub:hover:not(:disabled) { transform: translate(-50%, -50%) scale(1.05); }
        .sw-hub:active:not(:disabled) { transform: translate(-50%, -50%) scale(0.96); }
        .sw-hub:disabled { cursor: not-allowed; }
        .sw-hub.is-busy { animation: none; box-shadow: 0 0 0 6px rgba(204,255,0,0.08), 0 6px 18px rgba(204,255,0,0.2); }
        .sw-hub.is-busy .sw-hub-ico { animation: fr-spin 0.9s linear infinite; }
        @keyframes sw-breathe { 0%,100% { box-shadow: 0 0 0 6px rgba(204,255,0,0.12), 0 10px 30px rgba(204,255,0,0.35); } 50% { box-shadow: 0 0 0 10px rgba(204,255,0,0.06), 0 12px 40px rgba(204,255,0,0.55); } }

        /* Result popup over the wheel */
        .sw-pop-backdrop { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(8,8,8,0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: sw-fade 260ms ease-out both; }
        @keyframes sw-fade { from { opacity: 0; } to { opacity: 1; } }
        .sw-pop { width: min(100%, 300px); background: #0c0c0c; border: 1px solid rgba(255,255,255,0.12); border-radius: 22px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.7); animation: sw-pop-in 420ms cubic-bezier(0.34, 1.3, 0.64, 1) both; }
        @keyframes sw-pop-in { from { opacity: 0; transform: scale(0.86) translateY(14px); } to { opacity: 1; transform: none; } }
        .sw-pop-rule { height: 3px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); }
        .sw-pop.tone-win .sw-pop-rule, .sw-pop.tone-big .sw-pop-rule, .sw-pop.tone-jackpot .sw-pop-rule { background: linear-gradient(90deg, transparent, #CCFF00 25%, #E5FF66 50%, #9AD900 75%, transparent); }
        .sw-pop.tone-win, .sw-pop.tone-big { border-color: rgba(204,255,0,0.3); }
        .sw-pop.tone-jackpot { border-color: rgba(204,255,0,0.6); box-shadow: 0 30px 80px rgba(0,0,0,0.7), var(--fr-glow-lime); }
        .sw-pop-body { padding: 24px 22px 22px; text-align: center; }
        .sw-pop-ico { width: 52px; height: 52px; border-radius: 16px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; background: rgba(204,255,0,0.12); border: 1px solid rgba(204,255,0,0.3); color: var(--fr-lime); }
        .sw-pop-ico.muted { background: rgba(255,255,255,0.04); border-color: var(--fr-border-default); color: var(--fr-text-tertiary); }
        .sw-pop-h { margin: 0; font-size: 13px; font-weight: 700; color: var(--fr-text-secondary); letter-spacing: 0.02em; }
        .sw-pop-amt { margin: 4px 0 16px; font-family: var(--fr-font-mono); font-size: 40px; font-weight: 900; color: var(--fr-text-primary); letter-spacing: -0.04em; line-height: 1; }
        .sw-pop-amt span { font-size: 13px; font-weight: 800; color: var(--fr-lime); letter-spacing: 0.08em; margin-left: 4px; }
        .sw-pop.tone-jackpot .sw-pop-amt { color: var(--fr-lime); }
        .sw-pop-s { margin: 4px 0 16px; font-size: 12.5px; color: var(--fr-text-tertiary); }
        .sw-pop-btn { width: 100%; padding: 13px; border-radius: 13px; border: none; cursor: pointer; background: linear-gradient(135deg, #CCFF00 0%, #9AD900 100%); color: #000; font-size: 14px; font-weight: 900; letter-spacing: -0.01em; box-shadow: 0 6px 20px rgba(204,255,0,0.22); transition: transform var(--fr-ease-fast), opacity var(--fr-ease-fast); }
        .sw-pop-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .sw-pop-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .sw-pop.tone-none .sw-pop-btn { background: rgba(255,255,255,0.06); color: var(--fr-text-primary); border: 1px solid var(--fr-border-default); box-shadow: none; }

        .sw-side { display: flex; flex-direction: column; gap: 14px; min-width: 0; }

        /* Merged card */
        .sw-card { position: relative; overflow: hidden; background: var(--fr-dark-2); border: 1px solid var(--fr-border-default); border-radius: var(--fr-radius-xl); padding: 16px; display: flex; flex-direction: column; gap: 14px; transition: border-color var(--fr-ease-med); }
        .sw-card.tone-win { border-color: rgba(204,255,0,0.3); }

        .sw-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .sw-stat { background: rgba(255,255,255,0.03); border: 1px solid var(--fr-border-subtle); border-radius: var(--fr-radius-lg); padding: 11px 12px 10px; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .sw-stat-v { font-family: var(--fr-font-mono); font-size: 18px; font-weight: 800; color: var(--fr-text-primary); letter-spacing: -0.02em; overflow: hidden; text-overflow: ellipsis; }
        .sw-stat-v.lime { color: var(--fr-lime); }
        .sw-stat-l { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fr-text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .sw-again { width: 100%; padding: 12px; border-radius: var(--fr-radius-lg); border: none; cursor: pointer; background: var(--fr-lime); color: #000; font-size: 13.5px; font-weight: 800; letter-spacing: -0.01em; transition: transform var(--fr-ease-fast), opacity var(--fr-ease-fast); }
        .sw-again:hover:not(:disabled) { transform: translateY(-1px); }
        .sw-again:disabled { opacity: 0.45; cursor: not-allowed; }

        .sw-actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
        .sw-act { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: var(--fr-radius-md); font-size: 12.5px; font-weight: 700; text-decoration: none; cursor: pointer; background: rgba(255,255,255,0.04); border: 1px solid var(--fr-border-default); color: var(--fr-text-secondary); transition: background var(--fr-ease-fast), color var(--fr-ease-fast), border-color var(--fr-ease-fast); white-space: nowrap; }
        .sw-act:hover:not(:disabled) { background: rgba(204,255,0,0.08); border-color: rgba(204,255,0,0.25); color: var(--fr-lime); }
        .sw-act:disabled { opacity: 0.4; cursor: not-allowed; }
        .sw-meta { margin: -4px 0 0; font-size: 11px; color: var(--fr-text-tertiary); text-align: center; line-height: 1.5; }

        /* Confetti — topmost layer, falling over the popup. pointer-events: none keeps the Claim button clickable through it. */
        .sw-confetti { position: absolute; inset: 0; z-index: 6; pointer-events: none; overflow: hidden; }
        .sw-confetti span { position: absolute; top: -12px; border-radius: 2px; opacity: 0; animation: sw-fall 3s cubic-bezier(0.25, 0.6, 0.4, 1) forwards; }
        @keyframes sw-fall { 0% { opacity: 1; transform: translate(0, 0) rotate(var(--rot)); } 85% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), 640px) rotate(calc(var(--rot) + 720deg)); } }

        .sw-recent { background: var(--fr-dark-2); border: 1px solid var(--fr-border-default); border-radius: var(--fr-radius-xl); overflow: hidden; }
        .sw-recent-head { padding: 12px 16px; border-bottom: 1px solid var(--fr-border-subtle); font-size: 12.5px; font-weight: 700; color: var(--fr-text-primary); }
        .sw-recent-empty { padding: 26px 16px; text-align: center; font-size: 12.5px; color: var(--fr-text-tertiary); }
        .sw-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--fr-border-subtle); font-size: 12.5px; }
        .sw-row:last-child { border-bottom: none; }
        .sw-row-t { color: var(--fr-text-tertiary); font-family: var(--fr-font-mono); }
        .sw-row-p { color: var(--fr-text-tertiary); font-weight: 700; }
        .sw-row-p.win { color: var(--fr-lime); font-family: var(--fr-font-mono); }

        /* Withdraw modal — same shell as the referral / PRO modals, lime accent */
        .swm-backdrop { position: fixed; inset: 0; z-index: 9990; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,0.88); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .swm { width: 100%; max-width: 420px; max-height: 94dvh; overflow-y: auto; background: #0c0c0c; border: 1px solid rgba(204,255,0,0.15); border-radius: 28px; box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: swm-in 0.28s cubic-bezier(0.34,1.1,0.64,1); }
        @keyframes swm-in { from { opacity: 0; transform: scale(0.93) translateY(10px); } to { opacity: 1; transform: none; } }
        .swm-rule { height: 3px; border-radius: 28px 28px 0 0; background: linear-gradient(90deg, transparent, #CCFF00 25%, #E5FF66 50%, #9AD900 75%, transparent); }
        .swm-body { padding: 18px 18px 20px; }
        .swm-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
        .swm-title { margin: 0; font-size: 16px; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
        .swm-sub { margin: 2px 0 0; font-size: 11px; color: rgba(255,255,255,0.5); }
        .swm-close { width: 34px; height: 34px; border-radius: 11px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.28); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .swm-label { display: flex; justify-content: space-between; align-items: baseline; margin: 0 0 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.5); }
        .swm-avail { text-transform: none; letter-spacing: 0; font-weight: 600; color: rgba(255,255,255,0.35); }
        .swm-nets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .swm-net { padding: 10px 6px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.08); background: #181818; cursor: pointer; text-align: center; display: flex; flex-direction: column; gap: 3px; transition: all var(--fr-ease-fast); }
        .swm-net span { font-size: 12px; font-weight: 900; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; }
        .swm-net small { font-size: 9px; color: rgba(255,255,255,0.28); font-weight: 600; }
        .swm-net.on { border-color: #CCFF00; background: rgba(204,255,0,0.08); }
        .swm-net.on span { color: #CCFF00; }
        .swm-amt { display: flex; align-items: center; background: #181818; border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; overflow: hidden; margin-bottom: 10px; }
        .swm-amt input { flex: 1; min-width: 0; padding: 13px 0 13px 14px; background: transparent; border: none; outline: none; font-size: 16px; color: #fff; font-family: var(--fr-font-mono); }
        .swm-amt button { margin: 0 6px; padding: 6px 10px; border-radius: 8px; background: rgba(204,255,0,0.1); border: 1px solid rgba(204,255,0,0.3); color: #CCFF00; font-size: 11px; font-weight: 800; cursor: pointer; }
        .swm-amt b { padding: 0 14px; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5); }
        .swm-err { margin-bottom: 10px; padding: 10px 14px; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.25); border-radius: 10px; font-size: 12px; color: #F87171; line-height: 1.5; }
        .swm-err a { color: #CCFF00; font-weight: 700; text-decoration: none; }
        .swm-note { margin: 0 0 14px; font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.6; }
        .swm-primary { width: 100%; padding: 14px; border-radius: 13px; border: none; cursor: pointer; background: linear-gradient(135deg, #CCFF00 0%, #9AD900 100%); color: #000; font-size: 14px; font-weight: 900; letter-spacing: -0.01em; box-shadow: 0 6px 20px rgba(204,255,0,0.22); }
        .swm-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
        .swm-done { text-align: center; padding: 6px 0 0; }
        .swm-done-ico { width: 56px; height: 56px; border-radius: 18px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; background: rgba(204,255,0,0.12); border: 1.5px solid rgba(204,255,0,0.35); color: #CCFF00; }
        .swm-done-h { margin: 0; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); }
        .swm-done-amt { margin: 4px 0 8px; font-family: var(--fr-font-mono); font-size: 34px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1; }
        .swm-done-amt span { font-size: 12px; font-weight: 800; color: #CCFF00; letter-spacing: 0.08em; margin-left: 4px; }
        .swm-done-s { margin: 0 0 18px; font-size: 12.5px; color: rgba(255,255,255,0.45); line-height: 1.6; }

        @media (prefers-reduced-motion: reduce) {
          .sw-hub { animation: none; }
          .is-spinning .sw-dots circle, .sw-strip-track { animation: none; }
          .sw-confetti { display: none; }
        }
      `}</style>
    </div>
  );
}
