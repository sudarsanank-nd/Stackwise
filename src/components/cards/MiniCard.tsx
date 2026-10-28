import { Link } from 'react-router-dom';
import type { KnowledgeCard } from '../../types';
import { TopicTag } from '../common/ui';

export function MiniCard({ card, label, onClick }: { card: KnowledgeCard; label?: string; onClick?: () => void }) {
  return (
    <Link to={`/card/${card.id}`} onClick={onClick} className="block rounded-2xl border border-line bg-surface p-4 hover:bg-surface-2">
      <div className="flex items-center justify-between gap-2">
        <TopicTag topic={card.primaryTopic} small />
        {label && <span className="text-[12px] text-ink-2">{label}</span>}
      </div>
      <p className="mt-1 font-semibold">{card.title}</p>
      <p className="mt-0.5 line-clamp-2 text-[14px] text-ink-2">{card.hook}</p>
    </Link>
  );
}
