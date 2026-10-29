import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { IdeaCollision } from '../../types';
import { getCard } from '../../services/content';
import { useAppStore } from '../../store/useAppStore';
import { Button, TopicTag } from '../common/ui';
import { Icon } from '../common/Icon';

export function IdeaCollisionView({ collision, compact }: { collision: IdeaCollision; compact?: boolean }) {
  const a = getCard(collision.cardA)!;
  const b = getCard(collision.cardB)!;
  const [text, setText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const addReflection = useAppStore((s) => s.addReflection);
  const inputId = useId();

  const reveal = () => {
    if (text.trim()) addReflection({ prompt: collision.prompt, text: text.trim(), context: 'collision' });
    setRevealed(true);
  };

  return (
    <section aria-label="Idea collision" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <p className="flex items-center gap-2 text-[13px] font-semibold tracking-wider text-ink-2 uppercase">
        <Icon name="spark" size={16} /> Idea collision
      </p>
      <h2 className="mt-2 font-display text-[24px] leading-snug font-extrabold tracking-[-0.02em]">{collision.prompt}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[a, b].map((c) => (
          <Link key={c.id} to={`/card/${c.id}`} className="rounded-xl border border-line bg-bg p-3 hover:bg-surface-2">
            <TopicTag topic={c.primaryTopic} small />
            <p className="mt-1 font-semibold">{c.title}</p>
            {!compact && <p className="mt-1 text-[14px] text-ink-2">{c.hook}</p>}
          </Link>
        ))}
      </div>
      {!revealed ? (
        <div className="mt-4">
          <label htmlFor={inputId} className="text-[14px] font-medium">
            What's the connection? <span className="font-normal text-ink-2">(optional — a sentence is enough)</span>
          </label>
          <textarea
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-line bg-bg p-3 text-[16px]"
            placeholder="Both are about…"
          />
          <Button variant="primary" className="mt-2 w-full sm:w-auto" onClick={reveal}>
            Reveal a suggested connection
          </Button>
        </div>
      ) : (
        <div className="fade-in mt-4" aria-live="polite">
          {text.trim() && (
            <p className="mb-3 rounded-xl bg-surface-2 p-3 text-[15px]">
              <span className="text-[12px] font-semibold text-ink-2 uppercase">Your take</span>
              <br />
              {text}
            </p>
          )}
          <p className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">One interpretation</p>
          <p className="mt-1 text-[17px] leading-relaxed">{collision.suggestedConnection}</p>
          <p className="mt-3 text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Other angles</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px]">
            {collision.otherAngles.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
