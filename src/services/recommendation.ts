/**
 * Transparent recommendation engine.
 *
 * 1. `scoreCard` adds up simple, named weights (WEIGHTS) and records a human-readable
 *    reason for each one — that list powers "Why am I seeing this?".
 * 2. `bucketOf` places each card in a mix bucket (high-interest, adjacent, serendipity,
 *    review, experimental).
 * 3. `buildFeed` fills each bucket's quota with the best-scoring cards (plus a little
 *    seeded jitter so the feed doesn't repeat itself), then spreads buckets evenly and
 *    avoids two cards of the same topic in a row.
 *
 * Change behaviour by editing WEIGHTS or MIX — nothing else needs to change.
 */
import type {
  ContentFormat,
  FeedBucket,
  FeedFilters,
  FeedMode,
  KnowledgeCard,
  ScoredCard,
  SerendipityFrequency,
  TopicId,
  UserInteraction,
  UserProfile,
} from '../types';
import { GOALS, STYLE_FORMATS, TOPIC_MAP, topicLabel, DIFFICULTIES } from '../data/topics';
import { computeSignals, type Signals } from './signals';
import { mulberry32, shuffle } from '../utils/rng';
import { normalize } from '../utils/text';

export const WEIGHTS = {
  selectedInterest: 5,
  topFiveInterest: 4,
  secondaryInterest: 2,
  likedTopic: 3,
  savedRelated: 3,
  exploredTopic: 3,
  difficultyMatch: 2,
  difficultyFar: -1,
  adjacentTopic: 1,
  goalMatch: 1,
  styleMatch: 1,
  searchMatch: 2,
  moreLikeThis: 2,
  lessLikeThis: -3,
  overexposed: -3,
  repeatedlySkipped: -4,
  completed: -5,
  jitter: 2.5,
} as const;

/** Share of the feed per bucket, by the user's "unfamiliar topics" setting. */
export const MIX: Record<SerendipityFrequency, Record<Exclude<FeedBucket, 'balanced'>, number>> = {
  rarely: { 'high-interest': 0.6, adjacent: 0.2, serendipity: 0.05, review: 0.1, experimental: 0.05 },
  sometimes: { 'high-interest': 0.5, adjacent: 0.2, serendipity: 0.15, review: 0.1, experimental: 0.05 },
  often: { 'high-interest': 0.4, adjacent: 0.2, serendipity: 0.25, review: 0.1, experimental: 0.05 },
};

export const OVEREXPOSURE_WINDOW = 8;
export const OVEREXPOSURE_THRESHOLD = 3;
export const SKIP_THRESHOLD = 3;

