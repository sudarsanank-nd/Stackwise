import { Link } from 'react-router-dom';
import type { TopicId } from '../../types';
import { FAMILIES, FAMILY_ORDER, activeFamily, familyTopics, type FamilyId } from '../../data/families';

// Story-style row of topic families at the top of the feed. Tapping one filters the feed
// to that family's topics; tapping it again clears the filter.

const GLYPHS: Record<FamilyId, string> = {
  money: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  people: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM17 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 15c2.6 0 5 1.8 5 5',
  ai: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6.5 6.5 10 10M17.5 7.5 14 10.5M8 17.5l2.5-3.5',
  ops: 'M4 6h16M4 12h10M4 18h6M16 16l2 2 4-4',
  mind: 'M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3zM9.5 20h5',
};

export function TopicCircles({ topics, onChange }: { topics: TopicId[]; onChange: (topics: TopicId[]) => void }) {
  const active = activeFamily(topics);
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-3" role="group" aria-label="Topic shortcuts">
      <Link to="/session" className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-[12px] font-semibold">
        <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-brand p-[3px]">
          <span className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-bg bg-navy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        Today
      </Link>
      {FAMILY_ORDER.map((id) => {
        const f = FAMILIES[id];
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? [] : familyTopics(id))}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-[12px] font-semibold"
          >
            <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full p-[3px]" style={{ background: on ? 'var(--ink)' : f.bg }}>
              <span className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-bg" style={{ background: f.light }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#14213D" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={GLYPHS[id]} />
                </svg>
              </span>
            </span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
