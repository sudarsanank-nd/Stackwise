import { describe, expect, it } from 'vitest';
import { getCard } from '../services/content';
import { claudeResearchUrl, furtherReadingLinks, researchPrompt, researchQuery } from '../services/research';

describe('research links', () => {
  const card = getCard('bf-loss-aversion-panic')!;

  it('searches for the cited work rather than the hook-style title', () => {
    expect(researchQuery(card)).toContain('Prospect Theory');
    expect(researchQuery(card)).toContain('Daniel Kahneman');
  });

  it('builds a Claude prompt that cites the source and asks for checked links', () => {
    const p = researchPrompt(card);
    expect(p).toContain(card.title);
    expect(p).toContain('The app cites: Prospect Theory');
    expect(p).toContain('not a request for financial advice');
    expect(p).toMatch(/Only include links you have checked/);
    expect(claudeResearchUrl(card).startsWith('https://claude.ai/new?q=')).toBe(true);
  });

  it('offers the original source first when the card has a URL, then searches', () => {
    const withUrl = getCard('agent-compounding-errors')!;
    const links = furtherReadingLinks(card);
    expect(links.map((l) => l.label)).toEqual(expect.arrayContaining(['Research papers', 'Talks and videos', 'Background']));
    links.forEach((l) => expect(l.href).toMatch(/^https:\/\//));
    if (card.source?.url) expect(links[0].label).toBe('Original source');
    expect(furtherReadingLinks(withUrl).length).toBeGreaterThanOrEqual(3);
  });
});
