import type { Collection, GymResult, KnowledgeCard, TopicId, UserInteraction, UserProfile } from '../types';
import { TOPIC_MAP } from '../data/topics';
import { dayKey, daysAgo } from '../utils/date';
import { GYM_SECONDS } from './progress';
import { SCENARIO_INDEX } from './content';
import { WEEKLY_REFLECTION_QUESTIONS } from './session';

export interface WeeklyMap {
  from: string;
  to: string;
  totalSeconds: number;
  cardsCompleted: number;
  topicSeconds: { topic: TopicId; seconds: number; cards: number }[];
  savedThisWeek: string[];
  revisited: string[];
  strong: TopicId[];
  underexplored: TopicId[];
  edges: { a: TopicId; b: TopicId; weight: number }[];
  reflectionQuestion: string;
  dailySeconds: { day: string; seconds: number }[];
}

export function weeklyMap(
  profile: UserProfile,
  interactions: UserInteraction[],
  gymResults: GymResult[],
  collections: Collection[],
  cardIndex: Map<string, KnowledgeCard>,
  now = new Date(),
): WeeklyMap {
  const start = daysAgo(6, now);
  start.setHours(0, 0, 0, 0);
  const inWeek = (ts: string) => new Date(ts) >= start && new Date(ts) <= now;
  const week = interactions.filter((i) => inWeek(i.timestamp));

  const completed = new Map<string, string>(); // cardId -> first day
  const viewDays = new Map<string, Set<string>>();
  for (const i of week) {
    if (i.type === 'complete' && !completed.has(i.cardId)) completed.set(i.cardId, dayKey(i.timestamp));
    if (i.type === 'complete' || i.type === 'explore' || i.type === 'view') {
      if (!viewDays.has(i.cardId)) viewDays.set(i.cardId, new Set());
      viewDays.get(i.cardId)!.add(dayKey(i.timestamp));
    }
  }

  const topicAgg = new Map<TopicId, { seconds: number; cards: number }>();
  const daily = new Map<string, number>();
  const edgeMap = new Map<string, number>();
  completed.forEach((day, id) => {
    const c = cardIndex.get(id);
    if (!c) return;
    const sec = c.readingTimeSec ?? 0;
    const agg = topicAgg.get(c.primaryTopic) ?? { seconds: 0, cards: 0 };
    agg.seconds += sec;
    agg.cards += 1;
    topicAgg.set(c.primaryTopic, agg);
    daily.set(day, (daily.get(day) ?? 0) + sec);
    c.secondaryTopics.forEach((t) => {
      const key = [c.primaryTopic, t].sort().join('|');
      edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1);
    });
  });
  for (const g of gymResults.filter((g) => inWeek(g.completedAt))) {
    const s = SCENARIO_INDEX.get(g.scenarioId);
    if (!s) continue;
    const agg = topicAgg.get(s.topic) ?? { seconds: 0, cards: 0 };
    agg.seconds += GYM_SECONDS;
    topicAgg.set(s.topic, agg);
    daily.set(dayKey(g.completedAt), (daily.get(dayKey(g.completedAt)) ?? 0) + GYM_SECONDS);
  }

  const topicSeconds = [...topicAgg.entries()]
    .map(([topic, v]) => ({ topic, ...v }))
    .sort((a, b) => b.seconds - a.seconds);
  const totalSeconds = topicSeconds.reduce((n, t) => n + t.seconds, 0);

  const savedThisWeek = interactions
    .filter((i) => i.type === 'save' && inWeek(i.timestamp))
    .map((i) => i.cardId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx && collections.some((c) => c.cardIds.includes(id)));
  const revisited = [...viewDays.entries()].filter(([, d]) => d.size >= 2).map(([id]) => id);

  const strong = topicSeconds.slice(0, 3).map((t) => t.topic);
  const explored = new Set(topicSeconds.map((t) => t.topic));
  const interestGaps = profile.interests.filter((t) => !explored.has(t) || (topicAgg.get(t)?.cards ?? 0) <= 1);
  const adjacentGaps = profile.interests
    .flatMap((t) => TOPIC_MAP[t].adjacent)
    .filter((t, i, arr) => arr.indexOf(t) === i && !explored.has(t) && !profile.interests.includes(t));
  const underexplored = [...interestGaps, ...adjacentGaps].slice(0, 5);

  const edges = [...edgeMap.entries()]
    .map(([k, weight]) => {
      const [a, b] = k.split('|') as [TopicId, TopicId];
      return { a, b, weight };
    })
    .sort((x, y) => y.weight - x.weight)
    .slice(0, 8);

  const weekNo = Math.floor(now.getTime() / (7 * 86400000));
  const dailySeconds = Array.from({ length: 7 }, (_, i) => {
    const d = dayKey(daysAgo(6 - i, now));
    return { day: d, seconds: daily.get(d) ?? 0 };
  });

  return {
    from: dayKey(start),
    to: dayKey(now),
    totalSeconds,
    cardsCompleted: completed.size,
    topicSeconds,
    savedThisWeek,
    revisited,
    strong,
    underexplored,
    edges,
    reflectionQuestion: WEEKLY_REFLECTION_QUESTIONS[weekNo % WEEKLY_REFLECTION_QUESTIONS.length],
    dailySeconds,
  };
}
