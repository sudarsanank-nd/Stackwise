import type { GymResult, KnowledgeCard, LearningSession, UserInteraction } from '../types';
import { addDays, dayKey } from '../utils/date';

/** Seconds credited for finishing one Decision Gym scenario. */
export const GYM_SECONDS = 120;
/** Cards a day needs (unless a session was completed) to count toward the streak. */
export const STREAK_MIN_CARDS = 3;
/** A card counts as completed once it has been visible this share of its reading time. */
export const COMPLETION_DWELL_SHARE = 0.4;

export interface DailyProgress {
  day: string;
  seconds: number;
  targetSeconds: number;
  pct: number;
  met: boolean;
  cardsCompleted: number;
}

/** Unique cards completed on a given day. */
export function completedCardIdsOn(interactions: UserInteraction[], day: string): string[] {
  const ids = new Set<string>();
  for (const i of interactions) if (i.type === 'complete' && dayKey(i.timestamp) === day) ids.add(i.cardId);
  return [...ids];
}

export function dailyProgress(
  interactions: UserInteraction[],
  gymResults: GymResult[],
  cardIndex: Map<string, KnowledgeCard>,
  targetMinutes: number,
  day = dayKey(),
): DailyProgress {
  const ids = completedCardIdsOn(interactions, day);
  let seconds = ids.reduce((n, id) => n + (cardIndex.get(id)?.readingTimeSec ?? 0), 0);
  seconds += gymResults.filter((g) => dayKey(g.completedAt) === day).length * GYM_SECONDS;
  const targetSeconds = targetMinutes * 60;
  const pct = targetSeconds ? Math.min(1, seconds / targetSeconds) : 0;
  return { day, seconds, targetSeconds, pct, met: seconds >= targetSeconds, cardsCompleted: ids.length };
}

export function activeDays(interactions: UserInteraction[], sessions: LearningSession[]): Set<string> {
  const perDay = new Map<string, Set<string>>();
  for (const i of interactions) {
    if (i.type !== 'complete') continue;
    const d = dayKey(i.timestamp);
    if (!perDay.has(d)) perDay.set(d, new Set());
    perDay.get(d)!.add(i.cardId);
  }
  const days = new Set<string>();
  perDay.forEach((ids, d) => ids.size >= STREAK_MIN_CARDS && days.add(d));
  sessions.forEach((s) => s.completionTime && days.add(dayKey(s.completionTime)));
  return days;
}

export interface Streak {
  current: number;
  longest: number;
  todayCounted: boolean;
}

/**
 * Consecutive active days ending today — or ending yesterday if today isn't done yet,
 * so the streak never "breaks" in the middle of a day.
 */
export function computeStreak(days: Set<string>, today = new Date()): Streak {
  const todayKey = dayKey(today);
  const todayCounted = days.has(todayKey);
  let cursor = todayCounted ? today : addDays(today, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && dayKey(addDays(new Date(`${prev}T12:00:00`), 1)) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest: Math.max(longest, current), todayCounted };
}
