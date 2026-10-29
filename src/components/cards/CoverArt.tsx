import type { ReactNode } from 'react';
import type { KnowledgeCard } from '../../types';
import { familyOf, type FamilyMeta } from '../../data/families';
import { SYMBOLS } from './symbols';
import type { SymbolId } from '../../data/symbols';

// Procedural cover art: every card gets a flat illustration drawn from its topic family,
// varied by a seed from the card id. Pure SVG, so it costs nothing to ship and works offline.

const NAVY = '#14213D';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const between = (r: Rand, lo: number, hi: number) => lo + r() * (hi - lo);

function money(v: number, f: FamilyMeta, r: Rand): ReactNode {
  if (v === 0) {
    const pts = [0, 1, 2, 3, 4].map((i) => [40 + i * 68, 150 - i * between(r, 14, 26) + (i === 2 ? between(r, 10, 30) : 0)]);
    const [ex, ey] = pts[4];
    const coinX = between(r, 70, 110);
    return (
      <>
        <circle cx={coinX} cy={58} r={30} fill={f.light} />
        <circle cx={coinX} cy={58} r={16} fill="none" stroke={NAVY} strokeWidth={4} opacity={0.85} />
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={NAVY} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={ex} cy={ey} r={12} fill={NAVY} />
      </>
    );
  }
  if (v === 1) {
    const stacks = [0, 1, 2, 3].map((i) => Math.round(between(r, 2, 6)) + i);
    return (
      <>
        {stacks.map((n, i) =>
          Array.from({ length: n }, (_, k) => (
            <rect key={`${i}-${k}`} x={60 + i * 64} y={170 - k * 16} width={50} height={13} rx={6.5} fill={k === n - 1 ? NAVY : k % 2 ? f.light : f.mid} />
          )),
        )}
      </>
    );
  }
  const bars = [0, 1, 2, 3, 4].map(() => between(r, 40, 120));
  return (
    <>
      <circle cx={300} cy={40} r={between(r, 34, 48)} fill={f.light} />
      {bars.map((h, i) => (
        <rect key={i} x={50 + i * 50} y={176 - h} width={34} height={h} rx={10} fill={i === 3 ? NAVY : f.light} />
      ))}
    </>
  );
}

function people(v: number, f: FamilyMeta, r: Rand): ReactNode {
  if (v === 0) {
    const dx = between(r, 52, 70);
    return (
      <>
        <circle cx={180 - dx / 2} cy={104} r={52} fill={f.light} />
        <circle cx={180 + dx / 2} cy={104} r={52} fill={NAVY} opacity={0.9} />
        <circle cx={180 - dx / 2 - 6} cy={96} r={9} fill={NAVY} />
        <circle cx={180 + dx / 2 + 6} cy={96} r={9} fill={f.light} />
      </>
    );
  }
  if (v === 1) {
    return (
      <>
        <rect x={50} y={44} width={150} height={74} rx={24} fill={f.light} />
        <path d="M78 116 l-6 26 l28 -26z" fill={f.light} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={92 + i * 32} cy={81} r={9} fill={NAVY} />
        ))}
        <rect x={150} y={100} width={170} height={66} rx={22} fill={NAVY} />
        <path d="M290 164 l8 24 l-30 -24z" fill={NAVY} />
        <rect x={172} y={124} width={between(r, 70, 120)} height={9} rx={4.5} fill={f.light} />
        <rect x={172} y={140} width={between(r, 40, 80)} height={9} rx={4.5} fill={f.mid} />
      </>
    );
  }
  const xs = [110, 180, 250];
  const lead = Math.floor(r() * 3);
  return (
    <>
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={88} r={i === lead ? 28 : 22} fill={i === lead ? NAVY : f.light} />
          <path d={`M${x - 42} 190 a42 42 0 0 1 84 0z`} fill={i === lead ? NAVY : f.light} />
        </g>
      ))}
    </>
  );
}