export interface RecContext {
  profile: UserProfile;
  interactions: UserInteraction[];
  savedCardIds: Set<string>;
  searchHistory: string[];
  /** Ids of cards recently shown, most recent last. */
  recentShown: string[];
  cardIndex: Map<string, KnowledgeCard>;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

const DIFF_RANK = Object.fromEntries(DIFFICULTIES.map((d, i) => [d, i])) as Record<string, number>;

export function preferredDifficulty(profile: UserProfile, topic: TopicId) {
  return profile.topicDifficulty[topic] ?? (profile.interests.includes(topic) ? 'beginner' : 'intermediate');
}

function styleFormats(profile: UserProfile): Set<ContentFormat> {
  const set = new Set<ContentFormat>();
  profile.preferredStyles.forEach((s) => {
    if (s !== 'mixed') STYLE_FORMATS[s].forEach((f) => set.add(f));
  });
  return set;
}

/** Interests this card connects to through its secondary topics or topic adjacency. */
export function connectedInterests(card: KnowledgeCard, profile: UserProfile): TopicId[] {
  const out = new Set<TopicId>();
  for (const t of card.secondaryTopics) if (profile.interests.includes(t)) out.add(t);
  for (const t of TOPIC_MAP[card.primaryTopic].adjacent) if (profile.interests.includes(t)) out.add(t);
  return [...out];
}

export function scoreCard(card: KnowledgeCard, ctx: RecContext, signals: Signals): ScoreResult {
  const { profile } = ctx;
  const W = WEIGHTS;
  const reasons: string[] = [];
  let score = 0;
  const add = (w: number, reason: string) => {
    score += w;
    reasons.push(reason);
  };
  const topic = card.primaryTopic;
  const label = topicLabel(topic);
  const isInterest = profile.interests.includes(topic);

  if (isInterest) add(W.selectedInterest, `You chose ${label} as an interest`);
  const rank = profile.rankedInterests.indexOf(topic);
  if (rank >= 0) add(W.topFiveInterest, `${label} is #${rank + 1} in your top five`);
  if (!isInterest) {
    const secondary = card.secondaryTopics.find((t) => profile.interests.includes(t));
    if (secondary) add(W.secondaryInterest, `Touches on ${topicLabel(secondary)}, one of your interests`);
    else if (TOPIC_MAP[topic].adjacent.some((t) => profile.interests.includes(t))) {
      const near = TOPIC_MAP[topic].adjacent.find((t) => profile.interests.includes(t))!;
      add(W.adjacentTopic, `${label} sits next to ${topicLabel(near)}`);
    }
  }

  const ts = signals.topic[topic];
  if (ts?.likes) add(W.likedTopic, `You liked other ${label} ideas`);
  if (ts?.explores) add(W.exploredTopic, `You explored ${label} in depth`);
  if (ts?.more) add(W.moreLikeThis, `You asked for more ${label}`);
  if (ts?.less) add(W.lessLikeThis, `Lowered: you asked for less ${label}`);
  if (ts && ts.skips >= SKIP_THRESHOLD && ts.skips > ts.likes + ts.saves)
    add(W.repeatedlySkipped, `Lowered: you've skipped several ${label} cards`);

  const savedLink = [...ctx.savedCardIds].find(
    (id) => id !== card.id && (card.relatedCardIds.includes(id) || ctx.cardIndex.get(id)?.relatedCardIds.includes(card.id)),
  );
  if (savedLink) add(W.savedRelated, `Related to "${ctx.cardIndex.get(savedLink)?.title}", which you saved`);

  const pref = preferredDifficulty(profile, topic);
  const gap = Math.abs(DIFF_RANK[pref] - DIFF_RANK[card.difficulty]);
  if (gap === 0) add(W.difficultyMatch, `Matches your ${pref} depth for ${label}`);
  else if (gap === 2) add(W.difficultyFar, `Lowered: ${card.difficulty} is far from your ${pref} setting`);

  const goal = GOALS.find((g) => profile.learningGoals.includes(g.id) && g.topics.includes(topic));
  if (goal) add(W.goalMatch, `Supports your goal: ${goal.label.toLowerCase()}`);

  if (styleFormats(profile).has(card.format)) add(W.styleMatch, `In a format that suits your ${profile.preferredStyles.join('/')} preference`);

  const haystack = normalize(`${card.title} ${card.hook} ${card.keyConcepts.map((k) => k.label).join(' ')}`);
  const term = ctx.searchHistory.slice(-5).find((q) => q.trim().length > 2 && haystack.includes(normalize(q)));
  if (term) add(W.searchMatch, `Matches your search for "${term}"`);

  const fs = signals.format[card.format];
  if (fs && fs.less > fs.more) add(W.lessLikeThis, 'Lowered: you asked for less of this format');

  const recent = ctx.recentShown.slice(-OVEREXPOSURE_WINDOW);
  const seenTopic = recent.filter((id) => ctx.cardIndex.get(id)?.primaryTopic === topic).length;
  if (seenTopic >= OVEREXPOSURE_THRESHOLD) add(W.overexposed, `Lowered: you've seen a lot of ${label} recently`);

  if (signals.completed.has(card.id)) add(W.completed, 'Lowered: you have already read this');

  return { score, reasons };
}

export function bucketOf(card: KnowledgeCard, ctx: RecContext, signals: Signals): FeedBucket {
  const { profile } = ctx;
  const reviewable = (ctx.savedCardIds.has(card.id) || signals.liked.has(card.id)) && signals.completed.has(card.id) && !signals.understood.has(card.id);
  if (reviewable) return 'review';
  if (profile.interests.includes(card.primaryTopic)) return 'high-interest';
  if (connectedInterests(card, profile).length > 0) return 'adjacent';
  return 'serendipity';
}

export function serendipityReason(card: KnowledgeCard, profile: UserProfile): string {
  const links = connectedInterests(card, profile);
  const label = topicLabel(card.primaryTopic);
  if (links.length >= 2) return `Outside your usual topics. You follow ${topicLabel(links[0])} and ${topicLabel(links[1])} — this ${label} idea connects to both.`;
  if (links.length === 1) return `Outside your usual topics. This ${label} idea has a useful link to ${topicLabel(links[0])}.`;
  return `Outside your usual topics, picked to widen your view. ${label} ideas often transfer to other fields.`;
}

export function matchesFilters(card: KnowledgeCard, f?: Partial<FeedFilters>) {
  if (!f) return true;
  if (f.topics?.length && !f.topics.includes(card.primaryTopic) && !card.secondaryTopics.some((t) => f.topics!.includes(t))) return false;
  if (f.difficulties?.length && !f.difficulties.includes(card.difficulty)) return false;
  if (f.formats?.length && !f.formats.includes(card.format)) return false;
  return true;
}

export function matchesMode(card: KnowledgeCard, mode: FeedMode, profile: UserProfile) {
  switch (mode) {
    case 'contrarian':
      return !!card.contrarian || card.format === 'myth-vs-reality' || card.format === 'counterintuitive';
    case 'connect':
      return !!card.bridge || card.format === 'connect-domains';
    case 'serendipity':
      return !profile.interests.includes(card.primaryTopic);
    default:
      return true;
  }
}

export interface BuildFeedOptions {
  count?: number;
  seed?: number;
  mode?: FeedMode;
  filters?: Partial<FeedFilters>;
  exclude?: Set<string>;
}

/** Spread items evenly: bucket with n items gets target slots i * (total / n). */
function interleave(groups: ScoredCard[][], total: number): ScoredCard[] {
  const placed: { pos: number; item: ScoredCard }[] = [];
  groups.forEach((g, gi) => {
    const step = total / Math.max(1, g.length);
    g.forEach((item, i) => placed.push({ pos: i * step + (gi * step) / (groups.length + 1), item }));
  });
  return placed.sort((a, b) => a.pos - b.pos).map((p) => p.item);
}

/** Swap forward so two neighbouring cards rarely share a primary topic. */
export function avoidTopicRepeats(items: ScoredCard[]): ScoredCard[] {
  const out = [...items];
  for (let i = 1; i < out.length; i++) {
    if (out[i].card.primaryTopic === out[i - 1].card.primaryTopic) {
      const j = out.findIndex((x, k) => k > i && x.card.primaryTopic !== out[i - 1].card.primaryTopic);
      if (j > 0) [out[i], out[j]] = [out[j], out[i]];
    }
  }
  return out;
}

export function buildFeed(cards: KnowledgeCard[], ctx: RecContext, opts: BuildFeedOptions = {}): ScoredCard[] {
  const { count = 12, seed = Date.now(), mode = 'for-you', filters, exclude = new Set() } = opts;
  const rand = mulberry32(seed);
  const { profile } = ctx;
  let pool = cards.filter((c) => matchesFilters(c, filters) && matchesMode(c, mode, profile));
  const fresh = pool.filter((c) => !exclude.has(c.id));
  // When everything has been shown, allow repeats rather than ending in an empty feed.
  pool = fresh.length > 0 ? fresh : pool;
  if (pool.length === 0) return [];

  if (!profile.personalizationEnabled) {
    // Balanced round-robin across topics, no behavioural signals.
    const byTopic = new Map<TopicId, KnowledgeCard[]>();
    shuffle(pool, rand).forEach((c) => byTopic.set(c.primaryTopic, [...(byTopic.get(c.primaryTopic) ?? []), c]));
    const lists = shuffle([...byTopic.values()], rand);
    const out: ScoredCard[] = [];
    while (out.length < count && lists.some((l) => l.length)) {
      for (const l of lists) {
        const c = l.shift();
        if (c && out.length < count)
          out.push({ card: c, score: 0, bucket: 'balanced', reasons: ['Personalisation is off — this is a balanced mix across all topics.'] });
      }
    }
    return out;
  }

  const signals = computeSignals(ctx.interactions, ctx.cardIndex);
  const scored = pool.map((card) => {
    const { score, reasons } = scoreCard(card, ctx, signals);
    return { card, score, reasons, bucket: bucketOf(card, ctx, signals), j: score + rand() * WEIGHTS.jitter };
  });

  const mix = MIX[profile.serendipityFrequency];
  const want = (b: keyof typeof mix) => Math.max(b === 'high-interest' ? 1 : 0, Math.round(count * mix[b]));
  const taken = new Set<string>();
  const take = (items: typeof scored, n: number) => {
    const picked = items.filter((x) => !taken.has(x.card.id)).sort((a, b) => b.j - a.j).slice(0, n);
    picked.forEach((p) => taken.add(p.card.id));
    return picked;
  };

  const groups: Record<string, typeof scored> = {
    'high-interest': take(scored.filter((s) => s.bucket === 'high-interest'), want('high-interest')),
    adjacent: take(scored.filter((s) => s.bucket === 'adjacent'), want('adjacent')),
    serendipity: take(scored.filter((s) => s.bucket === 'serendipity'), want('serendipity')),
    review: take(scored.filter((s) => s.bucket === 'review'), want('review')),
  };
  // Experimental: a format the reader has rarely seen, from any bucket.
  const rareFormat = scored.filter((s) => (signals.format[s.card.format]?.seen ?? 0) === 0);
  groups.experimental = take(rareFormat.length ? rareFormat : scored, want('experimental')).map((s) => ({ ...s, bucket: 'experimental' as FeedBucket }));

  let picked = Object.values(groups).reduce((n, g) => n + g.length, 0);
  if (picked < count) {
    groups.fill = take(scored, count - picked);
    picked += groups.fill.length;
  }

  const decorate = (s: (typeof scored)[number]): ScoredCard => {
    const reasons = [...s.reasons];
    if (s.bucket === 'serendipity') reasons.unshift(serendipityReason(s.card, profile));
    if (s.bucket === 'review') reasons.unshift('A second look at an idea you saved or liked — revisiting helps it stick.');
    if (s.bucket === 'experimental') reasons.unshift('An experiment: a card format you haven\'t tried yet.');
    if (reasons.length === 0) reasons.push('Picked to keep your feed varied.');
    return { card: s.card, score: s.score, bucket: s.bucket, reasons };
  };

  const ordered = interleave(
    Object.values(groups).filter((g) => g.length).map((g) => g.map(decorate)),
    Math.min(count, picked),
  );
  return avoidTopicRepeats(ordered).slice(0, count);
}
