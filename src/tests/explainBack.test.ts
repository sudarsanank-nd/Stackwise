import { describe, expect, it } from 'vitest';
import { keywordEvaluator, conceptCovered } from '../services/explainBack';
import { CARD_INDEX } from '../services/content';

const card = CARD_INDEX.get('bf-loss-aversion-panic')!;

describe('explain it back', () => {
  it('recognises a good explanation', async () => {
    const r = await keywordEvaluator.evaluate('Losses hurt more than an equal gain feels good, so people panic and sell in a decline. Write your plan before buying.', card);
    expect(r.tooShort).toBe(false);
    expect(r.covered.length).toBe(3);
    expect(r.coverage).toBe(1);
  });
  it('lists missed concepts and a follow-up', async () => {
    const r = await keywordEvaluator.evaluate('It is about how a loss can feel more painful than a gain of the same size.', card);
    expect(r.missed.length).toBeGreaterThan(0);
    expect(r.followUpQuestion).toContain(r.missed[0].label.toLowerCase());
    expect(r.simplerExplanation).toBe(card.simpleExplanation);
  });
  it('flags misconceptions and short answers', async () => {
    const r = await keywordEvaluator.evaluate('Investors are just irrational and stupid when they lose money and sell.', card);
    expect(r.misunderstandings.length).toBe(1);
    expect((await keywordEvaluator.evaluate('loss bad', card)).tooShort).toBe(true);
  });
  it('matches at word starts only', () => {
    expect(conceptCovered('again and again', { label: 'x', terms: ['gain'] })).toBe(false);
    expect(conceptCovered('gains matter', { label: 'x', terms: ['gain'] })).toBe(true);
  });
});
