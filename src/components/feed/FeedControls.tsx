import { useState } from 'react';
import type { ContentFormat, Difficulty, FeedFilters, FeedMode, TopicId } from '../../types';
import { MODES, countFilters } from '../../data/feedModes';
import { DIFFICULTIES, DIFFICULTY_LABELS, FORMATS, FORMAT_LABELS, TOPICS } from '../../data/topics';
import { Chip } from '../common/ui';
import { Icon } from '../common/Icon';

export function FeedModeTabs({ mode, onChange }: { mode: FeedMode; onChange: (m: FeedMode) => void }) {
  return (
    <div>
      <div role="tablist" aria-label="Feed mode" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            type="button"
            aria-selected={mode === m.id}
            onClick={() => onChange(m.id)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
              mode === m.id ? 'bg-ink text-bg' : 'border border-line bg-surface text-ink-2 hover:text-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[14px] text-ink-2">{MODES.find((m) => m.id === mode)?.description}</p>
    </div>
  );
}

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function FilterPanel({ filters, onChange, defaultOpen = false }: { filters: FeedFilters; onChange: (f: FeedFilters) => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const n = countFilters(filters);
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between px-4">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-12 flex-1 items-center gap-2 text-[15px] font-medium">
          <Icon name="settings" size={18} /> Filters {n > 0 && <span className="rounded-full bg-brand px-2 text-xs text-brand-ink">{n}</span>}
          <Icon name={open ? 'up' : 'down'} size={16} className="ml-1 text-ink-2" />
        </button>
        {n > 0 && (
          <button type="button" onClick={() => onChange({ topics: [], difficulties: [], formats: [] })} className="min-h-11 px-2 text-sm text-ink-2 underline hover:text-ink">
            Clear
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4">
          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold text-ink-2">Topic</legend>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Chip key={t.id} accent={t.id} selected={filters.topics.includes(t.id)} onClick={() => onChange({ ...filters, topics: toggle<TopicId>(filters.topics, t.id) })}>
                  {t.short}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold text-ink-2">Difficulty</legend>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <Chip key={d} selected={filters.difficulties.includes(d)} onClick={() => onChange({ ...filters, difficulties: toggle<Difficulty>(filters.difficulties, d) })}>
                  {DIFFICULTY_LABELS[d]}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold text-ink-2">Format</legend>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <Chip key={f} selected={filters.formats.includes(f)} onClick={() => onChange({ ...filters, formats: toggle<ContentFormat>(filters.formats, f) })}>
                  {FORMAT_LABELS[f]}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
