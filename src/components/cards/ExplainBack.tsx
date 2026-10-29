import { useId, useState } from 'react';
import type { KnowledgeCard } from '../../types';
import { keywordEvaluator, type ExplainBackResult } from '../../services/explainBack';
import { useAppStore } from '../../store/useAppStore';
import { Button, Panel } from '../common/ui';
import { Icon } from '../common/Icon';

export function ExplainBack({ card }: { card: KnowledgeCard }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ExplainBackResult | null>(null);
  const record = useAppStore((s) => s.record);
  const id = useId();

  const check = async () => {
    const r = await keywordEvaluator.evaluate(text, card);
    setResult(r);
    if (!r.tooShort && r.coverage >= 0.67) record(card.id, 'understood', { feedbackReason: 'explain-back' });
  };

  return (
    <Panel>
      <h2 className="flex items-center gap-2 text-[17px] font-semibold">
        <Icon name="edit" size={18} /> Explain it back
      </h2>
      <p className="mt-1 text-[14px] text-ink-2">In your own words, as if to a colleague. Two or three sentences is plenty.</p>
      <label htmlFor={id} className="sr-only">
        Your explanation
      </label>
      <textarea id={id} rows={4} value={text} onChange={(e) => setText(e.target.value)} className="mt-3 w-full rounded-2xl border border-line bg-bg p-3 text-[16px]" />
      <Button variant="primary" className="mt-2" onClick={check} disabled={text.trim().length === 0}>
        Check my explanation
      </Button>
      <p className="mt-2 text-[12px] text-ink-2">Checked on your device by matching key concepts — a rough guide, not a grade.</p>

      {result && (
        <div className="fade-in mt-4 space-y-3 text-[15px]" aria-live="polite">
          {result.tooShort ? (
            <p className="rounded-2xl bg-surface-2 p-3">Add a little more — at least a sentence or two — so there's something to compare.</p>
          ) : (
            <>
              <p className="font-medium">
                You covered {result.covered.length} of {result.covered.length + result.missed.length} key ideas.
              </p>
              {result.covered.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold tracking-wider text-ok uppercase">Understood</h3>
                  <ul className="mt-1 space-y-1">
                    {result.covered.map((k) => (
                      <li key={k.label} className="flex gap-2">
                        <Icon name="check" size={18} className="mt-0.5 shrink-0 text-ok" /> {k.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.missed.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold tracking-wider text-warn uppercase">Worth adding</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {result.missed.map((k) => (
                      <li key={k.label}>{k.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {result.misunderstandings.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Possible misunderstanding</h3>
              {result.misunderstandings.map((m) => (
                <p key={m} className="mt-1">
                  {m}
                </p>
              ))}
            </div>
          )}
          <div>
            <h3 className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Simpler version</h3>
            <p className="mt-1">{result.simplerExplanation}</p>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Follow-up question</h3>
            <p className="mt-1">{result.followUpQuestion}</p>
          </div>
        </div>
      )}
    </Panel>
  );
}
