import { useEffect, useMemo } from 'react';
import { useAppStore, savedIdsOf } from '../store/useAppStore';
import { CARD_INDEX } from '../services/content';
import type { RecContext } from '../services/recommendation';
import { activeDays, computeStreak, dailyProgress } from '../services/progress';
import { dayKey } from '../utils/date';

export function useSavedIds() {
  const collections = useAppStore((s) => s.collections);
  return useMemo(() => savedIdsOf(collections), [collections]);
}

const NONE: string[] = [];

/** Recommendation context, or null before onboarding. */
export function useRecContext(recentShown: string[] = NONE): RecContext | null {
  const profile = useAppStore((s) => s.profile);
  const interactions = useAppStore((s) => s.interactions);
  const searchHistory = useAppStore((s) => s.searchHistory);
  const saved = useSavedIds();
  return useMemo(
    () => (profile ? { profile, interactions, savedCardIds: saved, searchHistory, recentShown, cardIndex: CARD_INDEX } : null),
    [profile, interactions, saved, searchHistory, recentShown],
  );
}

export function useDailyProgress() {
  const interactions = useAppStore((s) => s.interactions);
  const gym = useAppStore((s) => s.gymResults);
  const target = useAppStore((s) => s.profile?.dailyTargetMinutes ?? 10);
  const continuedDays = useAppStore((s) => s.continuedDays);
  const finishedDays = useAppStore((s) => s.finishedDays);
  return useMemo(() => {
    const p = dailyProgress(interactions, gym, CARD_INDEX, target);
    const today = dayKey();
    return { ...p, continued: continuedDays.includes(today), finished: finishedDays.includes(today) };
  }, [interactions, gym, target, continuedDays, finishedDays]);
}

export function useStreak() {
  const interactions = useAppStore((s) => s.interactions);
  const sessions = useAppStore((s) => s.sessions);
  return useMemo(() => computeStreak(activeDays(interactions, sessions)), [interactions, sessions]);
}

/** Applies the theme class to <html>, following the OS when set to "system". */
export function useApplyTheme() {
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && !!mq?.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [theme]);
}
