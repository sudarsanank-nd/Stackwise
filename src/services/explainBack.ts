import type { KeyConcept, KnowledgeCard } from '../types';
import { normalize, wordCount } from '../utils/text';

export interface ExplainBackResult {
  tooShort: boolean;
  covered: KeyConcept[];
  missed: KeyConcept[];
  misunderstandings: string[];
  simplerExplanation: string;
  followUpQuestion: string;
  /** 0–1 share of key concepts covered. */
  coverage: number;
}

/**
 * Evaluator interface — the local keyword matcher below implements it today.
 * A future LLM-backed evaluator can implement the same signature (async) and be
 * swapped in from the ExplainBack component without UI changes.
 */
export interface ExplainBackEvaluator {
  evaluate(text: string, card: KnowledgeCard): ExplainBackResult | Promise<ExplainBackResult>;
}

const termPresent = (haystack: string, term: string) => {
  const t = normalize(term);
  if (!t) return false;
  // Match at a word start so "gain" doesn't match "again", while stems like "accountab" still work.
  return ` ${haystack}`.includes(` ${t}`);
};

export function conceptCovered(text: string, concept: KeyConcept): boolean {
  const hay = normalize(text);
  const hits = concept.terms.filter((t) => termPresent(hay, t)).length;
  return hits >= Math.min(concept.minMatches ?? 1, concept.terms.length);
}

export const keywordEvaluator: ExplainBackEvaluator = {
  evaluate(text, card) {
    const tooShort = wordCount(text) < 8;
    const covered: KeyConcept[] = [];
    const missed: KeyConcept[] = [];
    if (!tooShort) card.keyConcepts.forEach((k) => (conceptCovered(text, k) ? covered : missed).push(k));
    else missed.push(...card.keyConcepts);
    const hay = normalize(text);
    const misunderstandings = (card.misconceptions ?? [])
      .filter((m) => m.triggers.some((t) => termPresent(hay, t)))
      .map((m) => m.note);
    const coverage = card.keyConcepts.length ? covered.length / card.keyConcepts.length : 0;
    const followUpQuestion =
      missed.length > 0
        ? `How does "${missed[0].label.toLowerCase()}" fit into the idea?`
        : `Where could you apply this in the next week — and what would make it fail?`;
    return {
      tooShort,
      covered,
      missed,
      misunderstandings,
      simplerExplanation: card.simpleExplanation ?? card.hook,
      followUpQuestion,
      coverage,
    };
  },
};
