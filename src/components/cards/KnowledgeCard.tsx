import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FeedBucket, KnowledgeCard as Card } from '../../types';
import { DIFFICULTY_LABELS, FORMAT_LABELS, TOPIC_MAP, topicLabel } from '../../data/topics';
import { Icon } from '../common/Icon';
import { TopicTag } from '../common/ui';
import { useAppStore, defaultCollectionIdFor } from '../../store/useAppStore';
import { useToast } from '../../store/toast';
import { shareCard } from '../../services/share';
import { formatSeconds } from '../../utils/text';
import { ContrarianView } from './ContrarianView';

const INVESTING_TOPICS = ['investing', 'personal-finance', 'behavioral-finance'];

const BUCKET_LABEL: Partial<Record<FeedBucket, string>> = {
  serendipity: 'Serendipity',
  review: 'Revisit',
  experimental: 'Something different',
  adjacent: 'Adjacent',
};

function Block({ label, children, tone = 'plain' }: { label: string; children: ReactNode; tone?: 'plain' | 'question' | 'action' }) {
  const tones = {
    plain: '',
    question: 'rounded-xl bg-surface-2 px-4 py-3',
    action: 'rounded-xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] px-4 py-3',
  };
  return (
    <div className={`mt-4 ${tones[tone]}`}>
      <h3 className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">{label}</h3>
      <div className="mt-1 text-[16px] leading-relaxed">{children}</div>
    </div>
  );
}

export interface KnowledgeCardProps {
  card: Card;
  reasons?: string[];
  bucket?: FeedBucket;
  variant?: 'feed' | 'detail';
  onSkip?: () => void;
  headingLevel?: 'h2' | 'h1';
}

