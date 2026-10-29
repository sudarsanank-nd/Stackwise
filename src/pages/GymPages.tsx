import { Link, useParams } from 'react-router-dom';
import { SCENARIOS, SCENARIO_INDEX } from '../services/content';
import { useAppStore } from '../store/useAppStore';
import { ScenarioRunner } from '../components/decision-gym/ScenarioRunner';
import { EmptyState, LinkButton, PageHeader, TopicTag } from '../components/common/ui';
import { DIFFICULTY_LABELS } from '../data/topics';
import { Icon } from '../components/common/Icon';

export function GymListPage() {
  const results = useAppStore((s) => s.gymResults);
  const done = new Set(results.map((r) => r.scenarioId));
  return (
    <div>
      <PageHeader title="Decision Gym" subtitle="Make the call first. Then see the trade-offs and the idea behind them." />
      <ul className="grid gap-3">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <Link to={`/gym/${s.id}`} className="block rounded-3xl border border-line bg-surface p-4 hover:bg-surface-2">
              <div className="flex items-center gap-3 text-[13px] text-ink-2">
                <TopicTag topic={s.topic} small />
                <span>{DIFFICULTY_LABELS[s.difficulty]}</span>
                {done.has(s.id) && (
                  <span className="ml-auto inline-flex items-center gap-1 text-ok">
                    <Icon name="check" size={14} /> Done
                  </span>
                )}
              </div>
              <p className="mt-1 font-display text-[19px] font-extrabold tracking-[-0.02em]">{s.title}</p>
              <p className="mt-1 line-clamp-2 text-[14px] text-ink-2">{s.scenario}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GymScenarioPage() {
  const { id = '' } = useParams();
  const scenario = SCENARIO_INDEX.get(id);
  if (!scenario) return <EmptyState title="Scenario not found" action={<LinkButton to="/gym">All scenarios</LinkButton>} />;
  const idx = SCENARIOS.findIndex((s) => s.id === id);
  const next = SCENARIOS[(idx + 1) % SCENARIOS.length];
  return (
    <div>
      <Link to="/gym" className="mb-3 inline-flex min-h-11 items-center text-[14px] text-ink-2 hover:text-ink">
        ← All scenarios
      </Link>
      <ScenarioRunner key={scenario.id} scenario={scenario} />
      <div className="mt-6 flex justify-end">
        <LinkButton to={`/gym/${next.id}`} variant="ghost">
          Next scenario →
        </LinkButton>
      </div>
    </div>
  );
}
