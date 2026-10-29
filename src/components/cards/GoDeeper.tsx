import type { KnowledgeCard } from '../../types';
import { claudeResearchUrl, furtherReadingLinks, researchPrompt } from '../../services/research';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../store/toast';
import { Icon } from '../common/Icon';

/** Opens Claude with a research prompt for this card (also copied, in case the prompt doesn't prefill). */
export function ResearchButton({ card, className = '' }: { card: KnowledgeCard; className?: string }) {
  const record = useAppStore((s) => s.record);
  const toast = useToast((s) => s.show);
  const onClick = async () => {
    record(card.id, 'explore');
    try {
      await navigator.clipboard?.writeText(researchPrompt(card));
      toast('Research prompt copied — paste it into Claude if it isn’t filled in');
    } catch {
      toast('Opening Claude…');
    }
  };
  return (
    <a
      href={claudeResearchUrl(card)}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-navy px-4 text-[15px] font-bold text-white hover:opacity-90 dark:bg-brand dark:text-brand-ink ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4" />
      </svg>
      Research with Claude<span className="sr-only"> (opens claude.ai in a new tab)</span>
    </a>
  );
}

export function GoDeeper({ card }: { card: KnowledgeCard }) {
  const links = furtherReadingLinks(card);
  return (
    <section aria-labelledby={`deeper-${card.id}`} className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <h2 id={`deeper-${card.id}`} className="font-display text-[20px] font-extrabold tracking-[-0.02em]">
        Go deeper, outside the app
      </h2>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
        Ask Claude to find sources, talks and debates on this idea, or search yourself. Nothing leaves the app until you tap.
      </p>
      <ResearchButton card={card} className="mt-4 w-full" />
      <ul className="mt-4 divide-y divide-line">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-3 py-2 hover:text-brand">
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{l.label}</span>
                <span className="line-clamp-1 block text-[13px] text-ink-2">{l.hint}</span>
              </span>
              <Icon name="external" size={18} className="text-ink-2" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
