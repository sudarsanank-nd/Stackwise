import type { CSSProperties } from 'react';
import type { ExplainerScene } from '../../types';
import type { FamilyMeta } from '../../data/families';

// Animated SVG building blocks for motion explainers. Each visual animates in once when its
// scene mounts (CSS keyframes in index.css); the player pauses them via `.sw-paused`.

const W = 300;
const H = 220;
const INK = '#F2EFE6';
const DIM = '#34466F';
const MARIGOLD = '#F2B33D';
const EMERALD = '#4FD08F';
const CORAL = '#FF6B57';

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function Label({ x, y, children, anchor = 'middle', size = 13, fill = INK, d = 0 }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end'; size?: number; fill?: string; d?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={700} fill={fill} fontFamily="Figtree Variable, Figtree, sans-serif" className="sw-fade" style={delay(d)}>
      {children}
    </text>
  );
}

function Scale({ labels = [], values }: ExplainerScene) {
  const leftHeavier = !values || (values[0] ?? 1) >= (values[1] ?? 0);
  return (
    <>
      <path d="M150 64 V186" stroke={DIM} strokeWidth={8} strokeLinecap="round" />
      <path d="M104 194 H196" stroke={DIM} strokeWidth={8} strokeLinecap="round" />
      <g className={leftHeavier ? 'sw-tip-left' : 'sw-tip-right'} style={{ transformOrigin: '150px 64px', ...delay(1) }}>
        <path d="M40 64 H260" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M40 64 L16 112 H64 Z" fill="none" stroke={INK} strokeWidth={3} />
        <path d="M260 64 L236 112 H284 Z" fill="none" stroke={INK} strokeWidth={3} />
        <rect x={6} y={88} width={68} height={24} rx={8} fill={CORAL} className="sw-pop" />
        <rect x={226} y={88} width={68} height={24} rx={8} fill={EMERALD} className="sw-pop" style={delay(0.3)} />
        <Label x={40} y={105} size={12} fill="#14213D">{labels[0] ?? ''}</Label>
        <Label x={260} y={105} size={12} fill="#14213D" d={0.3}>{labels[1] ?? ''}</Label>
      </g>
      <circle cx={150} cy={64} r={8} fill={MARIGOLD} />
    </>
  );
}

function Curve({ labels = [], values = [0.2, 0.4, 0.6, 0.8] }: ExplainerScene) {
  const n = Math.max(2, values.length);
  const pts = values.map((v, i) => [30 + (i * 240) / (n - 1), 180 - Math.max(0, Math.min(1, v)) * 140]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const [ex, ey] = pts[pts.length - 1];
  return (
    <>
      <path d="M30 190 H280" stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      <path d={d} fill="none" stroke={MARIGOLD} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="sw-draw" />
      <circle cx={ex} cy={ey} r={9} fill={INK} className="sw-pop" style={delay(2)} />
      {labels[0] && <Label x={30} y={212} anchor="start" size={12} fill="#B4BBCC">{labels[0]}</Label>}
      {labels[1] && <Label x={Math.min(270, ex)} y={Math.max(20, ey - 16)} anchor="end" d={2.2}>{labels[1]}</Label>}
    </>
  );
}

function Cycle({ labels = [] }: ExplainerScene, f: FamilyMeta) {
  const n = Math.max(3, Math.min(5, labels.length || 3));
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [150 + Math.cos(a) * 78, 110 + Math.sin(a) * 78];
  });
  return (
    <>
      <circle cx={150} cy={110} r={78} fill="none" stroke={DIM} strokeWidth={6} />
      <g className="sw-spin" style={{ transformOrigin: '150px 110px', ...delay(1) }}>
        <circle cx={150} cy={32} r={8} fill={MARIGOLD} />
      </g>
      {nodes.map(([x, y], i) => (
        <g key={i} className="sw-pop" style={delay(0.3 + i * 0.35)}>
          <circle cx={x} cy={y} r={22} fill={i === 0 ? f.bg : '#1E2D52'} stroke={INK} strokeWidth={2} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize={labels[i] && labels[i].length > 6 ? 9 : 11} fontWeight={800} fill={i === 0 ? f.onBg : INK} fontFamily="Figtree Variable, Figtree, sans-serif">
            {labels[i] ?? ''}
          </text>
        </g>
      ))}
    </>
  );
}

function Bars({ labels = [], values = [] }: ExplainerScene, f: FamilyMeta) {
  const n = Math.max(1, values.length);
  const bw = Math.min(64, 200 / n);
  const gap = (260 - bw * n) / (n + 1);
  return (
    <>
      <path d="M20 182 H280" stroke={DIM} strokeWidth={3} strokeLinecap="round" />
      {values.map((v, i) => {
        const h = Math.max(6, Math.min(1, v) * 140);
        const x = 20 + gap * (i + 1) + bw * i;
        return (
          <g key={i}>
            <rect x={x} y={180 - h} width={bw} height={h} rx={10} fill={i === 0 ? f.bg : '#5D6E98'} className="sw-grow" style={delay(0.4 + i * 0.4)} />
            <Label x={x + bw / 2} y={204} size={12} d={0.4 + i * 0.4}>{labels[i] ?? ''}</Label>
          </g>
        );
      })}
    </>
  );
}

