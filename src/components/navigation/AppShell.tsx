import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../common/Icon';
import { useAppStore } from '../../store/useAppStore';
import { useDailyProgress, useStreak } from '../../hooks/useAppData';
import { useToast } from '../../store/toast';
import { Toast } from '../common/ui';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/feed', label: 'Feed', icon: 'feed' },
  { to: '/session', label: 'Session', icon: 'timer' },
  { to: '/gym', label: 'Gym', icon: 'gym' },
  { to: '/shelf', label: 'Shelf', icon: 'shelf' },
  { to: '/profile', label: 'You', icon: 'user' },
];

function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const isDark = theme === 'dark' || (theme === 'system' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink"
      aria-label={`Switch to ${next} mode`}
      title={`Theme: ${theme}`}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  );
}

function DailyMeter() {
  const p = useDailyProgress();
  const streak = useStreak();
  const mins = Math.floor(p.seconds / 60);
  return (
    <Link to="/complete" className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm text-ink-2 hover:bg-surface-2" aria-label={`Today: ${mins} of ${p.targetSeconds / 60} minutes. Streak ${streak.current} days.`}>
      <svg width="28" height="28" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${p.pct * 94.2} 94.2`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="tabular-nums">
        {p.met ? 'Done today' : `${mins}/${p.targetSeconds / 60} min`}
      </span>
      {streak.current > 0 && (
        <span className="hidden items-center gap-1 sm:inline-flex">
          <Icon name="flame" size={16} /> {streak.current}
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const toast = useToast((s) => s.message);
  return (
    <div className="min-h-dvh bg-bg">
      <a href="#main" className="sr-only-focusable fixed top-2 left-2 z-50 rounded-lg bg-surface px-3 py-2">
        Skip to content
      </a>
      {/* Desktop rail */}
      <nav aria-label="Primary" className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface px-3 py-5 md:flex">
        <Link to="/feed" className="mb-6 flex items-center gap-2 px-3 font-serif text-xl font-semibold">
          <Logo /> Stackwise
        </Link>
        <ul className="space-y-1">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`
                }
              >
                <Icon name={n.icon} /> {n.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/search" className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}>
              <Icon name="search" /> Search
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}>
              <Icon name="map" /> Knowledge map
            </NavLink>
          </li>
        </ul>
        <p className="mt-auto px-3 text-xs leading-relaxed text-ink-2">Learn on purpose. Stop when you're done.</p>
      </nav>

      <div className="md:pl-56">
        <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 border-b border-line bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
          <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-2 px-4">
            <Link to="/feed" className="flex items-center gap-2 font-serif text-lg font-semibold md:invisible">
              <Logo /> Stackwise
            </Link>
            <div className="flex items-center gap-1">
              <DailyMeter />
              <Link to="/search" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink md:hidden" aria-label="Search">
                <Icon name="search" />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-2xl px-4 pt-6 pb-28 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom bar */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="mx-auto flex max-w-md justify-around">
          {NAV.map((n) => (
            <li key={n.to} className="flex-1">
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${isActive ? 'text-brand' : 'text-ink-2'}`
                }
              >
                <Icon name={n.icon} size={22} />
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Toast message={toast} />
    </div>
  );
}

export function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M9 11h14M9 16h14M9 21h9" stroke="var(--brand-ink)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
