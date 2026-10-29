import { useId, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useDailyProgress, useStreak } from '../hooks/useAppData';
import { completedCardIdsOn } from '../services/progress';
import { getCard } from '../services/content';
import { buildKnowledgeCheck } from '../services/knowledgeCheck';
import { REFLECTION_PROMPTS } from '../services/session';
import { Button, LinkButton, PageHeader, Panel, ProgressBar, Section, TopicTag } from '../components/common/ui';
import { Icon } from '../components/common/Icon';
import { dayKey } from '../utils/date';
import { hashString } from '../utils/rng';

export default function CompletePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const p = useDailyProgress();
  const streak = useStreak();
  const interactions = useAppStore((s) => s.interactions);
  const finishToday = useAppStore((s) => s.finishToday);
  const continueToday = useAppStore((s) => s.continueToday);
  const addReflection = useAppStore((s) => s.addReflection);
  const today = dayKey();
  const todayIds = useMemo(() => completedCardIdsOn(interactions, today), [interactions, today]);
  const prompt = REFLECTION_PROMPTS[hashString(today) % REFLECTION_PROMPTS.length];
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [showCheck, setShowCheck] = useState(params.get('check') === '1');
  const check = useMemo(() => buildKnowledgeCheck(todayIds, hashString(today)), [todayIds, today]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const reflectId = useId();
  const answered = Object.keys(answers).length;
  const correct = check.filter((q) => answers[q.card.id] === q.card.id).length;

  return (
    <div>
      <PageHeader
        title={p.met ? 'Today’s learning is done' : 'Today so far'}
        subtitle={p.met ? 'You met your daily target. Stopping here is a good choice.' : `${Math.round(p.seconds / 60)} of ${p.targetSeconds / 60} minutes. No pressure — this is just where you are.`}
      />
      <Panel>
        <ProgressBar value={p.pct} label="Daily target progress" />
        <div className="mt-3 flex justify-between text-[14px] text-ink-2">
          <span>{p.cardsCompleted} ideas read today</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="flame" size={16} /> {streak.current}-day streak
          </span>
        </div>
      </Panel>

      {todayIds.length > 0 && (
        <Section title="Concepts you met today">
          <ul className="space-y-2">
            {todayIds.map((id) => {
              const c = getCard(id);
              return c ? (
                <li key={id}>
                  <Link to={`/card/${id}`} className="block rounded-2xl border border-line bg-surface p-3 hover:bg-surface-2">
                    <TopicTag topic={c.primaryTopic} small />
                    <span className="block font-medium">{c.title}</span>
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </Section>
      )}

      <Section title="One question to sit with">
        <Panel>
          <label htmlFor={reflectId} className="font-serif italic text-[22px]" id="reflect">
            {prompt}
          </label>
          {reflectionSaved ? (
            <p role="status" className="mt-3 flex items-center gap-2 text-[15px]">
              <Icon name="check" className="text-ok" /> Saved to your history.
            </p>
          ) : (
            <>
              <textarea id={reflectId} autoFocus={params.get('reflect') === '1'} rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} className="mt-3 w-full rounded-2xl border border-line bg-bg p-3 text-[16px]" />
              <Button
                className="mt-2"
                disabled={!reflection.trim()}
                onClick={() => {
                  addReflection({ prompt, text: reflection.trim(), context: 'daily' });
                  setReflectionSaved(true);
                }}
              >
                Save reflection
              </Button>
            </>
          )}
        </Panel>
      </Section>

      {check.length > 0 && (
        <Section title="Short knowledge check">
          {!showCheck ? (
            <Button onClick={() => setShowCheck(true)}>Take a {check.length}-question check</Button>
          ) : (
            <div className="space-y-4">
              {check.map((q, qi) => (
                <fieldset key={q.card.id} className="rounded-3xl border border-line bg-surface p-4">
                  <legend className="sr-only">Question {qi + 1}</legend>
                  <p className="font-medium">
                    {qi + 1}. Which sentence best captures “{q.card.title}”?
                  </p>
                  <div className="mt-2 space-y-2">
                    {q.options.map((o) => {
                      const chosen = answers[q.card.id];
                      const isRight = o.id === q.card.id;
                      const state = chosen ? (isRight ? 'border-ok' : chosen === o.id ? 'border-warn' : 'border-line') : 'border-line';
                      return (
                        <label key={o.id} className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border p-3 text-[15px] ${state}`}>
                          <input
                            type="radio"
                            name={`q-${q.card.id}`}
                            disabled={!!chosen}
                            checked={chosen === o.id}
                            onChange={() => setAnswers((a) => ({ ...a, [q.card.id]: o.id }))}
                            className="mt-1 accent-[var(--brand)]"
                          />
                          <span>
                            {o.text}
                            {chosen && isRight && <span className="ml-1 font-semibold text-ok">✓ Correct</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              {answered === check.length && (
                <p role="status" className="font-medium">
                  {correct} of {check.length} correct. {correct < check.length ? 'Revisit the ones you missed — it helps them stick.' : 'Nicely retained.'}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Button
          variant="primary"
          onClick={() => {
            finishToday();
            navigate('/profile?finished=1');
          }}
        >
          Finish for today
        </Button>
        <LinkButton to="/shelf">Review saved ideas</LinkButton>
        <Button
          variant="ghost"
          onClick={() => {
            if (p.met) continueToday();
            navigate('/feed');
          }}
        >
          {p.met ? 'Continue knowingly' : 'Back to feed'}
        </Button>
      </div>
    </div>
  );
}
