// Stackwise brand marks. LogoMark is the simplified icon (three stacked cards + bookmark);
// LogoFull is the detailed lockup art with the rising chart, for welcome/load screens.

const LAYER = { x: -34, y: -34, width: 68, height: 68, rx: 14 };
const iso = (cy: number) => `translate(60 ${cy}) scale(1 0.58) rotate(45)`;

export function LogoMark({ size = 28, bookmark = true, className = '' }: { size?: number; bookmark?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden className={className}>
      <rect {...LAYER} fill="#2C3D68" transform={iso(88)} />
      <rect {...LAYER} fill="#1E8A5B" transform={iso(67)} />
      <rect {...LAYER} fill="#F7F0E0" transform={iso(46)} />
      {bookmark && <path d="M86 50 h10 v22 l-5 -4 l-5 4 z" fill="#F2B33D" />}
    </svg>
  );
}

export function LogoFull({ size = 150, animated = false }: { size?: number; animated?: boolean }) {
  const a = animated ? 'sw-layer' : '';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <g className={a}>
        <rect {...LAYER} fill="#0B1530" transform={iso(88)} />
        <rect {...LAYER} fill="#2C3D68" transform={iso(81)} />
      </g>
      <g className={a} style={animated ? { animationDelay: '150ms' } : undefined}>
        <rect {...LAYER} fill="#16704A" transform={iso(70)} />
        <rect {...LAYER} fill="#23A26B" transform={iso(63)} />
      </g>
      <g className={a} style={animated ? { animationDelay: '300ms' } : undefined}>
        <rect {...LAYER} fill="#D8CCAE" transform={iso(52)} />
        <rect {...LAYER} fill="#F7F0E0" transform={iso(45)} />
        <rect x="47" y="44" width="6" height="7" rx="1.5" fill="#1E8A5B" />
        <rect x="56" y="39" width="6" height="12" rx="1.5" fill="#1E8A5B" />
        <rect x="65" y="33" width="6" height="18" rx="1.5" fill="#1E8A5B" />
        <path d="M42 41 Q58 38 70 26" fill="none" stroke="#1E8A5B" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M65 25 L72 24 L71 31" fill="none" stroke="#1E8A5B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path className={animated ? 'sw-bookmark' : ''} d="M86 50 h9 v22 l-4.5 -4 l-4.5 4 z" fill="#F2B33D" />
    </svg>
  );
}

/** Two-tone wordmark: "Stack" in ink, "wise" in brand green. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-[-0.04em] ${className}`}>
      Stack<span className="text-brand-2">wise</span>
    </span>
  );
}

export function Tagline({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center gap-3 text-[13px] font-semibold tracking-[0.32em] ${className}`}>
      <span aria-hidden className="h-px w-7 bg-current opacity-40" />
      LEARN · GROW · LEAD
      <span aria-hidden className="h-px w-7 bg-current opacity-40" />
    </span>
  );
}
