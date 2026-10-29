// Domain types for Stackwise. Content files (src/data/*.json) must match these shapes;
// src/tests/content.test.ts enforces it.

export type TopicId =
  | 'investing'
  | 'personal-finance'
  | 'behavioral-finance'
  | 'psychology'
  | 'people-management'
  | 'leadership'
  | 'ai'
  | 'agentic-ai'
  | 'technology'
  | 'decision-making'
  | 'mental-models'
  | 'productivity'
  | 'operational-excellence'
  | 'support-leadership'
  | 'communication'
  | 'negotiation';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ContentFormat =
  | 'big-idea'
  | 'mental-model'
  | 'counterintuitive'
  | 'myth-vs-reality'
  | 'case-study'
  | 'experiment'
  | 'leadership-situation'
  | 'investment-mistake'
  | 'ai-explained'
  | 'what-would-you-do'
  | 'quote-interpretation'
  | 'framework'
  | 'checklist'
  | 'historical-lesson'
  | 'two-viewpoints'
  | 'self-assessment'
  | 'common-mistake'
  | 'comparison'
  | 'explain-beginner'
  | 'connect-domains';

export type ContentStyle = 'practical' | 'conceptual' | 'contrarian' | 'research' | 'mixed';

export type LearningGoal =
  | 'investor'
  | 'manager'
  | 'psychology'
  | 'ai'
  | 'decisions'
  | 'strategy'
  | 'communication'
  | 'technical'
  | 'productivity'
  | 'support-ops';

export type SerendipityFrequency = 'rarely' | 'sometimes' | 'often';
export type ThemePreference = 'light' | 'dark' | 'system';
export type DailyTargetMinutes = 5 | 10 | 15;

