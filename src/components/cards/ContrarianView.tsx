import type { ContrarianBlock } from '../../types';

const BALANCE: Record<ContrarianBlock['evidenceBalance'], string> = {
  balanced: 'Evidence is genuinely mixed',
  'leans-first': 'Evidence leans toward the first view',
  'leans-second': 'Evidence leans toward the second view',
};

export function ContrarianView({ block }: { block: ContrarianBlock }) {
  return (
    <section aria-label="Two viewpoints" className="rounded-2xl border border-line bg-bg p-4">
      <h3 className="font-serif text-[18px] font-semibold">{block.question}</h3>

      <div className="mt-3">
        <h4 className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Established facts</h4>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px]">
          {block.established.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {block.positions.map((p, i) => (
          <div key={p.label} className="rounded-xl border border-line bg-surface p-3">
            <p className="text-[12px] font-semibold text-ink-2 uppercase">View {i + 1}</p>
            <h4 className="font-semibold">{p.label}</h4>
            <p className="mt-1 text-[15px]">{p.claim}</p>
            <p className="mt-2 text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Supporting evidence</p>
            <ul className="list-disc space-y-1 pl-5 text-[14px]">
              {p.evidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Interpretation</p>
            <p className="text-[14px]">{p.interpretation}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-[14px]">
        <strong className="font-semibold">{BALANCE[block.evidenceBalance]}.</strong> {block.balanceNote}
      </p>

      {block.opinion && (
        <p className="mt-3 text-[14px]">
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[12px] font-semibold uppercase">Opinion</span> {block.opinion}
        </p>
      )}

      <div className="mt-3">
        <h4 className="text-[12px] font-semibold tracking-wider text-ink-2 uppercase">Still unresolved</h4>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[14px]">
          {block.unresolved.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
