import { useEffect, useState } from 'react';
import type { Explainer, KnowledgeCard } from '../../types';
import { familyOf } from '../../data/families';
import { explainerSeconds, sceneSeconds } from '../../services/content';
import { ExplainerVisual } from './ExplainerVisual';

// Plays a motion explainer: scene by scene, captions always on, no sound, no autoplay.
// Time advances only while playing; chapters jump straight to a scene.

const TICK_MS = 100;
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

export function ExplainerPlayer({ explainer, card }: { explainer: Explainer; card: KnowledgeCard }) {
  const family = familyOf(card.primaryTopic);
  const scenes = explainer.scenes;
  const [pos, setPos] = useState({ idx: 0, ms: 0 });
  const [wantPlay, setWantPlay] = useState(false);
  const [started, setStarted] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.5>(1);
  const [run, setRun] = useState(0);
  const { idx, ms } = pos;
  const scene = scenes[idx];
  const total = explainerSeconds(explainer);
  const now = scenes.slice(0, idx).reduce((n, s) => n + sceneSeconds(s), 0) + ms / 1000;
  const atEnd = idx === scenes.length - 1 && ms >= sceneSeconds(scene) * 1000;
  const playing = wantPlay && !atEnd;
  const ended = started && atEnd;

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setPos((p) => {
        const dur = sceneSeconds(scenes[p.idx]) * 1000;
        const next = p.ms + TICK_MS * speed;
        if (next < dur) return { ...p, ms: next };
        if (p.idx < scenes.length - 1) return { idx: p.idx + 1, ms: 0 };
        return { ...p, ms: dur };
      });
    }, TICK_MS);
    return () => window.clearInterval(t);
  }, [playing, speed, scenes]);

  const goTo = (i: number) => {
    setPos({ idx: i, ms: 0 });
    setRun((r) => r + 1);
    setStarted(true);
    setWantPlay(true);
  };

  const toggle = () => {
    if (ended) return goTo(0);
    setStarted(true);
    setWantPlay(!playing);
  };

  return (
    <section aria-label="Motion explainer" className="overflow-hidden rounded-[28px] bg-[#14213d] text-[#f2efe6]">
      <div className="relative aspect-[300/220] w-full px-3 pt-4">
        <div key={`${idx}-${run}`} className={`h-full w-full ${!started ? 'sw-static' : playing ? '' : 'sw-paused'}`}>
          <ExplainerVisual scene={scene} family={family} />
        </div>
        {!started && (
          <button
            type="button"
            onClick={toggle}
            className="absolute inset-0 flex items-center justify-center bg-[#14213d]/40"
            aria-label={`Play ${Math.round(total)}-second explainer`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-marigold shadow-lg">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#14213d" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <p aria-live="polite" className="min-h-[3.5rem] px-5 pt-2 text-center text-[16px] leading-snug font-semibold">
        {scene.caption}
      </p>

      <div className="px-4 pt-3 pb-4">
        <div
          role="progressbar"
          aria-label="Explainer progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(now)}
          className="relative h-1.5 rounded-full bg-[#34466f]"
        >
          <div className="h-full rounded-full bg-marigold" style={{ width: `${Math.min(100, (now / total) * 100)}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={ended ? 'Replay' : playing ? 'Pause' : 'Play'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2efe6] text-[#14213d]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : ended ? <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" /> : <path d="M8 5v14l11-7z" />}
            </svg>
          </button>
          <span className="flex-1 text-[13px] font-semibold tabular-nums">
            {fmt(now)} / {fmt(total)}
          </span>
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 1.5 : 1))}
            aria-label={`Playback speed ${speed}×`}
            className="min-h-11 min-w-11 rounded-xl border border-[#34466f] px-2 text-[13px] font-extrabold"
          >
            {speed}×
          </button>
        </div>
      </div>

      <div className="border-t border-[#24345a] px-4 py-3">
        <h3 className="text-[12px] font-bold tracking-wider text-[#b4bbcc] uppercase">Chapters</h3>
        <ol className="mt-2 space-y-1.5">
          {scenes.map((s, i) => {
            const at = scenes.slice(0, i).reduce((n, x) => n + sceneSeconds(x), 0);
            const current = i === idx && started;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={current ? 'step' : undefined}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-[15px] font-semibold ${current ? 'bg-[#f2efe6] text-[#14213d]' : 'bg-[#1e2d52] hover:bg-[#24345a]'}`}
                >
                  <span className={`w-9 text-[13px] tabular-nums ${current ? 'text-[#8a5a00]' : 'text-marigold'}`}>{fmt(at)}</span>
                  {s.chapter}
                </button>
              </li>
            );
          })}
        </ol>
        <details className="mt-3 text-[14px]">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-[#b4bbcc]">Transcript</summary>
          <ol className="list-decimal space-y-1 pb-2 pl-5 leading-relaxed">
            {scenes.map((s, i) => (
              <li key={i}>{s.caption}</li>
            ))}
          </ol>
        </details>
        <p className="text-[12px] text-[#b4bbcc]">Illustrative animation · plays muted with captions</p>
      </div>
    </section>
  );
}
