import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/ui';
import { Icon } from '../common/Icon';

/** Shown in the feed once the daily target is met. Nothing continues automatically. */
export function GuardrailPanel({ minutes, cards }: { minutes: number; cards: number }) {
  const navigate = useNavigate();
  const finishToday = useAppStore((s) => s.finishToday);
  const continueToday = useAppStore((s) => s.continueToday);
  return (
    <section aria-labelledby="guardrail-title" className="fade-in rounded-3xl border border-line bg-surface p-6 text-center">
      <Icon name="check" size={32} className="mx-auto text-ok" />
      <h2 id="guardrail-title" className="mt-2 font-display text-[26px] font-extrabold tracking-[-0.02em]">
        You've reached today's target
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-ink-2">
        {cards} ideas, about {minutes} minutes. A good place to stop — what you do next is your call.
      </p>
      <div className="mx-auto mt-6 grid max-w-sm gap-2">
        <Button
          variant="primary"
          onClick={() => {
            finishToday();
            navigate('/complete');
          }}
        >
          Finish for today
        </Button>
        <Button onClick={() => navigate('/shelf')}>Review saved ideas</Button>
        <Button onClick={() => navigate('/complete?check=1')}>Take a short knowledge check</Button>
        <Button onClick={() => navigate('/complete?reflect=1')}>Write a reflection</Button>
        <Button variant="ghost" onClick={continueToday}>
          Continue intentionally
        </Button>
      </div>
    </section>
  );
}

export function TargetMetBanner() {
  return (
    <p role="status" className="sticky top-[4.5rem] z-10 mb-4 rounded-xl border border-line bg-surface-2 px-4 py-2 text-center text-[14px]">
      <strong className="font-semibold">Daily target complete.</strong> You're reading beyond today's goal.
    </p>
  );
}