export function KnowledgeCardView({ card, reasons, bucket, variant = 'feed', onSkip, headingLevel = 'h2' }: KnowledgeCardProps) {
  const topic = TOPIC_MAP[card.primaryTopic];
  const liked = useAppStore((s) => s.likedIds.includes(card.id));
  const saved = useAppStore((s) => s.collections.some((c) => c.cardIds.includes(card.id)));
  const collections = useAppStore((s) => s.collections);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const save = useAppStore((s) => s.save);
  const unsave = useAppStore((s) => s.unsave);
  const record = useAppStore((s) => s.record);
  const toast = useToast((s) => s.show);
  const [showWhy, setShowWhy] = useState(false);
  const [showViews, setShowViews] = useState(variant === 'detail');
  const H = headingLevel;

  const onSave = () => {
    if (saved) {
      unsave(card.id);
      toast('Removed from your shelf');
    } else {
      const colId = defaultCollectionIdFor(card.id);
      save(card.id, colId);
      toast(`Saved to ${collections.find((c) => c.id === colId)?.name ?? 'your shelf'}`);
    }
  };

  const onShare = async () => {
    const r = await shareCard(card);
    if (r !== 'failed') record(card.id, 'share');
    toast(r === 'copied' ? 'Copied to clipboard' : r === 'shared' ? 'Shared' : 'Sharing is not available here');
  };

  return (
    <article
      data-accent=""
      aria-labelledby={`t-${card.id}`}
      style={{ '--accent-l': topic.accent, '--accent-d': topic.accentDark } as CSSProperties}
      className="relative overflow-hidden rounded-3xl border border-line bg-surface px-5 pt-5 pb-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:px-7 sm:pt-7"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
        <TopicTag topic={card.primaryTopic} />
        <span aria-hidden>·</span>
        <span>{FORMAT_LABELS[card.format]}</span>
        <span aria-hidden>·</span>
        <span>{DIFFICULTY_LABELS[card.difficulty]}</span>
        <span aria-hidden>·</span>
        <span>
          <span className="sr-only">Reading time </span>
          {formatSeconds(card.readingTimeSec ?? 45)}
        </span>
        {bucket && BUCKET_LABEL[bucket] && (
          <span className="ml-auto rounded-full bg-surface-2 px-2.5 py-0.5 text-[12px] font-medium text-ink">{BUCKET_LABEL[bucket]}</span>
        )}
      </div>

      {card.bridge && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-[13px] font-medium">
          <Icon name="link" size={15} /> {topicLabel(card.bridge.from)} <span aria-hidden>→</span>
          <span className="sr-only">connects to</span> {topicLabel(card.bridge.to)}
        </p>
      )}

      <H id={`t-${card.id}`} tabIndex={-1} className="mt-3 font-serif text-[26px] leading-[1.18] font-semibold tracking-tight sm:text-[30px]">
        {card.title}
      </H>
      <p className="mt-2 text-[16px] text-ink-2 italic">{card.hook}</p>

      {card.quote && (
        <figure className="mt-4 border-l-4 border-[var(--accent)] pl-4">
          <blockquote className="font-serif text-[19px] leading-snug">“{card.quote.text}”</blockquote>
          <figcaption className="mt-1 text-[13px] text-ink-2">
            — {card.quote.by}
            {card.quote.note && <span className="block">{card.quote.note}</span>}
          </figcaption>
        </figure>
      )}

      <p className="mt-4 font-serif text-[18px] leading-[1.6]">{card.coreIdea}</p>

      {card.disputed && (
        <p className="mt-3 flex gap-2 rounded-lg bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] px-3 py-2 text-[14px]">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-warn" />
          <span>
            <strong className="font-semibold">Contested evidence: </strong>
            {card.disputed}
          </span>
        </p>
      )}

      <Block label="Why it matters">{card.whyItMatters}</Block>
      <Block label={`Example · ${card.exampleType}`}>{card.example}</Block>

      {card.checklist && (
        <Block label={card.format === 'self-assessment' ? 'Quick self-check' : 'Checklist'}>
          <ul className="space-y-1.5">
            {card.checklist.map((c) => (
              <li key={c} className="flex gap-2">
                <Icon name="check" size={18} className="mt-1 shrink-0 text-[var(--accent)]" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {card.contrarian && (
        <div className="mt-4">
          {showViews ? (
            <ContrarianView block={card.contrarian} />
          ) : (
            <button
              type="button"
              onClick={() => setShowViews(true)}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-[15px] font-medium hover:bg-surface-2"
            >
              <Icon name="scale" size={18} /> See both viewpoints and the evidence
            </button>
          )}
        </div>
      )}

      {card.bridge && <Block label="The connection">{card.bridge.insight}</Block>}

      <Block label="Think about it" tone="question">
        <span className="font-serif text-[17px]">{card.reflectionQuestion}</span>
      </Block>
      <Block label="Try this" tone="action">
        {card.suggestedAction}
      </Block>

      {INVESTING_TOPICS.includes(card.primaryTopic) && (
        <p className="mt-3 text-[12px] text-ink-2">
          Educational content, not financial advice. <Link to="/about" className="underline">Learn more</Link>
        </p>
      )}

      <p className="mt-4 text-[13px] text-ink-2">
        {card.source && card.source.type !== 'original' ? (
          <>
            Source:{' '}
            {card.source.url ? (
              <a href={card.source.url} target="_blank" rel="noreferrer" className="underline">
                {card.source.title}
              </a>
            ) : (
              <cite className="not-italic">{card.source.title}</cite>
            )}
            {card.source.author && `, ${card.source.author}`}
            {card.source.year && ` (${card.source.year})`}
          </>
        ) : (
          'Original Stackwise explanation'
        )}
        {card.attribution && <span className="block">{card.attribution}</span>}
        {card.reviewStatus === 'needs-source-check' && (
          <span className="mt-1 inline-block rounded bg-surface-2 px-1.5 py-0.5 text-[12px] font-medium">Source detail awaiting verification</span>
        )}
      </p>

      {/* Actions */}
      <div className="mt-4 -mx-2 flex items-center justify-between border-t border-line pt-2" role="group" aria-label="Card actions">
        <ActionButton icon="heart" label={liked ? 'Liked' : 'Like'} pressed={liked} onClick={() => toggleLike(card.id)} />
        <ActionButton icon="bookmark" label={saved ? 'Saved' : 'Save'} pressed={saved} onClick={onSave} />
        {onSkip && <ActionButton icon="skip" label="Skip" onClick={onSkip} />}
        <ActionButton icon="share" label="Share" onClick={onShare} />
        {variant === 'feed' ? (
          <Link
            to={`/card/${card.id}`}
            onClick={() => record(card.id, 'explore')}
            className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[12px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <Icon name="deeper" size={20} />
            Deeper
          </Link>
        ) : null}
      </div>

      {reasons && (
        <div className="mt-1 border-t border-line pt-1">
          <button
            type="button"
            aria-expanded={showWhy}
            onClick={() => setShowWhy((v) => !v)}
            className="flex min-h-11 w-full items-center gap-2 text-[13px] font-medium text-ink-2 hover:text-ink"
          >
            <Icon name="info" size={16} /> Why am I seeing this?
          </button>
          {showWhy && (
            <div className="fade-in pb-3 text-[14px]">
              <ul className="list-disc space-y-1 pl-5 text-ink-2">
                {reasons.slice(0, 5).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    record(card.id, 'more-like-this');
                    toast(`You'll see more ${topic.short} ideas`);
                  }}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] hover:bg-surface-2"
                >
                  <Icon name="thumbUp" size={15} /> More like this
                </button>
                <button
                  type="button"
                  onClick={() => {
                    record(card.id, 'less-like-this');
                    toast(`You'll see fewer ${topic.short} ideas`);
                  }}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] hover:bg-surface-2"
                >
                  <Icon name="thumbDown" size={15} /> Less like this
                </button>
                <Link to="/settings" className="inline-flex min-h-10 items-center px-2 text-[13px] underline">
                  Personalisation settings
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function ActionButton({ icon, label, onClick, pressed }: { icon: 'heart' | 'bookmark' | 'skip' | 'share'; label: string; onClick: () => void; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl px-2 text-[12px] font-medium hover:bg-surface-2 ${pressed ? 'text-[var(--accent)]' : 'text-ink-2 hover:text-ink'}`}
    >
      <span className={pressed ? '[&_path]:fill-current' : ''}>
        <Icon name={icon} size={20} />
      </span>
      {label}
    </button>
  );
}
