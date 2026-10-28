import type { ContentFormat, ContentStyle, LearningGoal, TopicId } from '../types';

export interface TopicMeta {
  id: TopicId;
  label: string;
  short: string;
  /** Accent used on light backgrounds (≥4.5:1 on #FBFAF7). */
  accent: string;
  /** Accent used on dark backgrounds (≥4.5:1 on #15171B). */
  accentDark: string;
  /** Topics that are one conceptual step away — used for "adjacent" and Serendipity explanations. */
  adjacent: TopicId[];
}

export const TOPICS: TopicMeta[] = [
  { id: 'investing', label: 'Investing', short: 'Investing', accent: '#0F6B4F', accentDark: '#5FD3A6', adjacent: ['personal-finance', 'behavioral-finance', 'decision-making'] },
  { id: 'personal-finance', label: 'Personal finance', short: 'Money', accent: '#1F6B2E', accentDark: '#8BD99A', adjacent: ['investing', 'behavioral-finance', 'productivity'] },
  { id: 'behavioral-finance', label: 'Behavioral finance', short: 'Behav. finance', accent: '#7A4B00', accentDark: '#F2B35E', adjacent: ['investing', 'psychology', 'decision-making'] },
  { id: 'psychology', label: 'Psychology & behavior', short: 'Psychology', accent: '#8A2F5C', accentDark: '#F29AC4', adjacent: ['behavioral-finance', 'people-management', 'decision-making', 'communication'] },
  { id: 'people-management', label: 'People management', short: 'Management', accent: '#1E4FA3', accentDark: '#8FB4F5', adjacent: ['leadership', 'psychology', 'communication', 'support-leadership'] },
  { id: 'leadership', label: 'Leadership', short: 'Leadership', accent: '#3A3FA8', accentDark: '#A7ABF7', adjacent: ['people-management', 'decision-making', 'communication', 'negotiation'] },
  { id: 'ai', label: 'Artificial intelligence', short: 'AI', accent: '#5B3BA8', accentDark: '#C1A8F5', adjacent: ['agentic-ai', 'technology', 'decision-making'] },
  { id: 'agentic-ai', label: 'Agentic AI', short: 'Agentic AI', accent: '#6E2FA0', accentDark: '#D3A2F2', adjacent: ['ai', 'technology', 'operational-excellence'] },
  { id: 'technology', label: 'Technology', short: 'Tech', accent: '#0E5E80', accentDark: '#7CCBEB', adjacent: ['ai', 'operational-excellence', 'agentic-ai'] },
  { id: 'decision-making', label: 'Decision-making', short: 'Decisions', accent: '#8C3B12', accentDark: '#F5A877', adjacent: ['mental-models', 'behavioral-finance', 'leadership', 'psychology'] },
  { id: 'mental-models', label: 'Mental models', short: 'Models', accent: '#7A2E2E', accentDark: '#F09B9B', adjacent: ['decision-making', 'investing', 'technology'] },
  { id: 'productivity', label: 'Productivity', short: 'Productivity', accent: '#4A5A12', accentDark: '#C3D67A', adjacent: ['operational-excellence', 'psychology', 'people-management'] },
  { id: 'operational-excellence', label: 'Operational excellence', short: 'Ops excellence', accent: '#225E63', accentDark: '#7FD0D6', adjacent: ['support-leadership', 'technology', 'productivity'] },
  { id: 'support-leadership', label: 'Customer-support leadership', short: 'Support', accent: '#0B5D73', accentDark: '#6FD0EA', adjacent: ['operational-excellence', 'people-management', 'communication'] },
  { id: 'communication', label: 'Communication', short: 'Communication', accent: '#8A3A00', accentDark: '#FFB27A', adjacent: ['negotiation', 'leadership', 'psychology'] },
  { id: 'negotiation', label: 'Negotiation & influence', short: 'Negotiation', accent: '#6B3E1E', accentDark: '#E8B48C', adjacent: ['communication', 'psychology', 'decision-making'] },
];

export const TOPIC_MAP: Record<TopicId, TopicMeta> = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, TopicMeta>;
export const TOPIC_IDS = TOPICS.map((t) => t.id);

export const topicLabel = (id: TopicId) => TOPIC_MAP[id]?.label ?? id;

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  'big-idea': 'Big idea',
  'mental-model': 'Mental model',
  counterintuitive: 'Counterintuitive',
  'myth-vs-reality': 'Myth vs reality',
  'case-study': 'One-minute case',
  experiment: 'Famous experiment',
  'leadership-situation': 'Leadership situation',
  'investment-mistake': 'Investment mistake',
  'ai-explained': 'AI, simply',
  'what-would-you-do': 'What would you do?',
  'quote-interpretation': 'Quote, interpreted',
  framework: 'Framework',
  checklist: 'Checklist',
  'historical-lesson': 'Historical lesson',
  'two-viewpoints': 'Two viewpoints',
  'self-assessment': 'Self-check',
  'common-mistake': 'Common mistake',
  comparison: 'Comparison',
  'explain-beginner': 'For beginners',
  'connect-domains': 'Connect the dots',
};

export const FORMATS = Object.keys(FORMAT_LABELS) as ContentFormat[];

/** Which formats satisfy each content-style preference. */
export const STYLE_FORMATS: Record<Exclude<ContentStyle, 'mixed'>, ContentFormat[]> = {
  practical: ['framework', 'checklist', 'case-study', 'leadership-situation', 'common-mistake', 'what-would-you-do', 'investment-mistake', 'self-assessment'],
  conceptual: ['big-idea', 'mental-model', 'explain-beginner', 'comparison', 'ai-explained', 'connect-domains', 'quote-interpretation'],
  contrarian: ['two-viewpoints', 'myth-vs-reality', 'counterintuitive'],
  research: ['experiment', 'historical-lesson'],
};

export const STYLE_LABELS: Record<ContentStyle, { label: string; hint: string }> = {
  practical: { label: 'Practical', hint: 'Frameworks, checklists, real situations' },
  conceptual: { label: 'Conceptual', hint: 'Big ideas and mental models' },
  contrarian: { label: 'Contrarian', hint: 'Myths, debates, counterintuitive takes' },
  research: { label: 'Research-based', hint: 'Experiments and historical evidence' },
  mixed: { label: 'Mixed', hint: 'A balance of everything' },
};

export const GOALS: { id: LearningGoal; label: string; topics: TopicId[] }[] = [
  { id: 'investor', label: 'Become a better investor', topics: ['investing', 'personal-finance', 'behavioral-finance'] },
  { id: 'manager', label: 'Become a stronger manager', topics: ['people-management', 'leadership'] },
  { id: 'psychology', label: 'Understand psychology', topics: ['psychology', 'behavioral-finance'] },
  { id: 'ai', label: 'Understand AI', topics: ['ai', 'agentic-ai'] },
  { id: 'decisions', label: 'Improve decision-making', topics: ['decision-making', 'mental-models'] },
  { id: 'strategy', label: 'Develop strategic thinking', topics: ['mental-models', 'leadership', 'technology'] },
  { id: 'communication', label: 'Improve communication', topics: ['communication', 'negotiation'] },
  { id: 'technical', label: 'Build technical awareness', topics: ['technology', 'ai', 'agentic-ai'] },
  { id: 'productivity', label: 'Become more productive', topics: ['productivity'] },
  { id: 'support-ops', label: 'Lead support operations more effectively', topics: ['support-leadership', 'operational-excellence'] },
];

export const DIFFICULTY_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const;
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
