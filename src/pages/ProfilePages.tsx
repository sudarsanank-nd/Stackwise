import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useDailyProgress, useSavedIds, useStreak } from '../hooks/useAppData';
import { Button, Chip, LinkButton, PageHeader, Panel, Section, Segmented, EmptyState } from '../components/common/ui';
import { Icon, type IconName } from '../components/common/Icon';
import { DIFFICULTY_LABELS, GOALS, STYLE_LABELS, TOPICS, TOPIC_MAP, topicLabel } from '../data/topics';
import { MIX, WEIGHTS } from '../services/recommendation';
import { computeSignals } from '../services/signals';
import { CARD_INDEX, getCard, SCENARIO_INDEX } from '../services/content';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import type { InteractionType, ThemePreference, TopicId } from '../types';
import { useToast } from '../store/toast';

export function ProfilePage() {
  const profile = useAppStore((s) => s.profile)!;
  const [params] = useSearchParams();
  const p = useDailyProgress();
  const streak = useStreak();
  const saved = useSavedIds();
  const sessions = useAppStore((s) => s.sessions.filter((x) => x.completionTime).length);
  const links: { to: string; label: string; icon: IconName; hint: string }[] = [
    { to: '/map', label: 'Weekly knowledge map', icon: 'map', hint: 'Time, topics, gaps' },
    { to: '/history', label: 'Learning history', icon: 'history', hint: 'Everything you read and wrote' },
    { to: '/settings', label: 'Personalisation settings', icon: 'settings', hint: 'Interests, signals, resets' },
    { to: '/topics', label: 'Topic explorer', icon: 'compass', hint: 'Browse every area' },
    { to: '/collide', label: 'Idea collisions', icon: 'spark', hint: 'Find links between unrelated ideas' },
    { to: '/about', label: 'About & disclaimer', icon: 'info', hint: 'How Stackwise works' },
  ];
  return (
    <div>
      {params.get('finished') === '1' && (
        <p role="status" className="mb-6 rounded-2xl bg-surface-2 p-4 text-[15px]">
          <strong>Done for today.</strong> Close the app with a clear conscience — the ideas will still be here tomorrow.
        </p>
      )}
      <PageHeader title={profile.displayName || 'You'} subtitle={`Following ${profile.interests.length} topics · ${profile.dailyTargetMinutes}-minute daily target`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Today', `${Math.round(p.seconds / 60)}/${p.targetSeconds / 60} min`],
          ['Streak', `${streak.current} day${streak.current === 1 ? '' : 's'}`],
          ['Saved', String(saved.size)],
          ['Sessions', String(sessions)],
        ].map(([k, v]) =>
          k === 'Streak' ? (
            <div key={k} className="rounded-3xl bg-navy p-4 text-white dark:bg-surface-2">
              <p className="font-display text-[22px] leading-none font-extrabold tracking-[-0.02em] text-marigold tabular-nums">{v}</p>
              <p className="mt-1.5 text-[12px] text-[#c7ccda]">{k}</p>
            </div>
          ) : (
            <Panel key={k} className="p-4!">
              <p className="font-display text-[22px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">{v}</p>
              <p className="mt-1.5 text-[12px] text-ink-2">{k}</p>
            </Panel>
          ),
        )}
      </div>
      <p className="mt-2 text-[13px] text-ink-2">
        Longest streak: {streak.longest} days. A streak day = 3 ideas read or one session completed. Missing a day is fine.
      </p>
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow)]">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="flex min-h-16 items-center gap-4 px-4 hover:bg-surface-2">
              <Icon name={l.icon} className="text-ink-2" />
              <span className="flex-1">
                <span className="block font-medium">{l.label}</span>
                <span className="text-[13px] text-ink-2">{l.hint}</span>
              </span>
              <span aria-hidden className="text-ink-2">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SettingsPage() {
  const profile = useAppStore((s) => s.profile)!;
  const update = useAppStore((s) => s.updateProfile);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const interactions = useAppStore((s) => s.interactions);
  const searchHistory = useAppStore((s) => s.searchHistory);
  const clearSearch = useAppStore((s) => s.clearSearchHistory);
  const resetRecs = useAppStore((s) => s.resetRecommendations);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const resetAll = useAppStore((s) => s.resetAll);
  const toast = useToast((s) => s.show);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<null | 'recs' | 'history' | 'all'>(null);
  const [editAll, setEditAll] = useState(false);
  const signals = useMemo(() => computeSignals(interactions, CARD_INDEX), [interactions]);

  if (editAll) {
    return (
      <OnboardingWizard
        editMode
        initial={{
          displayName: profile.displayName,
          interests: profile.interests,
          rankedInterests: profile.rankedInterests,
          topicDifficulty: profile.topicDifficulty,
          dailyTargetMinutes: profile.dailyTargetMinutes,
          preferredStyles: profile.preferredStyles,
          learningGoals: profile.learningGoals,
          serendipityFrequency: profile.serendipityFrequency,
          personalizationEnabled: profile.personalizationEnabled,
        }}
      />
    );
  }

  const toggleInterest = (t: TopicId) => {
    const interests = profile.interests.includes(t) ? profile.interests.filter((x) => x !== t) : [...profile.interests, t];
    if (interests.length === 0) return toast('Keep at least one interest');
    const ranked = profile.rankedInterests.filter((x) => interests.includes(x));
    update({ interests, rankedInterests: [...ranked, ...interests.filter((x) => !ranked.includes(x))].slice(0, 5) });
  };

  const topicSignals = Object.entries(signals.topic).filter(([, s]) => s && (s.likes || s.skips || s.saves || s.explores || s.more || s.less));
  const mix = MIX[profile.serendipityFrequency];

  const doConfirm = () => {
    if (confirm === 'recs') {
      resetRecs();
      toast('Recommendations reset');
    } else if (confirm === 'history') {
      clearHistory();
      toast('Activity history removed');
    } else if (confirm === 'all') {
      resetAll();
      navigate('/welcome');
    }
    setConfirm(null);
  };

  return (
    <div>
      <PageHeader title="Personalisation" subtitle="What shapes your feed — all of it visible, editable and stored only on this device." back="/profile" />

      <Section title="Personalised recommendations">
        <Panel>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={profile.personalizationEnabled} onChange={(e) => update({ personalizationEnabled: e.target.checked })} className="mt-1 h-5 w-5 accent-[var(--brand)]" />
            <span>
              <span className="block font-medium">Use my activity to personalise the feed</span>
              <span className="text-[14px] text-ink-2">{profile.personalizationEnabled ? 'On — signals below adjust what you see.' : 'Off — you get a balanced mix across all topics.'}</span>
            </span>
          </label>
        </Panel>
      </Section>

      <Section title="Interests" aside={<button type="button" onClick={() => setEditAll(true)} className="min-h-11 text-[14px] underline">Re-run setup</button>}>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Chip key={t.id} accent={t.id} selected={profile.interests.includes(t.id)} onClick={() => toggleInterest(t.id)}>
              {t.short}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-[14px] text-ink-2">Top five: {profile.rankedInterests.map(topicLabel).join(' › ')}</p>
      </Section>

      <Section title="Depth by topic">
        <ul className="space-y-2">
          {profile.interests.map((t) => (
            <li key={t} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[15px]">{TOPIC_MAP[t].label}</span>
              <Segmented
                label={`Depth for ${TOPIC_MAP[t].label}`}
                value={profile.topicDifficulty[t] ?? 'beginner'}
                options={(['beginner', 'intermediate', 'advanced'] as const).map((v) => ({ value: v, label: DIFFICULTY_LABELS[v] }))}
                onChange={(v) => update({ topicDifficulty: { ...profile.topicDifficulty, [t]: v } })}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Daily target, content and discovery">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[15px]">Daily target</span>
            <Segmented label="Daily target" value={profile.dailyTargetMinutes} options={[5, 10, 15].map((m) => ({ value: m as 5 | 10 | 15, label: `${m} min` }))} onChange={(v) => update({ dailyTargetMinutes: v })} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[15px]">Unfamiliar topics</span>
            <Segmented
              label="Unfamiliar topics"
              value={profile.serendipityFrequency}
              options={[
                { value: 'rarely', label: 'Rarely' },
                { value: 'sometimes', label: 'Sometimes' },
                { value: 'often', label: 'Often' },
              ]}
              onChange={(v) => update({ serendipityFrequency: v })}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[15px]">Theme</span>
            <Segmented<ThemePreference>
              label="Theme"
              value={theme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              onChange={setTheme}
            />
          </div>
          <p className="text-[14px] text-ink-2">
            Content style: {profile.preferredStyles.map((s) => STYLE_LABELS[s].label).join(', ')} · Goals: {profile.learningGoals.map((g) => GOALS.find((x) => x.id === g)?.label).join('; ') || 'none'}
          </p>
        </div>
      </Section>

      <Section title="What the feed has learned">
        {topicSignals.length === 0 && searchHistory.length === 0 ? (
          <p className="text-[15px] text-ink-2">No activity signals yet. Your feed is based only on the choices above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <caption className="sr-only">Signals per topic</caption>
              <thead className="text-ink-2">
                <tr>
                  <th scope="col" className="py-1 pr-2 font-medium">Topic</th>
                  <th scope="col" className="px-2 font-medium">Likes</th>
                  <th scope="col" className="px-2 font-medium">Saves</th>
                  <th scope="col" className="px-2 font-medium">Deeper</th>
                  <th scope="col" className="px-2 font-medium">Skips</th>
                  <th scope="col" className="px-2 font-medium">More/Less</th>
                </tr>
              </thead>
              <tbody>
                {topicSignals.map(([t, s]) => (
                  <tr key={t} className="border-t border-line">
                    <th scope="row" className="py-1.5 pr-2 font-medium">{topicLabel(t as TopicId)}</th>
                    <td className="px-2 tabular-nums">{s!.likes}</td>
                    <td className="px-2 tabular-nums">{s!.saves}</td>
                    <td className="px-2 tabular-nums">{s!.explores}</td>
                    <td className="px-2 tabular-nums">{s!.skips}</td>
                    <td className="px-2 tabular-nums">{s!.more}/{s!.less}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {searchHistory.length > 0 && (
          <p className="mt-3 text-[14px] text-ink-2">
            Recent searches used for matching: {searchHistory.slice(-5).join(', ')}{' '}
            <button type="button" className="min-h-11 underline" onClick={clearSearch}>Clear searches</button>
          </p>
        )}
      </Section>

      <Section title="How scoring works">
        <Panel>
          <p className="text-[14px] text-ink-2">Each card gets points from the rules below; the feed then mixes buckets in fixed shares so it never becomes only your top topic.</p>
          <ul className="mt-3 grid gap-1 text-[14px] sm:grid-cols-2">
            {[
              ['Selected interest', WEIGHTS.selectedInterest],
              ['Top-five interest', WEIGHTS.topFiveInterest],
              ['Liked topic', WEIGHTS.likedTopic],
              ['Related to a saved card', WEIGHTS.savedRelated],
              ['Explored topic', WEIGHTS.exploredTopic],
              ['Right difficulty', WEIGHTS.difficultyMatch],
              ['Adjacent topic', WEIGHTS.adjacentTopic],
              ['Recently overexposed', WEIGHTS.overexposed],
              ['Repeatedly skipped', WEIGHTS.repeatedlySkipped],
              ['Already read', WEIGHTS.completed],
            ].map(([k, v]) => (
              <li key={k as string} className="flex justify-between gap-2 rounded-xl bg-surface-2 px-3 py-1.5">
                <span>{k}</span>
                <span className="font-semibold tabular-nums">{(v as number) > 0 ? `+${v}` : v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[14px] text-ink-2">
            Current mix: {Math.round(mix['high-interest'] * 100)}% your interests · {Math.round(mix.adjacent * 100)}% adjacent · {Math.round(mix.serendipity * 100)}% serendipity · {Math.round(mix.review * 100)}% review · {Math.round(mix.experimental * 100)}% experimental.
          </p>
        </Panel>
      </Section>

      <Section title="Reset and remove">
        <div className="grid gap-2 sm:grid-cols-3">
          <Button onClick={() => setConfirm('recs')}>Reset recommendations</Button>
          <Button onClick={() => setConfirm('history')}>Remove activity history</Button>
          <Button variant="danger" onClick={() => setConfirm('all')}>Start over</Button>
        </div>
        <p className="mt-2 text-[13px] text-ink-2">Remove individual items from <Link to="/history" className="underline">Learning history</Link>.</p>
        {confirm && (
          <div role="alertdialog" aria-labelledby="confirm-title" className="mt-4 rounded-3xl border border-line bg-surface p-4">
            <p id="confirm-title" className="font-semibold">
              {confirm === 'recs' && 'Reset recommendations?'}
              {confirm === 'history' && 'Remove all activity history?'}
              {confirm === 'all' && 'Start over from scratch?'}
            </p>
            <p className="mt-1 text-[14px] text-ink-2">
              {confirm === 'recs' && 'Clears likes, skips, deeper reads, more/less feedback and searches. Keeps your saved cards, reading progress and settings.'}
              {confirm === 'history' && 'Clears reading history, sessions, reflections, Decision Gym results and searches. Keeps saved cards and settings. Streaks reset.'}
              {confirm === 'all' && 'Deletes your profile, saved cards, collections and history from this device.'}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant={confirm === 'all' ? 'danger' : 'primary'} onClick={doConfirm}>Confirm</Button>
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

const TYPE_LABEL: Partial<Record<InteractionType, string>> = {
  complete: 'Read',
  like: 'Liked',
  save: 'Saved',
  skip: 'Skipped',
  explore: 'Explored deeper',
  share: 'Shared',
  understood: 'Understood',
  'more-like-this': 'More like this',
  'less-like-this': 'Less like this',
};

export function HistoryPage() {
  const interactions = useAppStore((s) => s.interactions);
  const reflections = useAppStore((s) => s.reflections);
  const gym = useAppStore((s) => s.gymResults);
  const removeCard = useAppStore((s) => s.removeCardHistory);
  const [tab, setTab] = useState<'cards' | 'reflections' | 'gym'>('cards');

  const byCard = useMemo(() => {
    const m = new Map<string, { last: string; types: Set<InteractionType> }>();
    for (const i of interactions) {
      if (!TYPE_LABEL[i.type]) continue;
      const e = m.get(i.cardId) ?? { last: i.timestamp, types: new Set() };
      e.types.add(i.type);
      if (i.timestamp > e.last) e.last = i.timestamp;
      m.set(i.cardId, e);
    }
    return [...m.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last));
  }, [interactions]);

  return (
    <div>
      <PageHeader title="Learning history" back="/profile" />
      <Segmented
        label="History view"
        value={tab}
        options={[
          { value: 'cards', label: `Cards (${byCard.length})` },
          { value: 'reflections', label: `Reflections (${reflections.length})` },
          { value: 'gym', label: `Decisions (${gym.length})` },
        ]}
        onChange={setTab}
      />
      <div className="mt-5">
        {tab === 'cards' &&
          (byCard.length === 0 ? (
            <EmptyState title="No reading history yet" action={<LinkButton to="/feed">Open the feed</LinkButton>} />
          ) : (
            <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
              {byCard.map(([id, e]) => {
                const c = getCard(id);
                if (!c) return null;
                return (
                  <li key={id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1">
                      <Link to={`/card/${id}`} className="font-medium hover:underline">{c.title}</Link>
                      <p className="text-[13px] text-ink-2">
                        {[...e.types].map((t) => TYPE_LABEL[t]).join(' · ')} · {new Date(e.last).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" icon="x" aria-label={`Remove ${c.title} from history`} onClick={() => removeCard(id)} />
                  </li>
                );
              })}
            </ul>
          ))}
        {tab === 'reflections' &&
          (reflections.length === 0 ? (
            <EmptyState title="No reflections yet">Reflections from sessions, collisions and daily check-ins appear here.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {[...reflections].reverse().map((r) => (
                <li key={r.id} className="rounded-3xl border border-line bg-surface p-4">
                  <p className="text-[13px] text-ink-2">{new Date(r.date).toLocaleDateString()} · {r.context}</p>
                  <p className="mt-1 font-medium">{r.prompt}</p>
                  <p className="mt-1">{r.text}</p>
                </li>
              ))}
            </ul>
          ))}
        {tab === 'gym' &&
          (gym.length === 0 ? (
            <EmptyState title="No decisions yet" action={<LinkButton to="/gym">Open the Decision Gym</LinkButton>} />
          ) : (
            <ul className="space-y-3">
              {[...gym].reverse().map((g, i) => {
                const s = SCENARIO_INDEX.get(g.scenarioId);
                return (
                  <li key={`${g.scenarioId}-${i}`} className="rounded-3xl border border-line bg-surface p-4">
                    <p className="font-medium">{s?.title}</p>
                    <p className="text-[14px]">You chose: {s?.choices.find((c) => c.id === g.choiceId)?.label}</p>
                    {g.reasoning && <p className="text-[14px] text-ink-2">Reasoning: {g.reasoning}</p>}
                    {g.wouldChange && <p className="text-[14px] text-ink-2">Would change after debrief: {g.wouldChange}</p>}
                  </li>
                );
              })}
            </ul>
          ))}
      </div>
    </div>
  );
}
