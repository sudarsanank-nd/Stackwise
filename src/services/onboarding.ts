import type { ContentStyle, DailyTargetMinutes, Difficulty, LearningGoal, SerendipityFrequency, TopicId } from '../types';
import type { OnboardingInput } from '../store/useAppStore';

export interface OnboardingDraft {
  displayName: string;
  interests: TopicId[];
  rankedInterests: TopicId[];
  topicDifficulty: Partial<Record<TopicId, Difficulty>>;
  dailyTargetMinutes: DailyTargetMinutes;
  preferredStyles: ContentStyle[];
  learningGoals: LearningGoal[];
  serendipityFrequency: SerendipityFrequency;
  personalizationEnabled: boolean;
}

export const STEPS = ['Interests', 'Top five', 'Depth', 'Daily target', 'Content style', 'Goals', 'New topics', 'Personalisation'] as const;

/** Keeps the ranked list in sync with selected interests (max five, order preserved). */
export function syncRanked(interests: TopicId[], ranked: TopicId[]): TopicId[] {
  const kept = ranked.filter((t) => interests.includes(t));
  const added = interests.filter((t) => !kept.includes(t));
  return [...kept, ...added].slice(0, 5);
}

export function draftToProfileInput(d: OnboardingDraft): OnboardingInput {
  return {
    displayName: d.displayName.trim() || 'Reader',
    interests: d.interests,
    rankedInterests: syncRanked(d.interests, d.rankedInterests),
    topicDifficulty: d.topicDifficulty,
    dailyTargetMinutes: d.dailyTargetMinutes,
    preferredStyles: d.preferredStyles.length ? d.preferredStyles : ['mixed'],
    learningGoals: d.learningGoals,
    serendipityFrequency: d.serendipityFrequency,
    personalizationEnabled: d.personalizationEnabled,
  };
}

export function canAdvance(step: number, d: OnboardingDraft) {
  if (step === 0) return d.interests.length >= 3;
  if (step === 1) return d.rankedInterests.length >= Math.min(5, d.interests.length);
  if (step === 4) return d.preferredStyles.length > 0;
  if (step === 5) return d.learningGoals.length > 0;
  return true;
}

