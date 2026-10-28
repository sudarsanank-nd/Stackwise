import { describe, expect, it } from 'vitest';
import { activeDays, computeStreak, dailyProgress, GYM_SECONDS } from '../services/progress';
import { CARD_INDEX } from '../services/content';
import { ix } from './helpers';
import { dayKey } from '../utils/date';

const at = (y: number, m: number, d: number, h = 10) => new Date(y, m - 1, d, h).toISOString();

describe('daily goal', () => {
  it('sums reading time of unique cards completed today plus gym scenarios', () => {
    const today = new Date();
    const c1 = 'inv-compounding-patience';
    const c2 = 'pm-delegation-levels';
    const interactions = [ix(c1, 'complete'), ix(c1, 'complete'), ix(c2, 'complete'), ix('ai-rag-vs-finetune', 'like')];
    const p = dailyProgress(interactions, [{ scenarioId: 'gym-market-drop', choiceId: 'a', completedAt: today.toISOString() }], CARD_INDEX, 5);
    const expected = CARD_INDEX.get(c1)!.readingTimeSec! + CARD_INDEX.get(c2)!.readingTimeSec! + GYM_SECONDS;
    expect(p.seconds).toBe(expected);
    expect(p.cardsCompleted).toBe(2);
    expect(p.targetSeconds).toBe(300);
    expect(p.met).toBe(expected >= 300);
    expect(p.pct).toBeCloseTo(Math.min(1, expected / 300));
  });

  it('ignores other days', () => {
    const p = dailyProgress([ix('inv-compounding-patience', 'complete', at(2020, 1, 1))], [], CARD_INDEX, 10);
    expect(p.seconds).toBe(0);
    expect(p.met).toBe(false);
  });
});

describe('streaks', () => {
  const day = (y: number, m: number, d: number) => dayKey(new Date(y, m - 1, d, 12));
  it('counts consecutive days ending today', () => {
    const s = computeStreak(new Set([day(2026, 10, 26), day(2026, 10, 27), day(2026, 10, 28)]), new Date(2026, 9, 28, 15));
    expect(s).toEqual({ current: 3, longest: 3, todayCounted: true });
  });
  it('does not break before today is done', () => {
    const s = computeStreak(new Set([day(2026, 10, 26), day(2026, 10, 27)]), new Date(2026, 9, 28, 9));
    expect(s.current).toBe(2);
    expect(s.todayCounted).toBe(false);
  });
  it('resets after a missed day and tracks longest', () => {
    const s = computeStreak(new Set([day(2026, 10, 20), day(2026, 10, 21), day(2026, 10, 22), day(2026, 10, 28)]), new Date(2026, 9, 28, 9));
    expect(s.current).toBe(1);
    expect(s.longest).toBe(3);
  });
  it('handles month boundaries', () => {
    const s = computeStreak(new Set([day(2026, 9, 30), day(2026, 10, 1)]), new Date(2026, 9, 1, 20));
    expect(s.current).toBe(2);
  });
  it('a day is active with 3 completed cards or a completed session', () => {
    const d1 = at(2026, 10, 20);
    const d2 = at(2026, 10, 21);
    const interactions = ['inv-compounding-patience', 'pm-delegation-levels', 'dm-premortem'].map((id) => ix(id, 'complete', d1));
    interactions.push(ix('inv-compounding-patience', 'complete', d2));
    const days = activeDays(interactions, [{ id: 's', userId: 'u', cardIds: [], steps: [], sessionType: 'five-minute', startTime: d2, progress: 5, completionTime: at(2026, 10, 22) }]);
    expect(days.has(dayKey(d1))).toBe(true);
    expect(days.has(dayKey(d2))).toBe(false);
    expect(days.has(dayKey(at(2026, 10, 22)))).toBe(true);
  });
});
