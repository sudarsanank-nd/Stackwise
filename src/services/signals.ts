import type { ContentFormat, KnowledgeCard, TopicId, UserInteraction } from '../types';

export interface TopicSignal {
  likes: number;
  skips: number;
  saves: number;
  explores: number;
  more: number;
  less: number;
}

export interface Signals {
  topic: Partial<Record<TopicId, TopicSignal>>;
  format: Partial<Record<ContentFormat, { more: number; less: number; seen: number }>>;
  completed: Set<string>;
  liked: Set<string>;
  understood: Set<string>;
}

const emptyTopic = (): TopicSignal => ({ likes: 0, skips: 0, saves: 0, explores: 0, more: 0, less: 0 });

/** Folds the interaction log into per-topic / per-format counters used by scoring. */
export function computeSignals(interactions: UserInteraction[], cardIndex: Map<string, KnowledgeCard>): Signals {
  const s: Signals = { topic: {}, format: {}, completed: new Set(), liked: new Set(), understood: new Set() };
  for (const i of interactions) {
    const card = cardIndex.get(i.cardId);
    if (!card) continue;
    const t = (s.topic[card.primaryTopic] ??= emptyTopic());
    const f = (s.format[card.format] ??= { more: 0, less: 0, seen: 0 });
    switch (i.type) {
      case 'like':
        t.likes++;
        s.liked.add(card.id);
        break;
      case 'unlike':
        t.likes = Math.max(0, t.likes - 1);
        s.liked.delete(card.id);
        break;
      case 'skip':
        t.skips++;
        break;
      case 'save':
        t.saves++;
        break;
      case 'explore':
        t.explores++;
        break;
      case 'more-like-this':
        t.more++;
        f.more++;
        break;
      case 'less-like-this':
        t.less++;
        f.less++;
        break;
      case 'complete':
        s.completed.add(card.id);
        f.seen++;
        break;
      case 'understood':
        s.understood.add(card.id);
        break;
    }
  }
  return s;
}
