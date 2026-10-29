import type { KnowledgeCard } from '../types';

// "Go deeper" links for a card. The app ships no research of its own here: it hands a
// well-formed prompt to Claude, or opens a search, so every external claim is found
// (and can be checked) outside the app. Nothing is sent anywhere until the reader taps.

const MONEY_TOPICS = ['investing', 'personal-finance', 'behavioral-finance'];

/** Best search phrase for a card: its cited work when there is one, otherwise its title. */
export function researchQuery(card: KnowledgeCard): string {
  const s = card.source;
  if (s && s.type !== 'original' && s.title) return [s.title.replace(/\s*\(.*?\)\s*/g, ' ').trim(), s.author?.split(/[,&]| et al/)[0]?.trim()].filter(Boolean).join(' ');
  return card.title;
}

export function researchPrompt(card: KnowledgeCard): string {
  const s = card.source;
  const cited = s && s.type !== 'original' ? `\nThe app cites: ${s.title}${s.author ? `, ${s.author}` : ''}${s.year ? ` (${s.year})` : ''}.` : '';
  const money = MONEY_TOPICS.includes(card.primaryTopic) ? '\nThis is for my own education, not a request for financial advice.' : '';
  return `I'm learning about "${card.title}" in the Stackwise app. The idea: ${card.coreIdea}${cited}${money}

Please research this for me:
1. Find 3–5 reliable sources for further reading (original research, books, reputable articles), with links, and say what each one adds.
2. Suggest up to 2 good videos or talks, with links — only ones you can confirm are credible.
3. Note anything contested, or challenged since.
4. Give me one practical way to apply it this week.

Only include links you have checked, and say clearly if you couldn't verify something.`;
}

export const claudeResearchUrl = (card: KnowledgeCard) => `https://claude.ai/new?q=${encodeURIComponent(researchPrompt(card))}`;

export interface ReadingLink {
  label: string;
  hint: string;
  href: string;
}

export function furtherReadingLinks(card: KnowledgeCard): ReadingLink[] {
  const q = encodeURIComponent(researchQuery(card));
  const links: ReadingLink[] = [];
  if (card.source?.url) links.push({ label: 'Original source', hint: card.source.title, href: card.source.url });
  links.push(
    { label: 'Research papers', hint: 'Google Scholar search', href: `https://scholar.google.com/scholar?q=${q}` },
    { label: 'Talks and videos', hint: 'YouTube search', href: `https://www.youtube.com/results?search_query=${q}` },
    { label: 'Background', hint: 'Wikipedia search', href: `https://en.wikipedia.org/w/index.php?search=${q}` },
  );
  return links;
}