function Stack({ labels = [] }: ExplainerScene, f: FamilyMeta) {
  const n = Math.max(1, Math.min(5, labels.length));
  const bh = Math.min(40, 170 / n - 6);
  return (
    <>
      {labels.slice(0, n).map((l, i) => {
        // Items read top-down in order, each dropping into place after the previous one.
        const y = (H - n * (bh + 6) + 6) / 2 + i * (bh + 6);
        return (
          <g key={i} className="sw-drop" style={delay(0.3 + i * 0.6)}>
            <rect x={40} y={y} width={220} height={bh} rx={12} fill={i === n - 1 ? f.bg : i % 2 ? '#2C3D68' : '#1E2D52'} />
            <text x={150} y={y + bh / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={i === n - 1 ? f.onBg : INK} fontFamily="Figtree Variable, Figtree, sans-serif">
              {l}
            </text>
          </g>
        );
      })}
    </>
  );
}

function Versus({ labels = [] }: ExplainerScene, f: FamilyMeta) {
  return (
    <>
      <g className="sw-slide-l" style={delay(0.2)}>
        <rect x={16} y={50} width={124} height={120} rx={22} fill={f.bg} />
        <text x={78} y={116} textAnchor="middle" fontSize={15} fontWeight={800} fill={f.onBg} fontFamily="Figtree Variable, Figtree, sans-serif">
          {labels[0] ?? ''}
        </text>
      </g>
      <g className="sw-slide-r" style={delay(0.6)}>
        <rect x={160} y={50} width={124} height={120} rx={22} fill="#1E2D52" stroke={DIM} strokeWidth={2} />
        <text x={222} y={116} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK} fontFamily="Figtree Variable, Figtree, sans-serif">
          {labels[1] ?? ''}
        </text>
      </g>
      <circle cx={150} cy={110} r={17} fill={MARIGOLD} className="sw-pop" style={delay(1.1)} />
      <text x={150} y={115} textAnchor="middle" fontSize={12} fontWeight={900} fill="#14213D" className="sw-fade" style={delay(1.1)} fontFamily="Figtree Variable, Figtree, sans-serif">
        vs
      </text>
    </>
  );
}

function Chain({ labels = [], values = [] }: ExplainerScene, f: FamilyMeta) {
  const n = Math.max(2, labels.length);
  return (
    <>
      {labels.map((l, i) => {
        const y = 30 + i * (170 / (n - 1 || 1));
        const v = values[i] ?? 1;
        return (
          <g key={i} className="sw-fade" style={delay(0.4 + i * 0.8)}>
            {i > 0 && <path d={`M40 ${y - 170 / (n - 1) + 14} V${y - 14}`} stroke={DIM} strokeWidth={4} />}
            <circle cx={40} cy={y} r={12} fill={f.bg} opacity={0.35 + v * 0.65} />
            <rect x={66} y={y - 9} width={200} height={18} rx={9} fill="#1E2D52" />
            <rect x={66} y={y - 9} width={200 * v} height={18} rx={9} fill={v > 0.85 ? EMERALD : v > 0.7 ? MARIGOLD : CORAL} className="sw-grow-x" style={delay(0.6 + i * 0.8)} />
            <text x={74} y={y + 4} fontSize={11} fontWeight={800} fill="#14213D" fontFamily="Figtree Variable, Figtree, sans-serif">
              {l}
            </text>
          </g>
        );
      })}
    </>
  );
}

function Statement({ labels = [] }: ExplainerScene, f: FamilyMeta) {
  return (
    <>
      <circle cx={150} cy={110} r={86} fill={f.bg} opacity={0.18} className="sw-pop" />
      <text x={150} y={122} textAnchor="middle" fontSize={labels[0] && labels[0].length > 10 ? 28 : 40} fontWeight={800} fill={INK} className="sw-pop" style={delay(0.4)} fontFamily="Bricolage Grotesque Variable, Bricolage Grotesque, sans-serif">
        {labels[0] ?? ''}
      </text>
    </>
  );
}

const VISUALS = {
  scale: (s: ExplainerScene) => Scale(s),
  curve: (s: ExplainerScene) => Curve(s),
  cycle: Cycle,
  bars: Bars,
  stack: Stack,
  versus: Versus,
  chain: Chain,
  statement: Statement,
} as const;

export function ExplainerVisual({ scene, family }: { scene: ExplainerScene; family: FamilyMeta }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden>
      {VISUALS[scene.visual](scene, family)}
    </svg>
  );
}
