import type { TopicId } from '../types';

// Topic families drive cover art and the topic circles on the feed. Five families keep the
// palette small: each has an art background, a light and mid tint, and a short label.
export type FamilyId = 'money' | 'people' | 'ai' | 'ops' | 'mind';

export interface FamilyMeta {
  id: FamilyId;
  label: string;
  bg: string;
  mid: string;
  light: string;
  /** Text/icon colour that reads on `bg` (≥4.5:1). */
  onBg: string;
}

export const FAMILIES: Record<FamilyId, FamilyMeta> = {
  money: { id: 'money', label: 'Money', bg: '#F2B33D', mid: '#FFC96E', light: '#FFE6B8', onBg: '#14213D' },
  people: { id: 'people', label: 'People', bg: '#FF6B57', mid: '#FF8D7D', light: '#FFD6CF', onBg: '#14213D' },
  ai: { id: 'ai', label: 'AI', bg: '#6C4CF0', mid: '#8C72FF', light: '#E2DAFF', onBg: '#FFFFFF' },
  ops: { id: 'ops', label: 'Ops', bg: '#14B8A6', mid: '#46CFC0', light: '#CBF2EC', onBg: '#14213D' },
  mind: { id: 'mind', label: 'Mind', bg: '#5BC0F8', mid: '#86D2FA', light: '#D8F0FD', onBg: '#14213D' },
};

export const FAMILY_ORDER: FamilyId[] = ['money', 'people', 'ai', 'ops', 'mind'];

export const TOPIC_FAMILY: Record<TopicId, FamilyId> = {
  investing: 'money',
  'personal-finance': 'money',
  'behavioral-finance': 'money',
  'people-management': 'people',
  leadership: 'people',
  communication: 'people',
  negotiation: 'people',
  ai: 'ai',
  'agentic-ai': 'ai',
  technology: 'ai',
  productivity: 'ops',
  'operational-excellence': 'ops',
  'support-leadership': 'ops',
  psychology: 'mind',
  'decision-making': 'mind',
  'mental-models': 'mind',
};

export const familyOf = (topic: TopicId): FamilyMeta => FAMILIES[TOPIC_FAMILY[topic]];

export const familyTopics = (f: FamilyId) => (Object.keys(TOPIC_FAMILY) as TopicId[]).filter((t) => TOPIC_FAMILY[t] === f);

export function activeFamily(topics: TopicId[]): FamilyId | null {
  for (const f of FAMILY_ORDER) {
    const ft = familyTopics(f);
    if (topics.length === ft.length && ft.every((t) => topics.includes(t))) return f;
  }
  return null;
}
