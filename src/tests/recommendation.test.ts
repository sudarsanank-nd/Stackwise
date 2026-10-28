import { describe, expect, it } from 'vitest';
import { ALL_CARDS, CARD_INDEX } from '../services/content';
import { buildFeed, scoreCard, WEIGHTS, bucketOf } from '../services/recommendation';
import { computeSignals } from '../services/signals';
import { ix, makeCtx, makeProfile } from './helpers';

const card = (id: string) => CARD_INDEX.get(id)!;
const sig = (ctx = makeCtx()) => computeSignals(ctx.interactions, CARD_INDEX);

describe('recommendation scoring', () => {
  it('adds interest and top-five weights with readable reasons', () => {
    const ctx = makeCtx();
    const r = scoreCard(card('inv-compounding-patience'), ctx, sig(ctx));
    expect(r.reasons).toContain('You chose Investing as an interest');
    expect(r.reasons.some((x) => x.includes('#1 in your top five'))).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(WEIGHTS.selectedInterest + WEIGHTS.topFiveInterest);
  });

  it('scores cards in chosen interests above unrelated ones', () => {
    const ctx = makeCtx();
    const s = sig(ctx);
    expect(scoreCard(card('inv-compounding-patience'), ctx, s).score).toBeGreaterThan(scoreCard(card('prod-parkinsons-law'), ctx, s).score);
  });

  it('penalises completed cards by 5', () => {
    const c = card('inv-compounding-patience');
    const base = makeCtx();
    const done = makeCtx({ interactions: [ix(c.id, 'complete')] });
    expect(scoreCard(c, done, sig(done)).score - scoreCard(c, base, sig(base)).score).toBe(WEIGHTS.completed);
  });

  it('penalises repeatedly skipped topics', () => {
    const skips = ALL_CARDS.filter((c) => c.primaryTopic === 'leadership').slice(0, 3).map((c) => ix(c.id, 'skip'));
    const ctx = makeCtx({ interactions: skips });
    const target = ALL_CARDS.filter((c) => c.primaryTopic === 'leadership')[4];
    const r = scoreCard(target, ctx, sig(ctx));
    expect(r.reasons.some((x) => x.includes("you've skipped several"))).toBe(true);
  });

  it('boosts liked topics and saved-related cards', () => {
    const c = card('bf-loss-aversion-panic');
    const ctx = makeCtx({ interactions: [ix('bf-anchoring-purchase-price', 'like')], savedCardIds: new Set(['inv-compounding-patience']) });
    const r = scoreCard(c, ctx, sig(ctx));
    expect(r.reasons.some((x) => x.includes('You liked other Behavioral finance'))).toBe(true);
    expect(r.reasons.some((x) => x.includes('which you saved'))).toBe(true);
  });

  it('applies overexposure penalty from recently shown cards', () => {
    const recent = ALL_CARDS.filter((c) => c.primaryTopic === 'investing').slice(0, 3).map((c) => c.id);
    const ctx = makeCtx({ recentShown: recent });
    const r = scoreCard(ALL_CARDS.filter((c) => c.primaryTopic === 'investing')[5], ctx, sig(ctx));
    expect(r.reasons.some((x) => x.includes('seen a lot of Investing'))).toBe(true);
  });

  it('places cards into buckets', () => {
    const ctx = makeCtx();
    expect(bucketOf(card('inv-compounding-patience'), ctx, sig(ctx))).toBe('high-interest');
    const saved = makeCtx({ savedCardIds: new Set(['inv-compounding-patience']), interactions: [ix('inv-compounding-patience', 'complete')] });
    expect(bucketOf(card('inv-compounding-patience'), saved, sig(saved))).toBe('review');
  });
});

