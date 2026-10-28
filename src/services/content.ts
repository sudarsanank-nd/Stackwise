import type { DecisionScenario, IdeaCollision, KnowledgeCard, TopicId } from '../types';
import { wordCount } from '../utils/text';
import scenariosJson from '../data/scenarios.json';
import collisionsJson from '../data/collisions.json';

const WORDS_PER_MINUTE = 230;

/** Reading time estimated from the text a reader actually sees on the card face. */
export function estimateReadingTime(card: KnowledgeCard): number {
  const words =
    wordCount(card.title) +
    wordCount(card.hook) +
    wordCount(card.coreIdea) +
    wordCount(card.whyItMatters) +
    wordCount(card.example) +
    wordCount(card.reflectionQuestion) +
    wordCount(card.suggestedAction) +
    (card.checklist ? card.checklist.reduce((n, c) => n + wordCount(c), 0) : 0);
  const sec = (words / WORDS_PER_MINUTE) * 60;
  return Math.max(20, Math.round(sec / 5) * 5);
}

const modules = import.meta.glob<{ default: KnowledgeCard[] }>('../data/cards/*.json', { eager: true });

function loadCards(): KnowledgeCard[] {
  const all: KnowledgeCard[] = [];
  for (const mod of Object.values(modules)) all.push(...mod.default);
  return all.map((c) => ({ ...c, readingTimeSec: c.readingTimeSec ?? estimateReadingTime(c) }));
}

export const ALL_CARDS: KnowledgeCard[] = loadCards();
export const CARD_INDEX: Map<string, KnowledgeCard> = new Map(ALL_CARDS.map((c) => [c.id, c]));
export const SCENARIOS = scenariosJson as DecisionScenario[];
export const SCENARIO_INDEX = new Map(SCENARIOS.map((s) => [s.id, s]));
export const COLLISIONS = (collisionsJson as IdeaCollision[]).filter((c) => CARD_INDEX.has(c.cardA) && CARD_INDEX.has(c.cardB));

export const getCard = (id: string) => CARD_INDEX.get(id);

export const cardTopics = (c: KnowledgeCard): TopicId[] => [c.primaryTopic, ...c.secondaryTopics];

/**
 * Related cards: explicit links first (both directions), then cards sharing the
 * primary topic or a secondary topic, so every card has somewhere to go next.
 */
export function relatedCards(card: KnowledgeCard, cards: KnowledgeCard[] = ALL_CARDS, limit = 4): KnowledgeCard[] {
  const out: KnowledgeCard[] = [];
  const seen = new Set<string>([card.id]);
  const push = (c?: KnowledgeCard) => {
    if (c && !seen.has(c.id)) {
      seen.add(c.id);
      out.push(c);
    }
  };
  card.relatedCardIds.forEach((id) => push(cards.find((c) => c.id === id)));
  cards.filter((c) => c.relatedCardIds.includes(card.id)).forEach(push);
  const topics = new Set(cardTopics(card));
  cards
    .filter((c) => !seen.has(c.id))
    .map((c) => ({ c, overlap: cardTopics(c).filter((t) => topics.has(t)).length + (c.primaryTopic === card.primaryTopic ? 1 : 0) }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.c.id.localeCompare(b.c.id))
    .forEach((x) => push(x.c));
  return out.slice(0, limit);
}

export function contrastingCards(card: KnowledgeCard, cards: KnowledgeCard[] = ALL_CARDS) {
  return card.contrastingCardIds.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as KnowledgeCard[];
}
