import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../common/Icon';
import { useAppStore } from '../../store/useAppStore';
import { useDailyProgress, useStreak } from '../../hooks/useAppData';
import { useToast } from '../../store/toast';
import { Toast } from '../common/ui';
import { LogoMark, Wordmark } from '../brand/Logo';

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
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface text-ink hover:bg-surface-2"
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
    <Link to="/complete" className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1.5 text-sm font-semibold text-ink hover:bg-surface-2" aria-label={`Today: ${mins} of ${p.targetSeconds / 60} minutes. Streak ${streak.current} days.`}>
      <svg width="28" height="28" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--surface-2)" strokeWidth="5" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${p.pct * 94.2} 94.2`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="whitespace-nowrap tabular-nums">
        {p.met ? 'Done today' : `${mins}/${p.targetSeconds / 60} min`}
      </span>
      {streak.current > 0 && (
        <span className="hidden items-center gap-1 sm:inline-flex">
          <Icon name="flame" size={16} className="text-marigold" /> {streak.current}
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
        <Link to="/feed" className="mb-6 flex items-center gap-2 px-3 text-[24px]">
          <LogoMark size={34} /> <Wordmark />
        </Link>
        <ul className="space-y-1">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${isActive ? 'bg-navy text-white dark:bg-surface-2' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`
                }
              >
                <Icon name={n.icon} /> {n.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/search" className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${isActive ? 'bg-navy text-white dark:bg-surface-2' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}>
              <Icon name="search" /> Search
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${isActive ? 'bg-navy text-white dark:bg-surface-2' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}>
              <Icon name="map" /> Knowledge map
            </NavLink>
          </li>
        </ul>
        <p className="mt-auto px-3 text-xs leading-relaxed text-ink-2">Learn on purpose. Stop when you're done.</p>
      </nav>

      <div className="md:pl-56">
        <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-2 px-4">
            <Link to="/feed" className="flex items-center gap-1.5 text-[22px] md:invisible">
              <LogoMark size={32} /> <Wordmark />
            </Link>
            <div className="flex items-center gap-1">
              <DailyMeter />
              <Link to="/search" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface text-ink hover:bg-surface-2 md:hidden" aria-label="Search">
                <Icon name="search" />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-2xl px-4 pt-4 pb-32 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom bar: floating navy dock */}
      <nav aria-label="Primary" className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-30 rounded-3xl border border-white/5 bg-navy shadow-[0_14px_30px_rgb(20_33_61/0.3)] md:hidden">
        <ul className="mx-auto flex max-w-md justify-around px-1.5">
          {NAV.map((n) => (
            <li key={n.to} className="flex-1">
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  `group flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? 'text-white' : 'text-[#a9b0c3] hover:text-white'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-[#1e8a5b]' : ''}`}>
                      {n.to === '/feed' ? <LogoMark size={22} bookmark={isActive} /> : <Icon name={n.icon} size={20} />}
                    </span>
                    {n.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Toast message={toast} />
    </div>
  );
}

export { LogoMark as Logo } from '../brand/Logo';
