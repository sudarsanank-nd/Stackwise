import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { hashString } from '../utils/rng';
import { dayKey } from '../utils/date';
import { Link, useSearchParams } from 'react-router-dom';
import type { FeedFilters, FeedMode, ScoredCard } from '../types';
import { ALL_CARDS, COLLISIONS, SCENARIOS } from '../services/content';
import { buildFeed } from '../services/recommendation';
import { useAppStore } from '../store/useAppStore';
import { useDailyProgress, useRecContext } from '../hooks/useAppData';
import { useDwell } from '../hooks/useDwell';
import { KnowledgeCardView } from '../components/cards/KnowledgeCard';
import { IdeaCollisionView } from '../components/cards/IdeaCollisionView';
import { FeedModeTabs, FilterPanel } from '../components/feed/FeedControls';
import { GuardrailPanel, TargetMetBanner } from '../components/feed/GuardrailPanel';
import { Button, EmptyState, LinkButton } from '../components/common/ui';
import { Icon } from '../components/common/Icon';
import { useToast } from '../store/toast';

export const BATCH = 10;
const EMPTY_FILTERS: FeedFilters = { topics: [], difficulties: [], formats: [] };

export default function FeedPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<FeedMode>((params.get('mode') as FeedMode) || 'for-you');
  const [filters, setFilters] = useState<FeedFilters>(() => {
    const topic = params.get('topic');
    return topic ? { ...EMPTY_FILTERS, topics: [topic as FeedFilters['topics'][number]] } : EMPTY_FILTERS;
  });
  const [items, setItems] = useState<ScoredCard[]>([]);
  const [batches, setBatches] = useState(1);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ctx = useRecContext(recent);
  const ctxRef = useRef(ctx);
  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);
  const listRef = useRef<HTMLDivElement>(null);
  const progress = useDailyProgress();
  const record = useAppStore((s) => s.record);
  const markCompleted = useAppStore((s) => s.markCompleted);
  const skip = useAppStore((s) => s.skip);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const save = useAppStore((s) => s.save);
  const toast = useToast((s) => s.show);
  const [metAtLoad] = useState(progress.met);
  const guardrailKey = progress.met && !progress.continued ? 'stop' : 'go';

  // (Re)build the first batch when mode or filters change.
  useEffect(() => {
    if (!ctxRef.current) return;
    setLoading(true);
    const feed = buildFeed(ALL_CARDS, ctxRef.current, { count: BATCH, mode, filters, seed: Date.now() });
    setItems(feed);
    setBatches(1);
    setLoading(false);
    window.scrollTo({ top: 0 });
  }, [mode, filters]);

  const loadMore = () => {
    if (!ctxRef.current) return;
    const exclude = new Set(items.map((i) => i.card.id));
    const more = buildFeed(ALL_CARDS, ctxRef.current, { count: BATCH, mode, filters, exclude, seed: Date.now() });
    setItems((prev) => [...prev, ...more]);
    setBatches((b) => b + 1);
  };

  useDwell(listRef, [items.length, guardrailKey], {
    onView: (id) => {
      record(id, 'view');
      setRecent((r) => [...r.filter((x) => x !== id), id].slice(-12));
    },
    onActive: setActiveId,
    onComplete: (id, sec) => markCompleted(id, sec),
  });

  const scrollTo = useCallback((idx: number) => {
    const el = listRef.current?.querySelectorAll<HTMLElement>('[data-card-id]')[idx];
    if (el) {
      el.scrollIntoView({ block: 'start' });
      el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    }
  }, []);

  const onSkip = useCallback(
    (id: string) => {
      skip(id);
      const idx = items.findIndex((i) => i.card.id === id);
      if (idx >= 0) scrollTo(idx + 1);
    },
    [items, skip, scrollTo],
  );

  // Keyboard navigation: j/↓ next, k/↑ previous, l like, s save, x skip.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = Math.max(0, items.findIndex((i) => i.card.id === activeId));
      const current = items[idx]?.card.id;
      if (e.key === 'j') scrollTo(idx + 1);
      else if (e.key === 'k') scrollTo(Math.max(0, idx - 1));
      else if (e.key === 'l' && current) toggleLike(current);
      else if (e.key === 's' && current) {
        save(current);
        toast('Saved');
      } else if (e.key === 'x' && current) onSkip(current);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, activeId, scrollTo, toggleLike, save, onSkip, toast]);

  const [dayIndex] = useState(() => hashString(dayKey()));
  const collisionFor = COLLISIONS[dayIndex % Math.max(1, COLLISIONS.length)];
  const gymTeaser = SCENARIOS[dayIndex % SCENARIOS.length];

  if (!ctx) return null;

  // Guardrail: once the target is met (and the reader hasn't chosen to continue), stop after the card being read.
  const guardrailActive = progress.met && !progress.continued;
  const activeIdx = items.findIndex((i) => i.card.id === activeId);
  const cutoff = guardrailActive ? (metAtLoad ? 0 : Math.max(activeIdx + 1, 1)) : items.length;
  const visible = items.slice(0, cutoff);

  return (
    <div>
      <h1 className="sr-only">Your feed</h1>
      {progress.met && progress.continued && <TargetMetBanner />}
      <FeedModeTabs mode={mode} onChange={setMode} />
      <div className="mt-4">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>
      <p className="mt-3 hidden text-[13px] text-ink-2 md:block">
        Keyboard: <kbd>j</kbd>/<kbd>k</kbd> next/previous · <kbd>l</kbd> like · <kbd>s</kbd> save · <kbd>x</kbd> skip
      </p>

      <div ref={listRef} className="feed-scroller mt-6 space-y-6" aria-live="off">
        {loading && <p className="py-10 text-center text-ink-2">Preparing your feed…</p>}
        {!loading && items.length === 0 && (
          <EmptyState title="No cards match these filters" action={<Button onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>}>
            Try fewer filters or another mode.
          </EmptyState>
        )}
        {visible.map((it, i) => (
          <Fragment key={`${it.card.id}-${i}`}>
            <div className="feed-item" data-card-id={it.card.id}>
              <KnowledgeCardView card={it.card} reasons={it.reasons} bucket={it.bucket} onSkip={() => onSkip(it.card.id)} />
            </div>
            {mode === 'for-you' && i === 5 && collisionFor && (
              <div className="feed-item">
                <IdeaCollisionView collision={collisionFor} compact />
              </div>
            )}
            {mode === 'for-you' && i === 13 && gymTeaser && (
              <div className="feed-item rounded-3xl border border-line bg-surface p-6">
                <p className="flex items-center gap-2 text-[13px] font-semibold tracking-wider text-ink-2 uppercase">
                  <Icon name="gym" size={16} /> Decision Gym
                </p>
                <h2 className="mt-2 font-serif text-[22px] font-semibold">{gymTeaser.title}</h2>
                <p className="mt-1 line-clamp-3 text-ink-2">{gymTeaser.scenario}</p>
                <LinkButton to={`/gym/${gymTeaser.id}`} variant="primary" className="mt-4">
                  Make the call
                </LinkButton>
              </div>
            )}
            {(i + 1) % BATCH === 0 && i + 1 === items.length && !guardrailActive && (
              <FeedCheckpoint count={items.length} onMore={loadMore} batches={batches} />
            )}
          </Fragment>
        ))}
        {!loading && items.length > 0 && items.length % BATCH !== 0 && !guardrailActive && (
          <EmptyState icon="check" title="You've reached the end of this mode" action={<Button onClick={() => setMode('for-you')}>Back to For you</Button>}>
            There are no more cards matching this mode and filters.
          </EmptyState>
        )}
        {guardrailActive && <GuardrailPanel minutes={Math.round(progress.seconds / 60)} cards={progress.cardsCompleted} />}
      </div>
    </div>
  );
}

function FeedCheckpoint({ count, onMore, batches }: { count: number; onMore: () => void; batches: number }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-8 text-center">
      <p className="font-serif text-[20px] font-semibold">That's {count} ideas.</p>
      <p className="mx-auto mt-1 max-w-sm text-[15px] text-ink-2">
        {batches >= 3 ? 'You have been reading a while. Is another batch what you want right now?' : 'Pause here, or load the next batch if you want more.'}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={onMore}>Load {BATCH} more</Button>
        <LinkButton to="/complete" variant="ghost">
          I'm done for now
        </LinkButton>
        <Link to="/session" className="inline-flex min-h-11 items-center px-3 text-[15px] underline">
          Try a 5-minute session
        </Link>
      </div>
    </div>
  );
}