export interface UserProfile {
  id: string;
  displayName: string;
  interests: TopicId[];
  rankedInterests: TopicId[]; // top five, most important first
  topicDifficulty: Partial<Record<TopicId, Difficulty>>;
  learningGoals: LearningGoal[];
  dailyTargetMinutes: DailyTargetMinutes;
  preferredStyles: ContentStyle[];
  serendipityFrequency: SerendipityFrequency;
  personalizationEnabled: boolean;
  theme: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

export type SourceType = 'paper' | 'book' | 'primary' | 'institution' | 'article' | 'original';

export interface CardSource {
  type: SourceType;
  title: string;
  author?: string;
  year?: number;
  url?: string;
}

/** A concept the reader should be able to explain back. */
export interface KeyConcept {
  label: string;
  /** Words or short phrases; a concept counts as covered when `minMatches` of them appear. */
  terms: string[];
  minMatches?: number;
}

export interface Misconception {
  /** If any of these phrases appear, show the note. */
  triggers: string[];
  note: string;
}

export interface ContrarianPosition {
  label: string;
  claim: string;
  evidence: string[];
  interpretation: string;
}

export interface ContrarianBlock {
  question: string;
  established: string[];
  positions: [ContrarianPosition, ContrarianPosition];
  opinion?: string; // clearly labelled editorial view
  unresolved: string[];
  evidenceBalance: 'balanced' | 'leans-first' | 'leans-second';
  balanceNote: string;
}

export interface BridgeBlock {
  from: TopicId;
  to: TopicId;
  insight: string;
}

export type ReviewStatus = 'verified' | 'needs-source-check' | 'original-synthesis';

export interface KnowledgeCard {
  id: string;
  title: string;
  hook: string;
  coreIdea: string;
  whyItMatters: string;
  example: string;
  exampleType: 'illustrative' | 'historical' | 'documented';
  reflectionQuestion: string;
  suggestedAction: string;
  /** Filled at load time from word count when absent. */
  readingTimeSec?: number;
  primaryTopic: TopicId;
  secondaryTopics: TopicId[];
  difficulty: Difficulty;
  format: ContentFormat;
  source?: CardSource;
  attribution?: string;
  relatedCardIds: string[];
  contrastingCardIds: string[];
  createdAt: string;
  reviewStatus: ReviewStatus;
  /** Extra depth shown in Explore deeper. */
  deeper?: string;
  keyConcepts: KeyConcept[];
  misconceptions?: Misconception[];
  simpleExplanation?: string;
  /** Idea symbol drawn on the cover art; one of SYMBOL_IDS in src/data/symbols.ts. */
  coverSymbol?: string;
  checklist?: string[];
  quote?: { text: string; by: string; note?: string };
  contrarian?: ContrarianBlock;
  bridge?: BridgeBlock;
  disputed?: string; // short note when the underlying finding is contested
}

export type InteractionType =
  | 'view'
  | 'complete'
  | 'like'
  | 'unlike'
  | 'skip'
  | 'save'
  | 'unsave'
  | 'share'
  | 'explore'
  | 'more-like-this'
  | 'less-like-this'
  | 'understood';

export interface UserInteraction {
  userId: string;
  cardId: string;
  type: InteractionType;
  timestamp: string;
  timeSpentSec?: number;
  completed?: boolean;
  feedbackReason?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  cardIds: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SessionType = 'onboarding' | 'five-minute' | 'gap';

export type SessionStep =
  | { kind: 'card'; cardId: string; role: 'familiar' | 'adjacent' | 'surprising' | 'gap' }
  | { kind: 'gym'; scenarioId: string }
  | { kind: 'reflection'; prompt: string };

export interface LearningSession {
  id: string;
  userId: string;
  cardIds: string[];
  steps: SessionStep[];
  sessionType: SessionType;
  startTime: string;
  completionTime?: string;
  progress: number; // index of next step
  reflectionResponse?: string;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  gains: string[];
  costs: string[];
  likelyOutcome: string;
}

export interface DecisionScenario {
  id: string;
  title: string;
  scenario: string;
  choices: ScenarioChoice[];
  relevantConcepts: { name: string; explanation: string; cardId?: string }[];
  debrief: string;
  reflectionQuestion: string;
  difficulty: Difficulty;
  topic: TopicId;
}

export interface GymResult {
  scenarioId: string;
  choiceId: string;
  reasoning?: string;
  wouldChange?: 'yes' | 'no' | 'unsure';
  reflection?: string;
  completedAt: string;
}

export interface IdeaCollision {
  id: string;
  cardA: string;
  cardB: string;
  prompt: string;
  suggestedConnection: string;
  otherAngles: string[];
}

export interface Reflection {
  id: string;
  date: string; // ISO
  prompt: string;
  text: string;
  context: 'daily' | 'weekly' | 'session' | 'collision' | 'gym';
}

export type FeedMode = 'for-you' | 'serendipity' | 'contrarian' | 'connect';

export interface FeedFilters {
  topics: TopicId[];
  difficulties: Difficulty[];
  formats: ContentFormat[];
}

export type FeedBucket = 'high-interest' | 'adjacent' | 'serendipity' | 'review' | 'experimental' | 'balanced';

export interface ScoredCard {
  card: KnowledgeCard;
  score: number;
  reasons: string[];
  bucket: FeedBucket;
}

// ---- Motion explainers -------------------------------------------------------
// Short animated explainers (30–60 s) for selected cards, played only when the reader taps Play.
// Scenes reuse a small library of animated visuals; captions carry the meaning, so values
// are relative illustration only (0–1), never data. Rules: docs/content-guidelines.md.

export type ExplainerVisual = 'scale' | 'curve' | 'cycle' | 'bars' | 'stack' | 'versus' | 'chain' | 'statement';

export interface ExplainerScene {
  visual: ExplainerVisual;
  /** On-screen caption (always shown — explainers play muted). ≤ 140 characters. */
  caption: string;
  /** Short chapter name for the chapter list. */
  chapter: string;
  /** Short labels drawn in the visual (≤ 18 characters each). */
  labels?: string[];
  /** Relative sizes 0–1 for bars / curve points / chain strength. Illustrative only. */
  values?: number[];
  /** Scene length in seconds at 1× (default 8). */
  seconds?: number;
}

export interface Explainer {
  cardId: string;
  scenes: ExplainerScene[];
}
