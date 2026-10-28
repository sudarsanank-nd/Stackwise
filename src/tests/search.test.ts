import { describe, expect, it } from 'vitest';
import { ALL_CARDS } from '../services/content';
import { groupByTopic, searchCards } from '../services/search';

describe('search', () => {
  it('finds loss aversion first', () => {
    const r = searchCards('loss aversion', ALL_CARDS);
    expect(r[0].card.id).toBe('bf-loss-aversion-panic');
  });
  it('finds delegation and AI agents', () => {
    expect(searchCards('delegation', ALL_CARDS)[0].card.id).toBe('pm-delegation-levels');
    const agents = searchCards('AI agents', ALL_CARDS);
    expect(agents.slice(0, 5).some((r) => r.card.primaryTopic === 'agentic-ai')).toBe(true);
  });
  it('returns nothing for empty or stopword queries', () => {
    expect(searchCards('', ALL_CARDS)).toEqual([]);
    expect(searchCards('the and of', ALL_CARDS)).toEqual([]);
  });
  it('groups results by topic', () => {
    const groups = groupByTopic(searchCards('bias', ALL_CARDS));
    expect(groups.length).toBeGreaterThan(1);
    groups.forEach((g) => g.results.forEach((r) => expect(r.card.primaryTopic).toBe(g.topic)));
  });
  it('filters by topic and difficulty', () => {
    const t = searchCards('risk', ALL_CARDS, { topics: ['investing'] });
    expect(t.length).toBeGreaterThan(0);
    expect(t.every((r) => r.card.primaryTopic === 'investing' || r.card.secondaryTopics.includes('investing'))).toBe(true);
    const d = searchCards('risk', ALL_CARDS, { difficulties: ['beginner'] });
    expect(d.every((r) => r.card.difficulty === 'beginner')).toBe(true);
  });
});
