import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DecisionScenario, GymResult } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Button, TopicTag, ProgressBar } from '../common/ui';
import { DIFFICULTY_LABELS } from '../../data/topics';
import { Icon } from '../common/Icon';

type Stage = 'read' | 'reason' | 'tradeoffs' | 'principle' | 'reflect' | 'done';
const STAGES: Stage[] = ['read', 'reason', 'tradeoffs', 'principle', 'reflect', 'done'];

/**
 * Decision Gym flow: read → choose → optional reasoning → trade-offs of every option
 * → relevant principles → "would you change your decision?" → done.
 */
export function ScenarioRunner({ scenario, onComplete }: { scenario: DecisionScenario; onComplete?: (r: GymResult) => void }) {
  const [stage, setStage] = useState<Stage>('read');
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [wouldChange, setWouldChange] = useState<GymResult['wouldChange']>();
  const [reflection, setReflection] = useState('');
  const addGymResult = useAppStore((s) => s.addGymResult);
  const reasonId = useId();
  const reflectId = useId();
  const chosen = scenario.choices.find((c) => c.id === choiceId);

  const finish = () => {
    const r = { scenarioId: scenario.id, choiceId: choiceId!, reasoning: reasoning.trim() || undefined, wouldChange, reflection: reflection.trim() || undefined };
    addGymResult(r);
    setStage('done');
    onComplete?.({ ...r, completedAt: new Date().toISOString() });
  };

  return (
    <section aria-labelledby={`sc-${scenario.id}`} className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-3 text-[13px] text-ink-2">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Icon name="gym" size={16} /> Decision Gym
        </span>
        <TopicTag topic={scenario.topic} small />
        <span>{DIFFICULTY_LABELS[scenario.difficulty]}</span>
      </div>
      <ProgressBar className="mt-3" value={STAGES.indexOf(stage) / (STAGES.length - 1)} label="Scenario progress" />
      <h2 id={`sc-${scenario.id}`} className="mt-4 font-display text-[24px] leading-snug font-extrabold tracking-[-0.02em]">
        {scenario.title}
      </h2>
      <p className="mt-2 text-[17px] leading-relaxed">{scenario.scenario}</p>

      {stage === 'read' && (
        <fieldset className="mt-5">
          <legend className="text-[15px] font-semibold">What would you do?</legend>
          <p className="text-[13px] text-ink-2">There isn't one obviously correct answer. Pick what you'd actually do.</p>
          <div className="mt-3 space-y-2">
            {scenario.choices.map((c) => (
              <label
                key={c.id}
                className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border p-3 text-[15px] ${choiceId === c.id ? 'border-brand bg-surface-2' : 'border-line hover:bg-surface-2'}`}
              >
                <input type="radio" name={`choice-${scenario.id}`} value={c.id} checked={choiceId === c.id} onChange={() => setChoiceId(c.id)} className="mt-1 h-4 w-4 accent-[var(--brand)]" />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
          <Button variant="primary" className="mt-4" disabled={!choiceId} onClick={() => setStage('reason')}>
            Lock in my choice
          </Button>
        </fieldset>
      )}

      {stage === 'reason' && (
        <div className="fade-in mt-5">
          <p className="rounded-2xl bg-surface-2 p-3 text-[15px]">
            <span className="font-semibold">Your choice:</span> {chosen?.label}
          </p>
          <label htmlFor={reasonId} className="mt-4 block text-[15px] font-semibold">
            Why? <span className="font-normal text-ink-2">(optional)</span>
          </label>
          <textarea id={reasonId} rows={3} value={reasoning} onChange={(e) => setReasoning(e.target.value)} className="mt-2 w-full rounded-2xl border border-line bg-bg p-3 text-[16px]" />
          <Button variant="primary" className="mt-3" onClick={() => setStage('tradeoffs')}>
            Show the trade-offs
          </Button>
        </div>
      )}

      {(stage === 'tradeoffs' || stage === 'principle' || stage === 'reflect') && (
        <div className="fade-in mt-5 space-y-3">
          <h3 className="text-[15px] font-semibold">Likely trade-offs of each option</h3>
          {scenario.choices.map((c) => (
            <div key={c.id} className={`rounded-2xl border p-3 ${c.id === choiceId ? 'border-brand' : 'border-line'}`}>
              <p className="font-semibold">
                {c.label} {c.id === choiceId && <span className="ml-1 rounded bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink uppercase">Your pick</span>}
              </p>
              <div className="mt-2 grid gap-2 text-[14px] sm:grid-cols-2">
                <div>
                  <p className="font-medium text-ok">Gains</p>
                  <ul className="list-disc pl-5">{c.gains.map((g) => <li key={g}>{g}</li>)}</ul>
                </div>
                <div>
                  <p className="font-medium text-warn">Costs</p>
                  <ul className="list-disc pl-5">{c.costs.map((g) => <li key={g}>{g}</li>)}</ul>
                </div>
              </div>
              <p className="mt-2 text-[14px] text-ink-2"><span className="font-medium text-ink">Likely outcome:</span> {c.likelyOutcome}</p>
            </div>
          ))}
          {stage === 'tradeoffs' && (
            <Button variant="primary" onClick={() => setStage('principle')}>
              What principles apply?
            </Button>
          )}
        </div>
      )}

      {(stage === 'principle' || stage === 'reflect') && (
        <div className="fade-in mt-6">
          <h3 className="text-[15px] font-semibold">Relevant ideas</h3>
          <ul className="mt-2 space-y-2">
            {scenario.relevantConcepts.map((rc) => (
              <li key={rc.name} className="rounded-2xl bg-surface-2 p-3 text-[15px]">
                <p className="font-semibold">{rc.name}</p>
                <p className="text-ink-2">{rc.explanation}</p>
                {rc.cardId && (
                  <Link to={`/card/${rc.cardId}`} className="mt-1 inline-flex min-h-9 items-center text-[14px] font-medium underline">
                    Read the card
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[17px] leading-relaxed">{scenario.debrief}</p>
          {stage === 'principle' && (
            <Button variant="primary" className="mt-4" onClick={() => setStage('reflect')}>
              Reflect
            </Button>
          )}
        </div>
      )}

      {stage === 'reflect' && (
        <div className="fade-in mt-6">
          <fieldset>
            <legend className="text-[15px] font-semibold">Knowing the trade-offs, would you change your decision?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['yes', 'no', 'unsure'] as const).map((v) => (
                <label key={v} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 ${wouldChange === v ? 'border-brand bg-surface-2' : 'border-line'}`}>
                  <input type="radio" name={`change-${scenario.id}`} checked={wouldChange === v} onChange={() => setWouldChange(v)} className="accent-[var(--brand)]" />
                  {v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not sure'}
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={reflectId} className="mt-4 block text-[15px] font-semibold">
            {scenario.reflectionQuestion}
          </label>
          <textarea id={reflectId} rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} className="mt-2 w-full rounded-2xl border border-line bg-bg p-3 text-[16px]" />
          <Button variant="primary" className="mt-3" onClick={finish}>
            Complete scenario
          </Button>
        </div>
      )}

      {stage === 'done' && (
        <p role="status" className="fade-in mt-5 flex items-center gap-2 rounded-2xl bg-surface-2 p-3 text-[15px] font-medium">
          <Icon name="check" className="text-ok" /> Scenario complete. Your choice and reflection are saved in your history.
        </p>
      )}
    </section>
  );
}
