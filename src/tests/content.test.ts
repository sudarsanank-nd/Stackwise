import { describe, expect, it } from 'vitest';
import { ALL_CARDS, CARD_INDEX, COLLISIONS, SCENARIOS } from '../services/content';
import { FORMATS, TOPIC_IDS } from '../data/topics';
import { wordCount } from '../utils/text';
import { SYMBOL_IDS } from '../data/symbols';
import type { KnowledgeCard } from '../types';

const REQUIRED_STRINGS: (keyof KnowledgeCard)[] = [
  'id', 'title', 'hook', 'coreIdea', 'whyItMatters', 'example', 'reflectionQuestion', 'suggestedAction', 'createdAt',
];

describe('content schema', () => {
  it('has at least 60 cards with unique ids', () => {
    expect(ALL_CARDS.length).toBeGreaterThanOrEqual(60);
    expect(CARD_INDEX.size).toBe(ALL_CARDS.length);
  });

  it.each(ALL_CARDS.map((c) => [c.id, c] as const))('card %s is valid', (_id, c) => {
    for (const k of REQUIRED_STRINGS) expect(typeof c[k], `${c.id}.${String(k)}`).toBe('string');
    expect(TOPIC_IDS, `${c.id} primaryTopic`).toContain(c.primaryTopic);
    c.secondaryTopics.forEach((t) => expect(TOPIC_IDS, `${c.id} secondary ${t}`).toContain(t));
    expect(c.secondaryTopics, `${c.id} lists primary as secondary`).not.toContain(c.primaryTopic);
    expect(['beginner', 'intermediate', 'advanced']).toContain(c.difficulty);
    expect(FORMATS, `${c.id} format`).toContain(c.format);
    expect(['illustrative', 'historical', 'documented']).toContain(c.exampleType);
    expect(['verified', 'needs-source-check', 'original-synthesis']).toContain(c.reviewStatus);
    if (c.coverSymbol !== undefined) expect(SYMBOL_IDS as string[], `${c.id} coverSymbol`).toContain(c.coverSymbol);
    const words = wordCount(c.coreIdea);
    expect(words, `${c.id} coreIdea words=${words}`).toBeGreaterThanOrEqual(40);
    expect(words, `${c.id} coreIdea words=${words}`).toBeLessThanOrEqual(125);
    expect(c.readingTimeSec!, `${c.id} reading time`).toBeLessThanOrEqual(80);
    expect(c.keyConcepts.length, `${c.id} keyConcepts`).toBeGreaterThanOrEqual(2);
    c.keyConcepts.forEach((k) => expect(k.terms.length).toBeGreaterThan(0));
    [...c.relatedCardIds, ...c.contrastingCardIds].forEach((id) =>
      expect(CARD_INDEX.has(id), `${c.id} links to missing ${id}`).toBe(true),
    );
    if (c.format === 'two-viewpoints') expect(c.contrarian, `${c.id} needs contrarian block`).toBeTruthy();
    if (c.format === 'connect-domains') expect(c.bridge, `${c.id} needs bridge block`).toBeTruthy();
    if (c.format === 'checklist') expect(c.checklist?.length, `${c.id} needs checklist`).toBeGreaterThanOrEqual(3);
    if (c.format === 'quote-interpretation') expect(c.quote, `${c.id} needs quote`).toBeTruthy();
    if (c.exampleType === 'illustrative') expect(c.example.length).toBeGreaterThan(0);
  });

  it('meets the minimum topic distribution', () => {
    const count = (...topics: string[]) => ALL_CARDS.filter((c) => topics.includes(c.primaryTopic)).length;
    expect(count('investing', 'personal-finance')).toBeGreaterThanOrEqual(10);
    expect(count('behavioral-finance')).toBeGreaterThanOrEqual(6);
    expect(count('psychology')).toBeGreaterThanOrEqual(6);
    expect(count('people-management')).toBeGreaterThanOrEqual(8);
    expect(count('leadership')).toBeGreaterThanOrEqual(6);
    expect(count('ai', 'agentic-ai')).toBeGreaterThanOrEqual(8);
    expect(count('technology')).toBeGreaterThanOrEqual(5);
    expect(count('decision-making', 'mental-models')).toBeGreaterThanOrEqual(5);
    expect(count('productivity')).toBeGreaterThanOrEqual(3);
    expect(count('support-leadership', 'operational-excellence')).toBeGreaterThanOrEqual(3);
  });

  it('covers all difficulty levels and many formats', () => {
    const diffs = new Set(ALL_CARDS.map((c) => c.difficulty));
    expect(diffs.size).toBe(3);
    const formats = new Set(ALL_CARDS.map((c) => c.format));
    expect(formats.size).toBeGreaterThanOrEqual(18);
  });

  it('has no duplicate titles', () => {
    const titles = ALL_CARDS.map((c) => c.title.toLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('decision scenarios are well-formed', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(6);
    for (const s of SCENARIOS) {
      expect(s.choices.length).toBeGreaterThanOrEqual(3);
      s.choices.forEach((ch) => {
        expect(ch.gains.length).toBeGreaterThan(0);
        expect(ch.costs.length).toBeGreaterThan(0);
      });
      s.relevantConcepts.forEach((rc) => rc.cardId && expect(CARD_INDEX.has(rc.cardId), `${s.id} -> ${rc.cardId}`).toBe(true));
      expect(TOPIC_IDS).toContain(s.topic);
    }
  });

  it('idea collisions reference real cards', () => {
    expect(COLLISIONS.length).toBeGreaterThanOrEqual(4);
  });
});
