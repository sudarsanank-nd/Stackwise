import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contrastingCards, getCard, relatedCards } from '../services/content';
import { KnowledgeCardView } from '../components/cards/KnowledgeCard';
import { ExplainBack } from '../components/cards/ExplainBack';
import { CollectionPicker } from '../components/library/CollectionPicker';
import { EmptyState, LinkButton, Panel, Section, Button } from '../components/common/ui';
import { MiniCard } from '../components/cards/MiniCard';
import { useAppStore } from '../store/useAppStore';
import { FORMAT_LABELS } from '../data/topics';



export default function CardDetailPage() {
  const { id = '' } = useParams();
  const card = getCard(id);
  const markCompleted = useAppStore((s) => s.markCompleted);
  const record = useAppStore((s) => s.record);
  const understood = useAppStore((s) => s.interactions.some((i) => i.cardId === id && i.type === 'understood'));

  useEffect(() => {
    if (card) {
      window.scrollTo({ top: 0 });
      const t = setTimeout(() => markCompleted(card.id), ((card.readingTimeSec ?? 40) * 1000) / 2);
      return () => clearTimeout(t);
    }
  }, [card, markCompleted]);

  if (!card) {
    return (
      <EmptyState title="We couldn't find that card" action={<LinkButton to="/feed">Back to feed</LinkButton>}>
        It may have been renamed or removed.
      </EmptyState>
    );
  }

  const related = relatedCards(card);
  const contrasting = contrastingCards(card);

  return (
    <div className="space-y-8">
      <Link to="/feed" className="inline-flex min-h-11 items-center text-[14px] text-ink-2 hover:text-ink">
        ← Feed
      </Link>
      <KnowledgeCardView card={card} variant="detail" headingLevel="h1" />

      {card.deeper && (
        <Section title="Explore deeper">
          <Panel>
            <p className="text-[17px] leading-relaxed">{card.deeper}</p>
          </Panel>
        </Section>
      )}

      {related.length > 0 && (
        <Section title="Connected ideas">
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <MiniCard key={r.id} card={r} label={FORMAT_LABELS[r.format]} />
            ))}
          </div>
        </Section>
      )}

      {contrasting.length > 0 && (
        <Section title="A contrasting view">
          <div className="grid gap-3 sm:grid-cols-2">
            {contrasting.map((r) => (
              <MiniCard key={r.id} card={r} />
            ))}
          </div>
        </Section>
      )}

      <ExplainBack card={card} />

      <Panel>
        <CollectionPicker cardId={card.id} />
      </Panel>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={understood ? 'secondary' : 'primary'}
          icon="check"
          disabled={understood}
          onClick={() => record(card.id, 'understood')}
        >
          {understood ? 'Marked as understood' : 'Mark as understood'}
        </Button>
        <LinkButton to={`/search?q=${encodeURIComponent(card.keyConcepts[0]?.label ?? card.title)}`} variant="ghost" icon="search">
          Search similar
        </LinkButton>
      </div>
    </div>
  );
}
