import type { GymResult, LearningSession, SessionStep, SessionType, TopicId } from '../types';
import { ALL_CARDS, SCENARIOS } from './content';
import { buildFeed, type RecContext } from './recommendation';
import { mulberry32 } from '../utils/rng';
import { uid } from '../utils/text';
import { topicLabel } from '../data/topics';

export const REFLECTION_PROMPTS = [
  'Which idea from this session would change one decision you make this week?',
  'What did you disagree with, even slightly — and why?',
  'Which idea could you explain to a teammate tomorrow in two sentences?',
  'What connects two of the ideas you just read?',
  'What would you do differently in your next one-on-one because of this?',
];

export const WEEKLY_REFLECTION_QUESTIONS = [
  'Which idea from this week changed how you saw a real situation at work?',
  'Where did you notice a bias in yourself this week, not just in others?',
  'Which saved idea have you not yet used — what is stopping you?',
  'What topic did you avoid this week, and is that avoidance useful?',
];

function pickScenario(ctx: RecContext, gymResults: GymResult[], rand: () => number, preferTopics: TopicId[]) {
  const done = new Set(gymResults.map((g) => g.scenarioId));
  const fresh = SCENARIOS.filter((s) => !done.has(s.id));
  const pool = fresh.length ? fresh : SCENARIOS;
  const preferred = pool.filter((s) => preferTopics.includes(s.topic) || ctx.profile.interests.includes(s.topic));
  const list = preferred.length ? preferred : pool;
  return list[Math.floor(rand() * list.length)];
}

/**
 * Five steps: one familiar idea, one adjacent idea, one surprising idea,
 * one Decision Gym scenario and one reflection prompt.
 */
export function buildFiveMinuteSession(
  ctx: RecContext,
  gymResults: GymResult[],
  type: SessionType = 'five-minute',
  seed = Date.now(),
): LearningSession {
  const rand = mulberry32(seed);
  const feed = buildFeed(ALL_CARDS, ctx, { count: 30, seed });
  const used = new Set<string>();
  const firstOf = (pred: (b: string) => boolean) => {
    const hit = feed.find((s) => pred(s.bucket) && !used.has(s.card.id));
    if (hit) used.add(hit.card.id);
    return hit;
  };
  const familiar = firstOf((b) => b === 'high-interest') ?? firstOf(() => true);
  const adjacent = firstOf((b) => b === 'adjacent') ?? firstOf(() => true);
  const surprising = firstOf((b) => b === 'serendipity') ?? firstOf((b) => b !== 'high-interest') ?? firstOf(() => true);

  const steps: SessionStep[] = [];
  if (familiar) steps.push({ kind: 'card', cardId: familiar.card.id, role: 'familiar' });
  if (adjacent) steps.push({ kind: 'card', cardId: adjacent.card.id, role: 'adjacent' });
  if (surprising) steps.push({ kind: 'card', cardId: surprising.card.id, role: 'surprising' });
  const scenario = pickScenario(ctx, gymResults, rand, familiar ? [familiar.card.primaryTopic] : []);
  if (scenario) steps.push({ kind: 'gym', scenarioId: scenario.id });
  steps.push({ kind: 'reflection', prompt: REFLECTION_PROMPTS[Math.floor(rand() * REFLECTION_PROMPTS.length)] });

  return {
    id: uid('session'),
    userId: ctx.profile.id,
    cardIds: steps.flatMap((s) => (s.kind === 'card' ? [s.cardId] : [])),
    steps,
    sessionType: type,
    startTime: new Date().toISOString(),
    progress: 0,
  };
}

/** Session aimed at under-explored topics from the weekly map. */
export function buildGapSession(ctx: RecContext, topics: TopicId[], gymResults: GymResult[], seed = Date.now()): LearningSession {
  const rand = mulberry32(seed);
  const steps: SessionStep[] = [];
  const used = new Set<string>();
  for (const t of topics.slice(0, 3)) {
    const feed = buildFeed(ALL_CARDS, { ...ctx, profile: { ...ctx.profile, interests: [...ctx.profile.interests, t] } }, { count: 6, seed: seed + steps.length, filters: { topics: [t] } });
    const hit = feed.find((s) => !used.has(s.card.id));
    if (hit) {
      used.add(hit.card.id);
      steps.push({ kind: 'card', cardId: hit.card.id, role: 'gap' });
    }
  }
  const scenario = pickScenario(ctx, gymResults, rand, topics);
  if (scenario) steps.push({ kind: 'gym', scenarioId: scenario.id });
  steps.push({ kind: 'reflection', prompt: `What surprised you about ${topics.map(topicLabel).slice(0, 2).join(' and ')}?` });
  return {
    id: uid('session'),
    userId: ctx.profile.id,
    cardIds: steps.flatMap((s) => (s.kind === 'card' ? [s.cardId] : [])),
    steps,
    sessionType: 'gap',
    startTime: new Date().toISOString(),
    progress: 0,
  };
}
