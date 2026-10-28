import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type {
  Collection,
  GymResult,
  InteractionType,
  LearningSession,
  Reflection,
  ThemePreference,
  TopicId,
  UserInteraction,
  UserProfile,
} from '../types';
import { CARD_INDEX } from '../services/content';
import { uid } from '../utils/text';
import { dayKey } from '../utils/date';

export const STORAGE_KEY = 'scrollwise:v1';
const MAX_INTERACTIONS = 3000;

export const DEFAULT_COLLECTIONS: { name: string; description: string; topics: TopicId[] }[] = [
  { name: 'Investing Playbook', description: 'Money, markets and the biases around them', topics: ['investing', 'personal-finance', 'behavioral-finance'] },
  { name: 'Leadership Toolkit', description: 'Managing and leading people', topics: ['leadership', 'people-management'] },
  { name: 'AI Concepts', description: 'How AI and modern systems work', topics: ['ai', 'agentic-ai', 'technology'] },
  { name: 'Psychology at Work', description: 'Human behaviour, communication and influence', topics: ['psychology', 'communication', 'negotiation'] },
  { name: 'Decision-Making', description: 'Models and tools for better choices', topics: ['decision-making', 'mental-models'] },
  { name: 'Support Operations', description: 'Running a calm, effective support org', topics: ['support-leadership', 'operational-excellence'] },
  { name: 'Ideas Worth Revisiting', description: 'Anything you want to come back to', topics: ['productivity'] },
];

export function makeDefaultCollections(now = new Date().toISOString()): Collection[] {
  return DEFAULT_COLLECTIONS.map((c, i) => ({
    id: `col-default-${i}`,
    name: c.name,
    description: c.description,
    cardIds: [],
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }));
}

/** Default collection for a newly saved card, by its primary topic. */
export function defaultCollectionIdFor(cardId: string): string {
  const card = CARD_INDEX.get(cardId);
  const idx = card ? DEFAULT_COLLECTIONS.findIndex((c) => c.topics.includes(card.primaryTopic)) : -1;
  return `col-default-${idx >= 0 ? idx : DEFAULT_COLLECTIONS.length - 1}`;
}

/** localStorage that never throws (private mode, quota, sandboxed previews). */
const memory = new Map<string, string>();
export const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      memory.delete(k);
    }
  },
};

export type OnboardingInput = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'theme'>;

export interface AppState {
  profile: UserProfile | null;
  theme: ThemePreference;
  interactions: UserInteraction[];
  likedIds: string[];
  collections: Collection[];
  sessions: LearningSession[];
  searchHistory: string[];
  gymResults: GymResult[];
  reflections: Reflection[];
  /** Days on which the user chose "continue intentionally" after meeting the target. */
  continuedDays: string[];
  /** Days on which the user chose "finish for today". */
  finishedDays: string[];

  completeOnboarding: (input: OnboardingInput) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setTheme: (t: ThemePreference) => void;

  record: (cardId: string, type: InteractionType, extra?: Partial<UserInteraction>) => void;
  toggleLike: (cardId: string) => void;
  skip: (cardId: string) => void;
  markCompleted: (cardId: string, timeSpentSec?: number) => void;

  isSaved: (cardId: string) => boolean;
  save: (cardId: string, collectionId?: string) => void;
  unsave: (cardId: string) => void;
  createCollection: (name: string, description?: string) => string;
  renameCollection: (id: string, name: string, description?: string) => void;
  deleteCollection: (id: string) => void;
  moveCard: (cardId: string, fromId: string, toId: string) => void;
  addToCollection: (cardId: string, collectionId: string) => void;
  removeFromCollection: (cardId: string, collectionId: string) => void;

  addSearch: (q: string) => void;
  clearSearchHistory: () => void;

  startSession: (s: LearningSession) => void;
  advanceSession: (id: string) => void;
  completeSession: (id: string, reflection?: string) => void;

