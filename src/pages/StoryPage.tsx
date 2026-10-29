import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { KnowledgeCard } from '../types';
import { getCard, getExplainer } from '../services/content';
import { familyOf } from '../data/families';
import { FORMAT_LABELS, TOPIC_MAP } from '../data/topics';
import { CoverArt } from '../components/cards/CoverArt';
import { ExplainerPlayer } from '../components/explainer/ExplainerPlayer';
import { useAppStore, defaultCollectionIdFor } from '../store/useAppStore';
import { useToast } from '../store/toast';
import { LinkButton } from '../components/common/ui';
import { ResearchButton } from '../components/cards/GoDeeper';

// A card told as tap-through slides: cover → idea → example → question → try this.
// Tap the right side (or →) for next, left side (or ←) for back. Nothing advances on its own.

interface Slide {
  key: string;
  label: string;
  body: ReactNode;
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-bold tracking-[0.08em] text-marigold uppercase">{children}</p>;
}

function buildSlides(card: KnowledgeCard, hasExplainer: boolean): Slide[] {
  const slides: Slide[] = [
    {
      key: 'idea',
      label: 'The idea',
      body: (
        <>
          <Kicker>The idea</Kicker>
          <p className="mt-4 font-display text-[24px] leading-[1.25] font-bold tracking-[-0.015em]">{card.simpleExplanation ?? card.whyItMatters}</p>
          <p className="mt-4 text-[17px] leading-[1.6] text-[#d6dae6]">{card.coreIdea}</p>
          {card.disputed && <p className="mt-4 rounded-2xl bg-[#1e2d52] px-4 py-3 text-[14px]"><strong>Contested evidence: </strong>{card.disputed}</p>}
        </>
      ),
    },
  ];
  if (hasExplainer) {
    slides.push({ key: 'watch', label: 'Watch', body: null });
  }
  slides.push({
    key: 'example',
    label: 'Example',
    body: (
      <>
        <div className="flex items-center gap-2">
          <Kicker>For example</Kicker>
          <span className="rounded-full border border-[#34466f] px-2 py-0.5 text-[11px] font-semibold text-[#b4bbcc] capitalize">{card.exampleType}</span>
        </div>
        <p className="mt-4 text-[19px] leading-[1.55]">{card.example}</p>
        {card.checklist && (
          <ul className="mt-5 space-y-2">
            {card.checklist.map((c, i) => (
              <li key={c} className="flex items-start gap-3 rounded-2xl bg-[#1e2d52] px-4 py-3 text-[16px]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-marigold text-[14px] font-extrabold text-[#14213d]">{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
        )}
      </>
    ),
  });
  slides.push({
    key: 'think',
    label: 'Think',
    body: (
      <>
        <Kicker>Sit with this</Kicker>
        <p className="mt-5 font-serif text-[30px] leading-[1.25] italic">{card.reflectionQuestion}</p>
        <p className="mt-6 text-[16px] leading-relaxed text-[#b4bbcc]">{card.whyItMatters}</p>
      </>
    ),
  });
  return slides;
}

export default function StoryPage() {
  const { id = '' } = useParams();
  const card = getCard(id);
  const explainer = card ? getExplainer(card.id) : undefined;
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const markCompleted = useAppStore((s) => s.markCompleted);
  const record = useAppStore((s) => s.record);
  const save = useAppStore((s) => s.save);
  const saved = useAppStore((s) => s.collections.some((c) => c.cardIds.includes(id)));
  const toast = useToast((s) => s.show);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const slides = useMemo(() => (card ? buildSlides(card, !!explainer) : []), [card, explainer]);
  const count = slides.length + 2; // cover + content slides + finish
  const last = count - 1;

  useEffect(() => {
    if (card) record(card.id, 'explore');
  }, [card, record]);

  useEffect(() => {
    if (card && i === last) markCompleted(card.id);
    headingRef.current?.focus({ preventScroll: true });
  }, [i, last, card, markCompleted]);

  const next = useCallback(() => setI((x) => Math.min(last, x + 1)), [last]);
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') navigate(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, navigate]);

  if (!card) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="font-display text-2xl font-extrabold">We couldn't find that story</p>
        <LinkButton to="/feed" variant="primary" className="mt-6">Back to feed</LinkButton>
      </div>
    );
  }

  const fam = familyOf(card.primaryTopic);
  const topic = TOPIC_MAP[card.primaryTopic];
  const onCover = i === 0;
  const content = slides[i - 1];
  const isWatch = content?.key === 'watch';
  const labels = ['Cover', ...slides.map((s) => s.label), 'Your move'];
  const fg = onCover ? fam.onBg : '#f2efe6';

  // Tap anywhere on a slide: left third goes back, the rest goes forward. Controls inside the slide keep their own clicks.
  const onTap = (e: MouseEvent<HTMLDivElement>) => {
    if (isWatch || i === last) return;
    if ((e.target as HTMLElement).closest('a,button,input,textarea,summary,details')) return;
    if (window.getSelection()?.toString()) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.35) prev();
    else next();
  };

  const onSave = () => {
    if (saved) return toast('Already on your shelf');
    save(card.id, defaultCollectionIdFor(card.id));
    toast('Saved to your shelf');
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-center bg-[#0a1226]">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden" style={{ background: onCover ? fam.bg : '#14213d', color: fg }}>
        {/* Progress + header */}
        <div className="relative z-20 px-3.5 pt-[calc(env(safe-area-inset-top)+12px)]">
          <div className="flex gap-1" aria-hidden>
            {labels.map((l, k) => (
              <span key={l + k} className="h-1 flex-1 rounded-full" style={{ background: fg, opacity: k <= i ? 1 : 0.28 }} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold">{topic.label}</p>
              <p className="text-[12px] opacity-80">
                {labels[i]} · {i + 1} of {count}
              </p>
            </div>
            <Link
              to={`/card/${card.id}`}
              className="flex min-h-11 items-center rounded-2xl px-3 text-[13px] font-semibold"
              style={{ background: onCover ? 'rgb(255 255 255 / 0.35)' : 'rgb(255 255 255 / 0.08)' }}
            >
              Full card
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Close story"
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: onCover ? 'rgb(255 255 255 / 0.35)' : 'rgb(255 255 255 / 0.08)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slide */}
        <div key={i} onClick={onTap} className="fade-in relative z-10 flex-1 overflow-y-auto px-6 pt-6 pb-28">
          <h1 ref={headingRef} tabIndex={-1} className="sr-only">
            {card.title} — {labels[i]}
          </h1>
          {onCover && (
            <div className="flex min-h-full flex-col">
              <div className="-mx-6 overflow-hidden">
                <CoverArt card={card} height={300} />
              </div>
              <p className="mt-5 text-[13px] font-bold tracking-[0.06em] uppercase opacity-80">{FORMAT_LABELS[card.format]}</p>
              <p className="mt-2 font-display text-[40px] leading-[1.02] font-extrabold tracking-[-0.035em]">{card.title}</p>
              <p className="mt-3 font-serif text-[23px] leading-snug italic">{card.hook}</p>
            </div>
          )}
          {content && !isWatch && content.body}
          {isWatch && explainer && (
            <>
              <Kicker>Watch · {Math.round(explainer.scenes.reduce((n, s) => n + (s.seconds ?? 8), 0))} s</Kicker>
              <div className="mt-4 -mx-2">
                <ExplainerPlayer explainer={explainer} card={card} />
              </div>
            </>
          )}
          {i === last && (
            <>
              <Kicker>Try this week</Kicker>
              <p className="mt-4 font-display text-[28px] leading-[1.15] font-extrabold tracking-[-0.02em]">{card.suggestedAction}</p>
              {card.source && card.source.type !== 'original' && (
                <p className="mt-5 text-[13px] text-[#b4bbcc]">
                  Source: {card.source.title}
                  {card.source.author && `, ${card.source.author}`}
                  {card.source.year && ` (${card.source.year})`}
                </p>
              )}
              <div className="relative z-30 mt-8 space-y-2.5">
                <Link to={`/card/${card.id}`} state={{ focus: 'explain' }} className="flex min-h-14 items-center justify-center rounded-[18px] bg-marigold text-[16px] font-extrabold text-[#14213d]">
                  Explain it back in two lines
                </Link>
                <ResearchButton card={card} className="w-full !bg-[#1e2d52] !text-white" />
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={onSave} className="min-h-12 rounded-2xl border border-[#34466f] text-[15px] font-bold">
                    {saved ? 'Saved' : 'Save'}
                  </button>
                  <Link to="/feed" className="flex min-h-12 items-center justify-center rounded-2xl bg-[#f2efe6] text-[15px] font-bold text-[#14213d]">
                    Back to feed
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Explicit controls for slides that hold their own buttons. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <button
            type="button"
            onClick={prev}
            disabled={i === 0}
            aria-label="Previous slide"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-0"
            style={{ background: onCover ? 'rgb(255 255 255 / 0.4)' : 'rgb(255 255 255 / 0.1)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          {i === 0 && <span className="self-center rounded-full bg-[#14213d]/85 px-4 py-2 text-[13px] font-semibold text-white">Tap to continue · {count} slides</span>}
          <button
            type="button"
            onClick={next}
            disabled={i === last}
            aria-label="Next slide"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-0"
            style={{ background: onCover ? '#14213d' : '#f2efe6', color: onCover ? '#fff' : '#14213d' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
