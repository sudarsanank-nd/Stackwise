import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore, STORAGE_KEY, makeDefaultCollections } from '../store/useAppStore';
import { useToast } from '../store/toast';
import { draftToProfileInput, syncRanked, canAdvance, type OnboardingDraft } from '../services/onboarding';

const draft: OnboardingDraft = {
  displayName: 'Sudarsanan',
  interests: ['investing', 'leadership', 'ai', 'psychology', 'productivity', 'communication'],
  rankedInterests: [],
  topicDifficulty: { investing: 'intermediate' },
  dailyTargetMinutes: 10,
  preferredStyles: ['practical'],
  learningGoals: ['investor'],
  serendipityFrequency: 'often',
  personalizationEnabled: true,
};

const persisted = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').state;

beforeEach(() => {
  useAppStore.getState().resetAll();
});

describe('onboarding', () => {
  it('ranked interests keep order and cap at five', () => {
    expect(syncRanked(draft.interests, [])).toHaveLength(5);
    expect(syncRanked(['ai', 'investing'], ['investing', 'leadership'])).toEqual(['investing', 'ai']);
  });
  it('requires at least three interests to continue', () => {
    expect(canAdvance(0, { ...draft, interests: ['ai', 'investing'] })).toBe(false);
    expect(canAdvance(0, draft)).toBe(true);
  });
  it('completes onboarding and persists the profile', () => {
    useAppStore.getState().completeOnboarding(draftToProfileInput(draft));
    const p = useAppStore.getState().profile!;
    expect(p.displayName).toBe('Sudarsanan');
    expect(p.rankedInterests).toHaveLength(5);
    expect(p.topicDifficulty.investing).toBe('intermediate');
    expect(persisted().profile.interests).toEqual(draft.interests);
  });
  it('persists preference updates', () => {
    useAppStore.getState().completeOnboarding(draftToProfileInput(draft));
    useAppStore.getState().updateProfile({ dailyTargetMinutes: 15, personalizationEnabled: false });
    expect(persisted().profile.dailyTargetMinutes).toBe(15);
    expect(persisted().profile.personalizationEnabled).toBe(false);
  });
});

describe('card interactions', () => {
  it('saves into the topic default collection and unsaves', () => {
    const s = useAppStore.getState();
    s.save('bf-loss-aversion-panic');
    expect(useAppStore.getState().collections.find((c) => c.name === 'Investing Playbook')!.cardIds).toContain('bf-loss-aversion-panic');
    expect(useAppStore.getState().isSaved('bf-loss-aversion-panic')).toBe(true);
    expect(useAppStore.getState().interactions.map((i) => i.type)).toContain('save');
    useAppStore.getState().unsave('bf-loss-aversion-panic');
    expect(useAppStore.getState().isSaved('bf-loss-aversion-panic')).toBe(false);
  });
  it('likes toggle and record signals; skip records', () => {
    const s = useAppStore.getState();
    s.toggleLike('pm-delegation-levels');
    expect(useAppStore.getState().likedIds).toContain('pm-delegation-levels');
    useAppStore.getState().toggleLike('pm-delegation-levels');
    expect(useAppStore.getState().likedIds).not.toContain('pm-delegation-levels');
    useAppStore.getState().skip('dm-premortem');
    const types = useAppStore.getState().interactions.map((i) => i.type);
    expect(types).toEqual(expect.arrayContaining(['like', 'unlike', 'skip', 'complete']));
  });
  it('records a completed card only once per day', () => {
    useAppStore.getState().markCompleted('dm-premortem');
    useAppStore.getState().markCompleted('dm-premortem');
    expect(useAppStore.getState().interactions.filter((i) => i.type === 'complete')).toHaveLength(1);
  });
});

describe('collections', () => {
  it('creates, renames, moves and deletes', () => {
    const s = useAppStore.getState();
    const id = s.createCollection('Team reading');
    useAppStore.getState().renameCollection(id, 'Team reads', 'For 1:1s');
    let col = useAppStore.getState().collections.find((c) => c.id === id)!;
    expect(col.name).toBe('Team reads');
    expect(col.description).toBe('For 1:1s');
    useAppStore.getState().save('dm-premortem');
    const from = useAppStore.getState().collections.find((c) => c.cardIds.includes('dm-premortem'))!.id;
    useAppStore.getState().moveCard('dm-premortem', from, id);
    col = useAppStore.getState().collections.find((c) => c.id === id)!;
    expect(col.cardIds).toEqual(['dm-premortem']);
    useAppStore.getState().deleteCollection(id);
    expect(useAppStore.getState().collections.find((c) => c.id === id)).toBeUndefined();
    // Orphaned card moves to Ideas Worth Revisiting
    expect(useAppStore.getState().collections.find((c) => c.name === 'Ideas Worth Revisiting')!.cardIds).toContain('dm-premortem');
  });
  it('protects default collections from deletion', () => {
    useAppStore.getState().deleteCollection('col-default-0');
    expect(useAppStore.getState().collections).toHaveLength(makeDefaultCollections().length);
  });
});

describe('resets and theme', () => {
  it('reset recommendations keeps saves and reading progress', () => {
    const s = useAppStore.getState();
    s.toggleLike('dm-premortem');
    s.skip('pm-delegation-levels');
    s.save('ai-rag-vs-finetune');
    s.addSearch('loss aversion');
    useAppStore.getState().resetRecommendations();
    const st = useAppStore.getState();
    expect(st.interactions.some((i) => ['like', 'skip'].includes(i.type))).toBe(false);
    expect(st.interactions.some((i) => i.type === 'complete')).toBe(true);
    expect(st.isSaved('ai-rag-vs-finetune')).toBe(true);
    expect(st.searchHistory).toEqual([]);
    expect(st.likedIds).toEqual([]);
  });
  it('remove history clears activity but keeps saves', () => {
    useAppStore.getState().save('ai-rag-vs-finetune');
    useAppStore.getState().clearHistory();
    expect(useAppStore.getState().interactions).toEqual([]);
    expect(useAppStore.getState().isSaved('ai-rag-vs-finetune')).toBe(true);
  });
  it('persists dark mode', () => {
    useAppStore.getState().setTheme('dark');
    expect(persisted().theme).toBe('dark');
  });
  it('records Decision Gym results', () => {
    useAppStore.getState().addGymResult({ scenarioId: 'gym-market-drop', choiceId: 'c', wouldChange: 'no' });
    expect(persisted().gymResults[0].scenarioId).toBe('gym-market-drop');
  });
});

describe('toast', () => {
  it('clears itself', () => {
    vi.useFakeTimers();
    useToast.getState().show('hello');
    expect(useToast.getState().message).toBe('hello');
    vi.advanceTimersByTime(3000);
    expect(useToast.getState().message).toBeNull();
    vi.useRealTimers();
  });
});

describe('rename migration', () => {
  it('reads data saved under the old ScrollWise key', async () => {
    const { safeStorage, LEGACY_STORAGE_KEY } = await import('../store/useAppStore');
    localStorage.clear();
    localStorage.setItem(LEGACY_STORAGE_KEY, '{"state":{"theme":"dark"},"version":1}');
    expect(safeStorage.getItem(STORAGE_KEY)).toContain('"dark"');
  });
});
