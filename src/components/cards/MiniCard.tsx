import { Link } from 'react-router-dom';
import type { KnowledgeCard } from '../../types';
import { TopicTag } from '../common/ui';
import { CoverArt } from './CoverArt';

export function MiniCard({ card, label, onClick }: { card: KnowledgeCard; label?: string; onClick?: () => void }) {
  return (
    <Link to={`/card/${card.id}`} onClick={onClick} className="flex gap-3 rounded-3xl border border-line bg-surface p-3 hover:bg-surface-2">
      <span className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl">
        <CoverArt card={card} height={72} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <TopicTag topic={card.primaryTopic} small />
          {label && <span className="text-[12px] text-ink-2">{label}</span>}
        </span>
        <span className="mt-0.5 block font-display text-[16px] leading-snug font-extrabold tracking-[-0.01em]">{card.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[14px] text-ink-2">{card.hook}</span>
      </span>
    </Link>
  );
}
