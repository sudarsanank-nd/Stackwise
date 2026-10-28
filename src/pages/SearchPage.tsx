import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { FeedFilters } from '../types';
import { ALL_CARDS } from '../services/content';
import { groupByTopic, searchCards } from '../services/search';
import { useAppStore } from '../store/useAppStore';
import { FilterPanel } from '../components/feed/FeedControls';
import { EmptyState, PageHeader, Section } from '../components/common/ui';
import { MiniCard } from '../components/cards/MiniCard';
import { FORMAT_LABELS, topicLabel } from '../data/topics';
import { Icon } from '../components/common/Icon';

const SUGGESTIONS = ['loss aversion', 'delegation', 'AI agents', 'escalation', 'feedback', 'inflation', 'pre-mortem'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<FeedFilters>({ topics: [], difficulties: [], formats: [] });
  const addSearch = useAppStore((s) => s.addSearch);
  const history = useAppStore((s) => s.searchHistory);
  const query = params.get('q') ?? '';

  // Record the search after the user pauses typing.
  useEffect(() => {
    if (query.trim().length < 2) return;
    const t = setTimeout(() => addSearch(query), 1200);
    return () => clearTimeout(t);
  }, [query, addSearch]);

  const results = useMemo(() => searchCards(query, ALL_CARDS, filters), [query, filters]);
  const groups = useMemo(() => groupByTopic(results), [results]);

  return (
    <div>
      <PageHeader title="Search" subtitle="Find a concept, then follow where it leads." />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) addSearch(query);
        }}
      >
        <label htmlFor="search-input" className="sr-only">
          Search ideas
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--focus)]">
          <Icon name="search" className="text-ink-2" />
          <input
            id="search-input"
            type="search"
            value={query}
            autoFocus
            onChange={(e) => {
              setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
            }}
            placeholder="Try “loss aversion” or “delegation”"
            className="min-h-13 flex-1 bg-transparent text-[17px] outline-none"
          />
        </div>
      </form>

      <div className="mt-4">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {!query && (
        <div className="mt-6">
          <Section title="Try">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setParams({ q: s })} className="min-h-10 rounded-full border border-line bg-surface px-4 text-sm hover:bg-surface-2">
                  {s}
                </button>
              ))}
            </div>
          </Section>
          {history.length > 0 && (
            <Section title="Recent searches">
              <div className="flex flex-wrap gap-2">
                {[...history].reverse().slice(0, 8).map((s) => (
                  <button key={s} type="button" onClick={() => setParams({ q: s })} className="min-h-10 rounded-full bg-surface-2 px-4 text-sm">
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          )}
          <Link to="/topics" className="inline-flex min-h-11 items-center gap-2 font-medium underline">
            <Icon name="compass" size={18} /> Browse all topics
          </Link>
        </div>
      )}

      {query && (
        <div className="mt-6" aria-live="polite">
          <p className="mb-4 text-[14px] text-ink-2">
            {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
          </p>
          {results.length === 0 ? (
            <EmptyState title="No matching ideas">Try a broader word, or clear the filters.</EmptyState>
          ) : (
            groups.map((g) => (
              <Section key={g.topic} title={topicLabel(g.topic)}>
                <div className="grid gap-3">
                  {g.results.map((r) => (
                    <MiniCard key={r.card.id} card={r.card} label={FORMAT_LABELS[r.card.format]} />
                  ))}
                </div>
              </Section>
            ))
          )}
        </div>
      )}
    </div>
  );
}
