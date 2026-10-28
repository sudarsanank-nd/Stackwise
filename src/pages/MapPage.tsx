import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { weeklyMap } from '../services/knowledgeMap';
import { CARD_INDEX, getCard } from '../services/content';
import { TOPIC_MAP, topicLabel } from '../data/topics';
import { Button, EmptyState, LinkButton, PageHeader, Panel, Section } from '../components/common/ui';
import type { TopicId } from '../types';
import { useToast } from '../store/toast';

const fmtMin = (sec: number) => (sec < 60 ? `${Math.round(sec)} s` : `${Math.round(sec / 60)} min`);

export default function MapPage() {
  const profile = useAppStore((s) => s.profile)!;
  const interactions = useAppStore((s) => s.interactions);
  const gym = useAppStore((s) => s.gymResults);
  const collections = useAppStore((s) => s.collections);
  const addReflection = useAppStore((s) => s.addReflection);
  const toast = useToast((s) => s.show);
  const [reflection, setReflection] = useState('');
  const reflectId = useId();
  const map = useMemo(() => weeklyMap(profile, interactions, gym, collections, CARD_INDEX), [profile, interactions, gym, collections]);
  const max = Math.max(1, ...map.topicSeconds.map((t) => t.seconds));
  const maxDay = Math.max(1, ...map.dailySeconds.map((d) => d.seconds));

  return (
    <div>
      <PageHeader title="Weekly knowledge map" subtitle={`The last seven days, ${map.from} to ${map.to}.`} />

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Time learning', fmtMin(map.totalSeconds)],
          ['Ideas read', String(map.cardsCompleted)],
          ['Saved', String(map.savedThisWeek.length)],
        ].map(([k, v]) => (
          <Panel key={k} className="p-4!">
            <p className="text-[12px] text-ink-2">{k}</p>
            <p className="mt-1 font-serif text-[26px] font-semibold tabular-nums">{v}</p>
          </Panel>
        ))}
      </div>

      {map.cardsCompleted === 0 ? (
        <div className="mt-8">
          <EmptyState icon="map" title="Your map fills in as you read" action={<LinkButton to="/session" variant="primary">Start a 5-minute session</LinkButton>}>
            Read a few cards this week and you'll see where your attention went — and where it didn't.
          </EmptyState>
        </div>
      ) : (
        <>
          <Section title="Daily minutes">
            <div className="flex h-28 items-end gap-2" role="img" aria-label={`Minutes per day: ${map.dailySeconds.map((d) => `${d.day} ${Math.round(d.seconds / 60)}`).join(', ')}`}>
              {map.dailySeconds.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-brand" style={{ height: `${Math.max(2, (d.seconds / maxDay) * 88)}px`, opacity: d.seconds ? 1 : 0.25 }} />
                  <span className="text-[11px] text-ink-2">{new Date(`${d.day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Where your attention went">
            <ul className="space-y-2.5">
              {map.topicSeconds.map((t) => (
                <li key={t.topic}>
                  <div className="flex justify-between text-[14px]">
                    <Link to={`/topics/${t.topic}`} className="font-medium hover:underline">{topicLabel(t.topic)}</Link>
                    <span className="text-ink-2 tabular-nums">{fmtMin(t.seconds)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface-2">
                    <div className="h-2 rounded-full" style={{ width: `${(t.seconds / max) * 100}%`, background: TOPIC_MAP[t.topic].accent }} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {map.edges.length > 0 && (
            <Section title="Connections you made">
              <TopicGraph edges={map.edges} />
              <ul className="mt-3 space-y-1 text-[14px] text-ink-2">
                {map.edges.slice(0, 4).map((e) => (
                  <li key={`${e.a}-${e.b}`}>
                    {topicLabel(e.a)} ↔ {topicLabel(e.b)} · {e.weight} idea{e.weight === 1 ? '' : 's'}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {map.strong.length > 0 && (
            <Section title="Strong areas">
              <p className="text-[15px]">{map.strong.map(topicLabel).join(', ')}</p>
            </Section>
          )}
        </>
      )}

      {map.underexplored.length > 0 && (
        <Section title="Underexplored — worth a look">
          <Panel>
            <ul className="flex flex-wrap gap-2">
              {map.underexplored.map((t) => (
                <li key={t}>
                  <Link to={`/topics/${t}`} className="inline-flex min-h-10 items-center rounded-full bg-surface-2 px-3 text-[14px] hover:underline">
                    {topicLabel(t)}
                    {profile.interests.includes(t) ? ' · your interest' : ' · adjacent'}
                  </Link>
                </li>
              ))}
            </ul>
            <LinkButton to={`/session?gap=${map.underexplored.slice(0, 3).join(',')}`} variant="primary" className="mt-4">
              Start recommended session
            </LinkButton>
          </Panel>
        </Section>
      )}

      {(map.savedThisWeek.length > 0 || map.revisited.length > 0) && (
        <Section title="Saved and revisited this week">
          <ul className="space-y-1 text-[15px]">
            {[...new Set([...map.savedThisWeek, ...map.revisited])].slice(0, 8).map((id) => (
              <li key={id}>
                <Link to={`/card/${id}`} className="underline-offset-2 hover:underline">{getCard(id)?.title}</Link>
                <span className="text-[13px] text-ink-2">{map.revisited.includes(id) ? ' · revisited' : ' · saved'}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Weekly reflection">
        <Panel>
          <label htmlFor={reflectId} className="font-serif text-[18px]">{map.reflectionQuestion}</label>
          <textarea id={reflectId} rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} className="mt-3 w-full rounded-xl border border-line bg-bg p-3 text-[16px]" />
          <Button
            className="mt-2"
            disabled={!reflection.trim()}
            onClick={() => {
              addReflection({ prompt: map.reflectionQuestion, text: reflection.trim(), context: 'weekly' });
              setReflection('');
              toast('Reflection saved');
            }}
          >
            Save reflection
          </Button>
        </Panel>
      </Section>
    </div>
  );
}

/** Small circular node-link diagram of topics connected through the cards you read. */
function TopicGraph({ edges }: { edges: { a: TopicId; b: TopicId; weight: number }[] }) {
  const nodes = [...new Set(edges.flatMap((e) => [e.a, e.b]))];
  const R = 110;
  const pos = new Map(nodes.map((n, i) => [n, { x: 160 + R * Math.cos((2 * Math.PI * i) / nodes.length - Math.PI / 2), y: 140 + R * Math.sin((2 * Math.PI * i) / nodes.length - Math.PI / 2) }]));
  const maxW = Math.max(...edges.map((e) => e.weight));
  return (
    <svg viewBox="-50 0 420 280" className="w-full max-w-md" role="img" aria-label={`Topic connections: ${edges.map((e) => `${topicLabel(e.a)} with ${topicLabel(e.b)}`).join('; ')}`}>
      {edges.map((e) => {
        const a = pos.get(e.a)!;
        const b = pos.get(e.b)!;
        return <line key={`${e.a}${e.b}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink-2)" strokeOpacity={0.35 + 0.5 * (e.weight / maxW)} strokeWidth={1 + 3 * (e.weight / maxW)} />;
      })}
      {nodes.map((n) => {
        const p = pos.get(n)!;
        const anchor = p.x < 130 ? 'end' : p.x > 190 ? 'start' : 'middle';
        const dx = anchor === 'end' ? -10 : anchor === 'start' ? 10 : 0;
        const dy = anchor === 'middle' ? (p.y < 140 ? -12 : 20) : 4;
        return (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r={7} fill={TOPIC_MAP[n].accent} stroke="var(--surface)" strokeWidth={2} />
            <text x={p.x + dx} y={p.y + dy} textAnchor={anchor} fontSize="11" fill="var(--ink)">
              {TOPIC_MAP[n].short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