function ai(v: number, f: FamilyMeta, r: Rand): ReactNode {
  if (v === 0) {
    const nodes = [0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 + between(r, -0.3, 0.3);
      return [180 + Math.cos(a) * between(r, 90, 130), 100 + Math.sin(a) * between(r, 50, 70)];
    });
    const fills = ['#FFFFFF', '#F2B33D', NAVY, f.light, '#14B8A6'];
    return (
      <>
        {nodes.map(([x, y], i) => (
          <line key={`l${i}`} x1={180} y1={100} x2={x} y2={y} stroke={f.light} strokeWidth={4} />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={`n${i}`} cx={x} cy={y} r={13} fill={fills[i]} />
        ))}
        <circle cx={180} cy={100} r={32} fill={NAVY} />
        <circle cx={180} cy={100} r={12} fill="#FFFFFF" />
      </>
    );
  }
  if (v === 1) {
    return (
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={124 + i * 28} y1={20} x2={124 + i * 28} y2={180} stroke={f.light} strokeWidth={5} strokeLinecap="round" />
            <line x1={70} y1={44 + i * 28} x2={290} y2={44 + i * 28} stroke={f.light} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
          </g>
        ))}
        <rect x={110} y={34} width={140} height={132} rx={26} fill={NAVY} />
        <rect x={146} y={68} width={68} height={64} rx={14} fill={f.mid} />
        <circle cx={180} cy={100} r={between(r, 9, 14)} fill="#F2B33D" />
      </>
    );
  }
  const steps = ['#FFFFFF', '#F2B33D', '#14B8A6'];
  return (
    <>
      <circle cx={180} cy={100} r={66} fill="none" stroke={f.light} strokeWidth={10} strokeDasharray="70 34" />
      {steps.map((c, i) => {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2 + r() * 0.2;
        return <circle key={i} cx={180 + Math.cos(a) * 66} cy={100 + Math.sin(a) * 66} r={18} fill={c} stroke={NAVY} strokeWidth={4} />;
      })}
      <path d="M168 100 l9 9 18 -18" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function ops(v: number, f: FamilyMeta, r: Rand): ReactNode {
  if (v === 0) {
    const done = Math.floor(between(r, 2, 6));
    return (
      <>
        {Array.from({ length: 8 }, (_, i) => {
          const x = 60 + (i % 4) * 64;
          const y = 40 + Math.floor(i / 4) * 66;
          return (
            <g key={i}>
              <rect x={x} y={y} width={50} height={50} rx={14} fill={i < done ? NAVY : f.light} />
              {i < done && <path d={`M${x + 14} ${y + 26} l8 8 15 -16`} fill="none" stroke={f.light} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          );
        })}
      </>
    );
  }
  if (v === 1) {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={36 + i * 108} y={70} width={72} height={60} rx={18} fill={i === 1 ? NAVY : f.light} />
            {i < 2 && <path d={`M${112 + i * 108} 100 h22 m-9 -9 l9 9 -9 9`} fill="none" stroke={NAVY} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        ))}
        <circle cx={between(r, 60, 300)} cy={36} r={14} fill={f.mid} />
      </>
    );
  }
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={90} y={40 + i * 46} width={32} height={32} rx={9} fill={i < 2 ? NAVY : f.light} />
          {i < 2 && <path d={`M98 ${57 + i * 46} l6 6 11 -12`} fill="none" stroke={f.light} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
          <rect x={136} y={50 + i * 46} width={between(r, 90, 150)} height={12} rx={6} fill={i < 2 ? f.light : NAVY} opacity={i < 2 ? 1 : 0.5} />
        </g>
      ))}
    </>
  );
}

function mind(v: number, f: FamilyMeta, r: Rand): ReactNode {
  if (v === 0) {
    return (
      <>
        {[78, 56, 34].map((rad, i) => (
          <circle key={i} cx={180} cy={100} r={rad} fill={i === 1 ? f.light : i === 2 ? NAVY : f.mid} />
        ))}
        <circle cx={180} cy={100} r={12} fill="#F2B33D" />
        <path d={`M${between(r, 290, 320)} 30 L196 92`} stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
      </>
    );
  }
  if (v === 1) {
    const tilt = between(r, -12, 12);
    return (
      <>
        <path d="M180 60 V170" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
        <path d="M140 176 H220" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
        <g transform={`rotate(${tilt} 180 60)`}>
          <path d="M70 60 H290" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
          <path d="M70 60 L46 108 H94 Z" fill={f.light} stroke={NAVY} strokeWidth={4} />
          <path d="M290 60 L266 108 H314 Z" fill={NAVY} />
        </g>
        <circle cx={180} cy={60} r={10} fill="#F2B33D" />
      </>
    );
  }
  return (
    <>
      <circle cx={180} cy={88} r={50} fill={f.light} />
      <rect x={160} y={134} width={40} height={14} rx={7} fill={NAVY} />
      <rect x={166} y={152} width={28} height={10} rx={5} fill={NAVY} opacity={0.7} />
      <path d="M164 96 q16 -30 32 0" fill="none" stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => {
        const a = -Math.PI / 2 + (i - 1.5) * 0.6;
        return <line key={i} x1={180 + Math.cos(a) * 64} y1={88 + Math.sin(a) * 64} x2={180 + Math.cos(a) * (80 + r() * 8)} y2={88 + Math.sin(a) * (80 + r() * 8)} stroke={NAVY} strokeWidth={6} strokeLinecap="round" />;
      })}
    </>
  );
}

const MOTIFS = { money, people, ai, ops, mind };

export function CoverArt({ card, className = '', height = 200 }: { card: Pick<KnowledgeCard, 'id' | 'primaryTopic' | 'coverSymbol'>; className?: string; height?: number }) {
  const f = familyOf(card.primaryTopic);
  const seed = hash(card.id);
  const r = rng(seed);
  const variant = seed % 3;
  const cx = r() > 0.5 ? 330 : 30;
  const cy = r() > 0.5 ? 10 : 190;
  const big = between(r, 80, 120);
  const symbol = card.coverSymbol && card.coverSymbol in SYMBOLS ? SYMBOLS[card.coverSymbol as SymbolId] : null;
  // With an idea symbol, the family motif becomes a faint texture and the symbol takes centre stage.
  const sx = 180 + (cx > 180 ? -1 : 1) * between(r, 20, 70);
  return (
    <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" width="100%" height={height} className={className} aria-hidden>
      <rect width="360" height="200" fill={f.bg} />
      <circle cx={cx} cy={cy} r={big} fill={f.mid} />
      {symbol ? (
        <>
          <g opacity={0.22}>{MOTIFS[f.id](variant, f, r)}</g>
          <circle cx={sx} cy={100} r={66} fill={f.light} />
          <circle cx={sx + 52} cy={52} r={9} fill="#F2B33D" />
          <g transform={`translate(${sx - 45.6} 54.4) scale(1.9)`} fill="none" stroke={NAVY} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
            {symbol}
          </g>
        </>
      ) : (
        MOTIFS[f.id](variant, f, r)
      )}
    </svg>
  );
}
