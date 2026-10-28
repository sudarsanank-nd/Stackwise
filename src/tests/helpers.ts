import type { RecContext } from '../services/recommendation';
import type { UserInteraction, UserProfile } from '../types';
import { CARD_INDEX } from '../services/content';

export function makeProfile(patch: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'u1',
    displayName: 'Test',
    interests: ['investing', 'leadership', 'people-management'],
    rankedInterests: ['investing', 'leadership', 'people-management'],
    topicDifficulty: {},
    learningGoals: ['manager'],
    dailyTargetMinutes: 10,
    preferredStyles: ['mixed'],
    serendipityFrequency: 'sometimes',
    personalizationEnabled: true,
    theme: 'system',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...patch,
  };
}

export function makeCtx(patch: Partial<RecContext> = {}): RecContext {
  return {
    profile: makeProfile(),
    interactions: [],
    savedCardIds: new Set(),
    searchHistory: [],
    recentShown: [],
    cardIndex: CARD_INDEX,
    ...patch,
  };
}

export const ix = (cardId: string, type: UserInteraction['type'], timestamp = new Date().toISOString()): UserInteraction => ({
  userId: 'u1',
  cardId,
  type,
  timestamp,
});
