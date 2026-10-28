import type { FeedFilters, KnowledgeCard, TopicId } from '../types';
import { FORMAT_LABELS, topicLabel } from '../data/topics';
import { matchesFilters } from './recommendation';
import { normalize } from '../utils/text';

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'is', 'what', 'how', 'why', 'with']);

/** A few synonyms so common phrasings find the right cards. */
const SYNONYMS: Record<string, string[]> = {
  agents: ['agent', 'agentic'],
  agent: ['agentic'],
  llm: ['language model'],
  ai: ['artificial intelligence', 'model'],
  sla: ['service level'],
  feedback: ['sbi'],
  bias: ['biases'],
  money: ['finance', 'investing'],
  stocks: ['investing', 'index'],
};

export interface SearchResult {
  card: KnowledgeCard;
  score: number;
}

export function tokenize(q: string): string[] {
  return normalize(q)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function searchCards(query: string, cards: KnowledgeCard[], filters?: Partial<FeedFilters>): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const phrase = normalize(query);
  const results: SearchResult[] = [];
  for (const card of cards) {
    if (!matchesFilters(card, filters)) continue;
    const fields = {
      title: normalize(card.title),
      hook: normalize(card.hook),
      concepts: normalize(card.keyConcepts.map((k) => k.label).join(' ')),
      body: normalize(`${card.coreIdea} ${card.example} ${card.whyItMatters}`),
      meta: normalize(`${topicLabel(card.primaryTopic)} ${card.secondaryTopics.map(topicLabel).join(' ')} ${FORMAT_LABELS[card.format]}`),
    };
    let score = 0;
    let matchedTokens = 0;
    for (const t of tokens) {
      const variants = [t, ...(SYNONYMS[t] ?? [])];
      let hit = 0;
      for (const v of variants) {
        if (fields.title.includes(v)) hit = Math.max(hit, 5);
        if (fields.concepts.includes(v) || fields.hook.includes(v)) hit = Math.max(hit, 3);
        if (fields.meta.includes(v)) hit = Math.max(hit, 2);
        if (fields.body.includes(v)) hit = Math.max(hit, 1);
      }
      if (hit) matchedTokens++;
      score += hit;
    }
    if (matchedTokens === 0) continue;
    if (tokens.length > 1 && Object.values(fields).some((f) => f.includes(phrase))) score += 6;
    // Prefer cards matching every word of the query.
    if (matchedTokens === tokens.length) score += 2 * tokens.length;
    else score *= matchedTokens / tokens.length;
    results.push({ card, score });
  }
  return results.sort((a, b) => b.score - a.score || a.card.title.localeCompare(b.card.title));
}

export function groupByTopic(results: SearchResult[]): { topic: TopicId; results: SearchResult[] }[] {
  const map = new Map<TopicId, SearchResult[]>();
  results.forEach((r) => map.set(r.card.primaryTopic, [...(map.get(r.card.primaryTopic) ?? []), r]));
  return [...map.entries()]
    .map(([topic, rs]) => ({ topic, results: rs }))
    .sort((a, b) => b.results[0].score - a.results[0].score);
}
