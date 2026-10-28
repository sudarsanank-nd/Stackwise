import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ALL_CARDS } from '../services/content';
import { TOPICS, TOPIC_MAP, DIFFICULTY_LABELS, FORMAT_LABELS } from '../data/topics';
import { EmptyState, LinkButton, PageHeader, Section } from '../components/common/ui';
import { MiniCard } from '../components/cards/MiniCard';
import { useAppStore } from '../store/useAppStore';
import type { TopicId } from '../types';

const NO_TOPICS: TopicId[] = [];

export function TopicsPage() {
  const interests = useAppStore((s) => s.profile?.interests) ?? NO_TOPICS;
  return (
    <div>
      <PageHeader title="Topic explorer" subtitle="Every area ScrollWise covers. Yours are marked." back="/profile" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => {
          const n = ALL_CARDS.filter((c) => c.primaryTopic === t.id).length;
          return (
            <li key={t.id}>
              <Link
                to={`/topics/${t.id}`}
                data-accent=""
                style={{ '--accent-l': t.accent, '--accent-d': t.accentDark } as CSSProperties}
                className="flex min-h-20 flex-col justify-center rounded-2xl border border-line border-l-4 border-l-[var(--accent)] bg-surface px-4 py-3 hover:bg-surface-2"
              >
                <span className="font-semibold">{t.label}</span>
                <span className="text-[13px] text-ink-2">
                  {n} cards{interests.includes(t.id) ? ' · following' : ''}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TopicPage() {
  const { topicId = '' } = useParams();
  const topic = TOPIC_MAP[topicId as TopicId];
  if (!topic) return <EmptyState title="Unknown topic" action={<LinkButton to="/topics">All topics</LinkButton>} />;
  const primary = ALL_CARDS.filter((c) => c.primaryTopic === topic.id);
  const touching = ALL_CARDS.filter((c) => c.secondaryTopics.includes(topic.id));
  const byLevel = (['beginner', 'intermediate', 'advanced'] as const).map((d) => ({ d, cards: primary.filter((c) => c.difficulty === d) }));
  return (
    <div>
      <PageHeader
        title={topic.label}
        subtitle={`${primary.length} cards, plus ${touching.length} from other fields that touch on it.`}
        back="/topics"
        actions={<LinkButton to={`/feed?topic=${topic.id}`} variant="primary">Read as feed</LinkButton>}
      />
      {byLevel.map(({ d, cards }) =>
        cards.length ? (
          <Section key={d} title={DIFFICULTY_LABELS[d]}>
            <div className="grid gap-3">
              {cards.map((c) => (
                <MiniCard key={c.id} card={c} label={FORMAT_LABELS[c.format]} />
              ))}
            </div>
          </Section>
        ) : null,
      )}
      {touching.length > 0 && (
        <Section title="Connected from other fields">
          <div className="grid gap-3 sm:grid-cols-2">
            {touching.slice(0, 8).map((c) => (
              <MiniCard key={c.id} card={c} />
            ))}
          </div>
        </Section>
      )}
      <p className="text-[14px] text-ink-2">
        Next door: {topic.adjacent.map((a, i) => (
          <span key={a}>
            {i > 0 && ', '}
            <Link className="underline" to={`/topics/${a}`}>{TOPIC_MAP[a].label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
