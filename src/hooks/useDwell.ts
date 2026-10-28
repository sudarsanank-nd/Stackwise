import { useEffect, useRef } from 'react';
import { CARD_INDEX } from '../services/content';
import { COMPLETION_DWELL_SHARE } from '../services/progress';

/**
 * Tracks how long each `[data-card-id]` element inside `root` is mostly visible.
 * Calls onView once per card, onActive when a card becomes the main visible one,
 * and onComplete once dwell time passes COMPLETION_DWELL_SHARE of its reading time.
 */
export function useDwell(
  root: React.RefObject<HTMLElement | null>,
  deps: unknown[],
  handlers: { onView: (id: string) => void; onActive: (id: string) => void; onComplete: (id: string, seconds: number) => void },
) {
  const h = useRef(handlers);
  h.current = handlers;
  const state = useRef(new Map<string, { since: number | null; total: number; done: boolean; viewed: boolean }>());

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const st = state.current;
    const io = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.cardId!;
          const s = st.get(id) ?? { since: null, total: 0, done: false, viewed: false };
          if (e.isIntersecting) {
            if (s.since == null) s.since = now;
            if (!s.viewed) {
              s.viewed = true;
              h.current.onView(id);
            }
            h.current.onActive(id);
          } else if (s.since != null) {
            s.total += (now - s.since) / 1000;
            s.since = null;
          }
          st.set(id, s);
        }
      },
      { threshold: 0.35 },
    );
    el.querySelectorAll<HTMLElement>('[data-card-id]').forEach((n) => io.observe(n));

    const tick = setInterval(() => {
      const now = performance.now();
      st.forEach((s, id) => {
        if (s.done) return;
        const total = s.total + (s.since != null ? (now - s.since) / 1000 : 0);
        const need = (CARD_INDEX.get(id)?.readingTimeSec ?? 40) * COMPLETION_DWELL_SHARE;
        if (total >= need && !document.hidden) {
          s.done = true;
          h.current.onComplete(id, Math.round(total));
        }
      });
    }, 1000);
    return () => {
      io.disconnect();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
