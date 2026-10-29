import type { CSSProperties } from 'react';
import { Component, type ButtonHTMLAttributes, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TOPIC_MAP } from '../../data/topics';
import type { TopicId } from '../../types';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:opacity-90',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-surface text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950',
};

export function Button({
  variant = 'secondary',
  icon,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: IconName }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

export function LinkButton({ to, variant = 'secondary', icon, children, className = '' }: { to: string; variant?: Variant; icon?: IconName; children: ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-[15px] font-medium transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </Link>
  );
}

/** Toggle chip; uses aria-pressed so screen readers announce state. */
export function Chip({ selected, onClick, children, accent }: { selected: boolean; onClick: () => void; children: ReactNode; accent?: TopicId }) {
  const t = accent ? TOPIC_MAP[accent] : null;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      data-accent={t ? '' : undefined}
      style={t ? ({ '--accent-l': t.accent, '--accent-d': t.accentDark } as CSSProperties) : undefined}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? t
            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-ink'
            : 'border-brand bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] text-ink'
          : 'border-line bg-surface text-ink-2 hover:text-ink'
      }`}
    >
      {selected && <Icon name="check" size={14} className="mr-1 -ml-1 inline" />}
      {children}
    </button>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 rounded-lg px-3 text-sm font-medium transition-colors ${
            value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, label, className = '' }: { value: number; label: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
    >
      <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TopicTag({ topic, small }: { topic: TopicId; small?: boolean }) {
  const t = TOPIC_MAP[topic];
  return (
    <span
      data-accent=""
      style={{ '--accent-l': t.accent, '--accent-d': t.accentDark } as CSSProperties}
      className={`inline-flex items-center gap-1.5 font-semibold text-[var(--accent)] ${small ? 'text-xs' : 'text-[13px]'}`}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--accent)]" />
      {t.label}
    </span>
  );
}

export function PageHeader({ title, subtitle, back, actions }: { title: string; subtitle?: string; back?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        {back && (
          <Link to={back} className="mb-2 inline-flex min-h-11 items-center gap-1 text-sm text-ink-2 hover:text-ink">
            <Icon name="back" size={16} /> Back
          </Link>
        )}
        <h1 className="font-serif text-[28px] leading-tight font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-2">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}

export function EmptyState({ icon = 'info', title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center">
      <Icon name={icon} size={28} className="mx-auto text-ink-2" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {children && <div className="mx-auto mt-1 max-w-sm text-[15px] text-ink-2">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold tracking-wider text-ink-2 uppercase">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}

interface EBState {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode; onReset?: () => void }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Stackwise error:', error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Something went wrong on this screen</h1>
        <p className="mt-2 text-ink-2">Your saved ideas and settings are safe. You can try again, or go back to the feed.</p>
        <p className="mt-3 text-sm break-words text-ink-2">{this.state.error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
          <Button
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = '#/feed';
            }}
          >
            Go to feed
          </Button>
        </div>
      </div>
    );
  }
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
      {message && <div className="fade-in rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg">{message}</div>}
    </div>
  );
}