  addGymResult: (r: Omit<GymResult, 'completedAt'>) => void;
  addReflection: (r: Omit<Reflection, 'id' | 'date'>) => void;

  continueToday: () => void;
  finishToday: () => void;

  removeCardHistory: (cardId: string) => void;
  clearHistory: () => void;
  resetRecommendations: () => void;
  resetAll: () => void;
}

const now = () => new Date().toISOString();

const initialData = () => ({
  profile: null as UserProfile | null,
  theme: 'system' as ThemePreference,
  interactions: [] as UserInteraction[],
  likedIds: [] as string[],
  collections: makeDefaultCollections(),
  sessions: [] as LearningSession[],
  searchHistory: [] as string[],
  gymResults: [] as GymResult[],
  reflections: [] as Reflection[],
  continuedDays: [] as string[],
  finishedDays: [] as string[],
});

/** Interaction types that represent personalisation signals (cleared by "reset recommendations"). */
const SIGNAL_TYPES: InteractionType[] = ['like', 'unlike', 'skip', 'explore', 'more-like-this', 'less-like-this', 'share'];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      completeOnboarding: (input) => {
        const t = now();
        set({ profile: { ...input, id: get().profile?.id ?? uid('user'), theme: get().theme, createdAt: get().profile?.createdAt ?? t, updatedAt: t } });
      },
      updateProfile: (patch) => {
        const p = get().profile;
        if (!p) return;
        set({ profile: { ...p, ...patch, updatedAt: now() } });
      },
      setTheme: (theme) => {
        set({ theme });
        const p = get().profile;
        if (p) set({ profile: { ...p, theme, updatedAt: now() } });
      },

      record: (cardId, type, extra) => {
        const userId = get().profile?.id ?? 'anonymous';
        const entry: UserInteraction = { userId, cardId, type, timestamp: now(), ...extra };
        set({ interactions: [...get().interactions, entry].slice(-MAX_INTERACTIONS) });
      },
      toggleLike: (cardId) => {
        const liked = get().likedIds.includes(cardId);
        set({ likedIds: liked ? get().likedIds.filter((x) => x !== cardId) : [...get().likedIds, cardId] });
        get().record(cardId, liked ? 'unlike' : 'like');
        if (!liked) get().markCompleted(cardId);
      },
      skip: (cardId) => get().record(cardId, 'skip'),
      markCompleted: (cardId, timeSpentSec) => {
        const today = dayKey();
        const already = get().interactions.some((i) => i.cardId === cardId && i.type === 'complete' && dayKey(i.timestamp) === today);
        if (!already) get().record(cardId, 'complete', { completed: true, timeSpentSec });
      },

      isSaved: (cardId) => get().collections.some((c) => c.cardIds.includes(cardId)),
      save: (cardId, collectionId) => {
        const target = collectionId ?? defaultCollectionIdFor(cardId);
        if (get().collections.find((c) => c.id === target)?.cardIds.includes(cardId)) return;
        const wasSaved = get().isSaved(cardId);
        set({
          collections: get().collections.map((c) => (c.id === target ? { ...c, cardIds: [...c.cardIds, cardId], updatedAt: now() } : c)),
        });
        if (!wasSaved) {
          get().record(cardId, 'save');
          get().markCompleted(cardId);
        }
      },
      unsave: (cardId) => {
        set({ collections: get().collections.map((c) => (c.cardIds.includes(cardId) ? { ...c, cardIds: c.cardIds.filter((x) => x !== cardId), updatedAt: now() } : c)) });
        get().record(cardId, 'unsave');
      },
      createCollection: (name, description = '') => {
        const id = uid('col');
        const t = now();
        set({ collections: [...get().collections, { id, name: name.trim() || 'Untitled', description, cardIds: [], isDefault: false, createdAt: t, updatedAt: t }] });
        return id;
      },
      renameCollection: (id, name, description) =>
        set({
          collections: get().collections.map((c) =>
            c.id === id ? { ...c, name: name.trim() || c.name, description: description ?? c.description, updatedAt: now() } : c,
          ),
        }),
      deleteCollection: (id) => {
        const col = get().collections.find((c) => c.id === id);
        if (!col || col.isDefault) return;
        // Cards that would become unsaved move to "Ideas Worth Revisiting" rather than vanishing.
        const fallback = `col-default-${DEFAULT_COLLECTIONS.length - 1}`;
        const rest = get().collections.filter((c) => c.id !== id);
        const orphans = col.cardIds.filter((cid) => !rest.some((c) => c.cardIds.includes(cid)));
        set({ collections: rest.map((c) => (c.id === fallback ? { ...c, cardIds: [...c.cardIds, ...orphans] } : c)) });
      },
      moveCard: (cardId, fromId, toId) => {
        if (fromId === toId) return;
        set({
          collections: get().collections.map((c) => {
            if (c.id === fromId) return { ...c, cardIds: c.cardIds.filter((x) => x !== cardId), updatedAt: now() };
            if (c.id === toId && !c.cardIds.includes(cardId)) return { ...c, cardIds: [...c.cardIds, cardId], updatedAt: now() };
            return c;
          }),
        });
      },
      addToCollection: (cardId, collectionId) => get().save(cardId, collectionId),
      removeFromCollection: (cardId, collectionId) =>
        set({ collections: get().collections.map((c) => (c.id === collectionId ? { ...c, cardIds: c.cardIds.filter((x) => x !== cardId), updatedAt: now() } : c)) }),

      addSearch: (q) => {
        const query = q.trim();
        if (query.length < 2) return;
        set({ searchHistory: [...get().searchHistory.filter((s) => s.toLowerCase() !== query.toLowerCase()), query].slice(-20) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),

      startSession: (s) => set({ sessions: [...get().sessions.filter((x) => x.id !== s.id), s].slice(-100) }),
      advanceSession: (id) => set({ sessions: get().sessions.map((s) => (s.id === id ? { ...s, progress: Math.min(s.steps.length, s.progress + 1) } : s)) }),
      completeSession: (id, reflection) =>
        set({
          sessions: get().sessions.map((s) =>
            s.id === id ? { ...s, progress: s.steps.length, completionTime: now(), reflectionResponse: reflection || s.reflectionResponse } : s,
          ),
        }),

      addGymResult: (r) => set({ gymResults: [...get().gymResults, { ...r, completedAt: now() }] }),
      addReflection: (r) => set({ reflections: [...get().reflections, { ...r, id: uid('ref'), date: now() }] }),

      continueToday: () => set({ continuedDays: [...new Set([...get().continuedDays, dayKey()])] }),
      finishToday: () => set({ finishedDays: [...new Set([...get().finishedDays, dayKey()])] }),

      removeCardHistory: (cardId) =>
        set({ interactions: get().interactions.filter((i) => i.cardId !== cardId), likedIds: get().likedIds.filter((x) => x !== cardId) }),
      clearHistory: () => set({ interactions: [], likedIds: [], sessions: [], searchHistory: [], gymResults: [], reflections: [], continuedDays: [], finishedDays: [] }),
      resetRecommendations: () =>
        set({ interactions: get().interactions.filter((i) => !SIGNAL_TYPES.includes(i.type)), likedIds: [], searchHistory: [] }),
      resetAll: () => set({ ...initialData() }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        profile: s.profile,
        theme: s.theme,
        interactions: s.interactions,
        likedIds: s.likedIds,
        collections: s.collections,
        sessions: s.sessions,
        searchHistory: s.searchHistory,
        gymResults: s.gymResults,
        reflections: s.reflections,
        continuedDays: s.continuedDays,
        finishedDays: s.finishedDays,
      }),
    },
  ),
);

/** Ids of every saved card (in any collection). */
export const savedIdsOf = (collections: Collection[]) => {
  const set = new Set<string>();
  collections.forEach((c) => c.cardIds.forEach((id) => set.add(id)));
  return set;
};
