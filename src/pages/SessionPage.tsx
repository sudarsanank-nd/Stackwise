import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { LearningSession, TopicId } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useRecContext } from '../hooks/useAppData';
import { buildFiveMinuteSession, buildGapSession } from '../services/session';
import { getCard, SCENARIO_INDEX } from '../services/content';
import { KnowledgeCardView } from '../components/cards/KnowledgeCard';
import { ScenarioRunner } from '../components/decision-gym/ScenarioRunner';
import { Button, LinkButton, PageHeader, Panel, ProgressBar, TopicTag } from '../components/common/ui';
import { Icon } from '../components/common/Icon';
import { topicLabel } from '../data/topics';

const ROLE_LABEL = {
  familiar: 'Familiar ground',
  adjacent: 'One step over',
  surprising: 'Something surprising',
  gap: 'Filling a gap',
} as const;

export default function SessionPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const ctx = useRecContext();
  const sessions = useAppStore((s) => s.sessions);
  const gymResults = useAppStore((s) => s.gymResults);
  const startSession = useAppStore((s) => s.startSession);
  const advance = useAppStore((s) => s.advanceSession);
  const complete = useAppStore((s) => s.completeSession);
  const markCompleted = useAppStore((s) => s.markCompleted);
  const addReflection = useAppStore((s) => s.addReflection);
  const [gymDoneAt, setGymDoneAt] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const reflectId = useId();
  const topRef = useRef<HTMLDivElement>(null);

  const sessionId = params.get('id');
  const session: LearningSession | undefined = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);

  // Gap session requested from the knowledge map.
  useEffect(() => {
    const gap = params.get('gap');
    if (gap && ctx && !sessionId) {
      const s = buildGapSession(ctx, gap.split(',') as TopicId[], gymResults);
      startSession(s);
      setParams({ id: s.id }, { replace: true });
    }
  }, [params, ctx, sessionId, gymResults, startSession, setParams]);

  useEffect(() => {
    topRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [session?.progress]);

  if (!ctx) return null;

  const start = () => {
    const s = buildFiveMinuteSession(ctx, gymResults);
    startSession(s);
    setParams({ id: s.id });
  };

  const lastIncomplete = [...sessions].reverse().find((s) => !s.completionTime);

  if (!session) {
    const recent = sessions.filter((s) => s.completionTime).slice(-3).reverse();
    return (
      <div>
        <PageHeader title="Five-minute session" subtitle="A short, complete learning loop with a clear finish line." />
        <Panel>
          <ol className="space-y-3 text-[15px]">
            {[
              ['One familiar idea', 'from your top interests'],
              ['One adjacent idea', 'a step outside them'],
              ['One surprising idea', 'from a field you don’t follow'],
              ['One Decision Gym scenario', 'decide before you learn'],
              ['One reflection', 'to make it stick'],
            ].map(([a, b], i) => (
              <li key={a} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[13px] font-semibold">{i + 1}</span>
                <span>
                  <span className="font-medium">{a}</span> <span className="text-ink-2">— {b}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="primary" onClick={start}>
              Start a session
            </Button>
            {lastIncomplete && (
              <Button onClick={() => setParams({ id: lastIncomplete.id })}>
                Resume unfinished session ({lastIncomplete.progress}/{lastIncomplete.steps.length})
              </Button>
            )}
          </div>
        </Panel>
        {recent.length > 0 && (
          <p className="mt-6 text-[14px] text-ink-2">
            You've completed {sessions.filter((s) => s.completionTime).length} session{sessions.filter((s) => s.completionTime).length === 1 ? '' : 's'}.
          </p>
        )}
      </div>
    );
  }

  const done = !!session.completionTime;
  const gymDone = gymDoneAt === `${session.id}:${session.progress}`;
  const step = session.steps[session.progress];
  const total = session.steps.length;

  if (done || !step) {
    return (
      <div className="text-center" ref={topRef} tabIndex={-1}>
        <Icon name="check" size={40} className="mx-auto text-ok" />
        <h1 className="mt-3 font-serif text-[30px] font-semibold">Session complete</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-2">That's a full loop: ideas, a decision, and a reflection. A good place to stop.</p>
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left">
          {session.cardIds.map((id) => {
            const c = getCard(id);
            return c ? (
              <li key={id} className="rounded-xl border border-line bg-surface p-3">
                <TopicTag topic={c.primaryTopic} small />
                <p className="font-medium">{c.title}</p>
              </li>
            ) : null;
          })}
        </ul>
        {session.reflectionResponse && (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-surface-2 p-3 text-left text-[15px]">
            <span className="text-[12px] font-semibold text-ink-2 uppercase">Your reflection</span>
            <br />
            {session.reflectionResponse}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <LinkButton to="/complete" variant="primary">
            Finish for today
          </LinkButton>
          <LinkButton to="/feed">Go to feed</LinkButton>
          <Button variant="ghost" onClick={() => navigate('/session')}>
            New session
          </Button>
        </div>
      </div>
    );
  }

  const next = () => {
    if (step.kind === 'card') markCompleted(step.cardId);
    advance(session.id);
  };

  return (
    <div>
      <div ref={topRef} tabIndex={-1} className="mb-5 outline-none">
        <div className="flex items-center justify-between text-[13px] text-ink-2">
          <span className="font-semibold">
            {session.sessionType === 'onboarding' ? 'Your first session' : session.sessionType === 'gap' ? 'Gap session' : 'Five-minute session'}
          </span>
          <span>
            Step {session.progress + 1} of {total}
          </span>
        </div>
        <ProgressBar className="mt-2" value={session.progress / total} label="Session progress" />
        <ol className="mt-3 flex gap-1.5" aria-hidden>
          {session.steps.map((_, i) => (
            <li key={i} className={`h-1.5 flex-1 rounded-full ${i < session.progress ? 'bg-brand' : i === session.progress ? 'bg-ink-2' : 'bg-surface-2'}`} />
          ))}
        </ol>
      </div>

      {step.kind === 'card' && (() => {
        const card = getCard(step.cardId);
        if (!card) return <Button onClick={next}>Skip missing card</Button>;
        return (
          <>
            <p className="mb-3 text-[14px] font-semibold text-ink-2">
              {ROLE_LABEL[step.role]}
              {step.role === 'surprising' && ` · ${topicLabel(card.primaryTopic)}`}
            </p>
            <KnowledgeCardView card={card} headingLevel="h1" />
            <Button variant="primary" className="mt-5 w-full" onClick={next}>
              Next
            </Button>
          </>
        );
      })()}

      {step.kind === 'gym' && (() => {
        const sc = SCENARIO_INDEX.get(step.scenarioId);
        if (!sc) return <Button onClick={next}>Continue</Button>;
        return (
          <>
            <ScenarioRunner key={sc.id} scenario={sc} onComplete={() => setGymDoneAt(`${session.id}:${session.progress}`)} />
            <div className="mt-5 flex gap-2">
              <Button variant="primary" className="flex-1" disabled={!gymDone} onClick={next}>
                Next
              </Button>
              {!gymDone && (
                <Button variant="ghost" onClick={next}>
                  Skip scenario
                </Button>
              )}
            </div>
          </>
        );
      })()}

      {step.kind === 'reflection' && (
        <Panel>
          <h1 className="font-serif text-[24px] font-semibold">Reflect</h1>
          <label htmlFor={reflectId} className="mt-2 block text-[17px]">
            {step.prompt}
          </label>
          <textarea id={reflectId} rows={5} value={reflection} onChange={(e) => setReflection(e.target.value)} className="mt-3 w-full rounded-xl border border-line bg-bg p-3 text-[16px]" />
          <p className="mt-1 text-[13px] text-ink-2">Optional, private, and stored only on this device.</p>
          <Button
            variant="primary"
            className="mt-4 w-full"
            onClick={() => {
              if (reflection.trim()) addReflection({ prompt: step.prompt, text: reflection.trim(), context: 'session' });
              complete(session.id, reflection.trim());
            }}
          >
            Complete session
          </Button>
        </Panel>
      )}
    </div>
  );
}
