import type { KnowledgeCard } from '../types';

export function shareText(card: KnowledgeCard) {
  return `${card.title}\n\n${card.coreIdea}\n\nTry this: ${card.suggestedAction}\n\n— via ScrollWise`;
}

export async function shareCard(card: KnowledgeCard): Promise<'shared' | 'copied' | 'failed'> {
  const text = shareText(card);
  try {
    if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
      await navigator.share({ title: card.title, text });
      return 'shared';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'failed';
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
