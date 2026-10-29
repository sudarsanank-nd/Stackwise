import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ContentStyle } from '../../types';
import { DIFFICULTY_LABELS, GOALS, STYLE_LABELS, TOPICS, TOPIC_MAP } from '../../data/topics';
import { Button, Chip, ProgressBar, Segmented } from '../common/ui';
import { Icon } from '../common/Icon';
import { useAppStore } from '../../store/useAppStore';
import { STEPS, canAdvance, draftToProfileInput, syncRanked, type OnboardingDraft } from '../../services/onboarding';
import { buildFiveMinuteSession } from '../../services/session';
import { CARD_INDEX } from '../../services/content';

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function OnboardingWizard({ initial, editMode = false }: { initial?: Partial<OnboardingDraft>; editMode?: boolean }) {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const startSession = useAppStore((s) => s.startSession);
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [d, setD] = useState<OnboardingDraft>({
    displayName: '',
    interests: [],
    rankedInterests: [],
    topicDifficulty: {},
    dailyTargetMinutes: 10,
    preferredStyles: ['mixed'],
    learningGoals: [],
    serendipityFrequency: 'sometimes',
    personalizationEnabled: true,
    ...initial,
  });
  const set = (patch: Partial<OnboardingDraft>) => setD((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const finish = () => {
    const input = draftToProfileInput(d);
    completeOnboarding(input);
    if (editMode) {
      navigate('/settings');
      return;
    }
    const profile = useAppStore.getState().profile!;
    const s = useAppStore.getState();
    const savedIds = new Set(s.collections.flatMap((c) => c.cardIds));
    const session = buildFiveMinuteSession(
      { profile, interactions: s.interactions, savedCardIds: savedIds, searchHistory: s.searchHistory, recentShown: [], cardIndex: CARD_INDEX },
      s.gymResults,
      'onboarding',
    );
    startSession(session);
    navigate(`/session?id=${session.id}`);
  };

  const ranked = syncRanked(d.interests, d.rankedInterests);
  const move = (idx: number, dir: -1 | 1) => {
    const r = [...ranked];
    const j = idx + dir;
    if (j < 0 || j >= r.length) return;
    [r[idx], r[j]] = [r[j], r[idx]];
    set({ rankedInterests: r });
  };

  const titles = [
    'What do you want to learn about?',
    'Rank your five most important interests',
    'How deep should each topic go?',
    'How much time per day?',
    'What kind of content works for you?',
    'What are you learning for?',
    'How often should we show unfamiliar topics?',
    'Personalise your feed?',
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <div className="flex items-center justify-between text-[13px] text-ink-2">
          <span>
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
        </div>
        <ProgressBar className="mt-2" value={(step + 1) / STEPS.length} label="Onboarding progress" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="font-display text-[28px] leading-tight font-extrabold tracking-[-0.02em]">
        {titles[step]}
      </h1>

      <div className="mt-5">
        {step === 0 && (
          <>
            <label className="block text-[15px] font-medium" htmlFor="ob-name">
              What should we call you? <span className="font-normal text-ink-2">(optional)</span>
            </label>
            <input
              id="ob-name"
              value={d.displayName}
              onChange={(e) => set({ displayName: e.target.value })}
              className="mt-2 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-[16px]"
              autoComplete="given-name"
            />
            <p className="mt-5 text-[15px] text-ink-2">Pick at least three. You can change these any time.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Chip
                  key={t.id}
                  accent={t.id}
                  selected={d.interests.includes(t.id)}
                  onClick={() => {
                    const interests = toggle(d.interests, t.id);
                    set({ interests, rankedInterests: syncRanked(interests, d.rankedInterests) });
                  }}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-ink-2" aria-live="polite">
              {d.interests.length} selected{d.interests.length < 3 ? ` — choose ${3 - d.interests.length} more` : ''}
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-[15px] text-ink-2">These get the biggest boost in your feed. Use the arrows to reorder.</p>
            <ol className="mt-4 space-y-2">
              {ranked.map((t, i) => (
                <li key={t} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
                  <span className="w-6 text-center font-semibold tabular-nums">{i + 1}</span>
                  <span className="flex-1 font-medium">{TOPIC_MAP[t].label}</span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${TOPIC_MAP[t].label} up`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-2 disabled:opacity-30">
                    <Icon name="up" size={18} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === ranked.length - 1} aria-label={`Move ${TOPIC_MAP[t].label} down`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-2 disabled:opacity-30">
                    <Icon name="down" size={18} />
                  </button>
                </li>
              ))}
            </ol>
            {d.interests.length > 5 && (
              <>
                <p className="mt-5 text-[14px] text-ink-2">Swap in another interest:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {d.interests
                    .filter((t) => !ranked.includes(t))
                    .map((t) => (
                      <Chip key={t} accent={t} selected={false} onClick={() => set({ rankedInterests: [...ranked.slice(0, 4), t] })}>
                        {TOPIC_MAP[t].short}
                      </Chip>
                    ))}
                </div>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <ul className="space-y-3">
            {d.interests.map((t) => (
              <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3">
                <span className="font-medium">{TOPIC_MAP[t].label}</span>
                <Segmented
                  label={`Depth for ${TOPIC_MAP[t].label}`}
                  value={d.topicDifficulty[t] ?? 'beginner'}
                  options={(['beginner', 'intermediate', 'advanced'] as const).map((v) => ({ value: v, label: DIFFICULTY_LABELS[v] }))}
                  onChange={(v) => set({ topicDifficulty: { ...d.topicDifficulty, [t]: v } })}
                />
              </li>
            ))}
          </ul>
        )}

        {step === 3 && (
          <div role="radiogroup" aria-label="Daily learning target" className="grid gap-3 sm:grid-cols-3">
            {([5, 10, 15] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={d.dailyTargetMinutes === m}
                onClick={() => set({ dailyTargetMinutes: m })}
                className={`rounded-2xl border p-4 text-left ${d.dailyTargetMinutes === m ? 'border-brand bg-surface-2' : 'border-line bg-surface'}`}
              >
                <span className="block font-display text-[28px] font-extrabold tracking-[-0.02em]">{m} min</span>
                <span className="text-[14px] text-ink-2">about {m === 5 ? '6–8' : m === 10 ? '12–15' : '18–22'} ideas</span>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-2">
            {(Object.keys(STYLE_LABELS) as ContentStyle[]).map((s) => {
              const selected = d.preferredStyles.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    if (s === 'mixed') set({ preferredStyles: ['mixed'] });
                    else set({ preferredStyles: toggle(d.preferredStyles.filter((x) => x !== 'mixed'), s) });
                  }}
                  className={`flex min-h-14 items-center justify-between rounded-xl border px-4 text-left ${selected ? 'border-brand bg-surface-2' : 'border-line bg-surface'}`}
                >
                  <span>
                    <span className="block font-medium">{STYLE_LABELS[s].label}</span>
                    <span className="text-[14px] text-ink-2">{STYLE_LABELS[s].hint}</span>
                  </span>
                  {selected && <Icon name="check" className="text-brand" />}
                </button>
              );
            })}
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <Chip key={g.id} selected={d.learningGoals.includes(g.id)} onClick={() => set({ learningGoals: toggle(d.learningGoals, g.id) })}>
                {g.label}
              </Chip>
            ))}
          </div>
        )}

        {step === 6 && (
          <div role="radiogroup" aria-label="Unfamiliar topic frequency" className="grid gap-2">
            {(
              [
                ['rarely', 'Rarely', 'About 1 in 20 cards'],
                ['sometimes', 'Sometimes', 'About 3 in 20 cards (recommended)'],
                ['often', 'Often', 'About 5 in 20 cards'],
              ] as const
            ).map(([v, label, hint]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={d.serendipityFrequency === v}
                onClick={() => set({ serendipityFrequency: v })}
                className={`flex min-h-14 flex-col items-start justify-center rounded-xl border px-4 text-left ${d.serendipityFrequency === v ? 'border-brand bg-surface-2' : 'border-line bg-surface'}`}
              >
                <span className="font-medium">{label}</span>
                <span className="text-[14px] text-ink-2">{hint}</span>
              </button>
            ))}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4">
              <input
                type="checkbox"
                checked={d.personalizationEnabled}
                onChange={(e) => set({ personalizationEnabled: e.target.checked })}
                className="mt-1 h-5 w-5 accent-[var(--brand)]"
              />
              <span>
                <span className="block font-medium">Use my activity to personalise the feed</span>
                <span className="text-[14px] text-ink-2">
                  Likes, skips, saves, time spent, deeper reads and searches adjust what you see. Everything stays on this device, every card explains why it was shown, and you can reset or turn this off at any time.
                </span>
              </span>
            </label>
            <p className="text-[14px] text-ink-2">Off means a balanced mix across all topics, still filtered by your choices when you use filters.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button onClick={() => setStep((s) => s - 1)} disabled={step === 0} variant="ghost" icon="back">
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance(step, d)}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={finish}>
            {editMode ? 'Save preferences' : 'Start my first session'}
          </Button>
        )}
      </div>
    </div>
  );
}
