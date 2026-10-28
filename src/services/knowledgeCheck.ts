import type { KnowledgeCard } from '../types';
import { ALL_CARDS, getCard } from './content';
import { mulberry32, shuffle } from '../utils/rng';

export interface CheckQuestion {
  card: KnowledgeCard;
  options: { id: string; text: string }[];
}

/** Builds a 3-question check: pick the plain-language summary that matches each card read today. */
export function buildKnowledgeCheck(cardIds: string[], seed: number): CheckQuestion[] {
  const rand = mulberry32(seed);
  const cards = shuffle(cardIds.map(getCard).filter(Boolean) as KnowledgeCard[], rand).slice(0, 3);
  return cards.map((card) => {
    const distractors = shuffle(
      ALL_CARDS.filter((c) => c.id !== card.id && c.simpleExplanation),
      rand,
    ).slice(0, 2);
    return {
      card,
      options: shuffle(
        [card, ...distractors].map((c) => ({ id: c.id, text: c.simpleExplanation ?? c.hook })),
        rand,
      ),
    };
  });
}