describe('feed building', () => {
  it('is personalised: most cards come from selected interests', () => {
    const feed = buildFeed(ALL_CARDS, makeCtx(), { count: 20, seed: 1 });
    expect(feed).toHaveLength(20);
    const interest = feed.filter((f) => ['investing', 'leadership', 'people-management'].includes(f.card.primaryTopic)).length;
    expect(interest).toBeGreaterThanOrEqual(8);
    expect(interest).toBeLessThan(20); // never only interests
  });

  it('changes when interests change', () => {
    const a = buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: 3 });
    const b = buildFeed(ALL_CARDS, makeCtx({ profile: makeProfile({ interests: ['ai', 'agentic-ai', 'technology'], rankedInterests: ['ai', 'agentic-ai', 'technology'] }) }), { count: 10, seed: 3 });
    const aiShare = (f: typeof a) => f.filter((x) => ['ai', 'agentic-ai', 'technology'].includes(x.card.primaryTopic)).length;
    expect(aiShare(b)).toBeGreaterThan(aiShare(a));
  });

  it('stays varied over 20 cards', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const feed = buildFeed(ALL_CARDS, makeCtx(), { count: 20, seed });
      expect(new Set(feed.map((f) => f.card.id)).size).toBe(20);
      expect(new Set(feed.map((f) => f.card.primaryTopic)).size).toBeGreaterThanOrEqual(6);
      expect(new Set(feed.map((f) => f.card.format)).size).toBeGreaterThanOrEqual(8);
      let repeats = 0;
      for (let i = 1; i < feed.length; i++) if (feed[i].card.primaryTopic === feed[i - 1].card.primaryTopic) repeats++;
      expect(repeats).toBeLessThanOrEqual(2);
      expect(feed.some((f) => f.bucket === 'serendipity')).toBe(true);
    }
  });

  it('explains every card', () => {
    buildFeed(ALL_CARDS, makeCtx(), { count: 20, seed: 9 }).forEach((f) => expect(f.reasons.length).toBeGreaterThan(0));
  });

  it('is deterministic for a seed', () => {
    const ids = (s: number) => buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: s }).map((f) => f.card.id);
    expect(ids(42)).toEqual(ids(42));
  });

  it('excludes already shown cards when loading more', () => {
    const first = buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: 1 });
    const next = buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: 2, exclude: new Set(first.map((f) => f.card.id)) });
    expect(next.some((n) => first.some((f) => f.card.id === n.card.id))).toBe(false);
  });

  it('uses a balanced mix when personalisation is disabled', () => {
    const feed = buildFeed(ALL_CARDS, makeCtx({ profile: makeProfile({ personalizationEnabled: false }) }), { count: 16, seed: 1 });
    expect(feed.every((f) => f.bucket === 'balanced')).toBe(true);
    expect(new Set(feed.map((f) => f.card.primaryTopic)).size).toBeGreaterThanOrEqual(12);
  });

  it('supports serendipity, contrarian and connect modes', () => {
    const ctx = makeCtx();
    expect(buildFeed(ALL_CARDS, ctx, { mode: 'serendipity', seed: 1 }).every((f) => !ctx.profile.interests.includes(f.card.primaryTopic))).toBe(true);
    expect(buildFeed(ALL_CARDS, ctx, { mode: 'contrarian', seed: 1 }).every((f) => f.card.contrarian || ['myth-vs-reality', 'counterintuitive'].includes(f.card.format))).toBe(true);
    expect(buildFeed(ALL_CARDS, ctx, { mode: 'connect', seed: 1 }).every((f) => f.card.bridge)).toBe(true);
  });

  it('applies topic, difficulty and format filters', () => {
    const t = buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: 1, filters: { topics: ['ai'] } });
    expect(t.length).toBeGreaterThan(0);
    expect(t.every((f) => f.card.primaryTopic === 'ai' || f.card.secondaryTopics.includes('ai'))).toBe(true);
    const d = buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: 1, filters: { difficulties: ['advanced'] } });
    expect(d.length).toBeGreaterThan(0);
    expect(d.every((f) => f.card.difficulty === 'advanced')).toBe(true);
    const fm = buildFeed(ALL_CARDS, makeCtx(), { count: 10, seed: 1, filters: { formats: ['checklist'] } });
    expect(fm.every((f) => f.card.format === 'checklist')).toBe(true);
  });
});
